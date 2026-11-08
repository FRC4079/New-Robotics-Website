import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/utils/auth';
import { UserError, changeOwnPassword } from '@/utils/users';

// Lets a sub-account change its own password. The super admin password lives
// in the environment, so it is changed there instead.
export async function POST(request: NextRequest) {
  const access = await requireUser();
  if ('denied' in access) return access.denied;

  if (access.user.role === 'super') {
    return NextResponse.json(
      { success: false, error: 'The super admin password is set with the ADMIN_PASSWORD environment variable.' },
      { status: 400 }
    );
  }

  const body = (await request.json().catch(() => null)) as { current?: unknown; next?: unknown } | null;
  if (typeof body?.current !== 'string' || typeof body?.next !== 'string') {
    return NextResponse.json({ success: false, error: 'Current and new password are required' }, { status: 400 });
  }

  try {
    await changeOwnPassword(access.user.username, body.current, body.next);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof UserError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    console.error('Password change error:', error);
    return NextResponse.json({ success: false, error: 'Could not change password' }, { status: 500 });
  }
}
