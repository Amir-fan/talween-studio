import { NextRequest, NextResponse } from 'next/server';
import { checkPaymentStatus } from '@/lib/myfatoorah-service';
import { userDb } from '@/lib/simple-database';
import { googleSheetsUserDb } from '@/lib/google-sheets-server';
import { getOrder, updateOrderStatus } from '@/lib/google-sheets-orders';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get('paymentId');
    let invoiceId = searchParams.get('invoiceId');
    const orderId = searchParams.get('orderId');

    console.log('🔍 [CALLBACK] === PAYMENT CALLBACK START ===');
    console.log('🔍 [CALLBACK] Received payment callback', { paymentId, invoiceId, orderId });

    if (!invoiceId && !orderId) {
      console.error('🔍 [CALLBACK] ❌ Missing payment information');
      return NextResponse.json(
        { error: 'Missing payment information' },
        { status: 400 }
      );
    }

    // Ensure we use the correct InvoiceId; if missing from query, pull from Google Sheets order
    if (!invoiceId && orderId) {
      try {
        console.log('🔍 [CALLBACK] Attempting to get invoiceId from order:', orderId);
        const orderResult = await getOrder(orderId);
        console.log('🔍 [CALLBACK] getOrder result for invoiceId:', orderResult);
        if (orderResult.success && orderResult.order && orderResult.order.PaymentIntentID) {
          invoiceId = orderResult.order.PaymentIntentID;
          console.log('🔍 [CALLBACK] Found invoiceId from order:', invoiceId);
        } else {
          console.log('🔍 [CALLBACK] No invoiceId found in order or getOrder failed');
        }
      } catch (invoiceIdError) {
        console.error('🔍 [CALLBACK] Error getting invoiceId from order:', invoiceIdError);
      }
    }

    // If a MOCK-* PaymentId is provided, short-circuit as Paid
    const isMock = (paymentId?.startsWith('MOCK-') ?? false);
    console.log('🔍 [CALLBACK] Checking if mock payment:', { isMock, paymentId });
    
    const statusResult = isMock
      ? { success: true, status: 'Paid', transactionId: paymentId || 'MOCK-TXN' }
      : await checkPaymentStatus(paymentId || (invoiceId as string), paymentId ? 'PaymentId' : 'InvoiceId');
    
    console.log('🔍 [CALLBACK] Payment status check result:', statusResult);
    
    if (!statusResult.success) {
      console.error('🔍 [CALLBACK] ❌ Payment status check failed:', statusResult.error);
      console.error('🔍 [CALLBACK] Full status result:', JSON.stringify(statusResult));
      console.error('🔍 [CALLBACK] Payment details:', { paymentId, invoiceId, orderId });
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/error?orderId=${orderId}&error=${encodeURIComponent(statusResult.error || 'Payment verification failed')}`);
    }

    // Find the order in Google Sheets
    console.log('🔍 [CALLBACK] Looking for order in Google Sheets:', orderId);
    let orderResult;
    try {
      orderResult = await getOrder(orderId!);
      console.log('🔍 [CALLBACK] getOrder result:', orderResult);
    } catch (getOrderError) {
      console.error('🔍 [CALLBACK] ❌ getOrder function failed:', getOrderError);
      throw new Error(`getOrder failed: ${getOrderError instanceof Error ? getOrderError.message : String(getOrderError)}`);
    }
    
    if (!orderResult.success || !orderResult.order) {
      console.error('🔍 [CALLBACK] ❌ Order not found in Google Sheets:', orderId);
      console.error('🔍 [CALLBACK] Order result:', orderResult);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/error?orderId=${orderId}&error=${encodeURIComponent('Order not found in Google Sheets')}`);
    }
    
    const order = orderResult.order;
    console.log('🔍 [CALLBACK] ✅ Found order in Google Sheets:', { 
      ID: order.ID, 
      UserID: order.UserID, 
      Amount: order.Amount, 
      CreditsPurchased: order.CreditsPurchased, 
      Status: order.Status,
      PaymentIntentID: order.PaymentIntentID
    });

    // Update order status based on payment result
    if (statusResult.status === 'Paid') {
      // Check if credits were already added to prevent duplicates
      const alreadyProcessed = order.Status === 'paid';
      
      if (alreadyProcessed) {
        console.log('⚠️ [CALLBACK:GET] Order already processed, skipping credit addition to prevent duplicates');
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/success?orderId=${orderId}&amount=${order.Amount}&credits=${order.CreditsPurchased || 0}&packageId=${order.PackageID}&userId=${order.UserID}`);
      }

      // Mark order as paid in Google Sheets FIRST to prevent race conditions
      console.log('💳 [CALLBACK:GET] Marking order as paid in Google Sheets...');
      const updateResult = await updateOrderStatus({
        orderId: orderId!,
        status: 'paid',
        paymentId: paymentId || invoiceId
      });
      
      if (!updateResult.success) {
        console.error('💳 [CALLBACK:GET] Failed to update order status:', updateResult.error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/error?error=${encodeURIComponent('Failed to update order status')}`);
      }
      console.log('💳 [CALLBACK:GET] Marked order as paid in Google Sheets, will add credits');

      // Credits will be added by the success page via /api/payment/add-credits
      // This prevents duplicate credit addition and ensures consistency
      console.log('💰 [CALLBACK:GET] Payment verified - credits will be added by success page via add-credits API');

      console.log(`✅ [CALLBACK:GET] Payment successful for order ${orderId}, credits will be added by success page`);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/success?orderId=${orderId}&amount=${order.Amount}&credits=${order.CreditsPurchased || 0}&packageId=${order.PackageID}&userId=${order.UserID}`);
    } else if (statusResult.status === 'Failed') {
      await updateOrderStatus({
        orderId: orderId!,
        status: 'failed'
      });
      console.log(`❌ [CALLBACK:GET] Payment failed for order ${orderId}`);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/error?orderId=${orderId}&error=${encodeURIComponent('Payment failed')}`);
    } else {
      // Pending or other status
      await updateOrderStatus({
        orderId: orderId!,
        status: 'pending'
      });
      console.log(`⏳ [CALLBACK:GET] Payment pending for order ${orderId}, status: ${statusResult.status}`);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/pending?orderId=${orderId}&amount=${order.Amount}&credits=${order.CreditsPurchased || 0}&packageId=${order.PackageID}&userId=${order.UserID}`);
    }
  } catch (error) {
    console.error('💥 [CALLBACK:GET] Payment callback error:', error);
    console.error('💥 [CALLBACK:GET] Error details:', { error: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined });
    
    // Include orderId and paymentId in error redirect for better debugging
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');
    const paymentId = searchParams.get('paymentId');
    
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/error?orderId=${orderId || 'unknown'}&paymentId=${paymentId || 'unknown'}&Id=${paymentId || 'unknown'}&error=${encodeURIComponent('Payment verification error')}`);
  }
}

