'use client';

import { useRouter } from 'next/navigation';
import { Edit2 } from 'lucide-react';
import Image from 'next/image';

type Card = {
  id: string;
  slug: string;
  name: string;
  arcanaType: 'major' | 'minor';
  suit: 'wands' | 'cups' | 'swords' | 'pentacles' | null;
  number: number | null;
  imageUrl: string;
  summary: string;
  mappingsCount?: number;
};

type Props = {
  card: Card;
};

export function CardRow({ card }: Props) {
  const router = useRouter();

  const arcanaLabel = card.arcanaType === 'major'
    ? 'Major Arcana'
    : card.suit?.charAt(0).toUpperCase() + card.suit?.slice(1);

  return (
    <tr className="hover:bg-gray-800/50">
      <td className="px-6 py-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-16 relative flex-shrink-0 bg-gray-900 rounded overflow-hidden">
            <Image
              src={card.imageUrl}
              alt={card.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-100">
              {card.name}
            </p>
            <p className="text-xs text-gray-500 mt-1">/{card.slug}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="text-gray-300 text-sm">
          {arcanaLabel}
        </p>
      </td>
      <td className="px-6 py-4">
        <p className="text-gray-400 text-sm">
          {card.mappingsCount || 0}
        </p>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => router.push(`/admin/cards/${card.id}/edit`)}
            className="p-2 text-indigo-400 hover:bg-indigo-900/20 rounded-lg transition-colors"
            title="Edit card"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
