import { NextRequest, NextResponse } from 'next/server';
import { createPaymentSession } from '@/lib/myfatoorah-service';
import { orderDb } from '@/lib/simple-database';

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

    const { amount, currency, packageId, credits, userId, orderId: providedOrderId } = await request.json();
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

    // Create payment session with simplified user data
    const paymentData = {
      amount: amount,
      currency: currency,
      customerName: 'User', // Simplified - will be updated after payment
      customerEmail: 'user@example.com', // Simplified - will be updated after payment
      customerMobile: '+966500000000',
      orderId: orderId,
      packageId: packageId,
      credits: credits,
      description: `شراء ${credits} نقطة - ${packageId}`,
      // Route through server callback endpoint so credits are added before the thank-you page
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback?orderId=${orderId}`,
      errorUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/error?orderId=${orderId}`,
    };

    console.log('🔍 PAYMENT API - Creating payment session...');
    const paymentResult = await createPaymentSession(paymentData);

    console.log('🔍 PAYMENT API - Payment result:', paymentResult);

    if (paymentResult.success) {
      // Store invoice id on the order (as payment_intent_id) with pending status
      try {
        if (paymentResult.invoiceId) {
          orderDb.updateStatus(orderId, 'pending', paymentResult.invoiceId);
        }
      } catch (e) {
        console.log('Failed to store invoiceId on order (non-blocking):', e);
      }
      return NextResponse.json({
        success: true,
        paymentUrl: paymentResult.paymentUrl,
        orderId: orderId,
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
