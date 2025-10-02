import { NextRequest, NextResponse } from 'next/server';
import { createPaymentSession } from '@/lib/myfatoorah-service';

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

    const { amount, currency, packageId, credits, userId } = await request.json();
    console.log('🔍 PAYMENT API - Request data:', { amount, currency, packageId, credits, userId });

    if (!amount || !currency || !packageId || !credits || !userId) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    // Generate order ID
    const orderId = `TAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?orderId=${orderId}`,
      errorUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/error?orderId=${orderId}`,
    };

    console.log('🔍 PAYMENT API - Creating payment session...');
    const paymentResult = await createPaymentSession(paymentData);

    console.log('🔍 PAYMENT API - Payment result:', paymentResult);

    if (paymentResult.success) {
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
