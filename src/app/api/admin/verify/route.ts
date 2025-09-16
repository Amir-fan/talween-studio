import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get user from request headers (set by client)
    const userId = request.headers.get('x-user-id');
    const isAdmin = request.headers.get('x-is-admin');
    
    if (!userId || isAdmin !== 'true') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized - Admin access required',
          isAdmin: false 
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      isAdmin: true,
      message: 'Admin access verified' 
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Server error',
        isAdmin: false 
      },
      { status: 500 }
    );
  }
}
