import { CardsList } from '@/components/admin/cards/CardsList';

export default function AdminCardsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Manage Cards</h1>
        <p className="text-gray-400 mt-2">
          Edit card meanings and content
        </p>
      </div>

      <CardsList />
    </div>
  );
}
