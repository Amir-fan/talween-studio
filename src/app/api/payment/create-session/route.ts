import { NextRequest, NextResponse } from 'next/server';
import { createPaymentSession } from '@/lib/myfatoorah-service';
import { createOrder, updateOrderStatus } from '@/lib/google-sheets-orders';
import { userDb, orderDb } from '@/lib/simple-database';

// Helper function to get package name by ID
function getPackageName(packageId: string): string {
  const packageNames: Record<string, string> = {
    'EXPLORER': 'المكتشف',
    'CREATOR': 'المبدع',
    'STUDIO': 'الاستوديو',
    'TEACHER': 'المعلم المبدع'
  };
  return packageNames[packageId] || packageId;
}

// Helper function to calculate lead score based on purchase intent
function calculateLeadScore(amount: number, credits: number, packageId: string): number {
  let score = 50; // Base score
  
  // Higher amount = higher score
  if (amount >= 50) score += 30;
  else if (amount >= 25) score += 20;
  else if (amount >= 12) score += 10;
  
  // More credits = higher score
  if (credits >= 5000) score += 20;
  else if (credits >= 2000) score += 15;
  else if (credits >= 1000) score += 10;
  
  // Premium packages = higher score
  if (packageId === 'TEACHER') score += 25;
  else if (packageId === 'STUDIO') score += 15;
  else if (packageId === 'CREATOR') score += 10;
  
  return Math.min(score, 100); // Cap at 100
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [CREATE SESSION] === PAYMENT SESSION CREATION START ===');

    const { amount, currency, packageId, credits, userId, orderId: providedOrderId, discountCode } = await request.json();
    console.log('🔍 [CREATE SESSION] Request data received:', { 
      amount, 
      currency, 
      packageId, 
      credits, 
      userId, 
      providedOrderId, 
      discountCode 
    });

    // Require API key for real MyFatoorah integration
    if (!process.env.MYFATOORAH_API_KEY) {
      console.error('MyFatoorah API key not configured in environment variables');
      return NextResponse.json(
        { 
          error: 'MyFatoorah API key missing. Please configure MYFATOORAH_API_KEY environment variable.',
          debug: 'MYFATOORAH_API_KEY is missing from environment variables'
        },
        { status: 500 }
      );
    }

    if (!amount || !currency || !packageId || !credits || !userId) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    // Apply discount if provided (must be done before creating order)
    let finalAmount = amount;
    let appliedDiscount: { 
      code?: string; 
      type?: string;
      value?: number;
      amount?: number;
      description?: string;
    } | null = null;
    try {
      if (discountCode) {
        const resp = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/discounts/validate`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: discountCode, amount })
        });
        const data = await resp.json();
        if (data.success) {
          finalAmount = data.finalAmount;
          appliedDiscount = { 
            code: discountCode, 
            type: data.discountType,
            value: data.discountValue,
            amount: data.discountAmount,
            description: data.description
          };
        }
      }
    } catch {}

    // Create order with graceful fallback to local storage
    let orderId: string | null = providedOrderId || null;
    let orderNumber: string | null = null;
    let isOrderInGoogleSheets = false;
    
    const createOrderInDatabase = async () => {
      console.log('🔍 [CREATE SESSION] Creating order in Google Sheets...');
      try {
        const orderResult = await createOrder({
          userId,
          amount: finalAmount,
          packageId,
          credits: credits
        });
        
        if (orderResult.success && orderResult.orderId) {
          console.log('🔍 [CREATE SESSION] ✅ Order created in Google Sheets');
          return { 
            success: true, 
            orderId: orderResult.orderId, 
            orderNumber: orderResult.orderNumber || null 
          };
        } else {
          console.warn('🔍 [CREATE SESSION] ⚠️ Google Sheets failed, trying local storage');
          throw new Error(orderResult.error || 'Google Sheets order creation failed');
        }
      } catch (e) {
        console.error('🔍 [CREATE SESSION] Google Sheets error:', e);
        throw e;
      }
    };

    const createOrderLocally = () => {
      console.log('🔍 [CREATE SESSION] Creating order in local database...');
      const localOrder = orderDb.create(userId, finalAmount, packageId, credits);
      console.log('🔍 [CREATE SESSION] ✅ Order created locally:', localOrder);
      return localOrder;
    };

    try {
      // Try Google Sheets first
      const googleOrder = await createOrderInDatabase();
      orderId = googleOrder.orderId;
      orderNumber = googleOrder.orderNumber;
      isOrderInGoogleSheets = true;
    } catch (error) {
      // Fallback to local storage if Google Sheets fails
      const localOrder = createOrderLocally();
      orderId = localOrder.id;
      orderNumber = localOrder.orderNumber;
      isOrderInGoogleSheets = false;
      console.log('🔍 [CREATE SESSION] Using local order ID:', orderId);
    }
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'فشل إنشاء رقم الطلب، الرجاء المحاولة مرة أخرى' },
        { status: 500 }
      );
    }

    // Pull real user info for invoice fields
    const user = userDb.findById(userId);
    const customerName = (user?.display_name || 'Talween User').toString().slice(0, 100);
    const customerEmail = (user?.email || 'hello@talween.com').toString();
    const customerMobile = (user?.phone || '+965500000000').toString();

    const orderIdStr = orderId as string;
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/+$/, '');
    const paymentData = {
      amount: finalAmount,
      currency: currency,
      customerName,
      customerEmail,
      customerMobile,
      orderId: orderIdStr,
      packageId: packageId,
      credits: credits,
      description: `تالوين — شراء ${credits} نقطة (${packageId})${appliedDiscount ? ` — خصم ${appliedDiscount.value}${appliedDiscount.type === 'percentage' ? '%' : '$'}: ${appliedDiscount.code}` : ''}`,
      // Redirect to callback first to verify payment and add credits
      returnUrl: `${baseUrl}/api/payment/callback?orderId=${orderIdStr}`,
      errorUrl: `${baseUrl}/payment/error?orderId=${orderIdStr}`,
    };

    console.log('🔍 PAYMENT API - Creating payment session...');
    const paymentResult = await createPaymentSession(paymentData);

    console.log('🔍 PAYMENT API - Payment result:', paymentResult);

    if (paymentResult.success) {
      // Store invoice id on the order (as payment_intent_id) with pending status
      const updateOrderStatusAsync = async () => {
        if (!paymentResult.invoiceId) return;
        
        try {
          if (isOrderInGoogleSheets) {
            // Update in Google Sheets
            await updateOrderStatus({
              orderId: orderIdStr,
              status: 'pending',
              paymentId: paymentResult.invoiceId
            });
            console.log('✅ Order status updated in Google Sheets');
          } else {
            // Update in local database
            orderDb.updateStatus(orderIdStr, 'pending', paymentResult.invoiceId);
            console.log('✅ Order status updated in local database');
          }
        } catch (e) {
          console.log('❌ Failed to update order status (non-blocking):', e);
        }
      };
      
      // Run update async to avoid blocking response
      setTimeout(() => {
        updateOrderStatusAsync();
      }, 0);

      // Send purchase intent lead to LeadConnector (non-blocking)
      try {
        console.log('📞 Sending purchase intent lead to LeadConnector webhook...');
        
        // Use setTimeout to make it non-blocking
        setTimeout(async () => {
          try {
            await fetch('https://services.leadconnectorhq.com/hooks/2xJ6VY43ugovZK68Cz74/webhook-trigger/f75cf95c-c0b9-41ae-93d7-2b5711d9059d', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                // Lead basic information
                email: customerEmail,
                first_name: customerName.split(' ')[0] || customerName,
                last_name: customerName.split(' ').slice(1).join(' ') || '',
                full_name: customerName,
                
                // Lead source and tracking
                source: 'talween-studio-purchase-intent',
                lead_source: 'Package Purchase Intent',
                campaign: 'Credit Package Purchase',
                
                // Lead details
                lead_type: 'Purchase Intent',
                status: 'Hot Lead',
                tags: ['purchase-intent', 'package-selection', 'high-value', 'ready-to-buy'],
                
                // Purchase data
                user_id: userId,
                order_id: orderIdStr,
                package_id: packageId,
                package_name: getPackageName(packageId),
                purchase_amount: finalAmount,
                original_amount: amount,
                credits_purchased: credits,
                payment_method: 'MyFatoorah',
                payment_status: 'pending',
                invoice_id: paymentResult.invoiceId,
                
                // Discount information
                discount_applied: appliedDiscount ? {
                  code: appliedDiscount.code,
                  type: appliedDiscount.type,
                  value: appliedDiscount.value,
                  amount: appliedDiscount.amount,
                  description: appliedDiscount.description
                } : null,
                discount_savings: appliedDiscount ? (amount - finalAmount) : 0,
                
                // Timestamps
                created_at: new Date().toISOString(),
                timestamp: Date.now(),
                
                // Additional metadata
                metadata: {
                  purchase_method: 'online',
                  platform_version: '1.0',
                  payment_source: 'myfatoorah',
                  session_type: 'payment_intent',
                  lead_score: calculateLeadScore(finalAmount, credits, packageId),
                  conversion_stage: 'payment_initiated'
                }
              })
            });
            console.log('✅ Purchase intent lead sent to LeadConnector successfully');
          } catch (webhookError) {
            console.log('❌ Purchase intent lead webhook failed (non-blocking):', webhookError);
          }
        }, 100); // 100ms delay to ensure response is sent first
      } catch (e) {
        console.log('❌ Failed to initiate purchase intent lead webhook:', e);
      }

      return NextResponse.json({
        success: true,
        paymentUrl: paymentResult.paymentUrl,
        orderId: orderIdStr,
        invoiceId: paymentResult.invoiceId,
        finalAmount: finalAmount, // Return the final amount after discount
        originalAmount: amount, // Return the original amount
        discountApplied: appliedDiscount, // Return discount info
        message: 'Payment session created successfully'
      });
    } else {
      console.error('Payment failed:', paymentResult.error);
      return NextResponse.json(
        { error: paymentResult.error || 'فشل في إنشاء جلسة الدفع' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Payment session creation error:', error);
    return NextResponse.json(
      { 
        error: 'حدث خطأ أثناء إنشاء جلسة الدفع',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
