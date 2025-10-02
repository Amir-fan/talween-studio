import { NextRequest, NextResponse } from 'next/server';
import { createPaymentSession } from '@/lib/myfatoorah-service';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Testing MyFatoorah service...');
    
    // Test payment data
    const paymentData = {
      amount: 9.99,
      currency: 'USD',
      customerName: 'Test User',
      customerEmail: 'test@example.com',
      customerMobile: '+966500000000',
      orderId: 'test-order-123',
      packageId: 'starter',
      credits: 100,
      description: 'Test payment',
      returnUrl: 'https://italween.com/payment/success',
      errorUrl: 'https://italween.com/payment/error',
    };

    console.log('📊 Payment data:', paymentData);
    
    const result = await createPaymentSession(paymentData);
    
    console.log('📊 MyFatoorah result:', result);
    
    return NextResponse.json({
      success: true,
      result: result,
      message: 'MyFatoorah test completed'
    });
  } catch (error) {
    console.error('❌ MyFatoorah test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
