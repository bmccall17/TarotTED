import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getTalkWithMappedCards, getAllTalks } from '@/lib/db/queries/talks';
import { Badge } from '@/components/ui/Badge';
import { ExternalLink, Clock, Calendar } from 'lucide-react';

export async function generateStaticParams() {
  const talks = await getAllTalks();
  return talks.map((talk) => ({
    slug: talk.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const talk = await getTalkWithMappedCards(params.slug);

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

export default async function TalkDetailPage({ params }: { params: { slug: string } }) {
  const talk = await getTalkWithMappedCards(params.slug);

  if (!talk) {
    notFound();
  }

  const durationMinutes = talk.durationSeconds ? Math.floor(talk.durationSeconds / 60) : null;

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Talk Header */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
            <div className="mb-4">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{talk.title}</h1>
              <p className="text-xl text-gray-700 mb-2">
                by <span className="font-semibold">{talk.speakerName}</span>
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">
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

            {talk.description && (
              <p className="text-gray-700 mb-6 leading-relaxed">{talk.description}</p>
            )}

            <a
              href={talk.tedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Watch on TED
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </section>

        {/* Mapped Cards */}
        {talk.mappedCards.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Related Tarot Cards</h2>
            <p className="text-gray-600 mb-4">
              This talk resonates with the following Tarot cards:
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {talk.mappedCards.map((item) => {
                const keywords = JSON.parse(item.card.keywords);
                const isPrimary = item.mapping.isPrimary;

                return (
                  <Link
                    key={item.card.id}
                    href={`/cards/${item.card.slug}`}
                    className={`block bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
                      isPrimary ? 'border-purple-300 bg-purple-50/30' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="relative w-20 h-32 flex-shrink-0 rounded overflow-hidden shadow-sm">
                        <Image
                          src={item.card.imageUrl}
                          alt={item.card.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {item.card.name}
                          </h3>
                          {isPrimary && (
                            <Badge variant="primary">Primary</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {item.card.summary}
                        </p>
                        <p className="text-sm text-gray-700 italic mb-2">
                          "{item.mapping.rationaleShort}"
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {keywords.slice(0, 3).map((keyword: string) => (
                            <Badge key={keyword} variant="default">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-2">
                          <Badge variant="secondary">
                            Strength: {item.mapping.strength}/5
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Back to all talks */}
        <div className="text-center">
          <Link
            href="/talks"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Back to all talks
          </Link>
        </div>
      </div>
    </div>
  );
}
