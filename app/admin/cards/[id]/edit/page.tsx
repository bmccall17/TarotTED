import { notFound } from 'next/navigation';
import { getCardForAdmin } from '@/lib/db/queries/admin-cards';
import { CardForm } from '@/components/admin/cards/CardForm';

export default async function EditCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = await getCardForAdmin(id);

  if (!card) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Edit Card</h1>
        <p className="text-gray-400 mt-2">
          Update card meanings and content
        </p>
      </div>

      <CardForm initialData={card} />
    </div>
  );
}
