'use client';

import { useState, useEffect } from 'react';
import { Download, RefreshCw, Check, Image, AlertCircle } from 'lucide-react';

type Card = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string;
};

export default function ShareImagesPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, currentCard: '' });
  const [generatedCards, setGeneratedCards] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const response = await fetch('/api/admin/cards');
      const data = await response.json();
      setCards(data.cards || []);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSingleImage = async (slug: string, type: 'opengraph' | 'twitter'): Promise<boolean> => {
    try {
      const response = await fetch(`/cards/${slug}/${type}-image?generate=true&t=${Date.now()}`);
      if (!response.ok) {
        throw new Error(`Failed to generate ${type} image for ${slug}`);
      }
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const generateAllImages = async () => {
    setGenerating(true);
    setProgress({ current: 0, total: cards.length * 2, currentCard: '' });
    setGeneratedCards(new Set());
    setErrors([]);

    const newErrors: string[] = [];

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      setProgress({ current: i * 2, total: cards.length * 2, currentCard: card.name });

      // Generate OpenGraph image
      const ogSuccess = await generateSingleImage(card.slug, 'opengraph');
      if (!ogSuccess) {
        newErrors.push(`${card.name}: OpenGraph image failed`);
      }

      setProgress({ current: i * 2 + 1, total: cards.length * 2, currentCard: card.name });

      // Generate Twitter image
      const twitterSuccess = await generateSingleImage(card.slug, 'twitter');
      if (!twitterSuccess) {
        newErrors.push(`${card.name}: Twitter image failed`);
      }

      if (ogSuccess && twitterSuccess) {
        setGeneratedCards((prev) => new Set([...prev, card.slug]));
      }

      // Small delay to prevent overwhelming the server
      await new Promise((r) => setTimeout(r, 100));
    }

    setProgress({ current: cards.length * 2, total: cards.length * 2, currentCard: 'Complete!' });
    setErrors(newErrors);
    setGenerating(false);
    setRefreshKey(Date.now());
  };

  const downloadImage = async (slug: string, type: 'opengraph' | 'twitter') => {
    try {
      const response = await fetch(`/cards/${slug}/${type}-image`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}-${type}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const downloadAllImages = async () => {
    setGenerating(true);
    setProgress({ current: 0, total: cards.length * 2, currentCard: '' });

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      setProgress({ current: i * 2, total: cards.length * 2, currentCard: `Downloading ${card.name}...` });

      await downloadImage(card.slug, 'opengraph');
      await new Promise((r) => setTimeout(r, 200));

      setProgress({ current: i * 2 + 1, total: cards.length * 2, currentCard: `Downloading ${card.name}...` });

      await downloadImage(card.slug, 'twitter');
      await new Promise((r) => setTimeout(r, 200));
    }

    setProgress({ current: cards.length * 2, total: cards.length * 2, currentCard: 'Complete!' });
    setGenerating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Share Images</h1>
        <p className="text-gray-400 mt-1">
          Generate and preview OpenGraph/Twitter share images for all {cards.length} cards
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
        <button
          onClick={generateAllImages}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          {generating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Image className="w-4 h-4" />
              Generate All Images
            </>
          )}
        </button>

        <button
          onClick={downloadAllImages}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          Download All
        </button>

        <button
          onClick={() => setRefreshKey(Date.now())}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Previews
        </button>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-sm ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-sm ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            List
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {generating && (
        <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">{progress.currentCard}</span>
            <span className="text-sm text-gray-400">
              {progress.current} / {progress.total}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">{errors.length} errors occurred</span>
          </div>
          <ul className="text-sm text-red-300 space-y-1 max-h-32 overflow-y-auto">
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Cards Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`bg-gray-800/50 border rounded-xl p-4 transition-all ${
                generatedCards.has(card.slug) ? 'border-green-500/50' : 'border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-100 truncate">{card.name}</h3>
                {generatedCards.has(card.slug) && (
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                )}
              </div>

              {/* OpenGraph Preview */}
              <div className="space-y-2">
                <p className="text-xs text-gray-500">OpenGraph:</p>
                <div className="border border-gray-700 rounded overflow-hidden">
                  <img
                    src={`/cards/${card.slug}/opengraph-image?t=${refreshKey}`}
                    alt={`OG: ${card.name}`}
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadImage(card.slug, 'opengraph')}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    OG
                  </button>
                  <button
                    onClick={() => downloadImage(card.slug, 'twitter')}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    Twitter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Card</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">OpenGraph</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Twitter</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {cards.map((card) => (
                <tr key={card.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={card.imageUrl}
                        alt={card.name}
                        className="w-8 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium text-gray-100">{card.name}</p>
                        <p className="text-xs text-gray-500">{card.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <img
                      src={`/cards/${card.slug}/opengraph-image?t=${refreshKey}`}
                      alt={`OG: ${card.name}`}
                      className="w-32 h-auto rounded border border-gray-700"
                      loading="lazy"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <img
                      src={`/cards/${card.slug}/twitter-image?t=${refreshKey}`}
                      alt={`Twitter: ${card.name}`}
                      className="w-32 h-auto rounded border border-gray-700"
                      loading="lazy"
                    />
                  </td>
                  <td className="px-4 py-3">
                    {generatedCards.has(card.slug) ? (
                      <span className="flex items-center gap-1 text-green-400 text-sm">
                        <Check className="w-4 h-4" />
                        Generated
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => downloadImage(card.slug, 'opengraph')}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                        title="Download OpenGraph"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <a
                        href={`/cards/${card.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-400 hover:text-indigo-300"
                      >
                        View
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats */}
      <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
        <h3 className="font-medium text-gray-100 mb-2">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Total Cards</p>
            <p className="text-2xl font-bold text-gray-100">{cards.length}</p>
          </div>
          <div>
            <p className="text-gray-500">Images Per Card</p>
            <p className="text-2xl font-bold text-gray-100">2</p>
          </div>
          <div>
            <p className="text-gray-500">Total Images</p>
            <p className="text-2xl font-bold text-gray-100">{cards.length * 2}</p>
          </div>
          <div>
            <p className="text-gray-500">Generated This Session</p>
            <p className="text-2xl font-bold text-green-400">{generatedCards.size}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
