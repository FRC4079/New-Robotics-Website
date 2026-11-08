import { NextResponse } from 'next/server';
import { isAdmin } from '@/utils/auth';

export async function GET() {
  try {
    return NextResponse.json({ authenticated: await isAdmin() });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}
