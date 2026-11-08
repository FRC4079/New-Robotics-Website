// Server-only helpers for the media API routes. Do not import from client components.
import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

/** Assets that ship with the site. Read only: change them through the repository. */
export const PUBLIC_DIR = path.join(process.cwd(), 'public');

/**
 * Where files uploaded through the CMS are stored. They are served from
 * /uploads, because Next.js only serves files in public/ that existed when the
 * server started. Mount a volume here so uploads survive redeploys.
 */
export const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(process.cwd(), 'data', 'uploads');

export const UPLOAD_URL_PREFIX = '/uploads';

/** Replaced and deleted files are copied here. It is never served. */
export const BACKUP_DIR = process.env.MEDIA_BACKUP_DIR
  ? path.resolve(process.env.MEDIA_BACKUP_DIR)
  : path.join(process.cwd(), 'data', 'media-backups');

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/** Accepted upload types and the file extensions that may carry them. */
const UPLOAD_TYPES: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/jpg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'image/svg+xml': ['.svg'],
};

/** Content types for the files that may be served from the uploads folder. */
export const SERVED_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

/** Extensions listed by the media manager. */
export const MEDIA_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4', '.mov', '.avi',
]);

/** True when the upload's MIME type is allowed and matches its file extension. */
export function isAllowedUpload(file: File): boolean {
  const extensions = UPLOAD_TYPES[file.type];
  return !!extensions && extensions.includes(path.extname(file.name).toLowerCase());
}

/**
 * Resolves a user supplied path inside a base folder. Returns null when it
 * would escape that folder or touch a hidden file or folder.
 */
export function resolveInside(baseDir: string, relativePath: string): string | null {
  const normalized = path.normalize(relativePath.replace(/\\/g, '/')).replace(/^([/\\])+/, '');
  const resolved = path.resolve(baseDir, normalized);
  const inside = resolved === baseDir || resolved.startsWith(baseDir + path.sep);
  if (!inside) return null;
  const hidden = path.relative(baseDir, resolved).split(path.sep).some((part) => part.startsWith('.'));
  return hidden ? null : resolved;
}

/** Resolves "/uploads/images/a.png" (or "uploads/images/a.png") to a file in the uploads folder. */
export function resolveUploadUrl(urlPath: string): string | null {
  const trimmed = urlPath.replace(/^[/\\]+/, '');
  const prefix = UPLOAD_URL_PREFIX.slice(1) + '/';
  if (!trimmed.startsWith(prefix)) return null;
  return resolveInside(UPLOAD_DIR, trimmed.slice(prefix.length));
}

/** Keeps a single file or folder name to safe characters. Returns null if nothing usable is left. */
export function sanitizeName(name: string): string | null {
  const cleaned = path.basename(name.replace(/\\/g, '/')).replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^[.-]+/, '');
  return cleaned === '' ? null : cleaned;
}

/** Sanitizes each part of a folder path such as "comp/frc". Returns null if any part is unusable. */
export function sanitizeFolder(folder: string): string | null {
  const parts = folder.split(/[\\/]+/).filter((part) => part !== '');
  const cleaned: string[] = [];
  for (const part of parts) {
    const safe = sanitizeName(part);
    if (!safe) return null;
    cleaned.push(safe);
  }
  return cleaned.join('/');
}

/** Copies a file into the backup folder before it is overwritten or removed. */
export async function backupFile(filePath: string): Promise<void> {
  await mkdir(BACKUP_DIR, { recursive: true });
  await copyFile(filePath, path.join(BACKUP_DIR, `${Date.now()}-${path.basename(filePath)}`));
}

function toUrl(baseDir: string, prefix: string, fullPath: string): string {
  return prefix + '/' + path.relative(baseDir, fullPath).split(path.sep).join('/');
}

/** The URL a file inside public/ is served from. */
export function toPublicUrl(fullPath: string): string {
  return toUrl(PUBLIC_DIR, '', fullPath);
}

/** The URL a file inside the uploads folder is served from. */
export function toUploadUrl(fullPath: string): string {
  return toUrl(UPLOAD_DIR, UPLOAD_URL_PREFIX, fullPath);
}
