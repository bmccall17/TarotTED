'use client';

import { useState, useEffect, useRef } from 'react';
import { Save, X, Star } from 'lucide-react';
import { TalkSelector } from './TalkSelector';

type Mapping = {
  id: string;
  cardId: string;
  talkId: string;
  isPrimary: boolean;
  strength: number;
  rationaleShort: string;
  rationaleLong: string | null;
  talkTitle: string;
  talkSlug: string;
  talkSpeakerName: string;
  talkThumbnailUrl: string | null;
  talkYear: number | null;
};

type Talk = {
  id: string;
  slug: string;
  title: string;
  speakerName: string;
  thumbnailUrl: string | null;
  year: number | null;
};

type Props = {
  cardId: string;
  existingMappings: Mapping[];
  editingMapping: Mapping | null;
  onSubmit: (data: {
    talkId: string;
    isPrimary: boolean;
    strength: number;
    rationaleShort: string;
    rationaleLong?: string;
  }) => Promise<void>;
  onCancel: () => void;
};

export function MappingForm({
  cardId,
  existingMappings,
  editingMapping,
  onSubmit,
  onCancel,
}: Props) {
  const [selectedTalk, setSelectedTalk] = useState<Talk | null>(
    editingMapping
      ? {
          id: editingMapping.talkId,
          slug: editingMapping.talkSlug,
          title: editingMapping.talkTitle,
          speakerName: editingMapping.talkSpeakerName,
          thumbnailUrl: editingMapping.talkThumbnailUrl,
          year: editingMapping.talkYear,
        }
      : null
  );
  const [isPrimary, setIsPrimary] = useState(editingMapping?.isPrimary ?? false);
  const [strength, setStrength] = useState(editingMapping?.strength ?? 3);
  const [rationaleShort, setRationaleShort] = useState(editingMapping?.rationaleShort ?? '');
  const [rationaleLong, setRationaleLong] = useState(editingMapping?.rationaleLong ?? '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get list of talk IDs already mapped to this card (excluding the one being edited)
  const excludeTalkIds = existingMappings
    .filter((m) => m.id !== editingMapping?.id)
    .map((m) => m.talkId);

  // Check if there's already a primary mapping
  const hasPrimaryMapping = existingMappings.some(
    (m) => m.isPrimary && m.id !== editingMapping?.id
  );

  // Form ref for programmatic submission
  const formRef = useRef<HTMLFormElement>(null);

  // Keyboard shortcut: Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedTalk) {
      newErrors.talk = 'Please select a talk';
    }

    if (!rationaleShort.trim()) {
      newErrors.rationaleShort = 'Rationale is required';
    } else if (rationaleShort.trim().length < 20) {
      newErrors.rationaleShort = 'Rationale should be at least 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !selectedTalk) return;

    setLoading(true);
    try {
      await onSubmit({
        talkId: selectedTalk.id,
        isPrimary,
        strength,
        rationaleShort: rationaleShort.trim(),
        rationaleLong: rationaleLong.trim() || undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-100">
          {editingMapping ? 'Edit Mapping' : 'Add New Mapping'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 text-gray-400 hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Talk Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select Talk <span className="text-red-400">*</span>
        </label>
        {editingMapping ? (
          // When editing, show the talk (can't change it)
          <div className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-600 rounded-lg">
            {selectedTalk?.thumbnailUrl && (
              <img
                src={selectedTalk.thumbnailUrl}
                alt=""
                className="w-16 h-9 object-cover rounded"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-100 truncate">
                {selectedTalk?.title}
              </p>
              <p className="text-xs text-gray-400">
                {selectedTalk?.speakerName}
                {selectedTalk?.year && ` (${selectedTalk.year})`}
              </p>
            </div>
          </div>
        ) : (
          <TalkSelector
            selectedTalkId={selectedTalk?.id ?? null}
            excludeTalkIds={excludeTalkIds}
            onSelectTalk={setSelectedTalk}
            onClear={() => setSelectedTalk(null)}
          />
        )}
        {errors.talk && (
          <p className="text-sm text-red-400 mt-1">{errors.talk}</p>
        )}
      </div>

      {/* Strength */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Mapping Strength
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="5"
            value={strength}
            onChange={(e) => setStrength(parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex items-center gap-1 w-20 justify-end">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i <= strength ? 'bg-indigo-500' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          How strongly does this talk connect to the card? (1 = weak, 5 = strong)
        </p>
      </div>

      {/* Is Primary */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.target.checked)}
            className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
          />
          <span className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Star className="w-4 h-4 text-yellow-400" />
            Set as Primary Mapping
          </span>
        </label>
        {hasPrimaryMapping && isPrimary && !editingMapping?.isPrimary && (
          <p className="text-xs text-yellow-400 mt-2 ml-7">
            This will replace the current primary mapping
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1 ml-7">
          The primary mapping is shown first when viewing this card
        </p>
      </div>

      {/* Rationale Short */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Rationale (Short) <span className="text-red-400">*</span>
        </label>
        <textarea
          value={rationaleShort}
          onChange={(e) => setRationaleShort(e.target.value)}
          rows={3}
          placeholder="Explain why this talk connects to this card (1-2 sentences)..."
          className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        {errors.rationaleShort && (
          <p className="text-sm text-red-400 mt-1">{errors.rationaleShort}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {rationaleShort.length} characters (min 20)
        </p>
      </div>

      {/* Rationale Long (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Rationale (Long) <span className="text-gray-500">(optional)</span>
        </label>
        <textarea
          value={rationaleLong}
          onChange={(e) => setRationaleLong(e.target.value)}
          rows={5}
          placeholder="Optional deeper exploration of the connection..."
          className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : editingMapping ? 'Update Mapping' : 'Add Mapping'}
        </button>
      </div>
    </form>
  );
}
