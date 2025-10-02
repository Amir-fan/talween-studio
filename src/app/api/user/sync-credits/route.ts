import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/simple-database';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = userDb.findUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return updated user data
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        credits: user.credits,
        status: user.status,
        emailVerified: user.email_verified,
        subscriptionTier: user.subscription_tier
      }
    });
  } catch (error) {
    console.error('Credit sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync credits' },
      { status: 500 }
    );
  }
}
