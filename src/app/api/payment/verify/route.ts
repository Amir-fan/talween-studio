import { NextRequest, NextResponse } from 'next/server';
import { orderDb, userDb } from '@/lib/simple-database';
import { config } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const { orderId, status, transactionId } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    console.log('💳 PAYMENT VERIFY API - Verifying payment:', { orderId, status, transactionId });

    // Get order details from database
    const order = orderDb.findById(orderId);
    if (!order) {
      console.error('💳 PAYMENT VERIFY API - Order not found:', orderId);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    console.log('💳 PAYMENT VERIFY API - Found order:', { 
      id: order.id, 
      user_id: order.user_id, 
      amount: order.total_amount, 
      credits: order.credits_purchased, 
      status: order.status 
    });

    // Step 1: Update local database
    console.log('💾 Step 1: Updating local database...');
    let localSuccess = false;

    try {
      orderDb.updateStatus(orderId, status, transactionId);
      
      // If payment was successful, add credits to user
      if (status === 'paid' && order.credits_purchased) {
        userDb.updateCredits(order.user_id, order.credits_purchased);
        
        // Update user's subscription tier if applicable
        if (order.subscription_tier && order.subscription_tier !== 'FREE') {
          userDb.updateUser(order.user_id, {
            subscription_tier: order.subscription_tier
          });
        }
      }
      localSuccess = true;
      console.log('💾 Local database updated successfully');
    } catch (error) {
      console.log('💾 Local database error (continuing):', error);
    }

    // Step 2: Update Google Sheets
    console.log('📊 Step 2: Updating Google Sheets...');
    let googleSheetsSuccess = false;

    try {
      const response = await fetch(`${config.googleAppsScriptUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verifyPayment',
          orderId: orderId,
          status: status,
          transactionId: transactionId,
          apiKey: config.googleSheetsApiKey
        })
      });

      if (response.ok) {
        const result = await response.json();
        googleSheetsSuccess = result.success;
        console.log('📊 Google Sheets updated:', result);
      }
    } catch (error) {
      console.log('📊 Google Sheets error (continuing):', error);
    }

    // Return success if either update succeeded
    if (!localSuccess && !googleSheetsSuccess) {
      return NextResponse.json(
        { error: 'Failed to update payment status in both databases' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment status updated successfully',
      details: {
        localUpdated: localSuccess,
        googleSheetsUpdated: googleSheetsSuccess,
        orderFound: true,
        orderId: order.id,
        creditsAdded: order.credits_purchased || 0
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');
    if (!orderId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/error?error=${encodeURIComponent('Missing orderId')}`);
    }

    // Pull stored invoiceId
    const order = orderDb.findById(orderId);
    if (!order) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/error?error=${encodeURIComponent('Order not found')}`);
    }

    const invoiceId = (order as any).payment_intent_id || orderId;

    // Reuse callback endpoint to keep logic consistent
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback?orderId=${orderId}&invoiceId=${invoiceId}`);
  } catch (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/error?error=${encodeURIComponent('Verification error')}`);
  }
}