import { NextRequest, NextResponse } from 'next/server';
import { creditService } from '@/lib/services/credit-service';

// Package definitions matching the packages page EXACTLY
const PACKAGES = {
  'TEST': { credits: 22, amount: 1.00, name: 'اختبار الدفع', currency: 'USD' },
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

    // Get current balance before adding credits
    const currentCredits = creditService.getBalance(userId);
    console.log('🎁 [ADD CREDITS API] User current credits:', currentCredits);

    // Add credits using centralized service
    const creditResult = await creditService.addCredits(
      userId,
      packageCredits,
      `Package purchase: ${packageId} (Order: ${orderId})`
    );

    if (!creditResult.success) {
      console.error('🎁 [ADD CREDITS API] ❌ Credit addition failed:', creditResult.error);
      return NextResponse.json(
        { error: creditResult.error || 'Failed to add credits' },
        { status: 500 }
      );
    }

    const newCredits = creditResult.newBalance || 0;

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
      newCredits
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
      newCredits
    });

  } catch (error) {
    console.error('🎁 [ADD CREDITS API] ❌ Error:', error);
    return NextResponse.json(
      { error: 'Failed to add credits' },
      { status: 500 }
    );
  }
}
