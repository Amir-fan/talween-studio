import { NextRequest, NextResponse } from 'next/server';
import { createPaymentSession } from '@/lib/myfatoorah-service';
import { userDb, orderDb } from '@/lib/simple-database';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
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

    if (!amount || !currency || !packageId || !credits || !userId) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = userDb.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    // Create order record
    const order = orderDb.create(
      userId,
      amount,
      packageId,
      credits
    );
    const orderId = order.id;

    // Create payment session
    const paymentData = {
      amount: amount,
      currency: currency,
      customerName: user.display_name,
      customerEmail: user.email,
      customerMobile: '+966500000000', // You might want to store this in user profile
      orderId: orderId,
      packageId: packageId,
      credits: credits,
      description: `شراء ${credits} نقطة - ${packageId}`,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?orderId=${orderId}`,
      errorUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/error?orderId=${orderId}`,
    };

    const paymentResult = await createPaymentSession(paymentData);

    console.log('Payment result:', paymentResult);

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
    console.error('Payment session creation error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء جلسة الدفع' },
      { status: 500 }
    );
  }
}
