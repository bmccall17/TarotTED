'use client';

import { useState } from 'react';
import { X, Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface DownloadThumbnailModalProps {
  talk: {
    id: string;
    title: string;
    speakerName: string;
    thumbnailUrl: string | null;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function DownloadThumbnailModal({
  talk,
  onClose,
  onSuccess
}: DownloadThumbnailModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!talk.thumbnailUrl) {
      setError('No thumbnail URL available');
      return;
    }

    setIsDownloading(true);
    setError(null);

    try {
      // Triggering an update with the external URL will cause
      // the backend to upload it to Supabase Storage
      const response = await fetch('/api/admin/validation/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-thumbnail',
          talkId: talk.id,
          thumbnailUrl: talk.thumbnailUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to download thumbnail');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download thumbnail');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-semibold text-gray-100">Upload to Storage</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            disabled={isDownloading}
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

          {/* Current External URL */}
          {talk.thumbnailUrl && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Current External URL
              </label>
              <p className="text-xs text-gray-500 bg-gray-900/50 rounded-lg p-2 break-all">
                {talk.thumbnailUrl}
              </p>

              {/* Preview */}
              <div className="bg-gray-900 rounded-lg p-2 border border-gray-700">
                <img
                  src={talk.thumbnailUrl}
                  alt="Thumbnail preview"
                  className="w-full h-auto rounded"
                />
              </div>
            </div>
          )}

          {/* Info message */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="flex gap-2">
              <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-300">
                This will upload the image to Supabase Storage for better reliability and performance.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            disabled={isDownloading}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloading || !talk.thumbnailUrl}
            className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isDownloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload to Storage
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
