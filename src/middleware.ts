import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Check if user is authenticated and is admin
    // This is a basic check - in production you'd want more robust auth
    const adminToken = request.cookies.get('admin_token');
    
    if (!adminToken) {
      // Redirect to login with admin redirect
      return NextResponse.redirect(new URL('/login?redirect=/admin', request.url));
    }
  }
  
  // Protect API admin routes
  if (pathname.startsWith('/api/admin')) {
    const adminToken = request.cookies.get('admin_token');
    
    if (!adminToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
};
