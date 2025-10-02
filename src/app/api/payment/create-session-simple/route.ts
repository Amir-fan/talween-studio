import { NextRequest, NextResponse } from 'next/server';
import { createPaymentSession } from '@/lib/myfatoorah-service';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 SIMPLE PAYMENT API - Starting...');
    
    const { amount, currency, packageId, credits, userId } = await request.json();
    console.log('🔍 SIMPLE PAYMENT API - Request data:', { amount, currency, packageId, credits, userId });

    if (!amount || !currency || !packageId || !credits || !userId) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    // Generate a simple order ID
    const orderId = `TAL-${Date.now()}`;
    
    // Create payment session with simplified user data
    const paymentData = {
      amount: amount,
      currency: currency,
      customerName: 'User', // Simplified
      customerEmail: 'user@example.com', // Simplified
      customerMobile: '+966500000000',
      orderId: orderId,
      packageId: packageId,
      credits: credits,
      description: `شراء ${credits} نقطة - ${packageId}`,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?orderId=${orderId}`,
      errorUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/error?orderId=${orderId}`,
    };

    console.log('🔍 SIMPLE PAYMENT API - Creating payment session...');
    const paymentResult = await createPaymentSession(paymentData);

    console.log('🔍 SIMPLE PAYMENT API - Payment result:', paymentResult);

    if (paymentResult.success) {
      return NextResponse.json({
        success: true,
        paymentUrl: paymentResult.paymentUrl,
        orderId: orderId,
        invoiceId: paymentResult.invoiceId,
      });
    } else {
      console.error('Payment failed:', paymentResult.error);
      return NextResponse.json(
        { error: paymentResult.error || 'فشل في إنشاء جلسة الدفع' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Simple payment session creation error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء جلسة الدفع' },
      { status: 500 }
    );
  }
}
