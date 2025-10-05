import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/simple-database';
import { googleSheetsUserDb } from '@/lib/google-sheets-server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Prefer Google Sheets as the source of truth; fallback to local DB
    let sheetsUser = await googleSheetsUserDb.findById(userId);
    if (sheetsUser.success && sheetsUser.user) {
      const u = sheetsUser.user as any;
      return NextResponse.json({
        success: true,
        user: {
          id: u.id,
          email: u.email,
          displayName: u.displayName,
          credits: Number(u.credits || 0),
          status: u.status || 'active',
          emailVerified: !!u.emailVerified,
          subscriptionTier: u.subscriptionTier || 'FREE'
        }
      });
    }

    // Fallback to local DB
    const user = userDb.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        credits: user.credits || 0,
        status: user.status || 'active',
        emailVerified: user.email_verified || true,
        subscriptionTier: user.subscription_tier || 'FREE'
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
