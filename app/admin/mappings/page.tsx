import { getAllCardsWithMappingCounts, getMappingsStats } from '@/lib/db/queries/admin-mappings';
import { MappingEditor } from '@/components/admin/mappings/MappingEditor';

export const metadata = {
  title: 'Card-Talk Mappings | TarotTALKS Admin',
  description: 'Manage card-to-talk mappings',
};

export const dynamic = 'force-dynamic';

export default async function MappingsPage({
  searchParams,
}: {
  searchParams: Promise<{ cardId?: string }>;
}) {
  const params = await searchParams;
  const [cards, stats] = await Promise.all([
    getAllCardsWithMappingCounts(),
    getMappingsStats(),
  ]);

  return (
    <div className="p-8 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100">Card-Talk Mappings</h1>
          <p className="text-gray-400 mt-2">
            Assign TED talks to Tarot cards with rationale
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <p className="text-2xl font-bold text-gray-100">{stats.totalMappings}</p>
            <p className="text-sm text-gray-400">Total Mappings</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <p className="text-2xl font-bold text-green-400">{stats.cardsWithPrimary}</p>
            <p className="text-sm text-gray-400">Cards with Primary</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <p className="text-2xl font-bold text-yellow-400">{stats.cardsWithoutPrimary}</p>
            <p className="text-sm text-gray-400">Cards Missing Primary</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <p className="text-2xl font-bold text-orange-400">{stats.unmappedTalks}</p>
            <p className="text-sm text-gray-400">Unmapped Talks</p>
          </div>
        </div>

        {/* Mapping Editor */}
        <MappingEditor
          initialCards={cards}
          initialSelectedCardId={params.cardId || null}
        />
      </div>
    </div>
  );
}
