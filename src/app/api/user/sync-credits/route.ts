import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/simple-database';
import { googleSheetsUserDb } from '@/lib/google-sheets-server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    console.log('🔄 [SYNC-CREDITS] Request received for userId:', userId);

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Prefer Google Sheets as the source of truth; try by ID, then by email
    let sheetsUser = await googleSheetsUserDb.findById(userId);
    console.log('🔄 [SYNC-CREDITS] findById result:', { success: sheetsUser.success, userId: sheetsUser.user?.id, credits: sheetsUser.user?.credits });
    if (!(sheetsUser.success && sheetsUser.user)) {
      const local = userDb.findById(userId);
      console.log('🔄 [SYNC-CREDITS] Local user lookup:', { found: !!local, email: local?.email });
      if (local?.email) {
        const byEmail = await googleSheetsUserDb.findByEmail(local.email);
        console.log('🔄 [SYNC-CREDITS] findByEmail result:', { success: byEmail.success, userId: byEmail.user?.id, credits: byEmail.user?.credits });
        if (byEmail.success && byEmail.user) {
          sheetsUser = byEmail as any;
        }
      }
    }
    if (sheetsUser.success && sheetsUser.user) {
      const u = sheetsUser.user as any;
      console.log('✅ [SYNC-CREDITS] Returning Sheets user:', { id: u.id, email: u.email, credits: Number(u.credits || 0) });
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
      console.error('❌ [SYNC-CREDITS] User not found in local DB for id:', userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    console.log('✅ [SYNC-CREDITS] Returning Local user:', { id: user.id, email: user.email, credits: user.credits || 0 });
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
    console.error('💥 [SYNC-CREDITS] Credit sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync credits' },
      { status: 500 }
    );
  }
}
