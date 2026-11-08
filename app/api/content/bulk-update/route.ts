import { NextRequest, NextResponse } from 'next/server';
import { requireEditAccess } from '@/utils/auth';
import { ContentPathError, applyContentChange, updateContent } from '@/utils/contentStore';

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json().catch(() => null);
    const changes = (body as { changes?: unknown } | null)?.changes;

    if (!changes || typeof changes !== 'object' || Array.isArray(changes)) {
      return NextResponse.json(
        { error: 'Invalid changes format' },
        { status: 400 }
      );
    }

    // Every path must be inside an area this account may edit, or nothing is saved.
    const access = await requireEditAccess(Object.keys(changes));
    if ('denied' in access) return access.denied;

    // All changes are applied together: if one path is invalid, none are saved.
    let changesApplied = 0;
    await updateContent((content) => {
      for (const [jsonPath, value] of Object.entries(changes)) {
        if (applyContentChange(content, jsonPath, value)) changesApplied += 1;
      }
    });

    return NextResponse.json({
      success: true,
      changesApplied,
    });
  } catch (error) {
    if (error instanceof ContentPathError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Error updating content:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}
