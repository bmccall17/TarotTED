'use client';

import { useState } from 'react';
import { X, Star, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface SetPrimaryModalProps {
  card: {
    id: string;
    name: string;
    slug: string;
  };
  mappings: Array<{
    id: string;
    talkId: string;
    talkTitle: string;
    speakerName: string;
    rationaleShort: string | null;
    strength: number | null;
    isPrimary: boolean;
  }>;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SetPrimaryModal({
  card,
  mappings,
  onClose,
  onSuccess
}: SetPrimaryModalProps) {
  const [selectedTalkId, setSelectedTalkId] = useState<string | null>(
    mappings.find(m => m.isPrimary)?.talkId || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSetPrimary = async () => {
    if (!selectedTalkId) {
      setError('Please select a talk to set as primary');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/validation/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set-primary-mapping',
          cardId: card.id,
          talkId: selectedTalkId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set primary mapping');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set primary mapping');
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
            <Star className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-semibold text-gray-100">Set Primary Mapping</h2>
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
          {/* Card Info */}
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-gray-100">{card.name}</h3>
            </div>
            <Link
              href={`/cards/${card.slug}`}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              View Card →
            </Link>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-300">
                <p className="font-medium text-blue-400 mb-1">Select Primary Talk</p>
                <p>
                  Choose which talk should be the primary mapping for this card. The primary talk
                  appears first on the card detail page.
                </p>
              </div>
            </div>
          </div>

          {/* Mappings List */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Available Mappings ({mappings.length})
            </label>
            {mappings.map((mapping) => (
              <div
                key={mapping.id}
                className={`bg-gray-900/50 rounded-lg p-3 border ${
                  selectedTalkId === mapping.talkId
                    ? 'border-yellow-500/50 bg-yellow-500/5'
                    : 'border-gray-700'
                } transition-colors`}
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="primary-mapping"
                    checked={selectedTalkId === mapping.talkId}
                    onChange={() => setSelectedTalkId(mapping.talkId)}
                    disabled={isSubmitting}
                    className="mt-1 w-4 h-4 border-gray-600 bg-gray-700 text-yellow-500 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-100">{mapping.talkTitle}</h4>
                      {mapping.isPrimary && (
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded border border-yellow-500/30">
                          Current Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{mapping.speakerName}</p>
                    {mapping.strength && (
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < mapping.strength!
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-600'
                            }`}
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">
                          ({mapping.strength}/5)
                        </span>
                      </div>
                    )}
                    {mapping.rationaleShort && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                        {mapping.rationaleShort}
                      </p>
                    )}
                    <Link
                      href={`/admin/mappings?cardId=${card.id}&talkId=${mapping.talkId}`}
                      className="text-xs text-indigo-400 hover:text-indigo-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Edit Mapping →
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
            onClick={handleSetPrimary}
            disabled={isSubmitting || !selectedTalkId}
            className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Setting...
              </>
            ) : (
              <>
                <Star className="w-4 h-4" />
                Set as Primary
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
