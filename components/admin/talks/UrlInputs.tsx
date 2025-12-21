'use client';

import { useEffect } from 'react';
import { ExternalLink, CheckCircle2 } from 'lucide-react';

type Props = {
  tedUrl: string;
  youtubeUrl: string;
  onTedUrlChange: (url: string) => void;
  onYoutubeUrlChange: (url: string) => void;
  onYoutubeVideoIdChange: (id: string | null) => void;
  error?: string;
};

/**
 * Extract YouTube video ID from various URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
function extractYoutubeVideoId(url: string): string | null {
  if (!url) return null;

  try {
    const urlObj = new URL(url);

    // youtu.be format
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1).split('?')[0];
    }

    // youtube.com/watch format
    if (urlObj.hostname.includes('youtube.com')) {
      const videoId = urlObj.searchParams.get('v');
      if (videoId) return videoId;

      // youtube.com/embed format
      const embedMatch = urlObj.pathname.match(/\/embed\/([^/?]+)/);
      if (embedMatch) return embedMatch[1];
    }

    return null;
  } catch {
    return null;
  }
}

export function UrlInputs({
  tedUrl,
  youtubeUrl,
  onTedUrlChange,
  onYoutubeUrlChange,
  onYoutubeVideoIdChange,
  error,
}: Props) {
  // Auto-extract YouTube video ID when URL changes
  useEffect(() => {
    const videoId = extractYoutubeVideoId(youtubeUrl);
    onYoutubeVideoIdChange(videoId);
  }, [youtubeUrl, onYoutubeVideoIdChange]);

  const hasAtLeastOneUrl = tedUrl.trim() !== '' || youtubeUrl.trim() !== '';
  const primaryUrl = tedUrl.trim() !== '' ? tedUrl : youtubeUrl;
  const isPrimaryTed = tedUrl.trim() !== '';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-300">
          URLs <span className="text-red-400">*</span>
        </label>
        {hasAtLeastOneUrl && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <CheckCircle2 className="w-3 h-3 text-green-400" />
            Primary: {isPrimaryTed ? 'TED.com' : 'YouTube'}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400">
        At least one URL is required. TED.com URL will be used as primary if provided.
      </p>

      {/* TED.com URL */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          TED.com URL
        </label>
        <div className="relative">
          <input
            type="url"
            value={tedUrl}
            onChange={(e) => onTedUrlChange(e.target.value)}
            placeholder="https://www.ted.com/talks/..."
            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {tedUrl && (
            <a
              href={tedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-300"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
        {isPrimaryTed && (
          <p className="text-xs text-green-400 mt-1">
            This URL will be used as the primary link
          </p>
        )}
      </div>

      {/* YouTube URL */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          YouTube URL
        </label>
        <div className="relative">
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => onYoutubeUrlChange(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {youtubeUrl && (
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-300"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
        {youtubeUrl && extractYoutubeVideoId(youtubeUrl) && (
          <p className="text-xs text-gray-400 mt-1">
            Video ID: <code className="font-mono bg-gray-800 px-1 py-0.5 rounded">{extractYoutubeVideoId(youtubeUrl)}</code>
          </p>
        )}
        {youtubeUrl && !extractYoutubeVideoId(youtubeUrl) && (
          <p className="text-xs text-yellow-400 mt-1">
            Could not extract video ID from URL
          </p>
        )}
        {!isPrimaryTed && youtubeUrl && (
          <p className="text-xs text-green-400 mt-1">
            This URL will be used as the primary link
          </p>
        )}
      </div>

      {/* Validation Error */}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {!hasAtLeastOneUrl && (
        <p className="text-sm text-yellow-400">
          Please provide at least one URL (TED.com or YouTube)
        </p>
      )}
    </div>
  );
}
