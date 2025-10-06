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

      // Always update Google Sheets using the order's user_id, with robust email fallback
      try {
        let sheetsUpdated = false;
        const byId = await googleSheetsUserDb.addCredits(order.user_id, amountToAdd);
        sheetsUpdated = !!byId.success;

        if (!sheetsUpdated) {
          // Try to resolve Sheets user by local email if available
          try {
            if (localUser?.email) {
              const lookup = await googleSheetsUserDb.findByEmail(localUser.email);
              if (lookup.success && lookup.user?.id) {
                const targetId = lookup.user.id as string;
                const addByEmail = await googleSheetsUserDb.addCredits(targetId, amountToAdd);
                sheetsUpdated = !!addByEmail.success;
                if (!sheetsUpdated) {
                  const current = Number(lookup.user.credits || 0);
                  const setRes = await googleSheetsUserDb.updateCredits(targetId, current + amountToAdd);
                  sheetsUpdated = !!setRes.success;
                }
              }
            }
          } catch (inner) {
            console.error('Sheets email-based update failed:', inner);
          }
        }

        if (!sheetsUpdated) {
          // Final fallback: try to read current by id and set
          try {
            const sheetUser = await googleSheetsUserDb.findById(order.user_id);
            const current = sheetUser.success && sheetUser.user ? Number((sheetUser.user as any).credits || 0) : 0;
            await googleSheetsUserDb.updateCredits(order.user_id, current + amountToAdd);
          } catch {}
        }
      } catch (e) {
        console.error('Google Sheets addCredits failed (outer):', e);
        try {
          // Attempt email-based update in catch as well
          if (localUser?.email) {
            const lookup = await googleSheetsUserDb.findByEmail(localUser.email);
            if (lookup.success && lookup.user?.id) {
              const targetId = lookup.user.id as string;
              const addByEmail = await googleSheetsUserDb.addCredits(targetId, amountToAdd);
              if (!addByEmail.success) {
                const current = Number(lookup.user.credits || 0);
                await googleSheetsUserDb.updateCredits(targetId, current + amountToAdd);
              }
            }
          }
        } catch {}
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

        // Update Google Sheets using server wrapper with email fallback
        try {
          let sheetsUpdated = false;
          const byId = await googleSheetsUserDb.addCredits(user.id, order.credits_purchased || 0);
          sheetsUpdated = !!byId.success;
          if (!sheetsUpdated) {
            const lookup = await googleSheetsUserDb.findByEmail(user.email);
            if (lookup.success && lookup.user?.id) {
              const targetId = lookup.user.id as string;
              const addByEmail = await googleSheetsUserDb.addCredits(targetId, order.credits_purchased || 0);
              sheetsUpdated = !!addByEmail.success;
              if (!sheetsUpdated) {
                const current = Number(lookup.user.credits || 0);
                await googleSheetsUserDb.updateCredits(targetId, current + (order.credits_purchased || 0));
              }
            }
          }
        } catch (error) {
          console.error('Error updating Google Sheets (POST callback):', error);
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
