import { NextRequest, NextResponse } from 'next/server';
import {
  getShareById,
  updateShare,
  deleteShare,
  resolveSharedUrl,
} from '@/lib/db/queries/admin-social-shares';

/**
 * GET /api/admin/social-shares/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const share = await getShareById(id);

    if (!share) {
      return NextResponse.json(
        { error: 'Share not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ share });
  } catch (error) {
    console.error('Error fetching share:', error);
    return NextResponse.json(
      { error: 'Failed to fetch share' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/social-shares/[id]
 * Body: Partial<InsertShare>
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // If sharedUrl is changed, try to resolve card/talk
    if (body.sharedUrl && !body.cardId && !body.talkId) {
      const resolved = await resolveSharedUrl(body.sharedUrl);
      if (resolved.cardId) {
        body.cardId = resolved.cardId;
      }
      if (resolved.talkId) {
        body.talkId = resolved.talkId;
      }
    }

    // Convert postedAt string to Date object
    if (body.postedAt && typeof body.postedAt === 'string') {
      body.postedAt = new Date(body.postedAt);
    }

    const share = await updateShare(id, body);

    if (!share) {
      return NextResponse.json(
        { error: 'Share not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ share });
  } catch (error) {
    console.error('Error updating share:', error);
    return NextResponse.json(
      { error: 'Failed to update share' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/social-shares/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteShare(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting share:', error);
    return NextResponse.json(
      { error: 'Failed to delete share' },
      { status: 500 }
    );
  }
}
