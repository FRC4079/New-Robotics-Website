import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/utils/auth';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // The login page must stay reachable without a session.
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Everything else under /admin needs a validly signed, unexpired session.
  if (!verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
