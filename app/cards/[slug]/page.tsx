import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCardWithMappings, getAllCards } from '@/lib/db/queries/cards';
import { Badge } from '@/components/ui/Badge';
import { ExternalLink, ChevronRight } from 'lucide-react';

export async function generateStaticParams() {
  const cards = await getAllCards();
  return cards.map((card) => ({
    slug: card.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = await getCardWithMappings(slug);

  if (!card) {
    return {
      title: 'Card Not Found',
    };
  }

  return {
    title: `${card.name} - TarotTED`,
    description: card.summary,
  };
}

export default async function CardDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = await getCardWithMappings(slug);

  if (!card) {
    notFound();
  }

  const keywords = JSON.parse(card.keywords);
  const primaryMapping = card.mappings.find((m) => m.mapping.isPrimary);
  const otherMappings = card.mappings.filter((m) => !m.mapping.isPrimary);

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Above the fold: Card + Primary Talk */}
        <section className="mb-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Card Image */}
            <div className="w-full md:w-1/3">
              <div className="relative aspect-[2/3] w-full max-w-xs mx-auto md:mx-0 rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src={card.imageUrl}
                  alt={card.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Card Info */}
            <div className="flex-1">
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">
                  {card.arcanaType === 'major' ? 'Major Arcana' : `${card.suit?.charAt(0).toUpperCase()}${card.suit?.slice(1)}`}
                  {card.number !== null && ` • ${card.number}`}
                </p>
                <h1 className="text-4xl md:text-5xl font-bold mb-3">{card.name}</h1>
                <p className="text-xl text-gray-700 mb-4">{card.summary}</p>
              </div>

              {/* Keywords */}
              <div className="flex flex-wrap gap-2 mb-6">
                {keywords.map((keyword: string) => (
                  <Badge key={keyword} variant="primary">
                    {keyword}
                  </Badge>
                ))}
              </div>

              {/* Primary Talk */}
              {primaryMapping && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 shadow-sm">
                  <p className="text-xs uppercase text-purple-700 font-semibold mb-2 tracking-wide">
                    Primary Mapping
                  </p>
                  <h2 className="text-2xl font-bold mb-2 text-gray-900">
                    {primaryMapping.talk.title}
                  </h2>
                  <p className="text-gray-700 mb-1">
                    by <span className="font-medium">{primaryMapping.talk.speakerName}</span>
                  </p>
                  {primaryMapping.talk.durationSeconds && (
                    <p className="text-sm text-gray-500 mb-3">
                      {Math.floor(primaryMapping.talk.durationSeconds / 60)} minutes
                    </p>
                  )}
                  <p className="text-gray-800 mb-4 italic border-l-4 border-purple-400 pl-4">
                    "{primaryMapping.mapping.rationaleShort}"
                  </p>
                  <div className="flex gap-3">
                    <a
                      href={primaryMapping.talk.tedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      Watch Talk
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <Link
                      href={`/talks/${primaryMapping.talk.slug}`}
                      className="inline-flex items-center gap-2 bg-white text-purple-700 px-6 py-2.5 rounded-lg hover:bg-purple-50 transition-colors font-medium border border-purple-300"
                    >
                      Talk Details
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Below the fold: Additional content */}
        {otherMappings.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">More Talks for {card.name}</h2>
            <div className="space-y-4">
              {otherMappings.map((mapping) => (
                <div
                  key={mapping.talk.id}
                  className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1 text-gray-900">
                        {mapping.talk.title}
                      </h3>
                      <p className="text-gray-600 mb-2">by {mapping.talk.speakerName}</p>
                      <p className="text-gray-700 mb-3 text-sm">
                        {mapping.mapping.rationaleShort}
                      </p>
                      <div className="flex gap-3">
                        <a
                          href={mapping.talk.tedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                          Watch
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <Link
                          href={`/talks/${mapping.talk.slug}`}
                          className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-700 text-sm font-medium"
                        >
                          Details
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Badge variant="secondary">
                        Strength: {mapping.mapping.strength}/5
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Accordion sections for full meanings */}
        {card.uprightMeaning && (
          <section className="mb-4">
            <details className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow">
              <summary className="font-semibold text-lg cursor-pointer flex items-center justify-between">
                <span>Upright Meaning</span>
                <ChevronRight className="w-5 h-5 transform transition-transform" />
              </summary>
              <div className="mt-4 text-gray-700 prose prose-sm max-w-none">
                <p>{card.uprightMeaning}</p>
              </div>
            </details>
          </section>
        )}

        {card.reversedMeaning && (
          <section className="mb-8">
            <details className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow">
              <summary className="font-semibold text-lg cursor-pointer flex items-center justify-between">
                <span>Reversed Meaning</span>
                <ChevronRight className="w-5 h-5 transform transition-transform" />
              </summary>
              <div className="mt-4 text-gray-700 prose prose-sm max-w-none">
                <p>{card.reversedMeaning}</p>
              </div>
            </details>
          </section>
        )}

        {/* Back to all cards */}
        <div className="text-center">
          <Link
            href="/cards"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Back to all cards
          </Link>
        </div>
      </div>
    </div>
  );
}
