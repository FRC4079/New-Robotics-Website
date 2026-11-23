// Client-safe helpers for detecting and validating image, GIF, and video media.

export const MEDIA_ACCEPT =
  'image/*,image/gif,video/mp4,video/webm,video/quicktime,video/ogg,.gif,.mp4,.webm,.mov,.ogv,.m4v';

const VIDEO_EXTENSIONS = ['.mp4', '.m4v', '.webm', '.mov', '.ogv'];

export const MAX_CLIENT_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_CLIENT_VIDEO_BYTES = 50 * 1024 * 1024;

function stripQueryAndHash(url: string): string {
  return url.split(/[?#]/)[0].toLowerCase();
}

export function isVideoUrl(src?: string | null): boolean {
  if (!src) return false;
  const trimmed = src.trim();
  if (trimmed.startsWith('data:video/')) return true;
  const clean = stripQueryAndHash(trimmed);
  return VIDEO_EXTENSIONS.some((ext) => clean.endsWith(ext));
}

export function isGifUrl(src?: string | null): boolean {
  if (!src) return false;
  const trimmed = src.trim();
  if (trimmed.startsWith('data:image/gif')) return true;
  return stripQueryAndHash(trimmed).endsWith('.gif');
}

export function isSupportedMediaFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true;
  if (file.type === 'video/mp4' || file.type === 'video/webm' || file.type === 'video/quicktime' || file.type === 'video/ogg') {
    return true;
  }
  const lower = file.name.toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', ...VIDEO_EXTENSIONS].some((ext) => lower.endsWith(ext));
}

export function getMaxClientUploadBytes(file: File): number {
  const isVideo = file.type.startsWith('video/') || isVideoUrl(file.name);
  return isVideo ? MAX_CLIENT_VIDEO_BYTES : MAX_CLIENT_IMAGE_BYTES;
}

export function validateMediaFile(file: File): string | null {
  if (!isSupportedMediaFile(file)) {
    return 'Please choose an image, GIF, or video (.mp4, .webm, .mov, .ogv).';
  }
  const maxBytes = getMaxClientUploadBytes(file);
  if (file.size > maxBytes) {
    return `That file is over ${maxBytes / 1024 / 1024} MB. Please choose a smaller file.`;
  }
  return null;
}

export async function uploadMediaFile(
  file: File,
  category = 'images',
  subcategory = ''
): Promise<string> {
  const validationError = validateMediaFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const isVideo = file.type.startsWith('video/') || isVideoUrl(file.name);
  const effectiveCategory = category === 'images' && isVideo ? 'videos' : category;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', effectiveCategory);
  if (subcategory) {
    formData.append('subcategory', subcategory);
  }

  const response = await fetch('/api/media', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.success) {
    throw new Error(data?.error || 'Upload failed');
  }

  return data.filePath as string;
}
