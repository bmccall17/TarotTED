import { NextResponse } from 'next/server';
import { acknowledgeMention, getShareById } from '@/lib/db/queries/admin-social-shares';

/**
 * POST /api/admin/mentions/[id]/acknowledge
 * Mark a discovered mention as acknowledged
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const share = await getShareById(id);
    if (!share) {
      return NextResponse.json({ error: 'Mention not found' }, { status: 404 });
    }

    if (share.status !== 'discovered') {
      return NextResponse.json(
        { error: 'Can only acknowledge discovered mentions' },
        { status: 400 }
      );
    }

    const updated = await acknowledgeMention(id);
    return NextResponse.json({ share: updated });
  } catch (error) {
    console.error('Error acknowledging mention:', error);
    return NextResponse.json({ error: 'Failed to acknowledge mention' }, { status: 500 });
  }
}
