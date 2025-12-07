import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { ExternalLink, Clock } from 'lucide-react';

interface TalkListItemProps {
  slug: string;
  title: string;
  speakerName: string;
  tedUrl: string;
  year: number | null;
  durationSeconds: number | null;
}

export function TalkListItem({
  slug,
  title,
  speakerName,
  tedUrl,
  year,
  durationSeconds
}: TalkListItemProps) {
  const durationMinutes = durationSeconds ? Math.floor(durationSeconds / 60) : null;

  return (
    <div className="flex flex-col gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="flex-1">
        <Link href={`/talks/${slug}`}>
          <h3 className="font-semibold text-lg text-gray-900 mb-1 hover:text-purple-600 transition-colors">
            {title}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 mb-2">
          by <span className="font-medium">{speakerName}</span>
          {year && ` • ${year}`}
        </p>
        <div className="flex flex-wrap gap-2 items-center">
          {durationMinutes && (
            <Badge variant="secondary">
              <Clock className="w-3 h-3 inline mr-1" />
              {durationMinutes} min
            </Badge>
          )}
        </div>
      </div>
      <div className="flex gap-3">
        <a
          href={tedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm font-medium"
        >
          Watch on TED
          <ExternalLink className="w-3 h-3" />
        </a>
        <Link
          href={`/talks/${slug}`}
          className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-700 text-sm font-medium"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
