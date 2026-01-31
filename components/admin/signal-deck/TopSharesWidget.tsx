'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, ExternalLink, Heart, Repeat2, MessageCircle, Loader2 } from 'lucide-react';

type TopShare = {
  id: string;
  platform: string;
  postUrl: string | null;
  likeCount: number | null;
  repostCount: number | null;
  replyCount: number | null;
  card?: { name: string } | null;
  talk?: { title: string } | null;
};

const platformColors: Record<string, string> = {
  x: 'bg-gray-800 text-white',
  bluesky: 'bg-blue-600 text-white',
  threads: 'bg-gradient-to-r from-purple-600 to-pink-500 text-white',
  linkedin: 'bg-blue-700 text-white',
  other: 'bg-gray-600 text-white',
};

const platformLabels: Record<string, string> = {
  x: 'X',
  bluesky: 'BS',
  threads: 'TH',
  linkedin: 'LI',
  other: '...',
};

export function TopSharesWidget() {
  const [shares, setShares] = useState<TopShare[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopShares = async () => {
      try {
        const response = await fetch('/api/admin/social-shares?sortBy=engagement&limit=5');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setShares(data.shares || []);
      } catch (error) {
        console.error('Error fetching top shares:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopShares();
  }, []);

  const totalEngagement = (share: TopShare) =>
    (share.likeCount ?? 0) + (share.repostCount ?? 0) + (share.replyCount ?? 0);

  // Only show if there are shares with engagement
  const sharesWithEngagement = shares.filter((s) => totalEngagement(s) > 0);

  if (loading) {
    return (
      <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-medium text-gray-200">Top This Week</span>
        </div>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (sharesWithEngagement.length === 0) {
    return null; // Don't show widget if no shares with engagement
  }

  return (
    <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-indigo-400" />
        <span className="text-sm font-medium text-gray-200">Top This Week</span>
      </div>

      <div className="space-y-2">
        {sharesWithEngagement.slice(0, 5).map((share, index) => (
          <div
            key={share.id}
            className="flex items-center gap-3 p-2 bg-gray-900/30 rounded-lg"
          >
            {/* Rank */}
            <span className="text-xs font-bold text-gray-500 w-4">{index + 1}</span>

            {/* Platform */}
            <span
              className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${platformColors[share.platform]}`}
            >
              {platformLabels[share.platform]}
            </span>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-300 truncate">
                {share.card?.name || share.talk?.title || 'Share'}
              </p>
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-0.5">
                <Heart className="w-3 h-3 text-pink-400" />
                {share.likeCount ?? 0}
              </span>
              <span className="flex items-center gap-0.5">
                <Repeat2 className="w-3 h-3 text-green-400" />
                {share.repostCount ?? 0}
              </span>
              <span className="flex items-center gap-0.5">
                <MessageCircle className="w-3 h-3 text-blue-400" />
                {share.replyCount ?? 0}
              </span>
            </div>

            {/* Link */}
            {share.postUrl && (
              <a
                href={share.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-300"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
