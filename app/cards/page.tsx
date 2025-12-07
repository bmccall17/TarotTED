import { getAllCards } from '@/lib/db/queries/cards';
import { CardListItem } from '@/components/cards/CardListItem';

export const metadata = {
  title: 'Browse Tarot Cards | TarotTED',
  description: 'Explore all 78 Tarot cards and discover their meanings',
};

export default async function CardsPage() {
  const cards = await getAllCards();

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Tarot Cards</h1>
          <p className="text-gray-600">All 78 cards of the Tarot deck</p>
        </header>

        <div className="mb-6">
          <p className="text-sm text-gray-500">
            {cards.length} cards
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {cards.map((card) => (
            <CardListItem
              key={card.id}
              slug={card.slug}
              name={card.name}
              imageUrl={card.imageUrl}
              summary={card.summary}
              arcanaType={card.arcanaType}
              suit={card.suit}
              keywords={card.keywords}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
