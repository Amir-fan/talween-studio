import { NextRequest, NextResponse } from 'next/server';
import { userDb, orderDb } from '@/lib/simple-database';
import { googleSheetsUserDb } from '@/lib/google-sheets-server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 MINIMAL PAYMENT TEST - Starting...');
    
    const { userId } = await request.json();
    console.log('🔍 MINIMAL PAYMENT TEST - User ID:', userId);
    
    // Test user lookup
    console.log('🔍 MINIMAL PAYMENT TEST - Testing user lookup...');
    let user = null;
    
    try {
      user = await googleSheetsUserDb.findById(userId);
      console.log('📊 User found in Google Sheets:', !!user);
    } catch (error) {
      console.log('📊 Google Sheets error:', error);
    }
    
    if (!user) {
      user = userDb.findById(userId);
      console.log('💾 User found in local database:', !!user);
    }
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log('📊 User data:', { id: user.id, email: user.email, displayName: user.displayName });
    
    // Test order creation
    console.log('🔍 MINIMAL PAYMENT TEST - Testing order creation...');
    const orderResult = orderDb.create(userId, 9.99, 'starter', 100);
    console.log('📊 Order created:', orderResult);
    
    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, displayName: user.displayName },
      order: orderResult,
      message: 'Minimal payment test completed'
    });
  } catch (error) {
    console.error('❌ Minimal payment test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
