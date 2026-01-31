'use client';

import { useState } from 'react';
import { ExternalLink, Check, Eye, Loader2, RefreshCw } from 'lucide-react';

type Mention = {
  id: string;
  postUrl: string | null;
  authorHandle: string | null;
  authorDisplayName: string | null;
  sharedUrl: string | null;
  discoveredAt: string | null;
  likeCount: number | null;
  repostCount: number | null;
  replyCount: number | null;
  card?: { name: string } | null;
  talk?: { title: string } | null;
};

type Props = {
  mention: Mention;
  onAcknowledged: () => void;
  onConverted: () => void;
};

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function MentionRow({ mention, onAcknowledged, onConverted }: Props) {
  const [loading, setLoading] = useState<'acknowledge' | 'convert' | 'rescan' | null>(null);
  const [localMetrics, setLocalMetrics] = useState({
    likeCount: mention.likeCount ?? 0,
    repostCount: mention.repostCount ?? 0,
    replyCount: mention.replyCount ?? 0,
  });

  const handleAcknowledge = async () => {
    setLoading('acknowledge');
    try {
      const response = await fetch(`/api/admin/mentions/${mention.id}/acknowledge`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to acknowledge');
      onAcknowledged();
    } catch (error) {
      console.error('Error acknowledging mention:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleConvert = async () => {
    setLoading('convert');
    try {
      const response = await fetch(`/api/admin/social-shares/${mention.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'posted' }),
      });
      if (!response.ok) throw new Error('Failed to convert');
      onConverted();
    } catch (error) {
      console.error('Error converting mention:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleRescan = async () => {
    if (!mention.postUrl) return;
    setLoading('rescan');
    try {
      const response = await fetch(`/api/admin/social-shares/${mention.id}/rescan`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to rescan');
      const data = await response.json();
      setLocalMetrics({
        likeCount: data.metrics.likeCount,
        repostCount: data.metrics.repostCount,
        replyCount: data.metrics.replyCount,
      });
      // Rescan sets status to verified, so trigger conversion callback to refresh the list
      onConverted();
    } catch (error) {
      console.error('Error rescanning mention:', error);
    } finally {
      setLoading(null);
    }
  };

  const totalEngagement =
    localMetrics.likeCount + localMetrics.repostCount + localMetrics.replyCount;

  return (
    <div className="flex items-start gap-3 p-3 bg-gray-800/30 border border-purple-700/30 rounded-lg">
      {/* Author */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-purple-900/50 rounded-full flex items-center justify-center">
          <span className="text-sm font-bold text-purple-300">
            {(mention.authorHandle || '?')[0].toUpperCase()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-200">
            {mention.authorDisplayName || mention.authorHandle || 'Unknown'}
          </span>
          {mention.authorHandle && (
            <span className="text-xs text-gray-500">@{mention.authorHandle}</span>
          )}
        </div>

        {/* What they shared */}
        {(mention.card || mention.talk || mention.sharedUrl) && (
          <p className="text-xs text-gray-400">
            Shared:{' '}
            <span className="text-indigo-300">
              {mention.card?.name || mention.talk?.title || mention.sharedUrl}
            </span>
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>{formatRelativeTime(mention.discoveredAt)}</span>
          {totalEngagement > 0 && (
            <span>
              {totalEngagement} engagement
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {mention.postUrl && (
          <>
            <a
              href={mention.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded"
              title="Open post"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={handleRescan}
              disabled={loading !== null}
              className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded disabled:opacity-50"
              title="Rescan: Refresh metrics from Bluesky"
            >
              {loading === 'rescan' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </button>
          </>
        )}
        <button
          onClick={handleAcknowledge}
          disabled={loading !== null}
          className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded disabled:opacity-50"
          title="Acknowledge: Dismiss from inbox (I've seen this, don't need to track it)"
        >
          {loading === 'acknowledge' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={handleConvert}
          disabled={loading !== null}
          className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded disabled:opacity-50"
          title="Convert to Tracked Share: Move to Shares list and track engagement over time"
        >
          {loading === 'convert' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
