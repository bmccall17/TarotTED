import { db } from '@/lib/db';
import { cards, talks, cardTalkMappings } from '@/lib/db/schema';
import { count, eq } from 'drizzle-orm';
import { getTalksStats } from '@/lib/db/queries/admin-talks';

export default async function AdminDashboard() {
  // Fetch real statistics
  const [cardsCount, talksStats, mappingsCount] = await Promise.all([
    db.select({ count: count() }).from(cards),
    getTalksStats(),
    db.select({ count: count() }).from(cardTalkMappings),
  ]);

  const stats = {
    cards: cardsCount[0]?.count || 0,
    talks: talksStats.total,
    mappings: mappingsCount[0]?.count || 0,
    deletedTalks: talksStats.deleted,
    talksWithYoutube: talksStats.withYoutubeId,
    talksWithoutThumbnail: talksStats.withoutThumbnail,
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100">Admin Dashboard</h1>
          <p className="text-gray-400 mt-2">Content management overview</p>
        </div>

        {/* Primary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Total Cards</h3>
            <p className="text-3xl font-bold text-gray-100">{stats.cards}</p>
            <p className="text-xs text-gray-500 mt-2">Complete Tarot deck</p>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Total Talks</h3>
            <p className="text-3xl font-bold text-gray-100">{stats.talks}</p>
            {stats.deletedTalks > 0 && (
              <p className="text-xs text-gray-500 mt-2">{stats.deletedTalks} soft-deleted</p>
            )}
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Total Mappings</h3>
            <p className="text-3xl font-bold text-gray-100">{stats.mappings}</p>
            <p className="text-xs text-gray-500 mt-2">Card-Talk connections</p>
          </div>
        </div>

        {/* Data Quality Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Talks with YouTube IDs</h3>
            <p className="text-3xl font-bold text-gray-100">{stats.talksWithYoutube}</p>
            <p className="text-xs text-gray-500 mt-2">
              {stats.talks > 0 ? Math.round((stats.talksWithYoutube / stats.talks) * 100) : 0}% coverage
            </p>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Talks without Thumbnails</h3>
            <p className="text-3xl font-bold text-gray-100">{stats.talksWithoutThumbnail}</p>
            {stats.talksWithoutThumbnail > 0 && (
              <p className="text-xs text-yellow-500 mt-2">Needs attention</p>
            )}
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-100 mb-4">Phase 1: Foundation</h2>
          <p className="text-gray-300 mb-4">
            Building the admin portal structure with talks CRUD functionality.
          </p>
          <p className="text-gray-400 text-sm">
            Use the navigation to manage talks, mappings, themes, and validate data quality.
          </p>
        </div>
      </div>
    </div>
  );
}
