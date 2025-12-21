import { TalksList } from '@/components/admin/talks/TalksList';

export default function TalksPage() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100">Manage Talks</h1>
          <p className="text-gray-400 mt-2">
            Create, edit, and manage TED talk content
          </p>
        </div>

        <TalksList />
      </div>
    </div>
  );
}
