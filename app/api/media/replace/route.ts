import { NextRequest, NextResponse } from 'next/server';
import { stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { requireAdmin } from '@/utils/auth';
import {
  MAX_UPLOAD_BYTES,
  MEDIA_EXTENSIONS,
  backupFile,
  isAllowedUpload,
  resolveUploadUrl,
  toUploadUrl,
} from '@/utils/media';

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

// Replace existing media file
export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const existingPath = formData.get('existingPath');

    if (!(file instanceof File)) {
      return fail('No file provided', 400);
    }
    if (typeof existingPath !== 'string' || existingPath === '') {
      return fail('No existing file path provided', 400);
    }
    if (!isAllowedUpload(file)) {
      return fail('Invalid file type. Only images are allowed.', 400);
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return fail(`File is too large. The limit is ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`, 413);
    }

    // Only uploaded files can be replaced; the site's own assets belong to the repository.
    const existingFullPath = resolveUploadUrl(existingPath);
    if (!existingFullPath || !MEDIA_EXTENSIONS.has(path.extname(existingFullPath).toLowerCase())) {
      return fail('Only uploaded files can be replaced', 400);
    }

    const info = await stat(existingFullPath).catch(() => null);
    if (!info?.isFile()) {
      return fail('Existing file not found', 404);
    }

    await backupFile(existingFullPath);
    await writeFile(existingFullPath, Buffer.from(await file.arrayBuffer()));

    return NextResponse.json({
      success: true,
      message: 'File replaced successfully',
      filePath: toUploadUrl(existingFullPath),
      backupCreated: true,
    });
  } catch (error) {
    console.error('Error replacing file:', error);
    return fail('Failed to replace file', 500);
  }
}
