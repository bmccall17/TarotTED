'use client';

import { useState } from 'react';
import { UserCheck, UserPlus, HelpCircle, Loader2 } from 'lucide-react';
import { platformSupportsAutoFollowCheck, type Platform } from '@/lib/utils/social-handles';

type Props = {
  shareId: string;
  platform: Platform;
  speakerHandle: string | null;
  authorHandle: string | null;
  followingSpeaker: boolean | null;
  onRelationshipUpdate?: (following: boolean | null) => void;
};

export function RelationshipBadge({
  shareId,
  platform,
  speakerHandle,
  authorHandle,
  followingSpeaker,
  onRelationshipUpdate,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supportsAutoCheck = platformSupportsAutoFollowCheck(platform);
  const handle = speakerHandle || authorHandle;

  // No handle to check
  if (!handle) {
    return (
      <span
        className="flex items-center gap-1 text-xs text-gray-500"
        title="No speaker handle"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </span>
    );
  }

  const handleCheck = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/social-shares/relationships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to check');
      }

      const data = await res.json();
      onRelationshipUpdate?.(data.share.followingSpeaker);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/social-shares/relationships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareId,
          following: !followingSpeaker,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update');
      }

      const data = await res.json();
      onRelationshipUpdate?.(data.share.followingSpeaker);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <span className="flex items-center gap-1 text-xs text-gray-400">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      </span>
    );
  }

  // Unknown status
  if (followingSpeaker === null) {
    return (
      <button
        onClick={supportsAutoCheck ? handleCheck : handleToggle}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300"
        title={supportsAutoCheck ? 'Check follow status' : 'Set follow status'}
      >
        <HelpCircle className="w-3.5 h-3.5" />
        {supportsAutoCheck && <span>Check</span>}
      </button>
    );
  }

  // Following
  if (followingSpeaker === true) {
    return (
      <button
        onClick={supportsAutoCheck ? handleCheck : handleToggle}
        className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300"
        title={supportsAutoCheck ? 'Following - click to refresh' : 'Following - click to toggle'}
      >
        <UserCheck className="w-3.5 h-3.5" />
      </button>
    );
  }

  // Not following
  return (
    <button
      onClick={supportsAutoCheck ? handleCheck : handleToggle}
      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300"
      title={supportsAutoCheck ? 'Not following - click to refresh' : 'Not following - click to toggle'}
    >
      <UserPlus className="w-3.5 h-3.5" />
    </button>
  );
}
