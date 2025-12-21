'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

type Props = {
  title: string;
  mappingsCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export function HardDeleteDialog({
  title,
  mappingsCount,
  onConfirm,
  onCancel,
  loading = false,
}: Props) {
  const [confirmText, setConfirmText] = useState('');
  const isConfirmed = confirmText === 'DELETE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-gray-800 border border-red-500/50 rounded-xl shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-900/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-100">Permanent Delete</h2>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="p-1 text-gray-400 hover:text-gray-300 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300 font-medium mb-2">
              This action cannot be undone!
            </p>
            <p className="text-red-400 text-sm">
              You are about to permanently delete "{title}". This will also delete:
            </p>
            <ul className="mt-3 space-y-1 text-red-400 text-sm list-disc list-inside">
              <li>{mappingsCount} card-talk mapping{mappingsCount !== 1 ? 's' : ''}</li>
              <li>All associated metadata</li>
              <li>Any theme associations</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type <span className="font-mono font-bold text-red-400">DELETE</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50"
              placeholder="DELETE"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!isConfirmed || loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Deleting...' : 'Permanently Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
