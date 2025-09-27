import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Check if user is authenticated and is admin
    // This is a basic check - in production you'd want more robust auth
    const adminToken = request.cookies.get('admin_token');
    
    console.log('🔍 MIDDLEWARE - Admin route check:');
    console.log('  - pathname:', pathname);
    console.log('  - adminToken:', adminToken?.value);
    console.log('  - all cookies:', request.cookies.getAll());
    
    if (!adminToken) {
      console.log('❌ No admin token found - redirecting to login');
      // Redirect to login with admin redirect
      return NextResponse.redirect(new URL('/login?redirect=/admin', request.url));
    }
    
    console.log('✅ Admin token found - allowing access');
  }
  
  // Protect API admin routes
  if (pathname.startsWith('/api/admin')) {
    const adminToken = request.cookies.get('admin_token');
    
    console.log('🔍 API ADMIN MIDDLEWARE:');
    console.log('  - pathname:', pathname);
    console.log('  - adminToken:', adminToken?.value);
    
    if (!adminToken) {
      console.log('❌ No admin token - blocking request');
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }
    
    console.log('✅ Admin token found - allowing request');
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
};
