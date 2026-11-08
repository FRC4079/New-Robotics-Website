import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/utils/auth';
import { UserError, createUser, listUsers } from '@/utils/users';

export async function GET() {
  const access = await requireSuperAdmin();
  if ('denied' in access) return access.denied;
  return NextResponse.json({ success: true, users: await listUsers() });
}

export async function POST(request: NextRequest) {
  const access = await requireSuperAdmin();
  if ('denied' in access) return access.denied;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });

  try {
    const user = await createUser({
      username: body.username,
      displayName: body.displayName,
      password: body.password,
      permissions: body.permissions,
    });
    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    if (error instanceof UserError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    console.error('Create user error:', error);
    return NextResponse.json({ success: false, error: 'Could not create user' }, { status: 500 });
  }
}
