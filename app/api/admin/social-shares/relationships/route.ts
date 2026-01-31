import { NextResponse } from 'next/server';
import { getShareById, updateRelationship } from '@/lib/db/queries/admin-social-shares';
import { checkFollowStatus } from '@/lib/services/bluesky';

/**
 * POST /api/admin/social-shares/relationships
 * Check/update follow status for a share
 *
 * Body: { shareId: string } or { shareId: string, following: boolean }
 *
 * For Bluesky: auto-checks if @tarottalks follows the speaker
 * For other platforms: requires manual following status in body
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shareId, following } = body;

    if (!shareId) {
      return NextResponse.json({ error: 'shareId is required' }, { status: 400 });
    }

    const share = await getShareById(shareId);
    if (!share) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    // If manual following status provided, use it
    if (typeof following === 'boolean') {
      const updated = await updateRelationship(shareId, following);
      return NextResponse.json({ share: updated });
    }

    // For Bluesky shares, auto-check follow status
    if (share.platform === 'bluesky') {
      // Check speaker handle first, fall back to author handle (for mentions)
      const handleToCheck = share.speakerHandle || share.authorHandle;

      if (!handleToCheck) {
        return NextResponse.json(
          { error: 'No handle available to check follow status' },
          { status: 400 }
        );
      }

      const isFollowing = await checkFollowStatus(handleToCheck);

      if (isFollowing === null) {
        return NextResponse.json(
          { error: 'Failed to check follow status from Bluesky' },
          { status: 502 }
        );
      }

      const updated = await updateRelationship(shareId, isFollowing);
      return NextResponse.json({ share: updated });
    }

    // For non-Bluesky shares without manual following status
    return NextResponse.json(
      { error: 'Manual following status required for non-Bluesky shares' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating relationship:', error);
    return NextResponse.json({ error: 'Failed to update relationship' }, { status: 500 });
  }
}
