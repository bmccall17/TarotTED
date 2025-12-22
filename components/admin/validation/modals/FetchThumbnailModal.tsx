'use client';

import { useState } from 'react';
import { X, Image as ImageIcon, Download, AlertCircle } from 'lucide-react';

interface FetchThumbnailModalProps {
  talk: {
    id: string;
    title: string;
    speakerName: string;
    tedUrl: string | null;
    youtubeUrl: string | null;
    youtubeVideoId: string | null;
    thumbnailUrl: string | null;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function FetchThumbnailModal({
  talk,
  onClose,
  onSuccess
}: FetchThumbnailModalProps) {
  const [fetchedThumbnail, setFetchedThumbnail] = useState<string | null>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchFromTED = async () => {
    if (!talk.tedUrl) {
      setError('No TED URL available');
      return;
    }

    setIsFetching(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/fetch-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: talk.tedUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch metadata from TED');
      }

      if (data.thumbnailUrl) {
        setFetchedThumbnail(data.thumbnailUrl);
      } else {
        setError('No thumbnail found in TED metadata');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch from TED');
    } finally {
      setIsFetching(false);
    }
  };

  const handleFetchFromYouTube = async () => {
    if (!talk.youtubeVideoId) {
      setError('No YouTube video ID available');
      return;
    }

    // YouTube thumbnail URL pattern
    const thumbnailUrl = `https://img.youtube.com/vi/${talk.youtubeVideoId}/maxresdefault.jpg`;
    setFetchedThumbnail(thumbnailUrl);
  };

  const handleApplyThumbnail = async () => {
    const thumbnailToApply = customUrl || fetchedThumbnail;

    if (!thumbnailToApply) {
      setError('Please fetch a thumbnail or enter a custom URL');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/validation/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-thumbnail',
          talkId: talk.id,
          thumbnailUrl: thumbnailToApply,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update thumbnail');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update thumbnail');
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewUrl = customUrl || fetchedThumbnail || talk.thumbnailUrl;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-gray-100">Fetch Thumbnail</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            disabled={isFetching || isSubmitting}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Talk Info */}
          <div className="bg-gray-900/50 rounded-lg p-3">
            <h3 className="font-medium text-gray-100 mb-1">{talk.title}</h3>
            <p className="text-sm text-gray-400">{talk.speakerName}</p>
          </div>

          {/* Fetch Options */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">
              Fetch Thumbnail From
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleFetchFromTED}
                disabled={!talk.tedUrl || isFetching || isSubmitting}
                className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                TED.com
              </button>

              <button
                onClick={handleFetchFromYouTube}
                disabled={!talk.youtubeVideoId || isFetching || isSubmitting}
                className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                YouTube
              </button>
            </div>

            {!talk.tedUrl && !talk.youtubeVideoId && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-300">
                    No TED URL or YouTube ID available. Please enter a custom thumbnail URL below.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Custom URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Or Enter Custom URL
            </label>
            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://example.com/thumbnail.jpg"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-100 placeholder-gray-500"
              disabled={isFetching || isSubmitting}
            />
          </div>

          {/* Preview */}
          {previewUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Preview
              </label>
              <div className="bg-gray-900 rounded-lg p-2 border border-gray-700">
                <img
                  src={previewUrl}
                  alt="Thumbnail preview"
                  className="w-full h-auto rounded"
                  onError={() => setError('Failed to load thumbnail preview')}
                />
              </div>
            </div>
          )}

          {isFetching && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                <p className="text-sm text-blue-400">Fetching thumbnail...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            disabled={isFetching || isSubmitting}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyThumbnail}
            disabled={isFetching || isSubmitting || (!customUrl && !fetchedThumbnail)}
            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4" />
                Apply Thumbnail
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
