import { NextRequest, NextResponse } from 'next/server';
import { createPaymentSession } from '@/lib/myfatoorah-service';
import { userDb, orderDb } from '@/lib/simple-database';
import { googleSheetsUserDb } from '@/lib/google-sheets-server';
import { v4 as uuidv4 } from 'uuid';

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

    console.log('🔍 PAYMENT CREATE SESSION - Processing payment:', { amount, currency, packageId, credits, userId });

    // Get user from Google Sheets (primary) and local database (fallback)
    let user = null;
    
    try {
      console.log('🔍 PAYMENT API - Looking up user in Google Sheets...');
      // Try Google Sheets first
      user = await googleSheetsUserDb.findById(userId);
      console.log('📊 User found in Google Sheets:', !!user);
      if (user) {
        console.log('📊 User data from Google Sheets:', { id: user.id, email: user.email, displayName: user.displayName });
      }
    } catch (error) {
      console.log('📊 Google Sheets error, trying local database:', error);
    }
    
    // Fallback to local database if Google Sheets fails
    if (!user) {
      console.log('🔍 PAYMENT API - Looking up user in local database...');
      user = userDb.findById(userId);
      console.log('💾 User found in local database:', !!user);
      if (user) {
        console.log('💾 User data from local database:', { id: user.id, email: user.email, displayName: user.displayName });
      }
    }
    
    if (!user) {
      console.log('❌ User not found in any database');
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    // Create order record
    console.log('🔍 PAYMENT API - Creating order with:', { userId, amount, packageId, credits });
    const orderResult = orderDb.create(
      userId,
      amount,
      packageId,  // subscriptionTier
      credits     // creditsPurchased
    );
    console.log('🔍 PAYMENT API - Order created:', orderResult);
    const orderId = orderResult.id;

    // Get user name from the correct field (handle both Google Sheets and local DB)
    console.log('🔍 PAYMENT API - User object structure:', Object.keys(user));
    console.log('🔍 PAYMENT API - User data:', user);
    
    const userName = user['الاسم'] || user.displayName || user.display_name || user.Name || 'مستخدم';
    const userEmail = user['البريد الإلكتروني'] || user.email || user.Email;
    
    console.log('📊 User data for payment:', { userName, userEmail });

    // Create payment session
    const paymentData = {
      amount: amount,
      currency: currency,
      customerName: userName,
      customerEmail: userEmail,
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
