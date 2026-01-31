'use client';

import { useState } from 'react';
import { X, Loader2, Heart, Repeat2, MessageCircle } from 'lucide-react';
import { getPlatformMetricLabels, type Platform } from '@/lib/utils/social-handles';

type Props = {
  shareId: string;
  platform: Platform;
  initialLikes: number;
  initialReposts: number;
  initialReplies: number;
  onSave: (metrics: { likeCount: number; repostCount: number; replyCount: number }) => void;
  onClose: () => void;
};

export function ManualMetricsModal({
  shareId,
  platform,
  initialLikes,
  initialReposts,
  initialReplies,
  onSave,
  onClose,
}: Props) {
  const [likes, setLikes] = useState(initialLikes);
  const [reposts, setReposts] = useState(initialReposts);
  const [replies, setReplies] = useState(initialReplies);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const labels = getPlatformMetricLabels(platform);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/social-shares/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareId,
          metrics: {
            likeCount: likes,
            repostCount: reposts,
            replyCount: replies,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      onSave({ likeCount: likes, repostCount: reposts, replyCount: replies });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const platformInfo: Record<Platform, string> = {
    x: 'Twitter/X API requires paid tier ($100/mo) for metrics. Enter values manually.',
    linkedin: 'LinkedIn API only supports your own posts. Enter values manually.',
    threads: 'Threads has no public API. Enter values manually.',
    bluesky: 'Bluesky metrics are fetched automatically.',
    other: 'Enter engagement metrics manually.',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl max-w-sm w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-gray-100">Enter Metrics</h3>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-1 text-gray-400 hover:text-gray-300 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-xs text-gray-500">{platformInfo[platform]}</p>

          <div className="space-y-3">
            {/* Likes */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 w-24 text-sm text-gray-300">
                <Heart className="w-4 h-4 text-pink-400" />
                {labels.likes}
              </div>
              <input
                type="number"
                min="0"
                value={likes}
                onChange={(e) => setLikes(parseInt(e.target.value) || 0)}
                className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Reposts (hide for Instagram) */}
            {labels.reposts && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-24 text-sm text-gray-300">
                  <Repeat2 className="w-4 h-4 text-green-400" />
                  {labels.reposts}
                </div>
                <input
                  type="number"
                  min="0"
                  value={reposts}
                  onChange={(e) => setReposts(parseInt(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Replies/Comments */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 w-24 text-sm text-gray-300">
                <MessageCircle className="w-4 h-4 text-blue-400" />
                {labels.replies}
              </div>
              <input
                type="number"
                min="0"
                value={replies}
                onChange={(e) => setReplies(parseInt(e.target.value) || 0)}
                className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Metrics
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
