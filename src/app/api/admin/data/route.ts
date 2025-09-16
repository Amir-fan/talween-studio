import { NextRequest, NextResponse } from 'next/server';
import { userDb, orderDb, emailDb } from '@/lib/simple-database';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 ADMIN DATA API - Fetching data...');
    
    // Get all data
    const users = userDb.getAllUsers();
    console.log('  - Users found:', users.length);
    users.forEach((user, index) => {
      console.log(`    ${index + 1}. ${user.email} (${user.id}) - ${user.credits} credits`);
    });
    
    const orders = orderDb.findByUser(''); // Get all orders
    const emailLogs = []; // You'll need to implement this in database.ts
    
    // Calculate stats
    const stats = {
      totalUsers: users.length,
      verifiedUsers: users.filter(u => u.email_verified).length,
      activeUsers: users.filter(u => u.status === 'active').length,
      totalCredits: users.reduce((sum, u) => sum + u.credits, 0),
      totalSpent: users.reduce((sum, u) => sum + u.total_spent, 0),
    };
    
    console.log('  - Stats:', stats);

    return NextResponse.json({
      users,
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
