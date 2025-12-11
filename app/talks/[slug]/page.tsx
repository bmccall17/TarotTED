import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getTalkWithMappedCards, getAllTalks } from '@/lib/db/queries/talks';
import { ArrowLeft, ExternalLink, Clock, Calendar, Play } from 'lucide-react';

export async function generateStaticParams() {
  const talks = await getAllTalks();
  return talks.map((talk) => ({
    slug: talk.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const talk = await getTalkWithMappedCards(slug);

  if (!talk) {
    return {
      title: 'Talk Not Found',
    };
  }

  return {
    title: `${talk.title} - TarotTED`,
    description: talk.description || `A TED talk by ${talk.speakerName}`,
  };
}

export default async function TalkDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const talk = await getTalkWithMappedCards(slug);

  if (!talk) {
    notFound();
  }

  const durationMinutes = talk.durationSeconds ? Math.floor(talk.durationSeconds / 60) : null;

  return (
    <div className="min-h-screen pb-24">
      {/* Sticky Header */}
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center gap-3 max-w-7xl mx-auto">
          <Link
            href="/talks"
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-100 truncate">{talk.title}</h2>
            <p className="text-sm text-gray-500">{talk.speakerName}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-4xl mx-auto">
        {/* Talk Hero */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-xl overflow-hidden border border-indigo-500/30">
          {/* Thumbnail Banner */}
          {talk.thumbnailUrl && (
            <a
              href={talk.tedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block relative w-full bg-gray-900 group cursor-pointer"
            >
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <img
                  src={talk.thumbnailUrl}
                  alt={talk.title}
                  className="absolute inset-0 w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/30 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-indigo-600 rounded-full p-4 shadow-lg">
                    <Play className="w-10 h-10 text-white" fill="white" />
                  </div>
                </div>
              </div>
            </a>
          )}

          <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
              {!talk.thumbnailUrl && (
                <div className="w-16 h-16 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Play className="w-8 h-8 text-white" />
                </div>
              )}
              <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-100 mb-2">{talk.title}</h1>
              <p className="text-lg text-gray-300 mb-2">
                by <span className="font-semibold">{talk.speakerName}</span>
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                {talk.year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {talk.year}
                  </span>
                )}
                {durationMinutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {durationMinutes} minutes
                  </span>
                )}
              </div>
              </div>
            </div>

            {talk.description && (
              <p className="text-gray-300 mb-6 leading-relaxed">{talk.description}</p>
            )}

            <a
              href={talk.tedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Watch on TED
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Tarot Mapping */}
        {talk.mappedCards.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-100">Tarot Mapping</h2>
            {talk.mappedCards.map((item) => {
              const keywords = JSON.parse(item.card.keywords);

              return (
                <div
                  key={item.card.id}
                  className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/30 rounded-xl p-6 space-y-4"
                >
                  <Link
                    href={`/cards/${item.card.slug}`}
                    className="flex gap-6 items-start group"
                  >
                    <div className="relative w-24 h-40 md:w-32 md:h-52 flex-shrink-0 rounded-lg overflow-hidden shadow-lg bg-gray-900 group-hover:shadow-xl transition-shadow">
                      <Image
                        src={item.card.imageUrl}
                        alt={item.card.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-bold text-gray-100 mb-2 group-hover:text-indigo-300 transition-colors">
                        {item.card.name}
                      </h3>
                      <p className="text-gray-400 mb-3">
                        {item.card.summary}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {keywords.map((keyword: string) => (
                          <span
                            key={keyword}
                            className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>

                  {/* Rationale - More prominent */}
                  <div className="border-t border-purple-500/20 pt-4">
                    <h4 className="text-sm font-semibold text-purple-300 mb-2 uppercase tracking-wide">
                      Why This Mapping?
                    </h4>
                    <p className="text-gray-300 leading-relaxed">
                      {item.mapping.rationaleShort}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Back Link */}
        <div className="text-center pt-4">
          <Link
            href="/talks"
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            ← Back to all talks
          </Link>
        </div>
      </div>
    </div>
  );
}
