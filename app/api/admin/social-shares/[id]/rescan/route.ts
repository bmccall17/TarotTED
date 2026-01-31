import { NextResponse } from 'next/server';
import { getShareById, updateShare } from '@/lib/db/queries/admin-social-shares';
import { getMetricsFromUrl } from '@/lib/services/bluesky';

/**
 * POST /api/admin/social-shares/[id]/rescan
 * Rescan a share to refresh metrics from the platform
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const share = await getShareById(id);
    if (!share) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    if (!share.postUrl) {
      return NextResponse.json(
        { error: 'No post URL to rescan' },
        { status: 400 }
      );
    }

    // Currently only Bluesky is supported for automatic rescanning
    if (share.platform !== 'bluesky') {
      return NextResponse.json(
        { error: 'Automatic rescan only supported for Bluesky. Edit manually for other platforms.' },
        { status: 400 }
      );
    }

    // Get fresh metrics from Bluesky
    const metrics = await getMetricsFromUrl(share.postUrl);

    if (!metrics) {
      return NextResponse.json(
        { error: 'Could not fetch metrics from Bluesky. The post may have been deleted.' },
        { status: 404 }
      );
    }

    // Update the share with new metrics
    const updated = await updateShare(id, {
      likeCount: metrics.likeCount,
      repostCount: metrics.repostCount,
      replyCount: metrics.replyCount,
      metricsUpdatedAt: new Date(),
    });

    return NextResponse.json({
      share: updated,
      metrics: {
        likeCount: metrics.likeCount,
        repostCount: metrics.repostCount,
        replyCount: metrics.replyCount,
      },
      message: 'Metrics refreshed successfully',
    });
  } catch (error) {
    console.error('Error rescanning share:', error);
    return NextResponse.json({ error: 'Failed to rescan share' }, { status: 500 });
  }
}
