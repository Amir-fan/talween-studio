import { NextRequest, NextResponse } from 'next/server';
import { userDb, contentDb, orderDb } from '@/lib/simple-database';
import { googleSheetsUserDb } from '@/lib/google-sheets-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user data - try local first, then Google Sheets
    let user = userDb.findById(userId);
    
    // If not found locally, try Google Sheets
    if (!user) {
      console.log('[STATS API] User not found locally, trying Google Sheets...');
      try {
        const googleSheetsResult = await googleSheetsUserDb.findById(userId);
        if (googleSheetsResult.success && googleSheetsResult.user) {
          console.log('[STATS API] User found in Google Sheets');
          user = googleSheetsResult.user;
        }
      } catch (error: any) {
        console.error('[STATS API] Google Sheets lookup failed:', error);
      }
    }
    
    if (!user) {
      console.error('[STATS API] User not found in any database:', userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user content
    const allUserContent = contentDb.findByUser(userId);
    const userContent = allUserContent.filter(content => content.status !== 'favorite');
    const favorites = allUserContent.filter(content => content.status === 'favorite');
    
    // Get user orders
    const userOrders = orderDb.findByUser(userId);

    // Calculate statistics
    const stats = {
      stories: allUserContent.filter(item => item.type === 'story').length,
      coloring: allUserContent.filter(item => item.type === 'coloring').length,
      images: allUserContent.filter(item => item.type === 'image').length,
      totalContent: allUserContent.length,
      creditsUsed: user.total_spent || 0,
      creditsRemaining: user.credits || 0,
      totalPurchased: userOrders.reduce((sum, order) => sum + (order.credits_purchased || 0), 0),
      joinDate: user.created_at,
      lastLogin: user.last_login,
      subscriptionTier: user.subscription_tier || 'FREE',
      emailVerified: user.email_verified || false
    };

    // Get recent transactions (orders and content creation)
    const recentTransactions = [
      ...userOrders.map(order => ({
        id: order.id,
        type: 'purchase',
        amount: order.credits_purchased || 0,
        description: `شراء ${order.credits_purchased || 0} نقطة - ${order.subscription_tier || 'باقة'}`,
        date: new Date(order.created_at * 1000),
        status: order.status
      })),
      ...allUserContent.map(content => ({
        id: content.id,
        type: 'deduction',
        amount: -getContentCost(content.type),
        description: `${getContentTypeLabel(content.type)}: ${content.title}`,
        date: new Date(content.created_at * 1000),
        status: 'completed'
      }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        credits: user.credits,
        subscription_tier: user.subscription_tier,
        email_verified: user.email_verified,
        created_at: user.created_at,
        last_login: user.last_login
      },
      stats,
      recentTransactions,
      userContent,
      favorites
    });
  } catch (error: any) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
}

// Helper function to get content cost based on type
function getContentCost(type: string): number {
  switch (type) {
    case 'story':
      return 50; // Average story cost
    case 'coloring':
      return 25; // Average coloring page cost
    case 'image':
      return 30; // Average image conversion cost
    default:
      return 20;
  }
}

// Helper function to get content type label
function getContentTypeLabel(type: string): string {
  switch (type) {
    case 'story':
      return 'قصة';
    case 'coloring':
      return 'صفحة تلوين';
    case 'image':
      return 'تحويل صورة';
    default:
      return 'محتوى';
  }
}
