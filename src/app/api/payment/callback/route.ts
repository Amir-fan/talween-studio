import { NextRequest, NextResponse } from 'next/server';
import { checkPaymentStatus } from '@/lib/myfatoorah-service';
import { orderDb, userDb } from '@/lib/simple-database';
import { googleSheetsUserDb } from '@/lib/google-sheets-server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get('paymentId');
    let invoiceId = searchParams.get('invoiceId');
    const orderId = searchParams.get('orderId');

    console.log('MyFatoorah callback received:', { paymentId, invoiceId, orderId });

    if (!invoiceId && !orderId) {
      return NextResponse.json(
        { error: 'Missing payment information' },
        { status: 400 }
      );
    }

    // Ensure we use the correct InvoiceId; if missing from query, pull from our stored order
    if (!invoiceId && orderId) {
      try {
        const existingOrder = orderDb.findById(orderId);
        if (existingOrder && existingOrder.payment_intent_id) {
          invoiceId = existingOrder.payment_intent_id;
        }
      } catch {}
    }

    // If mock mode or a MOCK-* PaymentId is provided, short-circuit as Paid
    const isMock = process.env.PAYMENT_USE_MOCK === 'true' || (paymentId?.startsWith('MOCK-') ?? false);
    const statusResult = isMock
      ? { success: true, status: 'Paid', transactionId: paymentId || 'MOCK-TXN' }
      : await checkPaymentStatus(paymentId || (invoiceId as string), paymentId ? 'PaymentId' : 'InvoiceId');
    
    if (!statusResult.success) {
      console.error('Payment status check failed:', statusResult.error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/error?error=${encodeURIComponent(statusResult.error || 'Payment verification failed')}`);
    }

    // Find the order
    const order = orderDb.findById(orderId!);
    if (!order) {
      console.error('Order not found:', orderId);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/error?error=${encodeURIComponent('Order not found')}`);
    }

    // Update order status based on payment result
    if (statusResult.status === 'Paid') {
      orderDb.updateStatus(orderId!, 'paid', paymentId || invoiceId);
      
      // Add credits to user in local DB (if exists) and Google Sheets (always)
      const amountToAdd = order.credits_purchased || (order as any).credits || 0;
      const localUser = userDb.findById(order.user_id);
      if (localUser) {
        userDb.updateCredits(localUser.id, amountToAdd);
        if (order.subscription_tier && order.subscription_tier !== 'FREE') {
          userDb.updateUser(localUser.id, { subscription_tier: order.subscription_tier });
        }
      }

      // Always update Google Sheets using the order's user_id
      try {
        await googleSheetsUserDb.addCredits(order.user_id, amountToAdd);
      } catch (e) {
        console.error('Google Sheets addCredits failed:', e);
      }

      console.log(`Payment successful for order ${orderId}, added ${order.credits_purchased || 0} credits`);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/success?orderId=${orderId}&amount=${order.total_amount}&credits=${order.credits_purchased || 0}`);
    } else if (statusResult.status === 'Failed') {
      orderDb.updateStatus(orderId!, 'failed');
      console.log(`Payment failed for order ${orderId}`);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/error?orderId=${orderId}&error=${encodeURIComponent('Payment failed')}`);
    } else {
      // Pending or other status
      console.log(`Payment pending for order ${orderId}, status: ${statusResult.status}`);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/pending?orderId=${orderId}`);
    }
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/error?error=${encodeURIComponent('Payment verification error')}`);
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

    // Find order by invoice ID or custom field
    const orders = orderDb.getAllOrders();
    const order = orders.find(o => o.id === InvoiceId || o.transactionId === InvoiceId);
    
    if (!order) {
      console.error('Order not found for invoice:', InvoiceId);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order status
    if (TransactionStatus === 'Paid') {
      orderDb.updateStatus(order.id, 'paid', TransactionId);
      
      // Add credits to user in both databases
      const user = userDb.findById(order.user_id);
      if (user) {
        // Update local database
        userDb.updateCredits(user.id, order.credits_purchased || 0);
        
        // Update subscription tier if applicable
        if (order.subscription_tier && order.subscription_tier !== 'FREE') {
          userDb.updateUser(user.id, {
            subscription_tier: order.subscription_tier
          });
        }

        // Update Google Sheets
        try {
          await fetch(`${process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'addCredits',
              userId: user.id,
              amount: order.credits_purchased || 0,
              apiKey: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY
            })
          });

          // Send thank you email
          await fetch(`${process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipientEmail: user.email,
              emailType: 'paymentSuccess',
              templateData: {
                name: user.display_name || 'مستخدم',
                orderNumber: order.id,
                totalAmount: order.total_amount || order.amount,
                credits: order.credits_purchased || order.credits,
                appUrl: process.env.NEXT_PUBLIC_APP_URL
              },
              userId: user.id
            })
          });
        } catch (error) {
          console.error('Error updating Google Sheets or sending email:', error);
        }
      }

      console.log(`Payment successful for order ${order.id}, added ${order.credits_purchased || 0} credits`);
    } else if (TransactionStatus === 'Failed') {
      orderDb.updateStatus(order.id, 'failed');
      console.log(`Payment failed for order ${order.id}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Payment POST callback error:', error);
    return NextResponse.json({ error: 'Callback processing failed' }, { status: 500 });
  }
}
