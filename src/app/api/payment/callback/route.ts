import { NextRequest, NextResponse } from 'next/server';
import { paymentVerificationService } from '@/lib/services/payment-verification-service';
import { orderManagerService } from '@/lib/services/order-manager-service';
import { creditService } from '@/lib/services/credit-service';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();
  console.log('='.repeat(50));
  console.log(`🔍 [CALLBACK] ${timestamp} - PAYMENT CALLBACK TRIGGERED`);
  console.log('='.repeat(50));
  
  try {
    const searchParams = request.nextUrl.searchParams;
    let paymentId = searchParams.get('paymentId');
    let invoiceId = searchParams.get('invoiceId');
    const orderId = searchParams.get('orderId');

    console.log('🔍 [CALLBACK] Payment callback:', { paymentId, invoiceId, orderId });

    // Must have orderId at minimum
    if (!orderId) {
      console.error('🔍 [CALLBACK] ❌ Missing orderId');
      return NextResponse.redirect(`${APP_URL}/payment/error?error=${encodeURIComponent('Missing order information')}`);
    }

    // Find order
    const orderResult = await orderManagerService.findById(orderId!);
    if (!orderResult.success || !orderResult.order) {
      console.error('🔍 [CALLBACK] ❌ Order not found');
      return NextResponse.redirect(`${APP_URL}/payment/error?orderId=${orderId}&error=${encodeURIComponent('Order not found')}`);
    }

    const order = orderResult.order;

    // If payment ID not in URL, try to get it from the order
    if (!paymentId && !invoiceId && order.PaymentIntentID) {
      console.log('🔍 [CALLBACK] Using PaymentIntentID from order:', order.PaymentIntentID);
      invoiceId = order.PaymentIntentID.toString();
    }

    // Check if already processed
    if (orderManagerService.isAlreadyProcessed(order)) {
      console.log('⚠️ [CALLBACK] Order already processed, redirecting to success');
      return NextResponse.redirect(
        `${APP_URL}/payment/success?orderId=${orderId}&amount=${order.Amount}&credits=${order.CreditsPurchased || 0}&packageId=${order.PackageID}&userId=${order.UserID}`
      );
    }

    // Verify payment status
    const isMock = paymentId?.startsWith('MOCK-');
    const verificationKey = paymentId || invoiceId || order.PaymentIntentID;
    
    const paymentStatus = isMock
      ? { success: true, status: 'Paid' as const }
      : await paymentVerificationService.verifyPayment(
          verificationKey!,
          paymentId ? 'PaymentId' : 'InvoiceId'
        );

    if (!paymentStatus.success) {
      console.error('🔍 [CALLBACK] ❌ Payment verification failed:', paymentStatus.error);
      return NextResponse.redirect(
        `${APP_URL}/payment/error?orderId=${orderId}&paymentId=${paymentId}&error=${encodeURIComponent(paymentStatus.error || 'Verification failed')}`
      );
    }

    // Handle different payment statuses
    if (paymentStatus.status === 'Paid') {
      // Mark order as paid FIRST
      const markResult = await orderManagerService.markAsPaid(orderId!, paymentId || invoiceId || undefined);
      
      if (!markResult.success) {
        console.error('🔍 [CALLBACK] ❌ Failed to mark order as paid');
        return NextResponse.redirect(`${APP_URL}/payment/error?orderId=${orderId}&error=${encodeURIComponent('Failed to update order')}`);
      }

      // Add credits immediately in callback (server-side, reliable)
      console.log('💰 [CALLBACK] Adding credits for successful payment...');
      const creditResult = await creditService.addCredits(
        order.UserID,
        order.CreditsPurchased || 0,
        `Payment verified: ${orderId}`
      );

      if (!creditResult.success) {
        console.error('🔍 [CALLBACK] ⚠️ Credit addition failed:', creditResult.error);
        // Order is marked paid, user can contact support
        // Still redirect to success with warning
      } else {
        console.log('✅ [CALLBACK] Credits added successfully:', creditResult.newBalance);
      }

      console.log('✅ [CALLBACK] Payment successful, redirecting to success page');
      return NextResponse.redirect(
        `${APP_URL}/payment/success?orderId=${orderId}&amount=${order.Amount}&credits=${order.CreditsPurchased || 0}&packageId=${order.PackageID}&userId=${order.UserID}`
      );

    } else if (paymentStatus.status === 'Failed') {
      await orderManagerService.markAsFailed(orderId!);
      console.log('❌ [CALLBACK] Payment failed');
      return NextResponse.redirect(`${APP_URL}/payment/error?orderId=${orderId}&error=${encodeURIComponent('Payment failed')}`);

    } else {
      // Pending status
      console.log('⏳ [CALLBACK] Payment pending');
      return NextResponse.redirect(
        `${APP_URL}/payment/pending?orderId=${orderId}&amount=${order.Amount}&credits=${order.CreditsPurchased || 0}&packageId=${order.PackageID}&userId=${order.UserID}`
      );
    }

  } catch (error) {
    console.error('💥 [CALLBACK] Error:', error);
    
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');
    const paymentId = searchParams.get('paymentId');
    
    return NextResponse.redirect(
      `${APP_URL}/payment/error?orderId=${orderId || 'unknown'}&paymentId=${paymentId || 'unknown'}&error=${encodeURIComponent('Payment verification error')}`
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔍 [CALLBACK:POST] MyFatoorah POST callback:', body);

    const { InvoiceId, TransactionStatus, TransactionId } = body;
    
    if (!InvoiceId) {
      return NextResponse.json({ error: 'Missing InvoiceId' }, { status: 400 });
    }

    // Find order by invoice ID
    const orderResult = await orderManagerService.findById(InvoiceId);
    
    if (!orderResult.success || !orderResult.order) {
      console.error('🔍 [CALLBACK:POST] Order not found');
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    const order = orderResult.order;

    // Check if already processed
    if (orderManagerService.isAlreadyProcessed(order)) {
      console.log('⚠️ [CALLBACK:POST] Order already processed');
      return NextResponse.json({ success: true, message: 'Already processed' });
    }

    // Update order status and add credits
    if (TransactionStatus === 'Paid') {
      // Mark as paid FIRST
      const markResult = await orderManagerService.markAsPaid(order.ID, TransactionId);
      
      if (!markResult.success) {
        console.error('🔍 [CALLBACK:POST] Failed to mark order as paid');
        return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
      }
      
      // Add credits using centralized service (same as GET handler)
      console.log('💰 [CALLBACK:POST] Adding credits for successful payment...');
      const creditResult = await creditService.addCredits(
        order.UserID,
        order.CreditsPurchased || 0,
        `Payment verified: ${order.ID}`
      );

      if (!creditResult.success) {
        console.error('🔍 [CALLBACK:POST] ⚠️ Credit addition failed:', creditResult.error);
        // Order is marked as paid, user can contact support
        return NextResponse.json({
          success: true,
          warning: 'Order processed but credits addition failed'
        });
      }

      console.log(`✅ [CALLBACK:POST] Payment successful, ${order.CreditsPurchased} credits added`);
      return NextResponse.json({ received: true, success: true });

    } else if (TransactionStatus === 'Failed') {
      await orderManagerService.markAsFailed(order.ID);
      console.log('❌ [CALLBACK:POST] Payment failed');
      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('💥 [CALLBACK:POST] Error:', error);
    return NextResponse.json({ error: 'Callback processing failed' }, { status: 500 });
  }
}

