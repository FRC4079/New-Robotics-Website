import { NextRequest, NextResponse } from 'next/server';
import { getVisibleContent } from '@/utils/visibleContent';
import { requireEditAccess, requireSuperAdmin } from '@/utils/auth';
import {
  ContentPathError,
  addAtPath,
  parseContentPath,
  removeAtPath,
  setAtPath,
  updateContent,
} from '@/utils/contentStore';

function badRequest(error: string) {
  return NextResponse.json({ success: false, error }, { status: 400 });
}

async function readBody(request: NextRequest): Promise<Record<string, unknown>> {
  const body: unknown = await request.json().catch(() => null);
  return typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
}

// Get all site content
export async function GET() {
  const content = await getVisibleContent();
  if (!content) {
    return NextResponse.json(
      { success: false, error: 'Content not available' },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, content });
}

// Update site content
export async function POST(request: NextRequest) {
  try {
    const { section, data } = await readBody(request);

    if (typeof section !== 'string' || section === '' || data === undefined) {
      return badRequest('Section and data are required');
    }

    // Replacing the whole file is a super admin action; sections follow permissions.
    const access = section === 'full' ? await requireSuperAdmin() : await requireEditAccess([section]);
    if ('denied' in access) return access.denied;

    await updateContent((content) => {
      if (section === 'full') {
        if (typeof data !== 'object' || data === null || Array.isArray(data)) {
          throw new ContentPathError('Full content must be an object');
        }
        return data as Record<string, unknown>;
      }
      setAtPath(content, parseContentPath(section), data);
    });

    return NextResponse.json({
      success: true,
      message: 'Content updated successfully',
      section,
    });
  } catch (error) {
    if (error instanceof ContentPathError) return badRequest(error.message);
    console.error('Error updating content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update content' },
      { status: 500 }
    );
  }
}

// Add new navigation item or content section
export async function PUT(request: NextRequest) {
  try {
    const { section, item } = await readBody(request);

    if (typeof section !== 'string' || section === '' || !item) {
      return badRequest('Section and item are required');
    }

    const access = await requireEditAccess([section]);
    if ('denied' in access) return access.denied;

    await updateContent((content) => {
      addAtPath(content, parseContentPath(section), item);
    });

    return NextResponse.json({
      success: true,
      message: 'Item added successfully',
      section,
    });
  } catch (error) {
    if (error instanceof ContentPathError) return badRequest(error.message);
    console.error('Error adding item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add item' },
      { status: 500 }
    );
  }
}

// Delete content section or item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const itemId = searchParams.get('itemId') ?? undefined;

    if (!section) {
      return badRequest('Section is required');
    }

    const access = await requireEditAccess([section]);
    if ('denied' in access) return access.denied;

    let found = false;
    await updateContent((content) => {
      const segments = parseContentPath(section);
      const removesWholeSection = !(itemId && Array.isArray(content[segments[0]]));
      if (segments.length === 1 && removesWholeSection) {
        throw new ContentPathError('Top-level sections cannot be deleted');
      }
      found = removeAtPath(content, segments, itemId);
    });

    if (!found) {
      return NextResponse.json(
        { success: false, error: 'Section not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: itemId ? 'Item deleted successfully' : 'Section deleted successfully',
    });
  } catch (error) {
    if (error instanceof ContentPathError) return badRequest(error.message);
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete content' },
      { status: 500 }
    );
  }
}
