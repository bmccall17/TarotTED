import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

interface CardListItemProps {
  slug: string;
  name: string;
  imageUrl: string;
  summary: string;
  arcanaType: string;
  suit: string | null;
  keywords: string; // JSON string
}

export function CardListItem({
  slug,
  name,
  imageUrl,
  summary,
  arcanaType,
  suit,
  keywords
}: CardListItemProps) {
  const keywordArray = JSON.parse(keywords);
  const displayKeywords = keywordArray.slice(0, 3);

  return (
    <Link href={`/cards/${slug}`}>
      <div className="flex items-start gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <div className="relative w-20 h-32 flex-shrink-0 rounded overflow-hidden shadow-sm">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-gray-900 mb-1">{name}</h3>
          <p className="text-sm text-gray-500 mb-2">
            {arcanaType === 'major' ? 'Major Arcana' : `${suit?.charAt(0).toUpperCase()}${suit?.slice(1)}`}
          </p>
          <p className="text-sm text-gray-700 mb-2 line-clamp-2">{summary}</p>
          <div className="flex flex-wrap gap-1">
            {displayKeywords.map((keyword: string) => (
              <Badge key={keyword} variant="default">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
