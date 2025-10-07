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
      // Check if already processed to prevent duplicates
      if (order.status === 'paid') {
        console.log('⚠️ PAYMENT VERIFY - Order already processed, returning existing status');
        return NextResponse.json({
          success: true,
          message: 'Payment already verified',
          details: {
            localUpdated: true,
            googleSheetsUpdated: false,
            orderFound: true,
            orderId: order.id,
            creditsAdded: order.credits_purchased || 0,
            alreadyProcessed: true
          }
        });
      }

      // Mark as paid FIRST to prevent race conditions
      orderDb.updateStatus(orderId, status, transactionId);
      
      // If payment was successful, add credits to user
      if (status === 'paid' && order.credits_purchased) {
        console.log('💳 PAYMENT VERIFY - Adding credits:', { userId: order.user_id, credits: order.credits_purchased });
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
      // Use the existing addCredits action for Google Sheets
      const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbz9yA6fJAIHHiroyqX2AUNlZ5C1QqUXh8VKCrGkX3ykIPRcpaHYbpX5wF39M6-y4XQ/exec';
      const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;
      
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'addCredits',
          apiKey: GOOGLE_SHEETS_API_KEY,
          userId: order.user_id,
          amount: order.credits_purchased || 0
        })
      });

      if (response.ok) {
        const result = await response.json();
        googleSheetsSuccess = result.success;
        console.log('📊 Google Sheets updated:', result);
      } else {
        console.log('📊 Google Sheets HTTP error:', response.status);
      }
    } catch (error) {
      console.log('📊 Google Sheets error (continuing):', error);
    }

    // Return success if local update succeeded (Google Sheets is optional)
    if (!localSuccess) {
      return NextResponse.json(
        { error: 'Failed to update payment status in local database' },
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