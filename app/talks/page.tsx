import { getAllTalks } from '@/lib/db/queries/talks';
import { TalkListItem } from '@/components/talks/TalkListItem';

export const metadata = {
  title: 'Browse TED Talks | TarotTED',
  description: 'Explore curated TED talks mapped to Tarot archetypes',
};

export default async function TalksPage() {
  const talks = await getAllTalks();

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">TED Talks</h1>
          <p className="text-gray-600">
            Curated talks mapped to Tarot archetypes and themes
          </p>
        </header>

        <div className="mb-6">
          <p className="text-sm text-gray-500">
            {talks.length} talks
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {talks.map((talk) => (
            <TalkListItem
              key={talk.id}
              slug={talk.slug}
              title={talk.title}
              speakerName={talk.speakerName}
              tedUrl={talk.tedUrl}
              year={talk.year}
              durationSeconds={talk.durationSeconds}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
