'use client';

import { useState, useEffect, useCallback } from 'react';
import { RitualCard } from './RitualCard';
import { RefreshCw } from 'lucide-react';

type CardData = {
  id: string;
  slug: string;
  name: string;
  arcanaType: 'major' | 'minor';
  suit: string | null;
  imageUrl: string | null;
  keywords: string | null;
  primaryTalk: {
    id: string;
    slug: string;
    title: string;
    speakerName: string;
    thumbnailUrl: string | null;
    durationSeconds: number | null;
  } | null;
};

export function CardCascade() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [showRedraw, setShowRedraw] = useState(false);

  const fetchCards = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    setRevealedCount(0);
    setShowRedraw(false);

    try {
      const response = await fetch('/api/ritual-cards');
      if (!response.ok) throw new Error('Failed to fetch cards');

      const data = await response.json();
      setCards(data.cards || []);
    } catch (error) {
      console.error('Error fetching ritual cards:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleReveal = useCallback(() => {
    setRevealedCount((prev) => {
      const newCount = prev + 1;
      // Show redraw button after all cards revealed
      if (newCount >= 3) {
        setTimeout(() => setShowRedraw(true), 1000);
      }
      return newCount;
    });
  }, []);

  const handleRedraw = useCallback(() => {
    // Reset and fetch new cards
    setCards([]);
    fetchCards();
  }, [fetchCards]);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-gray-400 mb-4">The cards are resting. Try again.</p>
        <button
          onClick={fetchCards}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors"
        >
          Draw Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Cards Container */}
      <div className="flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-8">
        {isLoading ? (
          // Loading placeholders
          <>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-[200px] h-[340px] md:w-[220px] md:h-[370px] rounded-xl bg-gray-800/50 animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </>
        ) : (
          // Actual cards with cascade animation
          cards.map((card, index) => (
            <div
              key={card.id}
              className="animate-cascade-in"
              style={{ animationDelay: `${index * 333}ms` }}
            >
              <RitualCard
                card={card}
                primaryTalk={card.primaryTalk}
                index={index}
                onReveal={handleReveal}
              />
            </div>
          ))
        )}
      </div>

      {/* Instruction Text */}
      <div className="mt-8 text-center">
        {!isLoading && revealedCount === 0 && (
          <p className="text-gray-400 text-sm animate-gentle-pulse">
            Choose a card to reveal your reading
          </p>
        )}
        {revealedCount > 0 && revealedCount < 3 && (
          <p className="text-gray-500 text-sm">
            {3 - revealedCount} card{3 - revealedCount !== 1 ? 's' : ''} remaining
          </p>
        )}
      </div>

      {/* Redraw Button */}
      <div
        className={`
          mt-6 transition-all duration-500
          ${showRedraw ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
        `}
      >
        <button
          onClick={handleRedraw}
          className="flex items-center gap-2 px-6 py-3 bg-gray-800/80 hover:bg-gray-700 border border-gray-600 rounded-xl text-gray-300 hover:text-white transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Draw New Cards</span>
        </button>
      </div>
    </div>
  );
}
