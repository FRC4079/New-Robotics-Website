// Server-only account store. Editors live in a JSON file next to the content
// file (on the data volume); the super admin comes from the environment and is
// never written to disk.
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { sanitizePermissions, type SessionUser } from '@/utils/permissions';

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export const USERNAME_PATTERN = /^[a-z0-9._-]{3,32}$/;
export const MIN_PASSWORD_LENGTH = 10;
const KEY_LENGTH = 64;

type StoredUser = {
  username: string;
  displayName: string;
  passwordHash: string;
  permissions: string[];
  disabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PublicUser = Omit<StoredUser, 'passwordHash'>;

export class UserError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

function usersFilePath(): string {
  return process.env.USERS_FILE || path.join(process.cwd(), 'data', 'users.json');
}

export function superAdminUsername(): string | null {
  return process.env.ADMIN_USERNAME?.trim().toLowerCase() || null;
}

export function superAdminUser(): SessionUser | null {
  const username = superAdminUsername();
  return username ? { username, displayName: 'Super admin', role: 'super', permissions: [] } : null;
}

// ---- password hashing ------------------------------------------------------

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString('base64url')}$${hash.toString('base64url')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltB64, hashB64] = stored.split('$');
  if (scheme !== 'scrypt' || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, 'base64url');
  const actual = await scrypt(password, Buffer.from(saltB64, 'base64url'), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// Used to spend the same time on unknown usernames as on real ones.
const DUMMY_HASH = 'scrypt$AAAAAAAAAAAAAAAAAAAAAA$' + Buffer.alloc(KEY_LENGTH).toString('base64url');

// ---- storage ---------------------------------------------------------------

let writeQueue: Promise<unknown> = Promise.resolve();

async function readAll(): Promise<StoredUser[]> {
  try {
    const parsed = JSON.parse(await fs.readFile(/*turbopackIgnore: true*/ usersFilePath(), 'utf-8')) as { users?: StoredUser[] };
    return Array.isArray(parsed.users) ? parsed.users : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

async function writeAll(users: StoredUser[]): Promise<void> {
  const file = usersFilePath();
  await fs.mkdir(/*turbopackIgnore: true*/ path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(/*turbopackIgnore: true*/ tmp, JSON.stringify({ users }, null, 2), { mode: 0o600 });
  await fs.rename(/*turbopackIgnore: true*/ tmp, /*turbopackIgnore: true*/ file);
}

/** Serialises read-modify-write cycles so concurrent requests cannot clobber each other. */
function mutate<T>(fn: (users: StoredUser[]) => Promise<T> | T): Promise<T> {
  const run = writeQueue.then(async () => {
    const users = await readAll();
    const result = await fn(users);
    await writeAll(users);
    return result;
  });
  writeQueue = run.catch(() => undefined);
  return run;
}

const toPublic = ({ passwordHash: _hash, ...rest }: StoredUser): PublicUser => {
  void _hash;
  return rest;
};

function validateUsername(raw: unknown): string {
  const username = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
  if (!USERNAME_PATTERN.test(username)) {
    throw new UserError('Username must be 3-32 characters: letters, numbers, dots, dashes or underscores.');
  }
  if (username === superAdminUsername()) throw new UserError('That username is reserved.');
  return username;
}

function validatePassword(raw: unknown): string {
  if (typeof raw !== 'string' || raw.length < MIN_PASSWORD_LENGTH) {
    throw new UserError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  if (raw.length > 200) throw new UserError('Password is too long.');
  return raw;
}

function validateDisplayName(raw: unknown, fallback: string): string {
  const name = typeof raw === 'string' ? raw.trim() : '';
  return (name || fallback).slice(0, 60);
}

// ---- public API ------------------------------------------------------------

export async function listUsers(): Promise<PublicUser[]> {
  return (await readAll()).map(toPublic).sort((a, b) => a.username.localeCompare(b.username));
}

export async function getEditor(username: string): Promise<PublicUser | null> {
  const found = (await readAll()).find((u) => u.username === username);
  return found ? toPublic(found) : null;
}

export async function createUser(input: {
  username: unknown;
  displayName?: unknown;
  password: unknown;
  permissions?: unknown;
}): Promise<PublicUser> {
  const username = validateUsername(input.username);
  const password = validatePassword(input.password);
  const passwordHash = await hashPassword(password);
  return mutate((users) => {
    if (users.some((u) => u.username === username)) throw new UserError('That username is already taken.', 409);
    const now = new Date().toISOString();
    const user: StoredUser = {
      username,
      displayName: validateDisplayName(input.displayName, username),
      passwordHash,
      permissions: sanitizePermissions(input.permissions),
      disabled: false,
      createdAt: now,
      updatedAt: now,
    };
    users.push(user);
    return toPublic(user);
  });
}

export async function updateUser(
  username: string,
  changes: { displayName?: unknown; permissions?: unknown; disabled?: unknown; password?: unknown }
): Promise<PublicUser> {
  const passwordHash =
    changes.password !== undefined ? await hashPassword(validatePassword(changes.password)) : null;
  return mutate((users) => {
    const user = users.find((u) => u.username === username);
    if (!user) throw new UserError('User not found.', 404);
    if (changes.displayName !== undefined) user.displayName = validateDisplayName(changes.displayName, user.username);
    if (changes.permissions !== undefined) user.permissions = sanitizePermissions(changes.permissions);
    if (typeof changes.disabled === 'boolean') user.disabled = changes.disabled;
    if (passwordHash) user.passwordHash = passwordHash;
    user.updatedAt = new Date().toISOString();
    return toPublic(user);
  });
}

export async function deleteUser(username: string): Promise<void> {
  await mutate((users) => {
    const index = users.findIndex((u) => u.username === username);
    if (index === -1) throw new UserError('User not found.', 404);
    users.splice(index, 1);
  });
}

/** Returns the session user for valid credentials, otherwise null. */
export async function authenticate(usernameInput: string, password: string): Promise<SessionUser | null> {
  const username = usernameInput.trim().toLowerCase();
  const superName = superAdminUsername();
  const superPassword = process.env.ADMIN_PASSWORD;

  if (superName && superPassword && username === superName) {
    // Constant-time compare via hashing both sides.
    const [a, b] = await Promise.all([
      scrypt(password, Buffer.alloc(16), KEY_LENGTH),
      scrypt(superPassword, Buffer.alloc(16), KEY_LENGTH),
    ]);
    return timingSafeEqual(a, b) ? superAdminUser() : null;
  }

  const stored = (await readAll()).find((u) => u.username === username);
  const ok = await verifyPassword(password, stored?.passwordHash ?? DUMMY_HASH);
  if (!stored || !ok || stored.disabled) return null;
  return { username: stored.username, displayName: stored.displayName, role: 'editor', permissions: stored.permissions };
}

export async function changeOwnPassword(username: string, current: string, next: string): Promise<void> {
  const validNext = validatePassword(next);
  const stored = (await readAll()).find((u) => u.username === username);
  if (!stored || !(await verifyPassword(current, stored.passwordHash))) {
    throw new UserError('Current password is incorrect.', 403);
  }
  await updateUser(username, { password: validNext });
}
