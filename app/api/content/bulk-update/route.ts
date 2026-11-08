import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ContentPathError, applyContentChange, updateContent } from '@/utils/contentStore';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: unknown = await request.json().catch(() => null);
    const changes = (body as { changes?: unknown } | null)?.changes;

    if (!changes || typeof changes !== 'object' || Array.isArray(changes)) {
      return NextResponse.json(
        { error: 'Invalid changes format' },
        { status: 400 }
      );
    }

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
