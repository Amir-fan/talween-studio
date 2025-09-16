import { NextRequest, NextResponse } from 'next/server';
import { userDb, orderDb, emailDb } from '@/lib/simple-database';

export async function GET(request: NextRequest) {
  try {
    // Get all data
    const users = userDb.getAllUsers();
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
