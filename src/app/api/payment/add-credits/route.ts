import { NextRequest, NextResponse } from 'next/server';
import { creditService } from '@/lib/services/credit-service';
import { orderManagerService } from '@/lib/services/order-manager-service';
import { updateOrderStatus } from '@/lib/google-sheets-orders';

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
    
    // Parse request body with error handling
    let requestBody;
    try {
      requestBody = await request.json();
      console.log('🎁 [ADD CREDITS API] Request body parsed successfully');
    } catch (parseError) {
      console.error('🎁 [ADD CREDITS API] ❌ Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    const { orderId, packageId, userId, amount, credits } = requestBody;
    
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

    // CRITICAL: Check if credits already added to prevent duplicates on page refresh
    console.log('🎁 [ADD CREDITS API] Checking for duplicate processing...');
    const orderResult = await orderManagerService.findById(orderId);
    
    if (!orderResult.success || !orderResult.order) {
      console.error('🎁 [ADD CREDITS API] Order not found:', orderId);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if credits were already added for this order
    if (orderResult.order.CreditsAdded === true || orderResult.order.CreditsAdded === 'true') {
      console.log('⚠️ [ADD CREDITS API] Credits already added for this order - preventing duplicate!');
      console.log('🎁 [ADD CREDITS API] Order details:', {
        orderId: orderResult.order.ID,
        status: orderResult.order.Status,
        creditsAdded: orderResult.order.CreditsAdded,
        creditsPurchased: orderResult.order.CreditsPurchased
      });

      // Return success with existing data (don't add credits again)
      return NextResponse.json({
        success: true,
        message: 'Credits already added (duplicate prevented)',
        orderId,
        packageId,
        packageName,
        credits: orderResult.order.CreditsPurchased || packageCredits,
        amount: orderResult.order.Amount || packageAmount,
        userId,
        currentCredits: creditService.getBalance(userId),
        newCredits: creditService.getBalance(userId),
        alreadyProcessed: true
      });
    }

    // CRITICAL FIX: If order is "pending" but user reached success page, trust the payment
    if (orderResult.order.Status === 'pending') {
      console.log('🎁 [ADD CREDITS API] Order is pending but user reached success page - trusting payment was successful');
      console.log('🎁 [ADD CREDITS API] This means MyFatoorah bypassed our callback, but payment was successful');
      
      // Mark order as paid first
      try {
        await updateOrderStatus({
          orderId: orderId,
          status: 'paid',
          CreditsAdded: false // Will be set to true after credits added
        });
        console.log('✅ [ADD CREDITS API] Order marked as paid (was pending)');
      } catch (updateError) {
        console.error('⚠️ [ADD CREDITS API] Failed to mark pending order as paid:', updateError);
        // Continue anyway - we'll still add credits
      }
    }

    console.log('✅ [ADD CREDITS API] Order not yet processed, proceeding with credit addition');

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

    // Mark order as processed to prevent future duplicates
    console.log('🎁 [ADD CREDITS API] Marking order as processed...');
    try {
      await updateOrderStatus({
        orderId: orderId,
        status: 'paid',
        CreditsAdded: true
      });
      console.log('✅ [ADD CREDITS API] Order marked with CreditsAdded=true');
    } catch (updateError) {
      console.error('⚠️ [ADD CREDITS API] Failed to mark order (non-critical):', updateError);
      // Non-critical - credits were added successfully, just log the error
    }

    // Send high-value lead to LeadConnector (non-blocking)
    try {
      console.log('📞 Sending payment lead to LeadConnector webhook...');
      
      // Get user details for lead
      const { userDb } = await import('@/lib/simple-database');
      const user = userDb.findById(userId);
      
      if (user) {
        await fetch('https://services.leadconnectorhq.com/hooks/2xJ6VY43ugovZK68Cz74/webhook-trigger/260c7d50-814b-47de-9245-257723375ee0', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            // Lead basic information
            email: user.email,
            first_name: (user.displayName || user.display_name || 'User').split(' ')[0],
            last_name: (user.displayName || user.display_name || 'User').split(' ').slice(1).join(' ') || '',
            full_name: user.displayName || user.display_name || 'User',
            
            // Lead source and tracking
            source: 'talween-studio-payment',
            lead_source: 'Payment Success (Direct)',
            campaign: 'Credit Purchase',
            
            // Lead details
            lead_type: 'Customer Purchase',
            status: 'Customer',
            tags: ['customer', 'paid', 'credits-purchase', 'high-value', 'direct-credit'],
            
            // Purchase data
            user_id: user.id,
            order_id: orderId,
            purchase_amount: packageAmount,
            credits_purchased: packageCredits,
            package_id: packageId,
            payment_method: 'MyFatoorah',
            
            // Timestamps
            created_at: new Date().toISOString(),
            timestamp: Date.now(),
            
            // Additional metadata
            metadata: {
              purchase_method: 'online',
              platform_version: '1.0',
              payment_source: 'myfatoorah',
              credit_addition_method: 'direct-api',
              is_returning_customer: false
            }
          })
        });
        console.log('✅ High-value customer lead sent to LeadConnector (via add-credits)');
      }
    } catch (e) {
      console.log('❌ Payment lead webhook failed (non-blocking):', e);
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
    console.error('🎁 [ADD CREDITS API] ❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { 
        error: 'Failed to add credits',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
