import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          TarotTED
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8">
          Mapping the Tarot deck to TED talks
        </p>
        <p className="text-lg text-gray-700 mb-12 max-w-xl mx-auto">
          Discover wisdom through the intersection of ancient Tarot archetypes and modern TED insights.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Link
            href="/cards"
            className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg hover:shadow-lg transition-all duration-200"
          >
            <h2 className="text-xl font-semibold mb-2 text-purple-900">Browse Cards</h2>
            <p className="text-gray-600 text-sm">Explore all 78 Tarot cards</p>
          </Link>

          <Link
            href="/talks"
            className="p-6 bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-lg hover:shadow-lg transition-all duration-200"
          >
            <h2 className="text-xl font-semibold mb-2 text-red-900">Discover Talks</h2>
            <p className="text-gray-600 text-sm">Watch TED talks by archetype</p>
          </Link>

          <Link
            href="/themes"
            className="p-6 bg-gradient-to-br from-green-50 to-teal-50 border border-green-200 rounded-lg hover:shadow-lg transition-all duration-200"
          >
            <h2 className="text-xl font-semibold mb-2 text-green-900">Explore Themes</h2>
            <p className="text-gray-600 text-sm">Curated collections for life's moments</p>
          </Link>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>Phase 0: Setup Complete ✓</p>
          <p className="mt-2">Next: Upload your Tarot card images to <code className="bg-gray-100 px-2 py-1 rounded">/public/images/cards/</code></p>
        </div>
      </div>
    </main>
  );
}
