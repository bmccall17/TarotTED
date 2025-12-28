'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2, RotateCcw, AlertTriangle, ExternalLink } from 'lucide-react';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { HardDeleteDialog } from '../ui/HardDeleteDialog';

type Talk = {
  id: string;
  slug: string;
  title: string;
  speakerName: string;
  tedUrl: string | null;
  youtubeUrl: string | null;
  thumbnailUrl: string | null;
  year: number | null;
  isDeleted: boolean;
  mappingsCount?: number;
};

type Props = {
  talk: Talk;
  onDeleted: () => void;
  onRestored: () => void;
  onHardDeleted: () => void;
};

export function TalkRow({ talk, onDeleted, onRestored, onHardDeleted }: Props) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showHardDeleteDialog, setShowHardDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSoftDelete = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/talks/${talk.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete talk');

      onDeleted();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting talk:', error);
      alert('Failed to delete talk');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/talks/${talk.id}/restore`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to restore talk');

      onRestored();
      setShowRestoreDialog(false);
    } catch (error) {
      console.error('Error restoring talk:', error);
      alert('Failed to restore talk');
    } finally {
      setLoading(false);
    }
  };

  const handleHardDelete = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/talks/${talk.id}/hard-delete`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to hard delete talk');

      onHardDeleted();
      setShowHardDeleteDialog(false);
    } catch (error) {
      console.error('Error hard deleting talk:', error);
      alert('Failed to hard delete talk');
    } finally {
      setLoading(false);
    }
  };

  const url = talk.tedUrl || talk.youtubeUrl;

  return (
    <>
      <tr className={talk.isDeleted ? 'bg-red-900/10' : 'hover:bg-gray-800/50'}>
        <td className="px-6 py-4">
          <div className="flex items-start gap-3">
            {talk.thumbnailUrl && (
              <img
                src={talk.thumbnailUrl}
                alt={talk.title}
                className="w-16 h-9 object-cover rounded"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p
                  className={`font-medium ${talk.isDeleted ? 'text-gray-500' : 'text-gray-100'}`}
                  title={talk.title}
                >
                  /{talk.slug}
                </p>
                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300"
                    title={talk.title}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <p className={talk.isDeleted ? 'text-gray-500' : 'text-gray-300'}>
            {talk.speakerName}
          </p>
        </td>
        <td className="px-6 py-4">
          <p className="text-gray-400 text-sm">
            {talk.year || '—'}
          </p>
        </td>
        <td className="px-6 py-4">
          <p className="text-gray-400 text-sm">
            {talk.mappingsCount || 0}
          </p>
        </td>
        <td className="px-6 py-4">
          {talk.isDeleted ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-900/20 text-red-400 border border-red-500/30">
              Deleted
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-900/20 text-green-400 border border-green-500/30">
              Active
            </span>
          )}
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center justify-end gap-2">
            {talk.isDeleted ? (
              <>
                <button
                  onClick={() => setShowRestoreDialog(true)}
                  className="p-2 text-green-400 hover:bg-green-900/20 rounded-lg transition-colors"
                  title="Restore talk"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowHardDeleteDialog(true)}
                  className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Permanently delete"
                >
                  <AlertTriangle className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push(`/admin/talks/${talk.id}/edit`)}
                  className="p-2 text-indigo-400 hover:bg-indigo-900/20 rounded-lg transition-colors"
                  title="Edit talk"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete talk"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </td>
      </tr>

      {/* Soft Delete Confirmation */}
      {showDeleteDialog && (
        <ConfirmDialog
          title="Delete Talk?"
          message={`Are you sure you want to delete "${talk.title}"? This is a soft delete and can be restored later.`}
          confirmLabel="Delete"
          onConfirm={handleSoftDelete}
          onCancel={() => setShowDeleteDialog(false)}
          loading={loading}
        />
      )}

      {/* Restore Confirmation */}
      {showRestoreDialog && (
        <ConfirmDialog
          title="Restore Talk?"
          message={`Are you sure you want to restore "${talk.title}"?`}
          confirmLabel="Restore"
          onConfirm={handleRestore}
          onCancel={() => setShowRestoreDialog(false)}
          loading={loading}
          variant="success"
        />
      )}

      {/* Hard Delete Confirmation */}
      {showHardDeleteDialog && (
        <HardDeleteDialog
          title={talk.title}
          mappingsCount={talk.mappingsCount || 0}
          onConfirm={handleHardDelete}
          onCancel={() => setShowHardDeleteDialog(false)}
          loading={loading}
        />
      )}
    </>
  );
}
