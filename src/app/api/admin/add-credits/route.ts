import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/simple-database';

export async function POST(request: NextRequest) {
  try {
    const { userId, credits } = await request.json();

    if (!userId || !credits || isNaN(credits)) {
      return NextResponse.json(
        { error: 'Invalid user ID or credits amount' },
        { status: 400 }
      );
    }

    // Add credits to user
    userDb.updateCredits(userId, credits);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding credits:', error);
    return NextResponse.json(
      { error: 'Failed to add credits' },
      { status: 500 }
    );
  }
}
