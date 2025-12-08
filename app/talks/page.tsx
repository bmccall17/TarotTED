import { getAllTalks } from '@/lib/db/queries/talks';
import { TalksGrid } from '@/components/talks/TalksGrid';

export const metadata = {
  title: 'Browse TED Talks | TarotTED',
  description: 'Explore curated TED talks mapped to Tarot archetypes',
};

export default async function TalksPage() {
  const talks = await getAllTalks();

  return (
    <div className="min-h-screen pb-24">
      <div className="px-4 py-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Browse Talks</h1>
          <p className="text-gray-400">Discover wisdom through curated TED talks</p>
        </div>

        {/* Talks Grid with Filters */}
        <TalksGrid talks={talks} />
      </div>
    </div>
  );
}
