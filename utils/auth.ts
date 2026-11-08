// Server-only helpers for admin sessions. Do not import from client components.
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { canEditAnything, canEditPath, type Role, type SessionUser } from '@/utils/permissions';
import { getEditor, superAdminUser, superAdminUsername } from '@/utils/users';

export const SESSION_COOKIE = 'admin_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 24 hours

const MIN_SECRET_LENGTH = 32;

type SessionPayload = {
  /** Username the session was issued to. */
  u: string;
  /** Role at the time of issue; permissions are always re-read from the store. */
  r: Role;
  /** Expiry as a unix timestamp in seconds. */
  exp: number;
};

/**
 * Returns the secret used to sign sessions, or null when it is missing or too
 * short to be safe. Callers must treat null as a server misconfiguration.
 */
export function getSessionSecret(): string | null {
  const secret = process.env.SESSION_SECRET;
  return secret && secret.length >= MIN_SECRET_LENGTH ? secret : null;
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

/** Compares two strings in constant time, regardless of their lengths. */
export function safeEqual(a: string, b: string): boolean {
  const hashA = createHash('sha256').update(a).digest();
  const hashB = createHash('sha256').update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

/** Creates a signed session token, or null when no valid secret is configured. */
export function createSessionToken(username: string, role: Role): string | null {
  const secret = getSessionSecret();
  if (!secret) return null;

  const payload: SessionPayload = {
    u: username,
    r: role,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${sign(encoded, secret)}`;
}

function readPayload(token: string | undefined | null): SessionPayload | null {
  const secret = getSessionSecret();
  if (!secret || !token) return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, signature] = parts;

  if (!safeEqual(signature, sign(encoded, secret))) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf-8')
    ) as Partial<SessionPayload>;
    if (
      typeof payload.exp !== 'number' ||
      payload.exp <= Date.now() / 1000 ||
      typeof payload.u !== 'string' ||
      (payload.r !== 'super' && payload.r !== 'editor')
    ) {
      return null;
    }
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

/** Checks the signature and expiry of a session token (no account lookup). */
export function verifySessionToken(token: string | undefined | null): boolean {
  return readPayload(token) !== null;
}

/**
 * The signed-in user for this request, or null. Editors are looked up on every
 * call, so disabling an account or changing its permissions takes effect at once.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const payload = readPayload(cookieStore.get(SESSION_COOKIE)?.value);
  if (!payload) return null;

  if (payload.r === 'super') {
    return payload.u === superAdminUsername() ? superAdminUser() : null;
  }

  const editor = await getEditor(payload.u);
  if (!editor || editor.disabled) return null;
  return { username: editor.username, displayName: editor.displayName, role: 'editor', permissions: editor.permissions };
}

const deny = (status: 401 | 403, error: string): NextResponse =>
  NextResponse.json({ success: false, error }, { status });

/** Any signed-in account that may edit at least something. */
export async function requireEditor(): Promise<{ user: SessionUser } | { denied: NextResponse }> {
  const user = await getSessionUser();
  if (!user) return { denied: deny(401, 'Unauthorized') };
  if (!canEditAnything(user)) return { denied: deny(403, 'This account has no editing permissions') };
  return { user };
}

/** Super admin only (user management, raw media management). */
export async function requireSuperAdmin(): Promise<{ user: SessionUser } | { denied: NextResponse }> {
  const user = await getSessionUser();
  if (!user) return { denied: deny(401, 'Unauthorized') };
  if (user.role !== 'super') return { denied: deny(403, 'Only the super admin can do this') };
  return { user };
}

/** Signed in, any role (e.g. changing your own password). */
export async function requireUser(): Promise<{ user: SessionUser } | { denied: NextResponse }> {
  const user = await getSessionUser();
  return user ? { user } : { denied: deny(401, 'Unauthorized') };
}

/** Editor whose permissions cover every one of the given content paths. */
export async function requireEditAccess(
  paths: string[]
): Promise<{ user: SessionUser } | { denied: NextResponse }> {
  const result = await requireEditor();
  if ('denied' in result) return result;
  const blocked = paths.find((p) => !canEditPath(result.user, p));
  if (blocked) return { denied: deny(403, `You do not have permission to edit "${blocked}"`) };
  return result;
}
