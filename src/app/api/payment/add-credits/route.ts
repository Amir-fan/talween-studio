import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/simple-database';
import { addCredits } from '@/lib/google-sheets-server';

// Package definitions matching the packages page EXACTLY
const PACKAGES = {
  'TEST': { credits: 22, amount: 0.10, name: 'اختبار الدفع', currency: 'USD' },
  'FREE': { credits: 128, amount: 0, name: 'المجانية', currency: 'USD' },
  'EXPLORER': { credits: 1368, amount: 12.99, name: 'المكتشف', currency: 'USD' },
  'CREATIVE_WORLD': { credits: 3440, amount: 29.99, name: 'عالم الإبداع', currency: 'USD' },
  'CREATIVE_TEACHER': { credits: 7938, amount: 59.99, name: 'المعلم المبدع', currency: 'USD' }
} as const;

export async function POST(request: NextRequest) {
  try {
    console.log('🎁 [ADD CREDITS API] === CREDIT ADDITION START ===');
    
    const { orderId, packageId, userId, amount, credits } = await request.json();
    
    console.log('🎁 [ADD CREDITS API] Request received:', { 
      orderId, 
      packageId, 
      userId, 
      amount, 
      credits 
    });

    // SECURITY: Validate required fields and prevent unauthorized access
    if (!orderId || !userId) {
      console.error('🎁 [ADD CREDITS API] Missing required fields');
      return NextResponse.json(
        { error: 'Order ID and User ID are required' },
        { status: 400 }
      );
    }

    // SECURITY: Validate orderId format (must start with 'order_')
    if (!orderId.startsWith('order_')) {
      console.error('🎁 [ADD CREDITS API] Invalid order ID format:', orderId);
      return NextResponse.json(
        { error: 'Invalid order ID format' },
        { status: 400 }
      );
    }

    // Get package info - prefer URL params, fallback to package lookup
    let packageCredits = credits;
    let packageAmount = amount;
    let packageName = 'Unknown Package';

    if (packageId && PACKAGES[packageId as keyof typeof PACKAGES]) {
      const pkg = PACKAGES[packageId as keyof typeof PACKAGES];
      packageCredits = pkg.credits;
      packageAmount = pkg.amount;
      packageName = pkg.name;
      console.log('🎁 [ADD CREDITS API] Using package definition:', { 
        packageId, 
        credits: packageCredits, 
        amount: packageAmount, 
        name: packageName 
      });
    } else if (credits && amount) {
      console.log('🎁 [ADD CREDITS API] Using URL parameters:', { credits, amount });
    } else {
      console.error('🎁 [ADD CREDITS API] No valid package info found');
      return NextResponse.json(
        { error: 'Invalid package information' },
        { status: 400 }
      );
    }

    // Validate credits amount
    if (!packageCredits || packageCredits <= 0) {
      console.error('🎁 [ADD CREDITS API] Invalid credits amount:', packageCredits);
      return NextResponse.json(
        { error: 'Invalid credits amount' },
        { status: 400 }
      );
    }

    console.log('🎁 [ADD CREDITS API] Final package info:', {
      packageCredits,
      packageAmount,
      packageName,
      userId
    });

    // Check if user exists
    const user = userDb.findById(userId);
    if (!user) {
      console.error('🎁 [ADD CREDITS API] User not found:', userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const currentCredits = user.credits || 0;
    console.log('🎁 [ADD CREDITS API] User current credits:', currentCredits);

    // Add credits to local database
    console.log('🎁 [ADD CREDITS API] Adding credits to local database...');
    userDb.updateCredits(userId, packageCredits);
    
    const updatedUser = userDb.findById(userId);
    const newCredits = updatedUser?.credits || 0;
    console.log('🎁 [ADD CREDITS API] Local database updated:', { 
      before: currentCredits, 
      after: newCredits, 
      added: packageCredits 
    });

    // Add credits to Google Sheets
    console.log('🎁 [ADD CREDITS API] Adding credits to Google Sheets...');
    let googleSheetsSuccess = false;
    
    try {
      const addCreditsResult = await addCredits(userId, packageCredits);
      googleSheetsSuccess = addCreditsResult.success;
      
      if (addCreditsResult.success) {
        console.log('🎁 [ADD CREDITS API] ✅ Google Sheets updated successfully:', addCreditsResult);
      } else {
        console.error('🎁 [ADD CREDITS API] ❌ Google Sheets update failed:', addCreditsResult.error);
      }
    } catch (error) {
      console.error('🎁 [ADD CREDITS API] ❌ Google Sheets error:', error);
    }

    console.log('🎁 [ADD CREDITS API] === CREDIT ADDITION COMPLETE ===');
    console.log('🎁 [ADD CREDITS API] Results:', {
      success: true,
      orderId,
      packageId,
      packageName,
      packageCredits,
      packageAmount,
      userId,
      currentCredits,
      newCredits,
      localUpdated: true,
      googleSheetsUpdated: googleSheetsSuccess
    });

    return NextResponse.json({
      success: true,
      message: 'Credits added successfully',
      orderId,
      packageId,
      packageName,
      credits: packageCredits,
      amount: packageAmount,
      userId,
      currentCredits,
      newCredits,
      localUpdated: true,
      googleSheetsUpdated: googleSheetsSuccess
    });

  } catch (error) {
    console.error('🎁 [ADD CREDITS API] ❌ Error:', error);
    return NextResponse.json(
      { error: 'Failed to add credits' },
      { status: 500 }
    );
  }
}
