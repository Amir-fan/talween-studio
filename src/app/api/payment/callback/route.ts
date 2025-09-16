import { NextRequest, NextResponse } from 'next/server';
import { checkPaymentStatus } from '@/lib/myfatoorah-service';
import { orderDb, userDb } from '@/lib/simple-database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get('paymentId');
    const invoiceId = searchParams.get('invoiceId');
    const orderId = searchParams.get('orderId');

    console.log('MyFatoorah callback received:', { paymentId, invoiceId, orderId });

    if (!invoiceId && !orderId) {
      return NextResponse.json(
        { error: 'Missing payment information' },
        { status: 400 }
      );
    }

    // Check payment status
    const statusResult = await checkPaymentStatus(invoiceId || orderId!);
    
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
      
      // Add credits to user
      const user = userDb.findById(order.userId);
      if (user) {
        userDb.updateCredits(user.id, order.credits);
        
        // Update subscription tier if applicable
        if (order.packageId && order.packageId !== 'FREE') {
          userDb.updateUser(user.id, {
            subscription_tier: order.packageId
          });
        }
      }

      console.log(`Payment successful for order ${orderId}, added ${order.credits} credits`);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/success?orderId=${orderId}&amount=${order.amount}&credits=${order.credits}`);
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
      
      // Add credits to user
      const user = userDb.findById(order.userId);
      if (user) {
        userDb.updateCredits(user.id, order.credits);
        
        // Update subscription tier if applicable
        if (order.packageId && order.packageId !== 'FREE') {
          userDb.updateUser(user.id, {
            subscription_tier: order.packageId
          });
        }
      }

      console.log(`Payment successful for order ${order.id}, added ${order.credits} credits`);
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
