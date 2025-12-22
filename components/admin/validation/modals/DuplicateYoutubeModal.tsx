'use client';

import { useState } from 'react';
import { X, Youtube, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface DuplicateYoutubeModalProps {
  youtubeVideoId: string;
  talks: Array<{
    id: string;
    title: string;
    speakerName: string;
    slug: string;
  }>;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DuplicateYoutubeModal({
  youtubeVideoId,
  talks,
  onClose,
  onSuccess
}: DuplicateYoutubeModalProps) {
  const [selectedTalkIds, setSelectedTalkIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = (talkId: string) => {
    const newSelected = new Set(selectedTalkIds);
    if (newSelected.has(talkId)) {
      newSelected.delete(talkId);
    } else {
      newSelected.add(talkId);
    }
    setSelectedTalkIds(newSelected);
  };

  const handleRemoveYoutubeIds = async () => {
    if (selectedTalkIds.size === 0) {
      setError('Please select at least one talk to remove YouTube ID from');
      return;
    }

    if (selectedTalkIds.size === talks.length) {
      setError('You must keep the YouTube ID on at least one talk');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Remove YouTube ID from selected talks
      for (const talkId of Array.from(selectedTalkIds)) {
        const response = await fetch('/api/admin/validation/fix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'resolve-duplicate-youtube',
            talkId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to remove YouTube ID');
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve duplicate');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
          <div className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-400" />
            <h2 className="text-lg font-semibold text-gray-100">Resolve Duplicate YouTube ID</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-300">
                <p className="font-medium text-yellow-400 mb-1">Duplicate YouTube ID Detected</p>
                <p className="mb-2">
                  Multiple talks share the same YouTube video ID: <code className="bg-gray-900 px-1.5 py-0.5 rounded text-xs">{youtubeVideoId}</code>
                </p>
                <p>
                  Select the talks that should have their YouTube ID <strong>removed</strong>.
                  At least one talk must keep the ID.
                </p>
              </div>
            </div>
          </div>

          {/* Talks List */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Talks to Remove YouTube ID From ({selectedTalkIds.size} selected)
            </label>
            {talks.map((talk) => (
              <div
                key={talk.id}
                className={`bg-gray-900/50 rounded-lg p-3 border ${
                  selectedTalkIds.has(talk.id)
                    ? 'border-red-500/50 bg-red-500/5'
                    : 'border-gray-700'
                } transition-colors`}
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTalkIds.has(talk.id)}
                    onChange={() => handleToggle(talk.id)}
                    disabled={isSubmitting}
                    className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-700 text-red-500 focus:ring-2 focus:ring-red-500 focus:ring-offset-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-100 mb-1">{talk.title}</h3>
                    <p className="text-sm text-gray-400 mb-2">{talk.speakerName}</p>
                    <Link
                      href={`/admin/talks/${talk.id}/edit`}
                      className="text-xs text-indigo-400 hover:text-indigo-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Edit Talk →
                    </Link>
                  </div>
                </label>
              </div>
            ))}
          </div>

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
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleRemoveYoutubeIds}
            disabled={isSubmitting || selectedTalkIds.size === 0}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Removing...
              </>
            ) : (
              <>
                Remove YouTube ID ({selectedTalkIds.size})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
