import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/simple-database';
import { config } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const { userId, amount } = await request.json();

    if (!userId || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid userId or amount' },
        { status: 400 }
      );
    }

    console.log('💳 DEDUCT CREDITS API - Deducting credits:', { userId, amount });

    // Step 1: Deduct from local database
    console.log('💾 Step 1: Deducting from local database...');
    let localResult = { success: false, error: 'User not found in local database' };
    let localCredits = 0;

    try {
      localResult = userDb.deductCredits(userId, amount);
      if (localResult.success) {
        const user = userDb.findById(userId);
        localCredits = user?.credits ?? 0;
        console.log('💾 Local database updated:', { userId, newCredits: localCredits });
      }
    } catch (error) {
      console.log('💾 Local database error (continuing):', error);
    }

    // Step 2: Deduct from Google Sheets
    console.log('📊 Step 2: Deducting from Google Sheets...');
    let googleSheetsResult = { success: false, error: 'Google Sheets unavailable' };
    let googleSheetsCredits = 0;

    try {
      const response = await fetch(`${config.googleAppsScriptUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deductCredits',
          userId: userId,
          amount: amount,
          apiKey: config.googleSheetsApiKey
        })
      });

      if (response.ok) {
        googleSheetsResult = await response.json();
        googleSheetsCredits = googleSheetsResult.newCredits || 0;
        console.log('📊 Google Sheets updated:', { userId, newCredits: googleSheetsCredits });
      }
    } catch (error) {
      console.log('📊 Google Sheets error (continuing):', error);
    }

    // Return success if either deduction succeeded
    if (!localResult.success && !googleSheetsResult.success) {
      return NextResponse.json(
        { error: 'Failed to deduct credits from both databases' },
        { status: 400 }
      );
    }

    const finalCredits = googleSheetsResult.success ? googleSheetsCredits : localCredits;

    return NextResponse.json({ 
      success: true, 
      credits: finalCredits,
      details: {
        localUpdated: localResult.success,
        googleSheetsUpdated: googleSheetsResult.success,
        localCredits: localCredits,
        googleSheetsCredits: googleSheetsCredits
      }
    });

  } catch (error) {
    console.error('Deduct credits API error:', error);
    return NextResponse.json(
      { error: 'Failed to deduct credits' },
      { status: 500 }
    );
  }
}


