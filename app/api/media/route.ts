import { NextRequest, NextResponse } from 'next/server';
import { mkdir, readdir, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { requireEditor, requireSuperAdmin } from '@/utils/auth';
import {
  MAX_UPLOAD_BYTES,
  MEDIA_EXTENSIONS,
  PUBLIC_DIR,
  UPLOAD_DIR,
  UPLOAD_URL_PREFIX,
  backupFile,
  isAllowedUpload,
  resolveInside,
  resolveUploadUrl,
  sanitizeFolder,
  sanitizeName,
  toPublicUrl,
  toUploadUrl,
} from '@/utils/media';

type MediaFile = { type: 'file'; path: string; size: number };
type MediaStructure = { [name: string]: MediaFile | MediaStructure };

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

// Get all media files: the site's own assets, plus everything uploaded through the CMS
export async function GET() {
  const access = await requireEditor();
  if ('denied' in access) return access.denied;

  try {
    const media: MediaStructure = await getMediaStructure(PUBLIC_DIR, toPublicUrl);
    media[UPLOAD_URL_PREFIX.slice(1)] = await getMediaStructure(UPLOAD_DIR, toUploadUrl);
    return NextResponse.json({ success: true, media });
  } catch (error) {
    console.error('Error fetching media:', error);
    return fail('Failed to fetch media files', 500);
  }
}

// Upload new media file
export async function POST(request: NextRequest) {
  const access = await requireEditor();
  if ('denied' in access) return access.denied;

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const category = sanitizeFolder(String(formData.get('category') || 'images'));
    const subcategory = sanitizeFolder(String(formData.get('subcategory') || ''));

    if (!(file instanceof File)) {
      return fail('No file provided', 400);
    }
    if (!isAllowedUpload(file)) {
      return fail('Invalid file type. Only images are allowed.', 400);
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return fail(`File is too large. The limit is ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`, 413);
    }

    const fileName = sanitizeName(file.name);
    if (!fileName || !category || subcategory === null) {
      return fail('Invalid file name or folder', 400);
    }
    const uploadDir = resolveInside(UPLOAD_DIR, [category, subcategory].filter(Boolean).join('/'));
    if (!uploadDir) {
      return fail('Invalid file name or folder', 400);
    }

    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);

    // Uploading a name that already exists replaces it, so keep the old copy.
    try {
      await backupFile(filePath);
    } catch {
      // Nothing to back up when the file is new.
    }

    await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      filePath: toUploadUrl(filePath),
      fileName,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return fail('Failed to upload file', 500);
  }
}

// Delete media file
export async function DELETE(request: NextRequest) {
  const access = await requireSuperAdmin();
  if ('denied' in access) return access.denied;

  try {
    const filePath = new URL(request.url).searchParams.get('path');
    if (!filePath) {
      return fail('No file path provided', 400);
    }

    // Only uploaded files can be removed; the site's own assets belong to the repository.
    const fullPath = resolveUploadUrl(filePath);
    if (!fullPath || !MEDIA_EXTENSIONS.has(path.extname(fullPath).toLowerCase())) {
      return fail('Only uploaded files can be deleted', 400);
    }

    const info = await stat(fullPath).catch(() => null);
    if (!info?.isFile()) {
      return fail('File not found', 404);
    }

    await backupFile(fullPath);
    await unlink(fullPath);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return fail('Failed to delete file', 500);
  }
}

// Recursively lists the media files under a folder. A folder that does not exist yet is empty.
async function getMediaStructure(dir: string, toUrl: (fullPath: string) => string): Promise<MediaStructure> {
  const structure: MediaStructure = {};

  let items;
  try {
    items = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return structure;
    throw error;
  }

  for (const item of items) {
    // Skip hidden entries.
    if (item.name.startsWith('.')) continue;
    const itemPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      structure[item.name] = await getMediaStructure(itemPath, toUrl);
    } else if (MEDIA_EXTENSIONS.has(path.extname(item.name).toLowerCase())) {
      structure[item.name] = {
        type: 'file',
        path: toUrl(itemPath),
        size: (await stat(itemPath)).size,
      };
    }
  }

  return structure;
}
