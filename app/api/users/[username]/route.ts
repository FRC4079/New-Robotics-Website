import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/utils/auth';
import { UserError, deleteUser, updateUser } from '@/utils/users';

type Params = { params: Promise<{ username: string }> };

function failure(error: unknown): NextResponse {
  if (error instanceof UserError) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.status });
  }
  console.error('User admin error:', error);
  return NextResponse.json({ success: false, error: 'Request failed' }, { status: 500 });
}

// Edit name, permissions, disabled flag, or reset the password.
export async function PATCH(request: NextRequest, { params }: Params) {
  const access = await requireSuperAdmin();
  if ('denied' in access) return access.denied;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });

  try {
    const { username } = await params;
    const user = await updateUser(username, {
      displayName: body.displayName,
      permissions: body.permissions,
      disabled: body.disabled,
      password: body.password,
    });
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const access = await requireSuperAdmin();
  if ('denied' in access) return access.denied;

  try {
    await deleteUser((await params).username);
    return NextResponse.json({ success: true });
  } catch (error) {
    return failure(error);
  }
}
