import { NextRequest, NextResponse } from 'next/server';
import { orderDb, userDb } from '@/lib/simple-database';

export async function POST(request: NextRequest) {
  try {
    const { orderId, status, transactionId } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    // Find the order
    const order = orderDb.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order status
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

    return NextResponse.json({
      success: true,
      message: 'Payment status updated successfully'
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}