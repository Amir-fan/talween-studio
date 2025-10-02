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
    
    // Combine and deduplicate users (Google Sheets takes priority)
    const allUsers = [...googleSheetsUsers, ...localUsers];
    const uniqueUsers = allUsers.reduce((acc, user) => {
      const existingIndex = acc.findIndex(u => u.email === user.email);
      if (existingIndex === -1) {
        acc.push(user);
      } else {
        // Update with Google Sheets data if available
        if (googleSheetsUsers.some(gs => gs.email === user.email)) {
          acc[existingIndex] = user;
        }
      }
      return acc;
    }, [] as any[]);
    
    console.log('  - Total unique users:', uniqueUsers.length);
    uniqueUsers.forEach((user, index) => {
      console.log(`    ${index + 1}. ${user.email || user.Email} (${user.id || user.ID}) - ${user.credits || user.Credits || 0} credits`);
    });
    
    // Get all orders
    const orders = orderDb.getAllOrders ? orderDb.getAllOrders() : [];
    const emailLogs = []; // You'll need to implement this in database.ts
    
    // Calculate stats
    const stats = {
      totalUsers: uniqueUsers.length,
      verifiedUsers: uniqueUsers.filter(u => u.email_verified || u.emailVerified).length,
      activeUsers: uniqueUsers.filter(u => (u.status || u.Status) === 'active').length,
      totalCredits: uniqueUsers.reduce((sum, u) => sum + (u.credits || u.Credits || 0), 0),
      totalSpent: uniqueUsers.reduce((sum, u) => sum + (u.total_spent || u.TotalPaid || 0), 0),
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
