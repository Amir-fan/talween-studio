import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/simple-database';

export async function POST(request: NextRequest) {
  try {
    const { userId, amount } = await request.json();

    if (!userId || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid userId or amount' },
        { status: 400 }
      );
    }

    const result = userDb.deductCredits(userId, amount);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Insufficient credits' },
        { status: 400 }
      );
    }

    const user = userDb.findById(userId);
    return NextResponse.json({ success: true, credits: user?.credits ?? null });
  } catch (error) {
    console.error('Deduct credits API error:', error);
    return NextResponse.json(
      { error: 'Failed to deduct credits' },
      { status: 500 }
    );
  }
}


