'use client';

import { useState } from 'react';

const sampleCards = [
  'the-fool',
  'the-magician',
  'the-high-priestess',
  'the-empress',
  'the-tower',
  'the-star',
  'the-moon',
  'the-sun',
  'death',
  'the-lovers',
];

export default function CardSharePreview() {
  const [selectedCards, setSelectedCards] = useState(sampleCards.slice(0, 4));
  const [refreshKey, setRefreshKey] = useState(Date.now());

  const handleRefresh = () => {
    setRefreshKey(Date.now());
  };

  const toggleCard = (slug: string) => {
    setSelectedCards(prev =>
      prev.includes(slug)
        ? prev.filter(c => c !== slug)
        : [...prev, slug]
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">OG Image Preview</h1>
        <p className="text-gray-400 mb-6">
          Test the OpenGraph images that appear when sharing cards on social media.
        </p>

        {/* Controls */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
          >
            Refresh All Images
          </button>
          <span className="text-gray-500 text-sm">
            Key: {refreshKey}
          </span>
        </div>

        {/* Card selector */}
        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-2">Toggle cards to preview:</p>
          <div className="flex flex-wrap gap-2">
            {sampleCards.map(slug => (
              <button
                key={slug}
                onClick={() => toggleCard(slug)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedCards.includes(slug)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {slug}
              </button>
            ))}
          </div>
        </div>

        {/* Image Grid */}
        <div className="space-y-8">
          {selectedCards.map(slug => (
            <div key={`${slug}-${refreshKey}`} className="space-y-3">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold capitalize">
                  {slug.replace(/-/g, ' ')}
                </h2>
                <a
                  href={`/cards/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 text-sm"
                >
                  View card page
                </a>
              </div>

              {/* OpenGraph Image */}
              <div className="space-y-2">
                <p className="text-sm text-gray-500">OpenGraph (1200x630):</p>
                <div className="border border-gray-700 rounded-lg overflow-hidden inline-block">
                  <img
                    src={`/cards/${slug}/opengraph-image?t=${refreshKey}`}
                    alt={`OG image for ${slug}`}
                    width={600}
                    height={315}
                    className="block"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </div>
                <p className="text-xs text-gray-600">
                  URL: <code className="bg-gray-800 px-2 py-0.5 rounded">/cards/{slug}/opengraph-image</code>
                </p>
              </div>

              {/* Twitter Image */}
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Twitter (1200x630):</p>
                <div className="border border-gray-700 rounded-lg overflow-hidden inline-block">
                  <img
                    src={`/cards/${slug}/twitter-image?t=${refreshKey}`}
                    alt={`Twitter image for ${slug}`}
                    width={600}
                    height={315}
                    className="block"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </div>
                <p className="text-xs text-gray-600">
                  URL: <code className="bg-gray-800 px-2 py-0.5 rounded">/cards/{slug}/twitter-image</code>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Debug info */}
        <div className="mt-12 p-4 bg-gray-900 rounded-lg">
          <h3 className="font-semibold mb-2">Debug Info</h3>
          <p className="text-sm text-gray-400">
            If images are not loading, check the browser console and network tab for errors.
            Common issues:
          </p>
          <ul className="text-sm text-gray-500 list-disc list-inside mt-2 space-y-1">
            <li>Database connection errors (card data not found)</li>
            <li>Font loading failures (will fallback to system fonts)</li>
            <li>Image URL resolution issues (card/talk thumbnails)</li>
            <li>Server-side rendering errors in the image generation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
