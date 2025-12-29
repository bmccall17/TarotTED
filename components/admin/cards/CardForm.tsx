'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Edit2, Star, Link2 } from 'lucide-react';
import Image from 'next/image';
import { Toast } from '../ui/Toast';

type CardFormData = {
  name: string;
  summary: string;
  keywords: string;
  uprightMeaning: string;
  reversedMeaning: string;
  symbolism: string;
  adviceWhenDrawn: string;
  journalingPrompts: string;
  astrologicalCorrespondence: string;
  numerologicalSignificance: string;
};

type Mapping = {
  id: string;
  talkId: string;
  isPrimary: boolean;
  strength: number;
  rationaleShort: string;
  rationaleLong: string | null;
  talkSlug: string;
  talkTitle: string;
  talkSpeakerName: string;
  talkThumbnailUrl: string | null;
  talkYear: number | null;
  talkIsDeleted: boolean;
};

type Props = {
  initialData: {
    id: string;
    slug: string;
    name: string;
    arcanaType: 'major' | 'minor';
    suit: string | null;
    imageUrl: string;
    keywords: string;
    summary: string;
    uprightMeaning: string | null;
    reversedMeaning: string | null;
    symbolism: string | null;
    adviceWhenDrawn: string | null;
    journalingPrompts: string | null;
    astrologicalCorrespondence: string | null;
    numerologicalSignificance: string | null;
    mappings: Mapping[];
  };
};

export function CardForm({ initialData }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CardFormData>({
    name: initialData.name,
    summary: initialData.summary,
    keywords: initialData.keywords,
    uprightMeaning: initialData.uprightMeaning || '',
    reversedMeaning: initialData.reversedMeaning || '',
    symbolism: initialData.symbolism || '',
    adviceWhenDrawn: initialData.adviceWhenDrawn || '',
    journalingPrompts: initialData.journalingPrompts || '',
    astrologicalCorrespondence: initialData.astrologicalCorrespondence || '',
    numerologicalSignificance: initialData.numerologicalSignificance || '',
  });

  const updateField = <K extends keyof CardFormData>(field: K, value: CardFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`/api/admin/cards/${initialData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          uprightMeaning: formData.uprightMeaning || null,
          reversedMeaning: formData.reversedMeaning || null,
          symbolism: formData.symbolism || null,
          adviceWhenDrawn: formData.adviceWhenDrawn || null,
          journalingPrompts: formData.journalingPrompts || null,
          astrologicalCorrespondence: formData.astrologicalCorrespondence || null,
          numerologicalSignificance: formData.numerologicalSignificance || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save card');
      }

      setToast({ message: 'Card saved successfully', type: 'success' });
      setTimeout(() => router.push('/admin/cards'), 1500);
    } catch (error) {
      console.error('Error saving card:', error);
      setToast({
        message: error instanceof Error ? error.message : 'Failed to save card',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const arcanaLabel = initialData.arcanaType === 'major'
    ? 'Major Arcana'
    : initialData.suit
      ? initialData.suit.charAt(0).toUpperCase() + initialData.suit.slice(1)
      : 'Minor Arcana';

  const primaryMapping = initialData.mappings.find(m => m.isPrimary);
  const otherMappings = initialData.mappings.filter(m => !m.isPrimary);

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-24 h-32 relative bg-gray-900 rounded-lg overflow-hidden border border-gray-700 flex-shrink-0">
            <Image
              src={initialData.imageUrl}
              alt={initialData.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-100">{initialData.name}</h2>
            <p className="text-sm text-gray-400 mt-1">/{initialData.slug}</p>
            <p className="text-sm text-indigo-400 mt-1">{arcanaLabel}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/cards')}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="button"
            onClick={() => router.push(`/admin/mappings?cardId=${initialData.id}`)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Link2 className="w-4 h-4" />
            Manage Mappings
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-100">Basic Information</h3>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Card Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Summary
          </label>
          <textarea
            value={formData.summary}
            onChange={(e) => updateField('summary', e.target.value)}
            rows={2}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Keywords <span className="text-gray-500">(JSON array)</span>
          </label>
          <textarea
            value={formData.keywords}
            onChange={(e) => updateField('keywords', e.target.value)}
            rows={2}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder='["keyword1", "keyword2", "keyword3"]'
          />
        </div>
      </div>

      {/* Meanings */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-100">Meanings</h3>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Upright Meaning
          </label>
          <textarea
            value={formData.uprightMeaning}
            onChange={(e) => updateField('uprightMeaning', e.target.value)}
            rows={4}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Reversed Meaning
          </label>
          <textarea
            value={formData.reversedMeaning}
            onChange={(e) => updateField('reversedMeaning', e.target.value)}
            rows={4}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Additional Details */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-100">Additional Details</h3>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Symbolism
          </label>
          <textarea
            value={formData.symbolism}
            onChange={(e) => updateField('symbolism', e.target.value)}
            rows={4}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Advice When Drawn
          </label>
          <textarea
            value={formData.adviceWhenDrawn}
            onChange={(e) => updateField('adviceWhenDrawn', e.target.value)}
            rows={4}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Journaling Prompts <span className="text-gray-500">(JSON array)</span>
          </label>
          <textarea
            value={formData.journalingPrompts}
            onChange={(e) => updateField('journalingPrompts', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder='["Prompt 1", "Prompt 2"]'
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Astrological Correspondence
          </label>
          <input
            type="text"
            value={formData.astrologicalCorrespondence}
            onChange={(e) => updateField('astrologicalCorrespondence', e.target.value)}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Numerological Significance
          </label>
          <textarea
            value={formData.numerologicalSignificance}
            onChange={(e) => updateField('numerologicalSignificance', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Mapped Talks */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">
          Mapped Talks ({initialData.mappings.length})
        </h3>

        {initialData.mappings.length === 0 ? (
          <p className="text-gray-400 text-sm">No talks mapped to this card yet.</p>
        ) : (
          <div className="space-y-4">
            {/* Primary Mapping */}
            {primaryMapping && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs font-medium text-yellow-400 uppercase">Primary Mapping</span>
                </div>
                <div className="bg-gray-900/50 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    {primaryMapping.talkThumbnailUrl && (
                      <img
                        src={primaryMapping.talkThumbnailUrl}
                        alt=""
                        className="w-20 h-12 object-cover rounded flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-100">{primaryMapping.talkTitle}</h4>
                      <p className="text-sm text-gray-400 mt-1">{primaryMapping.talkSpeakerName}</p>
                      <p className="text-sm text-gray-500 italic mt-2">
                        "{primaryMapping.rationaleShort}"
                      </p>
                    </div>
                    <a
                      href={`/admin/talks/${primaryMapping.talkId}/edit`}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit Talk
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Other Mappings */}
            {otherMappings.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2 uppercase">
                  Secondary Mappings ({otherMappings.length})
                </h4>
                <div className="space-y-2">
                  {otherMappings.map((mapping) => (
                    <div
                      key={mapping.id}
                      className="bg-gray-900/50 border border-gray-700 rounded-lg p-3"
                    >
                      <div className="flex items-start gap-3">
                        {mapping.talkThumbnailUrl && (
                          <img
                            src={mapping.talkThumbnailUrl}
                            alt=""
                            className="w-16 h-10 object-cover rounded flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-gray-100 text-sm">{mapping.talkTitle}</h5>
                          <p className="text-xs text-gray-400 mt-0.5">{mapping.talkSpeakerName}</p>
                        </div>
                        <a
                          href={`/admin/talks/${mapping.talkId}/edit`}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </form>
  );
}
