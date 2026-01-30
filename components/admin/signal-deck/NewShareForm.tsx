'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Link as LinkIcon, Check, AlertCircle } from 'lucide-react';

type Share = {
  id?: string;
  platform: 'x' | 'bluesky' | 'threads' | 'linkedin' | 'other';
  postUrl: string | null;
  status: 'draft' | 'posted' | 'verified';
  postedAt: string;
  sharedUrl: string | null;
  speakerHandle: string | null;
  speakerName: string | null;
  notes: string | null;
  cardId?: string | null;
  talkId?: string | null;
};

type Props = {
  share?: Share | null;
  onSave: () => void;
  onClose: () => void;
};

const platforms: Array<{ value: Share['platform']; label: string; shortLabel: string }> = [
  { value: 'x', label: 'X (Twitter)', shortLabel: 'X' },
  { value: 'bluesky', label: 'Bluesky', shortLabel: 'BS' },
  { value: 'threads', label: 'Threads', shortLabel: 'TH' },
  { value: 'linkedin', label: 'LinkedIn', shortLabel: 'LI' },
  { value: 'other', label: 'Other', shortLabel: '...' },
];

const statuses: Array<{ value: Share['status']; label: string }> = [
  { value: 'draft', label: 'Draft' },
  { value: 'posted', label: 'Posted' },
  { value: 'verified', label: 'Verified' },
];

const platformColors: Record<string, string> = {
  x: 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700',
  bluesky: 'bg-blue-600 border-blue-500 text-white hover:bg-blue-500',
  threads: 'bg-gradient-to-r from-purple-600 to-pink-500 border-purple-500 text-white hover:from-purple-500 hover:to-pink-400',
  linkedin: 'bg-blue-700 border-blue-600 text-white hover:bg-blue-600',
  other: 'bg-gray-600 border-gray-500 text-white hover:bg-gray-500',
};

const platformColorsSelected: Record<string, string> = {
  x: 'bg-gray-800 border-white text-white ring-2 ring-white',
  bluesky: 'bg-blue-600 border-white text-white ring-2 ring-blue-300',
  threads: 'bg-gradient-to-r from-purple-600 to-pink-500 border-white text-white ring-2 ring-purple-300',
  linkedin: 'bg-blue-700 border-white text-white ring-2 ring-blue-300',
  other: 'bg-gray-600 border-white text-white ring-2 ring-gray-300',
};

export function NewShareForm({ share, onSave, onClose }: Props) {
  const isEditing = !!share?.id;

  const [formData, setFormData] = useState<{
    platform: Share['platform'];
    postUrl: string;
    status: Share['status'];
    postedAt: string;
    sharedUrl: string;
    speakerHandle: string;
    speakerName: string;
    notes: string;
    cardId: string | null;
    talkId: string | null;
  }>({
    platform: share?.platform || 'x',
    postUrl: share?.postUrl || '',
    status: share?.status || 'posted',
    postedAt: share?.postedAt
      ? new Date(share.postedAt).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    sharedUrl: share?.sharedUrl || '',
    speakerHandle: share?.speakerHandle || '',
    speakerName: share?.speakerName || '',
    notes: share?.notes || '',
    cardId: share?.cardId || null,
    talkId: share?.talkId || null,
  });

  const [saving, setSaving] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolvedContent, setResolvedContent] = useState<{
    type: 'card' | 'talk' | null;
    name?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-detect TarotTALKS URL from post URL
  useEffect(() => {
    if (formData.postUrl && !formData.sharedUrl) {
      const match = formData.postUrl.match(/tarottalks\.app\/(cards|talks)\/[a-z0-9-]+/i);
      if (match) {
        const detectedUrl = `https://${match[0]}`;
        setFormData((prev) => ({ ...prev, sharedUrl: detectedUrl }));
      }
    }
  }, [formData.postUrl]);

  // Resolve shared URL to card/talk
  useEffect(() => {
    const resolveUrl = async () => {
      if (!formData.sharedUrl || !formData.sharedUrl.includes('tarottalks.app')) {
        setResolvedContent(null);
        setFormData((prev) => ({ ...prev, cardId: null, talkId: null }));
        return;
      }

      setResolving(true);
      try {
        const response = await fetch('/api/admin/social-shares/resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: formData.sharedUrl }),
        });

        if (!response.ok) throw new Error('Failed to resolve');

        const result = await response.json();
        setResolvedContent(result);
        setFormData((prev) => ({
          ...prev,
          cardId: result.cardId || null,
          talkId: result.talkId || null,
        }));
      } catch (err) {
        console.error('Error resolving URL:', err);
        setResolvedContent({ type: null });
      } finally {
        setResolving(false);
      }
    };

    const timeout = setTimeout(resolveUrl, 500);
    return () => clearTimeout(timeout);
  }, [formData.sharedUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const payload = {
        ...formData,
        postUrl: formData.postUrl || null,
        sharedUrl: formData.sharedUrl || null,
        speakerHandle: formData.speakerHandle || null,
        speakerName: formData.speakerName || null,
        notes: formData.notes || null,
        postedAt: new Date(formData.postedAt).toISOString(),
      };

      const url = isEditing
        ? `/api/admin/social-shares/${share.id}`
        : '/api/admin/social-shares';

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save');
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save share');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-gray-100">
            {isEditing ? 'Edit Share' : 'Log New Share'}
          </h2>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-1 text-gray-400 hover:text-gray-300 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Platform Selector */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Platform</label>
            <div className="flex gap-2">
              {platforms.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, platform: p.value }))}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    formData.platform === p.value
                      ? platformColorsSelected[p.value]
                      : platformColors[p.value]
                  }`}
                >
                  {p.shortLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Post URL */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Post URL</label>
            <input
              type="url"
              value={formData.postUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, postUrl: e.target.value }))}
              placeholder="https://x.com/tarottalks/status/..."
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* TarotTALKS URL */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              TarotTALKS URL Shared
            </label>
            <div className="relative">
              <input
                type="url"
                value={formData.sharedUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, sharedUrl: e.target.value }))}
                placeholder="https://tarottalks.app/cards/the-tower"
                className="w-full px-3 py-2 pr-10 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {resolving && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
              )}
            </div>
            {resolvedContent && resolvedContent.type && (
              <div className="flex items-center gap-2 text-xs">
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-300">
                  Detected: {resolvedContent.name}
                </span>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Status</label>
            <div className="flex gap-2">
              {statuses.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, status: s.value }))}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    formData.status === s.value
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-gray-900 border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Posted At */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Posted At</label>
            <input
              type="datetime-local"
              value={formData.postedAt}
              onChange={(e) => setFormData((prev) => ({ ...prev, postedAt: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Speaker Info (collapsible) */}
          <details className="group">
            <summary className="flex items-center gap-2 text-sm font-medium text-gray-400 cursor-pointer hover:text-gray-300">
              <LinkIcon className="w-4 h-4" />
              Speaker Info (optional)
            </summary>
            <div className="mt-3 space-y-3 pl-6">
              <div className="space-y-2">
                <label className="block text-xs text-gray-400">Speaker Handle</label>
                <input
                  type="text"
                  value={formData.speakerHandle}
                  onChange={(e) => setFormData((prev) => ({ ...prev, speakerHandle: e.target.value }))}
                  placeholder="@speaker"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-gray-400">Speaker Name</label>
                <input
                  type="text"
                  value={formData.speakerName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, speakerName: e.target.value }))}
                  placeholder="Jane Doe"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </details>

          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Any notes about this share..."
              rows={3}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
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
              {isEditing ? 'Update' : 'Save Share'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
