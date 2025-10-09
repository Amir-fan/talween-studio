import { NextRequest, NextResponse } from 'next/server';
import { checkPaymentStatus } from '@/lib/myfatoorah-service';
import { getOrder } from '@/lib/google-sheets-orders';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get('paymentId');
    const orderId = searchParams.get('orderId');

    const debugInfo: any = {
      timestamp: new Date().toISOString(),
      paymentId,
      orderId,
      steps: []
    };

    // Step 1: Check if we have required params
    debugInfo.steps.push({
      step: 1,
      name: 'Parameter Check',
      paymentId: paymentId || 'MISSING',
      orderId: orderId || 'MISSING',
      status: (paymentId || orderId) ? '✅ OK' : '❌ MISSING'
    });

    // Step 2: Get order from Google Sheets
    if (orderId) {
      try {
        const orderResult = await getOrder(orderId);
        debugInfo.steps.push({
          step: 2,
          name: 'Google Sheets Order Lookup',
          status: orderResult.success ? '✅ FOUND' : '❌ NOT FOUND',
          order: orderResult.order || null,
          error: orderResult.error || null
        });

        if (orderResult.success && orderResult.order) {
          debugInfo.orderDetails = {
            orderId: orderResult.order.ID,
            userId: orderResult.order.UserID,
            amount: orderResult.order.Amount,
            credits: orderResult.order.CreditsPurchased,
            status: orderResult.order.Status,
            packageId: orderResult.order.PackageID,
            paymentIntentId: orderResult.order.PaymentIntentID
          };
        }
      } catch (error: any) {
        debugInfo.steps.push({
          step: 2,
          name: 'Google Sheets Order Lookup',
          status: '❌ ERROR',
          error: error.message || String(error)
        });
      }
    }

    // Step 3: Check MyFatoorah payment status
    if (paymentId) {
      try {
        const statusResult = await checkPaymentStatus(paymentId, 'PaymentId');
        debugInfo.steps.push({
          step: 3,
          name: 'MyFatoorah Payment Status Check',
          status: statusResult.success ? '✅ SUCCESS' : '❌ FAILED',
          paymentStatus: statusResult.status,
          transactionId: statusResult.transactionId,
          rawStatus: statusResult.rawStatus,
          error: statusResult.error || null,
          fullResponse: statusResult
        });

        debugInfo.myFatoorahStatus = {
          success: statusResult.success,
          status: statusResult.status,
          isPaid: statusResult.status === 'Paid',
          isPending: statusResult.status === 'Pending',
          isFailed: statusResult.status === 'Failed'
        };
      } catch (error: any) {
        debugInfo.steps.push({
          step: 3,
          name: 'MyFatoorah Payment Status Check',
          status: '❌ ERROR',
          error: error.message || String(error),
          stack: error.stack || null
        });
      }
    }

    // Step 4: Environment check
    debugInfo.environment = {
      hasMyFatoorahApiKey: !!process.env.MYFATOORAH_API_KEY,
      myFatoorahBaseUrl: process.env.MYFATOORAH_BASE_URL || 'NOT SET',
      hasGoogleSheetsApiKey: !!(process.env.GOOGLE_SHEETS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY),
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET'
    };

    // Summary
    debugInfo.summary = {
      orderFound: !!debugInfo.orderDetails,
      paymentChecked: !!debugInfo.myFatoorahStatus,
      paymentStatus: debugInfo.myFatoorahStatus?.status || 'UNKNOWN',
      shouldSucceed: debugInfo.myFatoorahStatus?.isPaid && debugInfo.orderDetails?.status !== 'paid'
    };

    return NextResponse.json(debugInfo, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Debug endpoint error',
      message: error.message || String(error),
      stack: error.stack || null
    }, { status: 500 });
  }
}

