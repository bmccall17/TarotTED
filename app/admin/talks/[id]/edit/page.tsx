'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TalkForm } from '@/components/admin/talks/TalkForm';

type Mapping = {
  id: string;
  cardId: string;
  cardName: string;
  cardSlug: string;
  cardImageUrl: string;
  isPrimary: boolean;
  strength: number;
  rationaleShort: string;
};

type Talk = {
  id: string;
  title: string;
  speakerName: string;
  tedUrl: string | null;
  youtubeUrl: string | null;
  youtubeVideoId: string | null;
  description: string | null;
  durationSeconds: number | null;
  year: number | null;
  eventName: string | null;
  thumbnailUrl: string | null;
  language: string | null;
  mappings: Mapping[];
};

export default function EditTalkPage() {
  const params = useParams();
  const router = useRouter();
  const [talk, setTalk] = useState<Talk | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTalk = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/talks/${params.id}`);

        if (response.status === 404) {
          router.push('/admin/talks');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch talk');
        }

        const data = await response.json();
        setTalk(data.talk);
      } catch (err) {
        console.error('Error fetching talk:', err);
        setError(err instanceof Error ? err.message : 'Failed to load talk');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchTalk();
    }
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-400">Loading talk...</p>
        </div>
      </div>
    );
  }

  if (error || !talk) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-red-400">Error: {error || 'Talk not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <TalkForm
      mode="edit"
      talkId={talk.id}
      initialData={{
        title: talk.title,
        speakerName: talk.speakerName,
        tedUrl: talk.tedUrl || '',
        youtubeUrl: talk.youtubeUrl || '',
        youtubeVideoId: talk.youtubeVideoId,
        description: talk.description || '',
        durationSeconds: talk.durationSeconds,
        year: talk.year,
        eventName: talk.eventName || '',
        thumbnailUrl: talk.thumbnailUrl || '',
        language: talk.language || 'en',
      }}
      mappings={talk.mappings}
    />
  );
}
