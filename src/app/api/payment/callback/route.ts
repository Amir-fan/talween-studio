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
        const orderResult = await getOrder(orderId);
        if (orderResult.success && orderResult.order && orderResult.order.PaymentIntentID) {
          invoiceId = orderResult.order.PaymentIntentID;
        }
      } catch {}
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
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/error?error=${encodeURIComponent(statusResult.error || 'Payment verification failed')}`);
    }

    // Find the order in Google Sheets
    console.log('🔍 [CALLBACK] Looking for order in Google Sheets:', orderId);
    const orderResult = await getOrder(orderId!);
    if (!orderResult.success || !orderResult.order) {
      console.error('🔍 [CALLBACK] ❌ Order not found in Google Sheets:', orderId);
      console.error('🔍 [CALLBACK] Error:', orderResult.error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/error?error=${encodeURIComponent('Order not found')}`);
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
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/success?orderId=${orderId}&amount=${order.Amount}&credits=${order.CreditsPurchased || 0}`);
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

      // Add credits to user in local DB (if exists) and Google Sheets (always)
      const amountToAdd = order.CreditsPurchased || 0;
      console.log('💳 [CALLBACK:GET] Calculated amountToAdd:', amountToAdd);
      const localUserBefore = userDb.findById(order.UserID);
      if (localUserBefore) {
        console.log('💳 [CALLBACK:GET] Local user BEFORE credit add:', { id: localUserBefore.id, email: localUserBefore.email, credits: localUserBefore.credits });
        userDb.updateCredits(localUserBefore.id, amountToAdd);
        const localUserAfter = userDb.findById(order.UserID);
        console.log('💳 [CALLBACK:GET] Local user AFTER credit add:', { id: localUserAfter?.id, credits: localUserAfter?.credits });
      }

      // Always update Google Sheets using the order's user_id, with robust email fallback
      try {
        let sheetsUpdated = false;
        console.log('📊 [CALLBACK:GET] Attempt Sheets addCredits by ID:', { userId: order.UserID, amountToAdd });
        const byId = await googleSheetsUserDb.addCredits(order.UserID, amountToAdd);
        console.log('📊 [CALLBACK:GET] Sheets addCredits by ID result:', byId);
        sheetsUpdated = !!byId.success;

        if (!sheetsUpdated) {
          // Try to resolve Sheets user by local email if available
          try {
            const localUser = userDb.findById(order.UserID);
            if (localUser?.email) {
              console.log('📊 [CALLBACK:GET] Attempt Sheets findByEmail:', localUser.email);
              const lookup = await googleSheetsUserDb.findByEmail(localUser.email);
              console.log('📊 [CALLBACK:GET] Sheets findByEmail result:', { success: lookup.success, userId: lookup.user?.id, credits: lookup.user?.credits });
              if (lookup.success && lookup.user?.id) {
                const targetId = lookup.user.id as string;
                console.log('📊 [CALLBACK:GET] Attempt Sheets addCredits by found ID:', { targetId, amountToAdd });
                const addByEmail = await googleSheetsUserDb.addCredits(targetId, amountToAdd);
                console.log('📊 [CALLBACK:GET] Sheets addCredits by found ID result:', addByEmail);
                sheetsUpdated = !!addByEmail.success;
                if (!sheetsUpdated) {
                  const current = Number(lookup.user.credits || 0);
                  console.log('📊 [CALLBACK:GET] Attempt Sheets updateCredits (explicit set):', { targetId, current, newTotal: current + amountToAdd });
                  const setRes = await googleSheetsUserDb.updateCredits(targetId, current + amountToAdd);
                  console.log('📊 [CALLBACK:GET] Sheets updateCredits result:', setRes);
                  sheetsUpdated = !!setRes.success;
                }
              }
            }
          } catch (inner) {
            console.error('📊 [CALLBACK:GET] Sheets email-based update failed:', inner);
          }
        }

        if (!sheetsUpdated) {
          // Final fallback: try to read current by id and set
          try {
            console.log('📊 [CALLBACK:GET] Final fallback findById:', order.user_id);
            const sheetUser = await googleSheetsUserDb.findById(order.user_id);
            const current = sheetUser.success && sheetUser.user ? Number((sheetUser.user as any).credits || 0) : 0;
            console.log('📊 [CALLBACK:GET] Final fallback current credits:', current);
            const setRes = await googleSheetsUserDb.updateCredits(order.user_id, current + amountToAdd);
            console.log('📊 [CALLBACK:GET] Final fallback updateCredits result:', setRes);
          } catch {}
        }
      } catch (e) {
        console.error('📊 [CALLBACK:GET] Sheets addCredits failed (outer):', e);
        try {
          // Attempt email-based update in catch as well
          const localUser = userDb.findById(order.user_id);
          if (localUser?.email) {
            console.log('📊 [CALLBACK:GET] Catch fallback findByEmail:', localUser.email);
            const lookup = await googleSheetsUserDb.findByEmail(localUser.email);
            if (lookup.success && lookup.user?.id) {
              const targetId = lookup.user.id as string;
              console.log('📊 [CALLBACK:GET] Catch fallback addCredits by targetId:', targetId);
              const addByEmail = await googleSheetsUserDb.addCredits(targetId, amountToAdd);
              if (!addByEmail.success) {
                const current = Number(lookup.user.credits || 0);
                console.log('📊 [CALLBACK:GET] Catch fallback updateCredits explicit set:', { current, newTotal: current + amountToAdd });
                await googleSheetsUserDb.updateCredits(targetId, current + amountToAdd);
              }
            }
          }
        } catch {}
      }

      console.log(`✅ [CALLBACK:GET] Payment successful for order ${orderId}, added ${order.CreditsPurchased || 0} credits`);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/success?orderId=${orderId}&amount=${order.Amount}&credits=${order.CreditsPurchased || 0}`);
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
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/pending?orderId=${orderId}`);
    }
  } catch (error) {
    console.error('💥 [CALLBACK:GET] Payment callback error:', error);
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
      // Check if already processed to prevent duplicates
      if (order.status === 'paid') {
        console.log('⚠️ [CALLBACK:POST] Order already processed, skipping to prevent duplicate credits');
        return NextResponse.json({ success: true, message: 'Already processed' });
      }

      // Mark as paid FIRST to prevent race conditions
      orderDb.updateStatus(order.id, 'paid', TransactionId);
      
      // Add credits to user in both databases
      const user = userDb.findById(order.user_id);
      if (user) {
        console.log('💳 [CALLBACK:POST] Adding credits:', { userId: user.id, credits: order.credits_purchased });
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
