import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/simple-database';
import { googleSheetsUserDb } from '@/lib/google-sheets-server';

export async function POST(request: NextRequest) {
  try {
    console.log('🎁 [PUBLIC ADD CREDITS] Starting...');
    
    const { userId, credits } = await request.json();
    
    console.log('🎁 [PUBLIC ADD CREDITS] Adding credits:', { userId, credits });

    if (!userId || !credits) {
      console.error('🎁 [PUBLIC ADD CREDITS] Missing required fields');
      return NextResponse.json(
        { error: 'User ID and credits are required' },
        { status: 400 }
      );
    }

    // Validate credits amount
    if (credits <= 0 || credits > 1000) {
      console.error('🎁 [PUBLIC ADD CREDITS] Invalid credits amount:', credits);
      return NextResponse.json(
        { error: 'Invalid credits amount' },
        { status: 400 }
      );
    }

    // Step 1: Add credits to local database
    console.log('🎁 [PUBLIC ADD CREDITS] Adding to local database...');
    const localUser = userDb.findById(userId);
    let localSuccess = false;
    let localNewCredits = 0;

    if (localUser) {
      const currentCredits = localUser.credits || 0;
      localNewCredits = currentCredits + Number(credits);
      localUser.credits = localNewCredits;
      userDb.updateUser(localUser);
      localSuccess = true;
      console.log('🎁 [PUBLIC ADD CREDITS] Local database updated:', { userId, newCredits: localNewCredits });
    } else {
      console.error('🎁 [PUBLIC ADD CREDITS] User not found in local database');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Step 2: Add credits via Google Sheets API
    console.log('🎁 [PUBLIC ADD CREDITS] Adding to Google Sheets...');
    const result = await googleSheetsUserDb.addCredits(userId, Number(credits));
    const googleSheetsSuccess = result.success;

    if (!localSuccess && !googleSheetsSuccess) {
      console.error('🎁 [PUBLIC ADD CREDITS] Failed to add credits to both databases');
      return NextResponse.json(
        { error: 'Failed to add credits to both local database and Google Sheets' },
        { status: 500 }
      );
    }

    console.log('🎁 [PUBLIC ADD CREDITS] Success! Results:', {
      localSuccess,
      googleSheetsSuccess,
      newCredits: localNewCredits
    });

    return NextResponse.json({ 
      success: true,
      newCredits: localNewCredits,
      message: `تم إضافة ${credits} نقطة بنجاح`,
      localUpdated: localSuccess,
      googleSheetsUpdated: googleSheetsSuccess
    });

  } catch (error) {
    console.error('🎁 [PUBLIC ADD CREDITS] Error:', error);
    return NextResponse.json(
      { error: 'Failed to add credits: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
