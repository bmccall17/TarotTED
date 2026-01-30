'use client';

import { useState } from 'react';

const sampleTalks = [
  'the-power-of-vulnerability',
  'how-great-leaders-inspire-action',
  'your-body-language-may-shape-who-you-are',
  'the-happy-secret-to-better-work',
  'the-puzzle-of-motivation',
  'do-schools-kill-creativity',
  'the-power-of-introverts',
  'how-to-speak-so-that-people-want-to-listen',
];

type LayoutType = 'A' | 'B' | 'C';

export default function TalkSharePreview() {
  const [selectedTalks, setSelectedTalks] = useState(sampleTalks.slice(0, 3));
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>('A');
  const [comparisonMode, setComparisonMode] = useState(false);

  const handleRefresh = () => {
    setRefreshKey(Date.now());
  };

  const toggleTalk = (slug: string) => {
    setSelectedTalks(prev =>
      prev.includes(slug)
        ? prev.filter(t => t !== slug)
        : [...prev, slug]
    );
  };

  const layoutDescriptions: Record<LayoutType, string> = {
    A: 'Three-Column: Talk thumbnail left, text center, card image right',
    B: 'Talk Hero: Large talk thumbnail with smaller card on right',
    C: 'Side-by-Side Equal: Talk and card with equal visual weight',
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Talk OG Image Preview</h1>
        <p className="text-gray-400 mb-6">
          Test layout variations for talk share images. Select your preferred layout to implement.
        </p>

        {/* Layout Selector */}
        <div className="mb-6 p-4 bg-gray-900/50 border border-gray-700 rounded-xl">
          <p className="text-sm font-medium text-gray-300 mb-3">Select Layout:</p>
          <div className="flex flex-wrap gap-4">
            {(['A', 'B', 'C'] as LayoutType[]).map(layout => (
              <label
                key={layout}
                className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedLayout === layout
                    ? 'bg-indigo-600/30 border border-indigo-500'
                    : 'bg-gray-800 border border-gray-700 hover:bg-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="layout"
                  value={layout}
                  checked={selectedLayout === layout}
                  onChange={() => setSelectedLayout(layout)}
                  className="mt-1"
                />
                <div>
                  <span className="font-medium">Layout {layout}</span>
                  <p className="text-xs text-gray-400 mt-0.5">{layoutDescriptions[layout]}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
          >
            Refresh All Images
          </button>
          <button
            onClick={() => setComparisonMode(!comparisonMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              comparisonMode
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {comparisonMode ? 'Exit Comparison' : 'Compare All Layouts'}
          </button>
          <span className="text-gray-500 text-sm">
            Key: {refreshKey}
          </span>
        </div>

        {/* Talk selector */}
        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-2">Toggle talks to preview:</p>
          <div className="flex flex-wrap gap-2">
            {sampleTalks.map(slug => (
              <button
                key={slug}
                onClick={() => toggleTalk(slug)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTalks.includes(slug)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {slug.split('-').slice(0, 3).join(' ')}...
              </button>
            ))}
          </div>
        </div>

        {/* Image Display */}
        <div className="space-y-8">
          {selectedTalks.map(slug => (
            <div key={`${slug}-${refreshKey}`} className="space-y-3">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">
                  {slug.replace(/-/g, ' ')}
                </h2>
                <a
                  href={`/talks/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 text-sm"
                >
                  View talk page
                </a>
              </div>

              {comparisonMode ? (
                // Comparison mode: show all 3 layouts
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  {(['A', 'B', 'C'] as LayoutType[]).map(layout => (
                    <div key={layout} className="space-y-2">
                      <p className="text-sm text-gray-400">
                        Layout {layout}:
                      </p>
                      <div className="border border-gray-700 rounded-lg overflow-hidden">
                        <img
                          src={`/talks/${slug}/opengraph-image?layout=${layout}&t=${refreshKey}`}
                          alt={`Layout ${layout} for ${slug}`}
                          className="block w-full h-auto"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Single layout mode
                <>
                  {/* OpenGraph Image */}
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">
                      OpenGraph (1200x630) - Layout {selectedLayout}:
                    </p>
                    <div className="border border-gray-700 rounded-lg overflow-hidden inline-block">
                      <img
                        src={`/talks/${slug}/opengraph-image?layout=${selectedLayout}&t=${refreshKey}`}
                        alt={`OG image for ${slug}`}
                        width={600}
                        height={315}
                        className="block"
                        style={{ maxWidth: '100%', height: 'auto' }}
                      />
                    </div>
                    <p className="text-xs text-gray-600">
                      URL: <code className="bg-gray-800 px-2 py-0.5 rounded">/talks/{slug}/opengraph-image</code>
                    </p>
                  </div>

                  {/* Twitter Image */}
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Twitter (1200x630):</p>
                    <div className="border border-gray-700 rounded-lg overflow-hidden inline-block">
                      <img
                        src={`/talks/${slug}/twitter-image?layout=${selectedLayout}&t=${refreshKey}`}
                        alt={`Twitter image for ${slug}`}
                        width={600}
                        height={315}
                        className="block"
                        style={{ maxWidth: '100%', height: 'auto' }}
                      />
                    </div>
                    <p className="text-xs text-gray-600">
                      URL: <code className="bg-gray-800 px-2 py-0.5 rounded">/talks/{slug}/twitter-image</code>
                    </p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Debug info */}
        <div className="mt-12 p-4 bg-gray-900 rounded-lg">
          <h3 className="font-semibold mb-2">Layout Descriptions</h3>
          <ul className="text-sm text-gray-400 space-y-3">
            <li>
              <strong className="text-gray-200">Layout A (Three-Column):</strong> Talk thumbnail on left (420x236),
              centered text with title/speaker/metadata/rationale, card image on right (160x316).
              Best for showing all elements with balanced composition.
            </li>
            <li>
              <strong className="text-gray-200">Layout B (Talk Hero):</strong> Large talk thumbnail (560x315),
              smaller card on right side, text below. Emphasizes the TED talk content.
            </li>
            <li>
              <strong className="text-gray-200">Layout C (Side-by-Side):</strong> Equal visual weight for talk (400x225)
              and card (200x395), text below each. Balanced presentation of both elements.
            </li>
          </ul>
          <div className="mt-4 pt-4 border-t border-gray-800">
            <h4 className="font-semibold mb-2">Debug Info</h4>
            <p className="text-sm text-gray-400">
              If images are not loading, check the browser console and network tab for errors.
              Common issues:
            </p>
            <ul className="text-sm text-gray-500 list-disc list-inside mt-2 space-y-1">
              <li>Database connection errors (talk data not found)</li>
              <li>Font loading failures (will fallback to system fonts)</li>
              <li>Image URL resolution issues (talk thumbnail/card images)</li>
              <li>Server-side rendering errors in the image generation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