export async function POST(request: NextRequest) {
  // Handle POST callbacks from MyFatoorah
  try {
    const body = await request.json();
    console.log('MyFatoorah POST callback received:', body);

    const { InvoiceId, TransactionStatus, TransactionId } = body;
    
    if (!InvoiceId) {
      return NextResponse.json({ error: 'Missing InvoiceId' }, { status: 400 });
    }

    // Find order by invoice ID in Google Sheets
    console.log('🔍 [CALLBACK:POST] Looking for order by InvoiceId:', InvoiceId);
    const orderResult = await getOrder(InvoiceId);
    
    if (!orderResult.success || !orderResult.order) {
      console.error('🔍 [CALLBACK:POST] Order not found for invoice:', InvoiceId);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    const order = orderResult.order;
    console.log('🔍 [CALLBACK:POST] Found order in Google Sheets:', {
      ID: order.ID,
      UserID: order.UserID,
      Amount: order.Amount,
      CreditsPurchased: order.CreditsPurchased,
      Status: order.Status
    });

    // Update order status
    if (TransactionStatus === 'Paid') {
      // Check if already processed to prevent duplicates
      if (order.Status === 'paid') {
        console.log('⚠️ [CALLBACK:POST] Order already processed, skipping to prevent duplicate credits');
        return NextResponse.json({ success: true, message: 'Already processed' });
      }

      // Mark as paid in Google Sheets FIRST to prevent race conditions
      console.log('🔍 [CALLBACK:POST] Marking order as paid in Google Sheets...');
      const updateResult = await updateOrderStatus({
        orderId: order.ID,
        status: 'paid',
        paymentId: TransactionId
      });
      
      if (!updateResult.success) {
        console.error('🔍 [CALLBACK:POST] Failed to update order status:', updateResult.error);
        return NextResponse.json(
          { error: 'Failed to update order status: ' + updateResult.error },
          { status: 500 }
        );
      }
      
      // Add credits to user in both databases
      const user = userDb.findById(order.UserID);
      if (user) {
        console.log('💳 [CALLBACK:POST] Adding credits:', { userId: user.id, credits: order.CreditsPurchased });
        // Update local database
        userDb.updateCredits(user.id, order.CreditsPurchased || 0);

        // Update Google Sheets using server wrapper with email fallback
        try {
          let sheetsUpdated = false;
          const byId = await googleSheetsUserDb.addCredits(user.id, order.CreditsPurchased || 0);
          sheetsUpdated = !!byId.success;
          if (!sheetsUpdated) {
            const lookup = await googleSheetsUserDb.findByEmail(user.email);
            if (lookup.success && lookup.user?.id) {
              const targetId = lookup.user.id as string;
              const addByEmail = await googleSheetsUserDb.addCredits(targetId, order.CreditsPurchased || 0);
              sheetsUpdated = !!addByEmail.success;
              if (!sheetsUpdated) {
                const current = Number(lookup.user.credits || 0);
                await googleSheetsUserDb.updateCredits(targetId, current + (order.CreditsPurchased || 0));
              }
            }
          }
        } catch (error) {
          console.error('Error updating Google Sheets (POST callback):', error);
        }
      }

      console.log(`🔍 [CALLBACK:POST] Payment successful for order ${order.ID}, added ${order.CreditsPurchased || 0} credits`);
    } else if (TransactionStatus === 'Failed') {
      await updateOrderStatus({
        orderId: order.ID,
        status: 'failed'
      });
      console.log(`🔍 [CALLBACK:POST] Payment failed for order ${order.ID}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Payment POST callback error:', error);
    return NextResponse.json({ error: 'Callback processing failed' }, { status: 500 });
  }
}
