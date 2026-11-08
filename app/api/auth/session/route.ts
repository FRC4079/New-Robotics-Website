import { NextResponse } from 'next/server';
import { getSessionUser } from '@/utils/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    return NextResponse.json({ authenticated: user !== null, user });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ authenticated: false, user: null });
  }
}
