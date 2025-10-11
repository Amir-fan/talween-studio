import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/simple-database';
import { googleSheetsUserDb } from '@/lib/google-sheets-server';

export async function POST(request: NextRequest) {
  try {
    console.log('🎁 [SIMPLE ADD CREDITS] Starting...');
    
    const { userId, credits } = await request.json();
    
    console.log('🎁 [SIMPLE ADD CREDITS] Adding credits:', { userId, credits });

    if (!userId || !credits) {
      return NextResponse.json(
        { error: 'User ID and credits are required' },
        { status: 400 }
      );
    }

    // Step 1: Add credits to local database (same as admin)
    console.log('🎁 [SIMPLE ADD CREDITS] Adding to local database...');
    const localUser = userDb.findById(userId);
    let localSuccess = false;
    let localNewCredits = 0;

    if (localUser) {
      const currentCredits = localUser.credits || 0;
      localNewCredits = currentCredits + Number(credits);
      localUser.credits = localNewCredits;
      userDb.updateUser(localUser);
      localSuccess = true;
      console.log('🎁 [SIMPLE ADD CREDITS] Local database updated:', { userId, newCredits: localNewCredits });
    } else {
      console.log('🎁 [SIMPLE ADD CREDITS] User not found in local database');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Step 2: Add credits via Google Sheets API (same as admin)
    console.log('🎁 [SIMPLE ADD CREDITS] Adding to Google Sheets...');
    const result = await googleSheetsUserDb.addCredits(userId, Number(credits));
    const googleSheetsSuccess = result.success;

    console.log('🎁 [SIMPLE ADD CREDITS] Results:', {
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
    console.error('🎁 [SIMPLE ADD CREDITS] Error:', error);
    return NextResponse.json(
      { error: 'Failed to add credits: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
