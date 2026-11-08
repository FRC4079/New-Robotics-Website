import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { SERVED_TYPES, UPLOAD_DIR, resolveInside } from '@/utils/media';

// Serves files uploaded through the CMS. Next.js only serves files in public/
// that existed when the server started, so uploads are streamed from here.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const fullPath = resolveInside(UPLOAD_DIR, segments.join('/'));
  const contentType = fullPath ? SERVED_TYPES[path.extname(fullPath).toLowerCase()] : undefined;

  const info = fullPath && contentType ? await stat(fullPath).catch(() => null) : null;
  if (!fullPath || !contentType || !info?.isFile()) {
    return new NextResponse('Not found', { status: 404 });
  }

  // Uploads can be replaced under the same URL, so make caches check back.
  const etag = `W/"${info.size}-${Math.round(info.mtimeMs)}"`;
  const headers = {
    'Content-Type': contentType,
    'Cache-Control': 'public, max-age=0, must-revalidate',
    ETag: etag,
    'X-Content-Type-Options': 'nosniff',
    // An SVG opened directly must not be able to run scripts.
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
  };

  if (request.headers.get('if-none-match') === etag) {
    return new NextResponse(null, { status: 304, headers });
  }

  return new NextResponse(new Uint8Array(await readFile(fullPath)), { headers });
}
