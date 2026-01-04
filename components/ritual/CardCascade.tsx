'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { RitualCard } from './RitualCard';
import { RefreshCw } from 'lucide-react';
import { useCardSounds } from '@/lib/hooks/useCardSounds';
import { useRitualState } from '@/lib/hooks/useRitualState';

type CardData = {
  id: string;
  slug: string;
  name: string;
  arcanaType: 'major' | 'minor';
  suit: string | null;
  imageUrl: string | null;
  keywords: string | null;
  journalingPrompts: string | null;
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

type CardCascadeProps = {
  onCardsLoaded?: (prompts: string[][]) => void;
};

// Preload images before rendering cards to prevent flash
const preloadImages = (cards: CardData[]): Promise<void> => {
  return new Promise((resolve) => {
    const imageUrls = cards
      .map(card => card.imageUrl)
      .filter((url): url is string => url !== null);

    if (imageUrls.length === 0) {
      resolve();
      return;
    }

    let loadedCount = 0;
    const totalImages = imageUrls.length;

    const onImageLoad = () => {
      loadedCount++;
      if (loadedCount >= totalImages) {
        resolve();
      }
    };

    imageUrls.forEach(url => {
      const img = new window.Image();
      img.onload = onImageLoad;
      img.onerror = onImageLoad; // Don't block on error
      img.src = url;
    });

    // Fallback timeout: resolve after 3 seconds even if images aren't loaded
    setTimeout(() => {
      if (loadedCount < totalImages) {
        console.warn(`Image preload timeout: ${loadedCount}/${totalImages} loaded`);
        resolve();
      }
    }, 3000);
  });
};

export function CardCascade({ onCardsLoaded }: CardCascadeProps) {
  const [cards, setCards] = useState<CardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imagesReady, setImagesReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [revealedCards, setRevealedCards] = useState<number[]>([]);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('stacked');
  const [showRedraw, setShowRedraw] = useState(false);
  const [centeredCardIndex, setCenteredCardIndex] = useState<number>(0);
  const [isRestoredSession, setIsRestoredSession] = useState(false); // Track if restored from saved state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { playShuffleAndDealSound, playFlipSound, playFlip2Sound, playShuffleSound } = useCardSounds();
  const { saveRitualState, loadRitualState, clearRitualState, hasRestoredState, markRestored } = useRitualState();
  const prevLayoutModeRef = useRef<LayoutMode>('stacked');

  const fetchCards = useCallback(async (slugs?: string[], restoreState?: { revealedIndices: number[], layoutMode: LayoutMode }) => {
    setIsLoading(true);
    setImagesReady(false);
    setHasError(false);

    // Only reset state if not restoring
    if (!restoreState) {
      setRevealedCards([]);
      setLayoutMode('stacked');
      setShowRedraw(false);
    }

    try {
      const url = slugs && slugs.length > 0
        ? `/api/ritual-cards?slugs=${slugs.join(',')}`
        : '/api/ritual-cards';

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch cards');

      const data = await response.json();
      const loadedCards = data.cards || [];
      setCards(loadedCards);

      // Preload card images before showing cards (prevents flash)
      await preloadImages(loadedCards);
      setImagesReady(true);

      // Restore state if provided
      if (restoreState) {
        setRevealedCards(restoreState.revealedIndices);
        setLayoutMode(restoreState.layoutMode);

        // Show redraw if all cards were revealed
        if (restoreState.revealedIndices.length >= 3) {
          setTimeout(() => setShowRedraw(true), 1000);
        }
      }

      // Extract journal prompts for each card and notify parent
      if (onCardsLoaded && loadedCards.length > 0) {
        const prompts = loadedCards.map((card: CardData) => {
          if (card.journalingPrompts) {
            try {
              return JSON.parse(card.journalingPrompts);
            } catch {
              return [];
            }
          }
          return [];
        });
        onCardsLoaded(prompts);
      }
    } catch (error) {
      console.error('Error fetching ritual cards:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [onCardsLoaded]);

  // Restore state on mount or fetch new cards
  useEffect(() => {
    if (hasRestoredState) return; // Already restored, skip

    const savedState = loadRitualState();

    if (savedState && savedState.cardSlugs.length === 3) {
      // Restore previous ritual state
      setIsRestoredSession(true); // Mark as restored for sound selection
      fetchCards(savedState.cardSlugs, {
        revealedIndices: savedState.revealedIndices,
        layoutMode: savedState.layoutMode,
      });
      markRestored();
    } else {
      // Fetch new random cards
      setIsRestoredSession(false);
      fetchCards();
      markRestored();
    }
  }, [fetchCards, loadRitualState, hasRestoredState, markRestored]);

  // Save state whenever revealed cards or layout mode changes
  useEffect(() => {
    if (!hasRestoredState || cards.length === 0) return;

    const cardSlugs = cards.map(card => card.slug);
    saveRitualState({
      cardSlugs,
      revealedIndices: revealedCards,
      layoutMode,
    });
  }, [cards, revealedCards, layoutMode, saveRitualState, hasRestoredState]);

  // Play sound when cards are ready
  // - Fresh load: play full shuffleanddeal sound
  // - Restored session: play shorter shuffle sound
  useEffect(() => {
    if (imagesReady && cards.length > 0) {
      if (isRestoredSession) {
        playShuffleSound(); // Shorter sound for restored sessions
      } else {
        playShuffleAndDealSound(); // Full sound for fresh deals
      }
    }
  }, [imagesReady, cards.length, isRestoredSession, playShuffleAndDealSound, playShuffleSound]);

  // Play shuffle sound when layout transitions from stacked to spread
  useEffect(() => {
    const wasStacked = prevLayoutModeRef.current === 'stacked';
    const isNowSpread = layoutMode === 'spread-2' || layoutMode === 'spread-3';

    if (wasStacked && isNowSpread) {
      playShuffleSound();
    }

    prevLayoutModeRef.current = layoutMode;
  }, [layoutMode, playShuffleSound]);

  // Track which card is centered on mobile scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || layoutMode === 'stacked') return;
    if (typeof window === 'undefined' || window.innerWidth >= 768) return;

    const handleScroll = () => {
      const containerWidth = container.clientWidth;
      const scrollLeft = container.scrollLeft;
      const containerCenter = scrollLeft + containerWidth / 2;

      // Card layout: 10px base offset + 20px padding, 240px between card centers
      const cardOffset = 10 + 20; // Base offset + container padding
      const cardGap = 240;
      const cardWidth = 200;

      // Find which card is closest to center
      let closestIndex = 0;
      let closestDistance = Infinity;

      for (let i = 0; i < 3; i++) {
        const cardLeft = cardOffset + (i * cardGap);
        const cardCenter = cardLeft + (cardWidth / 2);
        const distance = Math.abs(containerCenter - cardCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      }

      setCenteredCardIndex(closestIndex);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => container.removeEventListener('scroll', handleScroll);
  }, [layoutMode]);

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

      // On mobile, scroll to center the revealed card
      // Skip for first card when stacked (already centered)
      const willBeSpread = newRevealed.length >= 2 || (newRevealed.length === 1 && index > 0);
      const isAlreadySpread = !wasStacked;

      if (willBeSpread || isAlreadySpread) {
        // Determine delay: longer if transitioning from stacked, shorter if already spread
        const scrollDelay = wasStacked ? 650 : 400; // 650ms for layout transition, 400ms for flip start

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
        }, scrollDelay);
      }

      // Show redraw after all cards revealed
      if (newRevealed.length >= 3) {
        setTimeout(() => setShowRedraw(true), 1000);
      }

      return newRevealed;
    });
  }, [layoutMode]);

  const handleRedraw = useCallback(() => {
    playShuffleSound(); // Play shuffle sound for redraw action
    clearRitualState(); // Clear saved state when drawing new cards
    setIsRestoredSession(false); // Fresh draw, not a restore
    setCards([]);
    fetchCards();
  }, [fetchCards, clearRitualState, playShuffleSound]);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-gray-400 mb-4">The cards are resting. Try again.</p>
        <button
          onClick={() => fetchCards()}
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
          {isLoading || !imagesReady ? (
            // Loading placeholder - show until images are preloaded
            <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[200px] h-[340px] md:w-[220px] md:h-[370px] rounded-xl bg-gray-800/50 animate-pulse" />
          ) : (
            // Actual cards with stacked/spread layout (images preloaded)
            cards.map((card, index) => (
              <RitualCard
                key={card.id}
                card={card}
                primaryTalk={card.primaryTalk}
                index={index}
                layoutMode={layoutMode}
                isRevealed={revealedCards.includes(index)}
                revealedCount={revealedCards.length}
                onReveal={() => handleReveal(index)}
                onFlipSound={playFlipSound}
                onFlip2Sound={playFlip2Sound}
                isCentered={index === centeredCardIndex}
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
        {!isLoading && imagesReady && revealedCards.length === 0 && (
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
