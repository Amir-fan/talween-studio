import { NextRequest, NextResponse } from 'next/server';
import { createPaymentSession } from '@/lib/myfatoorah-service';
import { createOrder, updateOrderStatus } from '@/lib/google-sheets-orders';
import { userDb } from '@/lib/simple-database';

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
    let appliedDiscount: { code?: string; percentOff?: number } | null = null;
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

    // Create a local order record first and use its ID everywhere to keep references consistent
    let orderId: string | null = providedOrderId || null;
    try {
      console.log('🔍 [CREATE SESSION] === ORDER CREATION START ===');
      console.log('🔍 [CREATE SESSION] Creating order in Google Sheets:', { 
        userId, 
        finalAmount, 
        packageId, 
        credits, 
        providedOrderId 
      });
      
      // Create order in Google Sheets
      const orderResult = await createOrder({
        userId,
        amount: finalAmount,
        packageId,
        credits: credits
      });
      
      if (!orderResult.success) {
        console.error('🔍 [CREATE SESSION] ❌ Failed to create order in Google Sheets:', orderResult.error);
        throw new Error('Failed to create order: ' + orderResult.error);
      }
      
      orderId = orderResult.orderId!;
      const orderNumber = orderResult.orderNumber!;
      
      console.log('🔍 [CREATE SESSION] ✅ Order created successfully in Google Sheets:', {
        orderId,
        orderNumber,
        userId,
        totalAmount: finalAmount,
        creditsPurchased: credits,
        packageId
      });
    } catch (e) {
      console.error('🔍 [CREATE SESSION] ❌ Order creation failed:', e);
    }
    console.log('🔍 PAYMENT API - Generated order ID:', orderId);
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
      description: `تالوين — شراء ${credits} نقطة (${packageId})${appliedDiscount ? ` — خصم ${appliedDiscount.percentOff}%: ${appliedDiscount.code}` : ''}`,
      // Redirect to callback first to verify payment and add credits
      returnUrl: `${baseUrl}/api/payment/callback?orderId=${orderIdStr}`,
      errorUrl: `${baseUrl}/payment/error?orderId=${orderIdStr}`,
    };

    console.log('🔍 PAYMENT API - Creating payment session...');
    const paymentResult = await createPaymentSession(paymentData);

    console.log('🔍 PAYMENT API - Payment result:', paymentResult);

    if (paymentResult.success) {
      // Store invoice id on the order (as payment_intent_id) with pending status
      try {
        if (paymentResult.invoiceId) {
          await updateOrderStatus({
            orderId: orderIdStr,
            status: 'pending',
            paymentId: paymentResult.invoiceId
          });
        }
      } catch (e) {
        console.log('Failed to store invoiceId on order (non-blocking):', e);
      }
      return NextResponse.json({
        success: true,
        paymentUrl: paymentResult.paymentUrl,
        orderId: orderIdStr,
        invoiceId: paymentResult.invoiceId,
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
