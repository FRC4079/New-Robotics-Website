// Server-only helpers for the media API routes. Do not import from client components.
import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

export const PUBLIC_DIR = path.join(process.cwd(), 'public');

/** Replaced and deleted files are copied here. It lives outside public/ so backups are never served. */
export const BACKUP_DIR = process.env.MEDIA_BACKUP_DIR
  ? path.resolve(process.env.MEDIA_BACKUP_DIR)
  : path.join(process.cwd(), '.media-backups');

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

/** Extensions listed by the media manager and allowed to be deleted or replaced. */
export const MEDIA_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4', '.mov', '.avi',
]);

/** True when the upload's MIME type is allowed and matches its file extension. */
export function isAllowedUpload(file: File): boolean {
  const extensions = UPLOAD_TYPES[file.type];
  return !!extensions && extensions.includes(path.extname(file.name).toLowerCase());
}

/**
 * Resolves a user supplied path inside public/. Returns null when it would
 * escape public/ or touch a hidden file or folder.
 */
export function resolveInPublic(relativePath: string): string | null {
  const normalized = path.normalize(relativePath.replace(/\\/g, '/')).replace(/^([/\\])+/, '');
  const resolved = path.resolve(PUBLIC_DIR, normalized);
  const inside = resolved === PUBLIC_DIR || resolved.startsWith(PUBLIC_DIR + path.sep);
  if (!inside) return null;
  const hidden = path.relative(PUBLIC_DIR, resolved).split(path.sep).some((part) => part.startsWith('.'));
  return hidden ? null : resolved;
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

/** The URL a file inside public/ is served from. */
export function toPublicUrl(fullPath: string): string {
  return '/' + path.relative(PUBLIC_DIR, fullPath).split(path.sep).join('/');
}
