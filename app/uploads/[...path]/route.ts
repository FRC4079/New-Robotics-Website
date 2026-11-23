import { NextRequest, NextResponse } from 'next/server';
import { open, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { SERVED_TYPES, UPLOAD_DIR, resolveInside } from '@/utils/media';

// Serves files uploaded through the CMS. Next.js only serves files in public/
// that existed when the server started, so uploads are streamed from here.
// Supports HTTP Range requests so uploaded videos seek and loop smoothly.
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
  const baseHeaders: Record<string, string> = {
    'Content-Type': contentType,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=0, must-revalidate',
    ETag: etag,
    'X-Content-Type-Options': 'nosniff',
  };

  // An SVG opened directly must not be able to run scripts.
  if (contentType === 'image/svg+xml') {
    baseHeaders['Content-Security-Policy'] = "default-src 'none'; style-src 'unsafe-inline'; sandbox";
  }

  if (request.headers.get('if-none-match') === etag) {
    return new NextResponse(null, { status: 304, headers: baseHeaders });
  }

  const rangeHeader = request.headers.get('range');
  if (rangeHeader && info.size > 0) {
    const match = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader.trim());
    if (match) {
      const start = match[1] ? Number(match[1]) : 0;
      const end = match[2] ? Math.min(Number(match[2]), info.size - 1) : info.size - 1;

      if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= info.size) {
        return new NextResponse(null, {
          status: 416,
          headers: { ...baseHeaders, 'Content-Range': `bytes */${info.size}` },
        });
      }

      const chunkSize = end - start + 1;
      const handle = await open(fullPath, 'r');
      try {
        const buffer = Buffer.alloc(chunkSize);
        await handle.read(buffer, 0, chunkSize, start);
        return new NextResponse(new Uint8Array(buffer), {
          status: 206,
          headers: {
            ...baseHeaders,
            'Content-Range': `bytes ${start}-${end}/${info.size}`,
            'Content-Length': String(chunkSize),
          },
        });
      } finally {
        await handle.close();
      }
    }
  }

  return new NextResponse(new Uint8Array(await readFile(fullPath)), {
    headers: {
      ...baseHeaders,
      'Content-Length': String(info.size),
    },
  });
}
