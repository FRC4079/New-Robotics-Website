import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
} from '@/utils/auth';
import { authenticate } from '@/utils/users';
import { createFailureLimiter } from '@/utils/rateLimit';

const MAX_FAILURES_PER_CLIENT = 5;
// Backstop for when the client address can be spoofed (no trusted proxy).
const MAX_FAILURES_GLOBAL = 50;
const WINDOW_MS = 15 * 60 * 1000;

const clientLimiter = createFailureLimiter(MAX_FAILURES_PER_CLIENT, WINDOW_MS);
const globalLimiter = createFailureLimiter(MAX_FAILURES_GLOBAL, WINDOW_MS);
const GLOBAL_KEY = 'all';

function getClientKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const clientKey = getClientKey(request);
    const retryAfter = Math.max(
      clientLimiter.retryAfter(clientKey),
      globalLimiter.retryAfter(GLOBAL_KEY)
    );
    if (retryAfter > 0) {
      return NextResponse.json(
        { success: false, error: 'Too many failed attempts. Try again later.' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    const body: unknown = await request.json().catch(() => null);
    const { username, password } = (body ?? {}) as Record<string, unknown>;
    if (typeof username !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
      console.error('ADMIN_USERNAME and ADMIN_PASSWORD must be set');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const user = await authenticate(username, password);
    if (!user) {
      clientLimiter.recordFailure(clientKey);
      globalLimiter.recordFailure(GLOBAL_KEY);
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const sessionToken = createSessionToken(user.username, user.role);
    if (!sessionToken) {
      console.error('SESSION_SECRET must be set to a string of at least 32 characters');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    clientLimiter.reset(clientKey);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_MAX_AGE_SECONDS,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: { username: user.username, displayName: user.displayName, role: user.role },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}
