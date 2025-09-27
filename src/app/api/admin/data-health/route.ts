import { NextRequest, NextResponse } from 'next/server';
import { performDataHealthCheck, performDataRecovery } from '@/lib/data-monitor';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 ADMIN: Data health check requested');
    
    const healthReport = performDataHealthCheck();
    
    return NextResponse.json({
      success: true,
      report: healthReport
    });
  } catch (error) {
    console.error('Data health check error:', error);
    return NextResponse.json(
      { error: 'Failed to perform data health check' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚨 ADMIN: Data recovery requested');
    
    const { action } = await request.json();
    
    if (action === 'recover') {
      const recoveryResult = await performDataRecovery();
      
      return NextResponse.json({
        success: true,
        recovery: recoveryResult
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Data recovery error:', error);
    return NextResponse.json(
      { error: 'Failed to perform data recovery' },
      { status: 500 }
    );
  }
}
