import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCardWithMappings, getAllCards } from '@/lib/db/queries/cards';
import { CardDetailClient } from '@/components/cards/CardDetailClient';
import { ArrowLeft, Play, ExternalLink, Clock, Calendar } from 'lucide-react';

// Revalidate frequently to pick up mapping changes from admin
export const revalidate = 60; // 1 minute - mappings can change

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

  const keywords = card.keywords ? JSON.parse(card.keywords) : [];
  const primaryMapping = card.mappings.find((m) => m.mapping.isPrimary);
  const otherMappings = card.mappings.filter((m) => !m.mapping.isPrimary);

  return (
    <div className="min-h-screen pb-24">
      {/* Sticky Header */}
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center gap-3 max-w-7xl mx-auto">
          <Link
            href="/cards"
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <div>
            <h2 className="font-semibold text-gray-100">{card.name}</h2>
            <p className="text-sm text-gray-500">
              {card.arcanaType === 'major' ? 'Major Arcana' : card.suit}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-4xl mx-auto">
        {/* Card Hero */}
        <div className="aspect-[5/7] max-w-xs mx-auto rounded-2xl overflow-hidden shadow-lg border-2 border-gray-700 bg-gray-900">
          <div className="relative w-full h-full">
            <Image
              src={card.imageUrl}
              alt={card.name}
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Archetype */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-100">{card.name}</h1>
          <p className="text-gray-300">{card.summary}</p>
        </div>

        {/* Keywords */}
        <div className="flex flex-wrap gap-2 justify-center">
          {keywords.map((keyword: string) => (
            <span
              key={keyword}
              className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm border border-indigo-500/30"
            >
              {keyword}
            </span>
          ))}
        </div>

        {/* Primary Talk */}
        {primaryMapping && (
          <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-xl p-5 border border-indigo-500/30">
            <div className="flex items-start gap-4 mb-3">
              {/* Thumbnail */}
              <Link
                href={`/talks/${primaryMapping.talk.slug}`}
                className="flex-shrink-0 group"
              >
                <div className="relative w-28 h-20 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-lg overflow-hidden border border-indigo-500/30 group-hover:border-indigo-400/50 transition-all">
                  {primaryMapping.talk.thumbnailUrl ? (
                    <>
                      <Image
                        src={primaryMapping.talk.thumbnailUrl}
                        alt={primaryMapping.talk.title}
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <Play className="w-8 h-8 text-white/90 drop-shadow-lg" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-indigo-400" />
                    </div>
                  )}
                </div>
              </Link>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="text-xs text-indigo-400 uppercase tracking-wide mb-1">Featured Talk</div>
                <h3 className="text-xl font-semibold text-gray-100 mb-1">{primaryMapping.talk.title}</h3>
                <div className="text-sm text-gray-400 mb-2">
                  {primaryMapping.talk.speakerName}
                </div>
                {(primaryMapping.talk.year || primaryMapping.talk.durationSeconds) && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {primaryMapping.talk.year && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-xs border border-indigo-500/30">
                        <Calendar className="w-3 h-3" />
                        <span>{primaryMapping.talk.year}</span>
                      </span>
                    )}
                    {primaryMapping.talk.durationSeconds && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs border border-purple-500/30">
                        <Clock className="w-3 h-3" />
                        <span>{Math.floor(primaryMapping.talk.durationSeconds / 60)} min</span>
                      </span>
                    )}
                  </div>
                )}
                <p className="text-sm text-gray-300 italic mb-4">
                  &ldquo;{primaryMapping.mapping.rationaleShort}&rdquo;
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  {(primaryMapping.talk.tedUrl || primaryMapping.talk.youtubeUrl) ? (
                    <a
                      href={(primaryMapping.talk.tedUrl || primaryMapping.talk.youtubeUrl) as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-center font-medium inline-flex items-center justify-center gap-2"
                    >
                      Watch Talk
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <div className="flex-1 bg-gray-700 text-gray-400 py-3 px-4 rounded-lg text-center font-medium inline-flex items-center justify-center gap-2 cursor-not-allowed">
                      No Video Available
                    </div>
                  )}
                  <Link
                    href={`/talks/${primaryMapping.talk.slug}`}
                    className="flex-1 bg-gray-800 text-gray-100 py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors text-center font-medium border border-gray-700"
                  >
                    View Talk Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* More Talks */}
        {otherMappings.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-100">More Talks for This Card</h3>
            {otherMappings.map((mapping) => (
              <Link
                key={mapping.talk.id}
                href={`/talks/${mapping.talk.slug}`}
                className="block bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:shadow-md hover:border-gray-600 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-100 mb-1">{mapping.talk.title}</h4>
                    <p className="text-sm text-gray-400 mb-2">{mapping.talk.speakerName}</p>
                    {(mapping.talk.year || mapping.talk.durationSeconds) && (
                      <div className="flex flex-wrap gap-2">
                        {mapping.talk.year && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-xs border border-indigo-500/30">
                            <Calendar className="w-3 h-3" />
                            <span>{mapping.talk.year}</span>
                          </span>
                        )}
                        {mapping.talk.durationSeconds && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs border border-purple-500/30">
                            <Clock className="w-3 h-3" />
                            <span>{Math.floor(mapping.talk.durationSeconds / 60)} min</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Accordion Sections */}
        <CardDetailClient
          uprightMeaning={card.uprightMeaning}
          reversedMeaning={card.reversedMeaning}
          symbolism={card.symbolism}
          adviceWhenDrawn={card.adviceWhenDrawn}
          journalingPrompts={card.journalingPrompts}
          astrologicalCorrespondence={card.astrologicalCorrespondence}
          numerologicalSignificance={card.numerologicalSignificance}
          cardName={card.name}
        />

        {/* Back Link */}
        <div className="text-center pt-4">
          <Link
            href="/cards"
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            ← Back to all cards
          </Link>
        </div>
      </div>
    </div>
  );
}
