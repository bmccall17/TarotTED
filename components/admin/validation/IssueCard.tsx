'use client';

import { ExternalLink, Edit2, RefreshCw } from 'lucide-react';
import Link from 'next/link';

type IssueType =
  | 'duplicateYoutube'
  | 'youtubeOnly'
  | 'missingUrls'
  | 'missingThumbnail'
  | 'shortDescription'
  | 'cardNoPrimary'
  | 'unmappedTalk'
  | 'softDeleted';

type DuplicateYoutubeData = {
  youtubeVideoId: string;
  talks: Array<{ id: string; title: string; speakerName: string }>;
};

type TalkData = {
  id: string;
  title: string;
  speakerName: string;
  youtubeUrl?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
  deletedAt?: Date | null;
};

type CardData = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  mappingsCount: number;
};

type Props = {
  type: IssueType;
  data: DuplicateYoutubeData | TalkData | CardData;
};

export function IssueCard({ type, data }: Props) {
  // Duplicate YouTube IDs
  if (type === 'duplicateYoutube') {
    const item = data as DuplicateYoutubeData;
    return (
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-gray-300">
              YouTube ID: <code className="text-red-400">{item.youtubeVideoId}</code>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Used by {item.talks.length} talks
            </p>
          </div>
          <a
            href={`https://www.youtube.com/watch?v=${item.youtubeVideoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200"
          >
            <ExternalLink className="w-3 h-3" />
            View on YouTube
          </a>
        </div>
        <div className="space-y-2">
          {item.talks.map((talk) => (
            <div
              key={talk.id}
              className="flex items-center justify-between bg-gray-800/50 rounded px-3 py-2"
            >
              <div>
                <p className="text-sm text-gray-100">{talk.title}</p>
                <p className="text-xs text-gray-400">{talk.speakerName}</p>
              </div>
              <Link
                href={`/admin/talks/${talk.id}/edit`}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
              >
                <Edit2 className="w-3 h-3" />
                Fix
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Talk-based issues
  if (
    type === 'youtubeOnly' ||
    type === 'missingUrls' ||
    type === 'missingThumbnail' ||
    type === 'shortDescription' ||
    type === 'unmappedTalk' ||
    type === 'softDeleted'
  ) {
    const item = data as TalkData;

    const getActionLabel = () => {
      switch (type) {
        case 'youtubeOnly':
          return 'Add TED URL';
        case 'missingUrls':
          return 'Add URLs';
        case 'missingThumbnail':
          return 'Add Thumbnail';
        case 'shortDescription':
          return 'Edit Description';
        case 'unmappedTalk':
          return 'Add to Card';
        case 'softDeleted':
          return 'Restore';
        default:
          return 'Edit';
      }
    };

    const getActionLink = () => {
      if (type === 'unmappedTalk') {
        return '/admin/mappings';
      }
      return `/admin/talks/${item.id}/edit`;
    };

    return (
      <div className="flex items-center justify-between bg-gray-900/50 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-4">
          {item.thumbnailUrl && (
            <img
              src={item.thumbnailUrl}
              alt=""
              className="w-16 h-9 object-cover rounded"
            />
          )}
          <div>
            <p className="text-sm font-medium text-gray-100">{item.title}</p>
            <p className="text-xs text-gray-400">{item.speakerName}</p>
            {type === 'shortDescription' && item.description && (
              <p className="text-xs text-gray-500 mt-1 truncate max-w-md">
                Current: "{item.description}"
              </p>
            )}
            {type === 'softDeleted' && item.deletedAt && (
              <p className="text-xs text-gray-500 mt-1">
                Deleted: {new Date(item.deletedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        <Link
          href={getActionLink()}
          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 rounded transition-colors"
        >
          <Edit2 className="w-3 h-3" />
          {getActionLabel()}
        </Link>
      </div>
    );
  }

  // Card-based issues
  if (type === 'cardNoPrimary') {
    const item = data as CardData;
    return (
      <div className="flex items-center justify-between bg-gray-900/50 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-10 h-14 object-cover rounded"
          />
          <div>
            <p className="text-sm font-medium text-gray-100">{item.name}</p>
            <p className="text-xs text-gray-400">
              {item.mappingsCount} mapping{item.mappingsCount !== 1 ? 's' : ''}, no primary
            </p>
          </div>
        </div>
        <Link
          href={`/admin/mappings?card=${item.slug}`}
          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 rounded transition-colors"
        >
          <Edit2 className="w-3 h-3" />
          Set Primary
        </Link>
      </div>
    );
  }

  return null;
}
