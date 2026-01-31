'use client';

import { useState, useEffect, useCallback } from 'react';
import { Radar, RefreshCw, Loader2, Inbox } from 'lucide-react';
import { MentionRow } from './MentionRow';
import { Toast } from '../ui/Toast';

type Mention = {
  id: string;
  postUrl: string | null;
  authorHandle: string | null;
  authorDisplayName: string | null;
  sharedUrl: string | null;
  discoveredAt: string | null;
  likeCount: number | null;
  repostCount: number | null;
  replyCount: number | null;
  card?: { name: string } | null;
  talk?: { title: string } | null;
};

export function MentionsInbox() {
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchMentions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/mentions');
      if (!response.ok) throw new Error('Failed to fetch mentions');
      const data = await response.json();
      setMentions(data.mentions || []);
    } catch (error) {
      console.error('Error fetching mentions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMentions();
  }, [fetchMentions]);

  const handleScan = async () => {
    setScanning(true);
    try {
      const response = await fetch('/api/admin/mentions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 100 }),
      });

      const data = await response.json();

      if (response.status === 503) {
        // Credentials not configured
        setToast({
          message: 'Bluesky credentials not configured. Check environment variables.',
          type: 'error',
        });
        return;
      }

      if (!response.ok) throw new Error(data.error || 'Failed to scan');

      setToast({
        message: data.newMentions > 0
          ? `Found ${data.newMentions} new mentions`
          : 'No new mentions found',
        type: data.newMentions > 0 ? 'success' : 'success',
      });

      if (data.newMentions > 0) {
        fetchMentions();
      }
    } catch (error) {
      console.error('Error scanning mentions:', error);
      setToast({ message: 'Failed to scan for mentions', type: 'error' });
    } finally {
      setScanning(false);
    }
  };

  const handleMentionAction = () => {
    fetchMentions();
  };

  return (
    <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          <Radar className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-gray-200">Mention Radar</span>
          {mentions.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-purple-900/50 text-purple-300 rounded">
              {mentions.length}
            </span>
          )}
        </div>
        <button
          onClick={handleScan}
          disabled={scanning}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {scanning ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          Scan Bluesky
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          </div>
        ) : mentions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <Inbox className="w-8 h-8 mb-2" />
            <p className="text-sm">No new mentions</p>
            <p className="text-xs mt-1">Click "Scan Bluesky" to check for mentions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mentions.map((mention) => (
              <MentionRow
                key={mention.id}
                mention={mention}
                onAcknowledged={handleMentionAction}
                onConverted={handleMentionAction}
              />
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
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
