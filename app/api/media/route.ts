import { NextRequest, NextResponse } from 'next/server';
import { mkdir, readdir, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { requireAdmin } from '@/utils/auth';
import {
  MAX_UPLOAD_BYTES,
  MEDIA_EXTENSIONS,
  PUBLIC_DIR,
  backupFile,
  isAllowedUpload,
  resolveInPublic,
  sanitizeFolder,
  sanitizeName,
  toPublicUrl,
} from '@/utils/media';

type MediaFile = { type: 'file'; path: string; size: number };
type MediaStructure = { [name: string]: MediaFile | MediaStructure };

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

// Get all media files
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const media = await getMediaStructure(PUBLIC_DIR);
    return NextResponse.json({ success: true, media });
  } catch (error) {
    console.error('Error fetching media:', error);
    return fail('Failed to fetch media files', 500);
  }
}

// Upload new media file
export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

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
    const uploadDir = resolveInPublic([category, subcategory].filter(Boolean).join('/'));
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
      filePath: toPublicUrl(filePath),
      fileName,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return fail('Failed to upload file', 500);
  }
}

// Delete media file
export async function DELETE(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const filePath = new URL(request.url).searchParams.get('path');
    if (!filePath) {
      return fail('No file path provided', 400);
    }

    const fullPath = resolveInPublic(filePath);
    if (!fullPath || !MEDIA_EXTENSIONS.has(path.extname(fullPath).toLowerCase())) {
      return fail('Invalid file path', 400);
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

// Recursively lists the media files under a folder
async function getMediaStructure(dir: string): Promise<MediaStructure> {
  const structure: MediaStructure = {};

  for (const item of await readdir(dir, { withFileTypes: true })) {
    // Skip hidden entries and folders that are not media.
    if (item.name.startsWith('.')) continue;
    const itemPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      structure[item.name] = await getMediaStructure(itemPath);
    } else if (MEDIA_EXTENSIONS.has(path.extname(item.name).toLowerCase())) {
      structure[item.name] = {
        type: 'file',
        path: toPublicUrl(itemPath),
        size: (await stat(itemPath)).size,
      };
    }
  }

  return structure;
}
