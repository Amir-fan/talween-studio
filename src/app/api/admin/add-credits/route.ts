import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { userDb } from '@/lib/simple-database';
import { googleSheetsUserDb } from '@/lib/google-sheets-server';

export async function POST(request: NextRequest) {
  try {
    const { userId, amount } = await request.json();

    if (!userId || !amount || isNaN(amount)) {
      return NextResponse.json(
        { error: 'Invalid user ID or credits amount' },
        { status: 400 }
      );
    }

    console.log('🔍 ADD CREDITS API - Adding credits:', { userId, amount });

    // Step 1: Add credits to local database
    console.log('💾 Step 1: Adding credits to local database...');
    const localUser = userDb.findById(userId);
    let localSuccess = false;
    let localNewCredits = 0;

    if (localUser) {
      const currentCredits = localUser.credits || 0;
      localNewCredits = currentCredits + Number(amount);
      localUser.credits = localNewCredits;
      userDb.updateUser(localUser);
      localSuccess = true;
      console.log('💾 Local database updated:', { userId, newCredits: localNewCredits });
    } else {
      console.log('💾 User not found in local database, skipping local update');
    }

    // Step 2: Add credits via Google Sheets API (server wrapper)
    console.log('📊 Step 2: Adding credits to Google Sheets...');
    const result = await googleSheetsUserDb.addCredits(userId, Number(amount));
    const googleSheetsSuccess = result.success;

    if (!localSuccess && !googleSheetsSuccess) {
      console.error('❌ Failed to add credits to both databases');
      return NextResponse.json(
        { error: 'Failed to add credits to both local database and Google Sheets' },
        { status: 500 }
      );
    }

    const finalCredits = googleSheetsSuccess ? undefined : localNewCredits;

    return NextResponse.json({ 
      success: true, 
      newCredits: finalCredits,
      message: `تم إضافة ${amount} نقطة بنجاح`,
      details: {
        localUpdated: localSuccess,
        googleSheetsUpdated: googleSheetsSuccess,
        localCredits: localNewCredits,
        googleSheetsCredits: finalCredits
      }
    });

  } catch (error) {
    console.error('Error adding credits:', error);
    return NextResponse.json(
      { error: 'Failed to add credits: ' + error.message },
      { status: 500 }
    );
  }
}
