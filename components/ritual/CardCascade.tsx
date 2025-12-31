'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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

type LayoutMode = 'stacked' | 'spread-2' | 'spread-3';

export function CardCascade() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [revealedCards, setRevealedCards] = useState<number[]>([]);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('stacked');
  const [showRedraw, setShowRedraw] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchCards = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    setRevealedCards([]);
    setLayoutMode('stacked');
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

  const handleReveal = useCallback((index: number) => {
    setRevealedCards((prev) => {
      if (prev.includes(index)) return prev;
      const newRevealed = [...prev, index];

      // Update layout mode based on which cards are revealed
      const wasStacked = layoutMode === 'stacked';
      if (newRevealed.length === 1 && index === 0) {
        // First card revealed, stay stacked
        setLayoutMode('stacked');
      } else if (newRevealed.length === 2 || (newRevealed.length === 1 && index > 0)) {
        setLayoutMode('spread-2');
      } else if (newRevealed.length >= 3) {
        setLayoutMode('spread-3');
      }

      // On mobile, scroll to the revealed card after spread transition
      if (wasStacked && index > 0) {
        setTimeout(() => {
          if (window.innerWidth < 768 && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const containerWidth = container.clientWidth;
            const cardWidth = 200; // Mobile card width
            const cardGap = 240; // Card position increment (from RitualCard)
            const cardOffset = 10 + 20; // Base offset (10px) + container padding (20px)

            // Calculate card center position
            const cardLeft = cardOffset + (index * cardGap);
            const cardCenter = cardLeft + (cardWidth / 2);
            const scrollLeft = cardCenter - (containerWidth / 2);

            container.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
          }
        }, 650); // Wait for spread transition (600ms) + buffer
      }

      // Show redraw after all cards revealed
      if (newRevealed.length >= 3) {
        setTimeout(() => setShowRedraw(true), 1000);
      }

      return newRevealed;
    });
  }, [layoutMode]);

  const handleRedraw = useCallback(() => {
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

  // Calculate container width based on layout mode
  // Always use same width for spread modes to keep centering consistent
  const getContainerWidth = () => {
    if (layoutMode === 'stacked') return '280px';
    return '720px'; // Same for spread-2 and spread-3
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Scroll Container for Mobile */}
      <div
        ref={scrollContainerRef}
        className={`
          w-full md:w-auto md:flex md:justify-center
          ${layoutMode !== 'stacked' ? 'overflow-x-auto md:overflow-visible' : ''}
          ${layoutMode !== 'stacked' ? 'snap-x snap-mandatory md:snap-none' : ''}
          ${layoutMode !== 'stacked' ? 'px-5 md:px-0' : ''}
          scrollbar-hide
        `}
        style={{
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Cards Container */}
        <div
          className="relative mx-auto md:mx-0"
          style={{
            width: getContainerWidth(),
            minWidth: layoutMode !== 'stacked' ? getContainerWidth() : undefined,
            height: '420px',
            transition: 'width 600ms ease-out',
          }}
        >
          {isLoading ? (
            // Loading placeholder
            <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[200px] h-[340px] md:w-[220px] md:h-[370px] rounded-xl bg-gray-800/50 animate-pulse" />
          ) : (
            // Actual cards with stacked/spread layout
            cards.map((card, index) => (
              <RitualCard
                key={card.id}
                card={card}
                primaryTalk={card.primaryTalk}
                index={index}
                layoutMode={layoutMode}
                isRevealed={revealedCards.includes(index)}
                onReveal={() => handleReveal(index)}
              />
            ))
          )}
        </div>
      </div>

      {/* Swipe hint for mobile when cards are spread */}
      {layoutMode !== 'stacked' && revealedCards.length > 0 && (
        <p className="text-gray-500 text-xs mt-2 md:hidden animate-pulse">
          ← Swipe to see all cards →
        </p>
      )}

      {/* Instruction Text */}
      <div className="mt-8 text-center">
        {!isLoading && revealedCards.length === 0 && (
          <p className="text-gray-400 text-sm animate-gentle-pulse">
            Choose a card to start
          </p>
        )}
        {revealedCards.length > 0 && revealedCards.length < 3 && (
          <p className="text-gray-400 text-sm">
            Click the card or talk for detailed information
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
