'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X } from 'lucide-react';
import { UrlInputs } from './UrlInputs';
import { MetadataFetcher } from './MetadataFetcher';
import { TalkPreview } from './TalkPreview';
import { Toast } from '../ui/Toast';

type TalkFormData = {
  title: string;
  speakerName: string;
  tedUrl: string;
  youtubeUrl: string;
  youtubeVideoId: string | null;
  description: string;
  durationSeconds: number | null;
  year: number | null;
  eventName: string;
  thumbnailUrl: string;
  language: string;
};

type Props = {
  initialData?: Partial<TalkFormData>;
  talkId?: string;
  mode: 'create' | 'edit';
};

export function TalkForm({ initialData, talkId, mode }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<TalkFormData>({
    title: initialData?.title || '',
    speakerName: initialData?.speakerName || '',
    tedUrl: initialData?.tedUrl || '',
    youtubeUrl: initialData?.youtubeUrl || '',
    youtubeVideoId: initialData?.youtubeVideoId || null,
    description: initialData?.description || '',
    durationSeconds: initialData?.durationSeconds || null,
    year: initialData?.year || null,
    eventName: initialData?.eventName || '',
    thumbnailUrl: initialData?.thumbnailUrl || '',
    language: initialData?.language || 'en',
  });

  const updateField = <K extends keyof TalkFormData>(field: K, value: TalkFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleApplyMetadata = (metadata: Partial<TalkFormData>) => {
    setFormData((prev) => ({ ...prev, ...metadata }));
    setToast({ message: 'Metadata applied successfully', type: 'success' });
  };

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

  // Explicitly allow navigation (disable browser's unsaved changes warning)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Delete the returnValue property to allow navigation
      delete e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.speakerName.trim()) {
      newErrors.speakerName = 'Speaker name is required';
    }
    if (!formData.tedUrl.trim() && !formData.youtubeUrl.trim()) {
      newErrors.urls = 'At least one URL (TED.com or YouTube) is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setToast({ message: 'Please fix the errors before submitting', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === 'create'
        ? '/api/admin/talks'
        : `/api/admin/talks/${talkId}`;

      const method = mode === 'create' ? 'POST' : 'PUT';

      // Prepare data for submission
      const submitData = {
        title: formData.title.trim(),
        speakerName: formData.speakerName.trim(),
        tedUrl: formData.tedUrl.trim() || null,
        youtubeUrl: formData.youtubeUrl.trim() || null,
        youtubeVideoId: formData.youtubeVideoId,
        description: formData.description.trim() || null,
        durationSeconds: formData.durationSeconds,
        year: formData.year,
        eventName: formData.eventName.trim() || null,
        thumbnailUrl: formData.thumbnailUrl.trim() || null,
        language: formData.language,
      };

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save talk');
      }

      const { talk } = await response.json();

      setToast({
        message: mode === 'create' ? 'Talk created successfully' : 'Talk updated successfully',
        type: 'success',
      });

      // Redirect after a short delay to show the toast
      setTimeout(() => {
        router.push('/admin/talks');
      }, 1500);
    } catch (error) {
      console.error('Error saving talk:', error);
      setToast({
        message: error instanceof Error ? error.message : 'Failed to save talk',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/talks');
  };

  return (
    <div className="max-w-7xl mx-auto p-8 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">
          {mode === 'create' ? 'Create New Talk' : 'Edit Talk'}
        </h1>
        <p className="text-gray-400 mt-2">
          {mode === 'create'
            ? 'Add a new TED talk to the collection'
            : 'Update talk details and metadata'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Column */}
        <div className="space-y-6">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            {/* URLs Section */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-100 mb-4">URLs</h2>
              <UrlInputs
                tedUrl={formData.tedUrl}
                youtubeUrl={formData.youtubeUrl}
                onTedUrlChange={(url) => updateField('tedUrl', url)}
                onYoutubeUrlChange={(url) => updateField('youtubeUrl', url)}
                onYoutubeVideoIdChange={(id) => updateField('youtubeVideoId', id)}
                error={errors.urls}
              />
            </div>

            {/* Metadata Fetcher */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-100 mb-4">Fetch Metadata</h2>
              <MetadataFetcher
                tedUrl={formData.tedUrl}
                youtubeUrl={formData.youtubeUrl}
                onApplyMetadata={handleApplyMetadata}
              />
            </div>

            {/* Basic Information */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-100 mb-4">Basic Information</h2>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter talk title"
                />
                {errors.title && (
                  <p className="text-sm text-red-400 mt-1">{errors.title}</p>
                )}
              </div>

              {/* Speaker Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Speaker Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.speakerName}
                  onChange={(e) => updateField('speakerName', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter speaker name"
                />
                {errors.speakerName && (
                  <p className="text-sm text-red-400 mt-1">{errors.speakerName}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter talk description"
                />
              </div>
            </div>

            {/* Additional Details */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-100 mb-4">Additional Details</h2>

              <div className="grid grid-cols-2 gap-4">
                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    value={formData.year || ''}
                    onChange={(e) => updateField('year', e.target.value ? parseInt(e.target.value, 10) : null)}
                    min="1900"
                    max="2100"
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="2024"
                  />
                </div>

                {/* Duration (seconds) */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    value={formData.durationSeconds || ''}
                    onChange={(e) => updateField('durationSeconds', e.target.value ? parseInt(e.target.value, 10) : null)}
                    min="0"
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="900"
                  />
                </div>
              </div>

              {/* Event Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Event Name
                </label>
                <input
                  type="text"
                  value={formData.eventName}
                  onChange={(e) => updateField('eventName', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="TED2024, TEDxBerkeley, etc."
                />
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  value={formData.thumbnailUrl}
                  onChange={(e) => updateField('thumbnailUrl', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Language
                </label>
                <input
                  type="text"
                  value={formData.language}
                  onChange={(e) => updateField('language', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="en"
                  maxLength={5}
                />
                <p className="text-xs text-gray-400 mt-1">
                  ISO 639-1 language code (e.g., en, es, fr)
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-6 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : mode === 'create' ? 'Create Talk' : 'Update Talk'}
              </button>
            </div>
          </form>
        </div>

        {/* Preview Column */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Preview</h2>
            <TalkPreview data={formData} />
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
