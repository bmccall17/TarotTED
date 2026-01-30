'use client';

import { useState, useEffect } from 'react';

type Talk = {
  id: string;
  slug: string;
  title: string;
  speakerName: string;
};

export default function TalkSharePreview() {
  const [talks, setTalks] = useState<Talk[]>([]);
  const [selectedTalks, setSelectedTalks] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTalks();
  }, []);

  const fetchTalks = async () => {
    try {
      const response = await fetch('/api/admin/talks');
      const data = await response.json();
      const fetchedTalks = data.talks || [];
      setTalks(fetchedTalks);
      // Select first 3 talks by default
      setSelectedTalks(fetchedTalks.slice(0, 3).map((t: Talk) => t.slug));
    } catch (error) {
      console.error('Error fetching talks:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-6 flex items-center justify-center">
        <div className="text-gray-400">Loading talks...</div>
      </div>
    );
  }

  if (talks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Talk OG Image Preview</h1>
          <p className="text-gray-400">No talks found in the database.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Talk OG Image Preview</h1>
        <p className="text-gray-400 mb-6">
          Preview OpenGraph/Twitter share images for talks. Uses Layout A (Three-Column).
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

        {/* Talk selector */}
        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-2">Toggle talks to preview ({talks.length} available):</p>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {talks.slice(0, 20).map(talk => (
              <button
                key={talk.slug}
                onClick={() => toggleTalk(talk.slug)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTalks.includes(talk.slug)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
                title={`${talk.speakerName}: ${talk.title}`}
              >
                {talk.speakerName}
              </button>
            ))}
          </div>
        </div>

        {/* Image Display */}
        <div className="space-y-8">
          {selectedTalks.map(slug => {
            const talk = talks.find(t => t.slug === slug);
            if (!talk) return null;

            return (
              <div key={`${slug}-${refreshKey}`} className="space-y-3">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold">
                    {talk.title}
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
                <p className="text-sm text-gray-500">by {talk.speakerName}</p>

                {/* OpenGraph Image */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">OpenGraph (1200x630):</p>
                  <div className="border border-gray-700 rounded-lg overflow-hidden inline-block">
                    <img
                      src={`/talks/${slug}/opengraph-image?t=${refreshKey}`}
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
                      src={`/talks/${slug}/twitter-image?t=${refreshKey}`}
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
              </div>
            );
          })}
        </div>

        {/* Debug info */}
        <div className="mt-12 p-4 bg-gray-900 rounded-lg">
          <h3 className="font-semibold mb-2">Layout Info</h3>
          <p className="text-sm text-gray-400">
            <strong className="text-gray-200">Layout A (Three-Column):</strong> Talk thumbnail on left (420x236),
            centered text with title/speaker/metadata/rationale, card image on right (160x316).
          </p>
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
