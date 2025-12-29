'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Filter } from 'lucide-react';
import { TalkRow } from './TalkRow';
import { Toast } from '../ui/Toast';

type Mapping = {
  talkId: string;
  isPrimary: boolean;
  cardImageUrl: string;
  cardName: string;
  cardSlug: string;
  cardId: string;
};

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
  mappings: Mapping[];
};

export function TalksList() {
  const router = useRouter();
  const [talks, setTalks] = useState<Talk[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchTalks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (includeDeleted) params.set('includeDeleted', 'true');
      if (searchQuery) params.set('search', searchQuery);

      const response = await fetch(`/api/admin/talks?${params}`);
      if (!response.ok) throw new Error('Failed to fetch talks');

      const data = await response.json();
      setTalks(data.talks);
    } catch (error) {
      console.error('Error fetching talks:', error);
      showToast('Failed to load talks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(fetchTalks, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, includeDeleted]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const handleTalkDeleted = () => {
    showToast('Talk deleted successfully', 'success');
    fetchTalks();
  };

  const handleTalkRestored = () => {
    showToast('Talk restored successfully', 'success');
    fetchTalks();
  };

  const handleTalkHardDeleted = () => {
    showToast('Talk permanently deleted', 'success');
    fetchTalks();
  };

  const activeTalks = talks.filter(t => !t.isDeleted);
  const deletedTalks = talks.filter(t => t.isDeleted);
  const displayTalks = includeDeleted ? talks : activeTalks;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search talks by title or speaker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIncludeDeleted(!includeDeleted)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              includeDeleted
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm">
              {includeDeleted ? 'Show Active' : 'Show Deleted'}
            </span>
          </button>

          <button
            onClick={() => router.push('/admin/talks/new')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">New Talk</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm">
        <div className="text-gray-400">
          <span className="font-medium text-gray-300">{activeTalks.length}</span> active talks
        </div>
        {deletedTalks.length > 0 && (
          <div className="text-gray-400">
            <span className="font-medium text-yellow-400">{deletedTalks.length}</span> deleted
          </div>
        )}
      </div>

      {/* Talks Table */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading talks...</div>
        ) : displayTalks.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            {searchQuery ? 'No talks found matching your search.' : 'No talks yet. Create your first one!'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Talk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Speaker
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Mappings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {displayTalks.map((talk) => (
                  <TalkRow
                    key={talk.id}
                    talk={talk}
                    onDeleted={handleTalkDeleted}
                    onRestored={handleTalkRestored}
                    onHardDeleted={handleTalkHardDeleted}
                  />
                ))}
              </tbody>
            </table>
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
    </div>
  );
}
