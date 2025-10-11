import { NextRequest, NextResponse } from 'next/server';
import { userDb, orderDb, emailDb } from '@/lib/simple-database';
import { googleSheetsUserDb } from '@/lib/google-sheets-server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 ADMIN DATA API - Fetching data...');
    
    // Get users from Google Sheets first
    let googleSheetsUsers: any[] = [];
    try {
      console.log('  - Fetching users from Google Sheets...');
      const googleResponse = await fetch(`${process.env.GOOGLE_APPS_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL}?action=getUsers&apiKey=${process.env.GOOGLE_SHEETS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY}`);
      const googleData = await googleResponse.json();
      if (googleData.success && googleData.users) {
        googleSheetsUsers = googleData.users;
        console.log('  - Google Sheets users found:', googleSheetsUsers.length);
      }
    } catch (error) {
      console.log('  - Google Sheets fetch failed:', error);
    }
    
    // Get users from local database
    const localUsers = userDb.getAllUsers();
    console.log('  - Local users found:', localUsers.length);
    
    // Normalize Google Sheets users to a unified shape, then dedupe by email
    const normalizedSheets = googleSheetsUsers.map((u: any) => ({
      id: u.ID || u.id || u['المعرف'],
      email: u.Email || u.email || u['البريد الإلكتروني'],
      display_name: u.Name || u.name || u.displayName || u['الاسم'],
      credits: Number(u.Credits || u.credits || u['النقاط'] || 0),
      status: u.Status || u.status || 'active',
      subscription_tier: u.Subscription || u.subscription || 'FREE',
      created_at: u.Created || u.created || Date.now(),
      last_login: u.LastLogin || u.lastLogin || Date.now(),
      total_spent: Number(u.TotalPaid || u.totalPaid || 0)
    }));

    const normalizedLocal = (localUsers || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      display_name: u.display_name,
      credits: u.credits,
      status: u.status,
      subscription_tier: u.subscription_tier,
      created_at: u.created_at,
      last_login: u.last_login,
      total_spent: u.total_spent
    }));

    const combined = [...normalizedSheets, ...normalizedLocal];
    const uniqueUsers = combined.reduce((acc: any[], user: any) => {
      if (!user?.email) return acc;
      const idx = acc.findIndex(u => u.email === user.email);
      if (idx === -1) acc.push(user);
      else acc[idx] = user; // prefer normalizedSheets order first
      return acc;
    }, [] as any[]);
    
    console.log('  - Total unique users:', uniqueUsers.length);
    uniqueUsers.forEach((user, index) => {
      console.log(`    ${index + 1}. ${user.email || user.Email} (${user.id || user.ID}) - ${user.credits || user.Credits || 0} credits`);
    });
    
    // Get all orders
    const orders = orderDb.getAllOrders ? orderDb.getAllOrders() : [];

    // Subscription and package stats
    const subscriptionCounts = orders.reduce((acc: any, o: any) => {
      const tier = o.subscription_tier || 'CREDITS_ONLY';
      acc[tier] = (acc[tier] || 0) + (o.status === 'paid' ? 1 : 0);
      return acc;
    }, {} as Record<string, number>);

    const packageCounts = orders.reduce((acc: any, o: any) => {
      const pack = o.order_number?.split('-')[0] || 'ORDER';
      acc[pack] = (acc[pack] || 0) + (o.status === 'paid' ? 1 : 0);
      return acc;
    }, {} as Record<string, number>);
    const emailLogs = []; // You'll need to implement this in database.ts
    
    // Calculate total paid orders (purchases/subscriptions)
    const paidOrders = orders.filter((o: any) => 
      o.status === 'paid' || 
      o.Status === 'paid' || 
      o.status === 'completed' || 
      o.Status === 'completed'
    );
    
    // Calculate stats
    const stats = {
      totalUsers: uniqueUsers.length,
      verifiedUsers: uniqueUsers.filter(u => u.email_verified || u.emailVerified).length,
      activeUsers: uniqueUsers.filter(u => (u.status || u.Status) === 'active').length,
      totalCredits: uniqueUsers.reduce((sum, u) => sum + (u.credits || u.Credits || 0), 0),
      totalSpent: uniqueUsers.reduce((sum, u) => sum + (u.total_spent || u.TotalPaid || 0), 0),
      totalSubscriptions: paidOrders.length, // Count paid orders instead of subscription tiers
      subscriptionCounts,
      packageCounts,
    };
    
    console.log('  - Stats:', stats);

    return NextResponse.json({
      users: uniqueUsers,
      orders,
      emailLogs,
      stats
    });
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
