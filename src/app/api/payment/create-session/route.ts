import { NextRequest, NextResponse } from 'next/server';
import { createPaymentSession } from '@/lib/myfatoorah-service';
import { orderDb, userDb } from '@/lib/simple-database';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 PAYMENT API - Starting payment session creation');
    
    // Check if MyFatoorah API key is configured
    if (!process.env.MYFATOORAH_API_KEY) {
      console.error('MyFatoorah API key not configured in environment variables');
      return NextResponse.json(
        { 
          error: 'MyFatoorah API key not configured. Please check your Vercel environment variables.',
          debug: 'MYFATOORAH_API_KEY is missing from environment variables'
        },
        { status: 500 }
      );
    }

    const { amount, currency, packageId, credits, userId, orderId: providedOrderId, discountCode } = await request.json();
    console.log('🔍 PAYMENT API - Request data:', { amount, currency, packageId, credits, userId });

    if (!amount || !currency || !packageId || !credits || !userId) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    // Create a local order record first and use its ID everywhere to keep references consistent
    let orderId: string | null = providedOrderId || null;
    try {
      if (orderId) {
        const existing = orderDb.findById(orderId);
        if (!existing) {
          const { id: dbOrderId } = orderDb.create(userId, amount, undefined, credits);
          orderId = dbOrderId;
        }
      } else {
        const { id: dbOrderId } = orderDb.create(userId, amount, undefined, credits);
        orderId = dbOrderId;
      }
    } catch (e) {
      console.log('Order pre-create failed (non-blocking):', e);
    }
    console.log('🔍 PAYMENT API - Generated order ID:', orderId);
    if (!orderId) {
      return NextResponse.json(
        { error: 'فشل إنشاء رقم الطلب، الرجاء المحاولة مرة أخرى' },
        { status: 500 }
      );
    }

    // Create payment session with simplified user data
    // Apply discount if provided
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
          appliedDiscount = { code: discountCode, percentOff: data.percentOff };
        }
      }
    } catch {}

    // Pull real user info for invoice fields
    const user = userDb.findById(userId);
    const customerName = (user?.display_name || 'Talween User').toString().slice(0, 100);
    const customerEmail = (user?.email || 'hello@talween.com').toString();
    const customerMobile = (user?.phone || '+965500000000').toString();

    const orderIdStr = orderId as string;
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
      // Route through server callback endpoint so credits are added before the thank-you page
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback?orderId=${orderIdStr}`,
      errorUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/error?orderId=${orderIdStr}`,
    };

    console.log('🔍 PAYMENT API - Creating payment session...');
    const paymentResult = await createPaymentSession(paymentData);

    console.log('🔍 PAYMENT API - Payment result:', paymentResult);

    if (paymentResult.success) {
      // Store invoice id on the order (as payment_intent_id) with pending status
      try {
        if (paymentResult.invoiceId) {
          orderDb.updateStatus(orderIdStr, 'pending', paymentResult.invoiceId);
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
