import { NextResponse } from 'next/server';
import { getShareById, updateMetrics } from '@/lib/db/queries/admin-social-shares';
import { getMetricsFromUrl, isBlueskyUrl } from '@/lib/services/bluesky';

/**
 * POST /api/admin/social-shares/metrics
 * Refresh metrics for a share
 *
 * Body: { shareId: string } or { shareId: string, metrics: { likeCount, repostCount, replyCount } }
 *
 * For Bluesky shares: auto-fetches metrics from API
 * For other platforms: requires manual metrics in body
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shareId, metrics } = body;

    if (!shareId) {
      return NextResponse.json({ error: 'shareId is required' }, { status: 400 });
    }

    const share = await getShareById(shareId);
    if (!share) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    // If manual metrics provided, use them
    if (metrics) {
      const updated = await updateMetrics(shareId, {
        likeCount: metrics.likeCount ?? 0,
        repostCount: metrics.repostCount ?? 0,
        replyCount: metrics.replyCount ?? 0,
      });
      return NextResponse.json({ share: updated });
    }

    // For Bluesky shares, auto-fetch metrics
    if (share.platform === 'bluesky' && share.postUrl && isBlueskyUrl(share.postUrl)) {
      const fetchedMetrics = await getMetricsFromUrl(share.postUrl);

      if (!fetchedMetrics) {
        return NextResponse.json(
          { error: 'Failed to fetch metrics from Bluesky' },
          { status: 502 }
        );
      }

      const updated = await updateMetrics(shareId, fetchedMetrics);
      return NextResponse.json({ share: updated });
    }

    // For non-Bluesky shares without manual metrics
    return NextResponse.json(
      { error: 'Manual metrics required for non-Bluesky shares' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating metrics:', error);
    return NextResponse.json({ error: 'Failed to update metrics' }, { status: 500 });
  }
}
