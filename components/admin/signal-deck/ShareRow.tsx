'use client';

import { useState } from 'react';
import { ExternalLink, Edit2, Trash2, Check, Clock, FileText, MessageSquare } from 'lucide-react';
import { ConfirmDialog } from '../ui/ConfirmDialog';

type Share = {
  id: string;
  platform: 'x' | 'bluesky' | 'threads' | 'linkedin' | 'other';
  postUrl: string | null;
  status: 'draft' | 'posted' | 'verified';
  postedAt: string;
  sharedUrl: string | null;
  speakerHandle: string | null;
  speakerName: string | null;
  notes: string | null;
  card?: { id: string; name: string; slug: string } | null;
  talk?: { id: string; title: string; slug: string; speakerName: string } | null;
};

type Props = {
  share: Share;
  onEdit: (share: Share) => void;
  onDeleted: () => void;
};

const platformIcons: Record<string, string> = {
  x: 'X',
  bluesky: 'BS',
  threads: 'TH',
  linkedin: 'LI',
  other: '...',
};

const platformColors: Record<string, string> = {
  x: 'bg-gray-800 text-white',
  bluesky: 'bg-blue-600 text-white',
  threads: 'bg-gradient-to-r from-purple-600 to-pink-500 text-white',
  linkedin: 'bg-blue-700 text-white',
  other: 'bg-gray-600 text-white',
};

const statusIcons: Record<string, React.ReactNode> = {
  draft: <FileText className="w-3.5 h-3.5" />,
  posted: <Clock className="w-3.5 h-3.5" />,
  verified: <Check className="w-3.5 h-3.5" />,
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-700 text-gray-300',
  posted: 'bg-amber-900/50 text-amber-300 border border-amber-700/50',
  verified: 'bg-green-900/50 text-green-300 border border-green-700/50',
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function truncateUrl(url: string, maxLength: number = 40): string {
  if (url.length <= maxLength) return url;
  return url.slice(0, maxLength) + '...';
}

export function ShareRow({ share, onEdit, onDeleted }: Props) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/social-shares/${share.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete');
      onDeleted();
    } catch (error) {
      console.error('Error deleting share:', error);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const sharedContent = share.card?.name || share.talk?.title || null;
  const sharedSpeaker = share.talk?.speakerName || share.speakerName || null;

  return (
    <>
      <div className="flex items-start gap-4 p-4 bg-gray-800/30 border border-gray-700/50 rounded-lg hover:bg-gray-800/50 transition-colors">
        {/* Platform Icon */}
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-lg text-sm font-bold ${platformColors[share.platform]}`}
        >
          {platformIcons[share.platform]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Post URL */}
          <div className="flex items-center gap-2">
            {share.postUrl ? (
              <a
                href={share.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-indigo-400 transition-colors flex items-center gap-1 text-sm"
              >
                {truncateUrl(share.postUrl)}
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            ) : (
              <span className="text-gray-500 text-sm italic">No post URL</span>
            )}
          </div>

          {/* Shared content info */}
          {(sharedContent || sharedSpeaker || share.sharedUrl) && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {sharedContent && (
                <span className="px-2 py-0.5 bg-indigo-900/40 text-indigo-300 rounded border border-indigo-700/50">
                  {share.card ? 'Card: ' : 'Talk: '}
                  {sharedContent}
                </span>
              )}
              {sharedSpeaker && !share.card && (
                <span className="text-gray-400">by {sharedSpeaker}</span>
              )}
              {share.sharedUrl && !sharedContent && (
                <span className="text-gray-500 truncate max-w-[200px]">{share.sharedUrl}</span>
              )}
            </div>
          )}

          {/* Speaker handle if present */}
          {share.speakerHandle && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <MessageSquare className="w-3 h-3" />
              <span>@{share.speakerHandle.replace('@', '')}</span>
            </div>
          )}

          {/* Notes preview */}
          {share.notes && (
            <p className="text-xs text-gray-500 line-clamp-2">{share.notes}</p>
          )}
        </div>

        {/* Meta info */}
        <div className="flex flex-col items-end gap-2">
          {/* Status badge */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusColors[share.status]}`}
          >
            {statusIcons[share.status]}
            {share.status}
          </span>

          {/* Posted time */}
          <span className="text-xs text-gray-500">{formatRelativeTime(share.postedAt)}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(share)}
            className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-gray-700 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Share"
          message="Are you sure you want to delete this share? This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          loading={deleting}
        />
      )}
    </>
  );
}
