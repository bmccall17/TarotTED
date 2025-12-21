import { NextRequest, NextResponse } from 'next/server';
import {
  getTalkByIdForAdmin,
  updateTalk,
  softDeleteTalk,
} from '@/lib/db/queries/admin-talks';

/**
 * GET /api/admin/talks/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const talk = await getTalkByIdForAdmin(id);

    if (!talk) {
      return NextResponse.json(
        { error: 'Talk not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ talk });
  } catch (error) {
    console.error('Error fetching talk:', error);
    return NextResponse.json(
      { error: 'Failed to fetch talk' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/talks/[id]
 * Body: Partial<InsertTalk>
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if at least one URL would remain
    if (body.tedUrl === null && body.youtubeUrl === null) {
      return NextResponse.json(
        { error: 'At least one URL (tedUrl or youtubeUrl) must be provided' },
        { status: 400 }
      );
    }

    const talk = await updateTalk(id, body);

    if (!talk) {
      return NextResponse.json(
        { error: 'Talk not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ talk });
  } catch (error) {
    console.error('Error updating talk:', error);
    return NextResponse.json(
      { error: 'Failed to update talk' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/talks/[id]
 * Soft delete by default
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const talk = await softDeleteTalk(id);

    if (!talk) {
      return NextResponse.json(
        { error: 'Talk not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ talk });
  } catch (error) {
    console.error('Error deleting talk:', error);
    return NextResponse.json(
      { error: 'Failed to delete talk' },
      { status: 500 }
    );
  }
}
