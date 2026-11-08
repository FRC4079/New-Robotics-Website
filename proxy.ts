import { NextRequest, NextResponse } from 'next/server';

export function proxy(req: NextRequest) {
  // Only run for /admin routes (but not /admin/login)
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Allow access to login page without authentication
    if (req.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }
    
    // Check for admin session cookie
    const hasSession = req.cookies.get('admin_session');
    
    if (!hasSession) {
      // Redirect to login page if not authenticated
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
