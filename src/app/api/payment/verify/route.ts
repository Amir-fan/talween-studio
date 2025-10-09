import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/simple-database';
import { addCredits } from '@/lib/google-sheets-server';
import { getOrder, updateOrderStatus } from '@/lib/google-sheets-orders';
import { checkPaymentStatus } from '@/lib/myfatoorah-service';
import { config } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const { orderId, status, transactionId } = await request.json();

    console.log('🔍 [VERIFY API] === PAYMENT VERIFICATION START ===');
    console.log('🔍 [VERIFY API] Request received:', { orderId, status, transactionId });

    if (!orderId) {
      console.error('🔍 [VERIFY API] Missing orderId');
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get order details from Google Sheets
    console.log('🔍 [VERIFY API] Looking for order in Google Sheets:', orderId);
    const orderResult = await getOrder(orderId);
    
    if (!orderResult.success || !orderResult.order) {
      console.error('🔍 [VERIFY API] ❌ Order not found in Google Sheets:', orderId);
      console.error('🔍 [VERIFY API] Error:', orderResult.error);
      return NextResponse.json(
        { error: 'Order not found: ' + (orderResult.error || 'Unknown error') },
        { status: 404 }
      );
    }

    const order = orderResult.order;
    console.log('🔍 [VERIFY API] Order found in Google Sheets:', { 
      ID: order.ID, 
      UserID: order.UserID, 
      Amount: order.Amount, 
      CreditsPurchased: order.CreditsPurchased, 
      Status: order.Status,
      PaymentIntentID: order.PaymentIntentID,
      PackageID: order.PackageID
    });

    // CRITICAL: Check payment status with MyFatoorah instead of trusting client
    console.log('🔍 [VERIFY API] Checking payment status with MyFatoorah...');
    let myFatoorahStatus;
    let isPaid = false;
    
    try {
      // Try to get payment status using payment_intent_id or orderId
      const paymentKey = order.PaymentIntentID || orderId;
      const keyType = order.PaymentIntentID ? 'InvoiceId' : 'InvoiceId';
      
      console.log('🔍 [VERIFY API] Checking MyFatoorah with:', { paymentKey, keyType });
      myFatoorahStatus = await checkPaymentStatus(paymentKey, keyType);
      
      console.log('🔍 [VERIFY API] MyFatoorah response:', myFatoorahStatus);
      
      isPaid = myFatoorahStatus.success && myFatoorahStatus.status === 'Paid';
      console.log('🔍 [VERIFY API] MyFatoorah reports payment as:', { 
        success: myFatoorahStatus.success, 
        status: myFatoorahStatus.status, 
        isPaid: isPaid 
      });
      
    } catch (error) {
      console.error('🔍 [VERIFY API] MyFatoorah status check failed:', error);
      // Fallback to client-provided status if MyFatoorah check fails
      isPaid = status === 'paid';
      console.log('🔍 [VERIFY API] Using fallback status from client:', { status, isPaid });
    }

    // Step 1: Update local database
    console.log('🔍 [VERIFY API] === STEP 1: LOCAL DATABASE UPDATE ===');
    let localSuccess = false;

    try {
      // Check if already processed to prevent duplicates
      if (order.Status === 'paid') {
        console.log('⚠️ [VERIFY API] Order already processed, returning existing status');
        return NextResponse.json({
          success: true,
          message: 'Payment already verified',
          orderId: order.ID,
          amount: order.Amount,
          credits: order.CreditsPurchased || 0,
          alreadyProcessed: true
        });
      }

      // Only process if MyFatoorah confirms payment is successful
      if (!isPaid) {
        console.error('🔍 [VERIFY API] Payment not confirmed as paid by MyFatoorah');
        return NextResponse.json({
          success: false,
          error: 'Payment not confirmed as successful',
          myFatoorahStatus: myFatoorahStatus?.status || 'unknown'
        }, { status: 400 });
      }

      console.log('🔍 [VERIFY API] Payment confirmed as paid, processing credits...');

      // Mark as paid in Google Sheets FIRST to prevent race conditions
      console.log('🔍 [VERIFY API] Marking order as paid in Google Sheets...');
      const updateResult = await updateOrderStatus({
        orderId,
        status: 'paid',
        paymentId: transactionId
      });
      
      if (!updateResult.success) {
        console.error('🔍 [VERIFY API] Failed to update order status:', updateResult.error);
        return NextResponse.json(
          { error: 'Failed to update order status: ' + updateResult.error },
          { status: 500 }
        );
      }
      console.log('🔍 [VERIFY API] Order status updated to "paid" in Google Sheets');
      
      // Add credits to user
      if (order.CreditsPurchased && order.CreditsPurchased > 0) {
        console.log('🔍 [VERIFY API] Adding credits to local database:', { 
          userId: order.UserID, 
          creditsToAdd: order.CreditsPurchased,
          currentCredits: userDb.findById(order.UserID)?.credits || 0
        });
        
        userDb.updateCredits(order.UserID, order.CreditsPurchased);
        
        const userAfter = userDb.findById(order.UserID);
        console.log('🔍 [VERIFY API] Credits added successfully:', { 
          userId: order.UserID, 
          newCredits: userAfter?.credits || 0 
        });
      } else {
        console.warn('🔍 [VERIFY API] No credits to add:', { CreditsPurchased: order.CreditsPurchased });
      }
      
      localSuccess = true;
      console.log('🔍 [VERIFY API] Local database updated successfully');
    } catch (error) {
      console.error('🔍 [VERIFY API] Local database error:', error);
    }

    // Step 2: Update Google Sheets
    console.log('🔍 [VERIFY API] === STEP 2: GOOGLE SHEETS UPDATE ===');
    let googleSheetsSuccess = false;

    try {
      if (order.CreditsPurchased && order.CreditsPurchased > 0) {
        console.log('🔍 [VERIFY API] Attempting to add credits to Google Sheets:', { 
          userId: order.UserID, 
          creditsToAdd: order.CreditsPurchased 
        });
        
        // Use the existing addCredits action for Google Sheets
        const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwFLOoyBsDlJPBwJ3LES41P0U3dHeUHHcz14Q0aE5vi6fqGl1qdMAnw0EtKdDRPL2Re/exec';
        const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;
        
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'addCredits',
            apiKey: GOOGLE_SHEETS_API_KEY,
            userId: order.UserID,
            amount: order.CreditsPurchased
          })
        });

        console.log('🔍 [VERIFY API] Google Sheets response status:', response.status);

        if (response.ok) {
          const result = await response.json();
          googleSheetsSuccess = result.success;
          console.log('🔍 [VERIFY API] Google Sheets updated successfully:', result);
        } else {
          const errorText = await response.text();
          console.error('🔍 [VERIFY API] Google Sheets HTTP error:', { 
            status: response.status, 
            body: errorText 
          });
        }
      } else {
        console.log('🔍 [VERIFY API] No credits to add to Google Sheets');
      }
    } catch (error) {
      console.error('🔍 [VERIFY API] Google Sheets error:', error);
    }

    console.log('🔍 [VERIFY API] === PAYMENT VERIFICATION COMPLETE ===');
    console.log('🔍 [VERIFY API] Results:', {
      localSuccess,
      googleSheetsSuccess,
      orderId: order.id,
      amount: order.total_amount,
      credits: order.credits_purchased
    });

    // Return success if local update succeeded (Google Sheets is optional)
    if (!localSuccess) {
      return NextResponse.json(
        { error: 'Failed to update payment status in local database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and credits added successfully',
      orderId: order.ID,
      amount: order.Amount,
      credits: order.CreditsPurchased || 0,
      localUpdated: localSuccess,
      googleSheetsUpdated: googleSheetsSuccess
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

    // Pull stored invoiceId from Google Sheets
    const orderResult = await getOrder(orderId);
    if (!orderResult.success || !orderResult.order) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/error?error=${encodeURIComponent('Order not found')}`);
    }

    const order = orderResult.order;
    const invoiceId = order.PaymentIntentID || orderId;

    // Reuse callback endpoint to keep logic consistent
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback?orderId=${orderId}&invoiceId=${invoiceId}`);
  } catch (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/error?error=${encodeURIComponent('Verification error')}`);
  }
}