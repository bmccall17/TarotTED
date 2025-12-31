'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Play } from 'lucide-react';

type RitualCardProps = {
  card: {
    id: string;
    slug: string;
    name: string;
    arcanaType: 'major' | 'minor';
    suit: string | null;
    imageUrl: string | null;
    keywords: string | null;
  };
  primaryTalk: {
    id: string;
    slug: string;
    title: string;
    speakerName: string;
    thumbnailUrl: string | null;
    durationSeconds: number | null;
  } | null;
  index: number;
  onReveal?: () => void;
};

export function RitualCard({ card, primaryTalk, index, onReveal }: RitualCardProps) {
  const router = useRouter();
  const [isRevealed, setIsRevealed] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isTalkHovering, setIsTalkHovering] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Parse keywords
  const keywords = card.keywords ? JSON.parse(card.keywords) : [];
  const displayKeywords = keywords.slice(0, 3);

  // Format duration
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  // Get archetype label
  const getArchetype = () => {
    if (card.arcanaType === 'major') return 'Major Arcana';
    if (card.suit) {
      return card.suit.charAt(0).toUpperCase() + card.suit.slice(1);
    }
    return 'Minor Arcana';
  };

  // Handle card click to reveal
  const handleCardClick = useCallback(() => {
    if (isNavigating) return;

    if (!isRevealed && !isFlipping) {
      setIsFlipping(true);
      onReveal?.();

      // Complete flip animation (777ms)
      setTimeout(() => {
        setIsRevealed(true);
        setIsFlipping(false);
      }, 777);
    } else if (isRevealed && !isTalkHovering) {
      // Navigate to card detail with ritual pause (888ms)
      setIsNavigating(true);
      setTimeout(() => {
        router.push(`/cards/${card.slug}`);
      }, 888);
    }
  }, [isRevealed, isFlipping, isTalkHovering, isNavigating, card.slug, router, onReveal]);

  // Handle talk overlay click
  const handleTalkClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!primaryTalk || isNavigating) return;

    setIsNavigating(true);
    setTimeout(() => {
      router.push(`/talks/${primaryTalk.slug}`);
    }, 888);
  }, [primaryTalk, isNavigating, router]);

  return (
    <div
      className={`
        relative w-[200px] h-[340px] md:w-[220px] md:h-[370px] cursor-pointer
        transition-all duration-300 ease-out
        ${isNavigating ? 'opacity-50 scale-95' : ''}
      `}
      style={{
        perspective: '1000px',
        animationDelay: `${index * 333}ms`,
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleCardClick}
    >
      {/* Card Container with 3D flip */}
      <div
        className={`
          relative w-full h-full
          ${isFlipping ? 'animate-ritual-flip' : ''}
          ${!isRevealed && isHovering && !isFlipping ? 'hover:rotate-y-12' : ''}
        `}
        style={{
          transformStyle: 'preserve-3d',
          transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: isFlipping ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {/* Card Back (Face Down) */}
        <div
          className={`
            absolute inset-0 rounded-xl overflow-hidden shadow-xl
            transition-all duration-300
            ${isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'}
            ${!isRevealed && isHovering ? 'shadow-2xl shadow-purple-500/30 scale-105' : ''}
          `}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <img
            src="/deck-back.webp"
            alt="Tarot card back"
            className="w-full h-full object-cover"
          />
          {/* Mystical glow on hover */}
          <div
            className={`
              absolute inset-0 bg-gradient-to-t from-purple-600/30 via-transparent to-indigo-600/20
              transition-opacity duration-300
              ${isHovering ? 'opacity-100' : 'opacity-0'}
            `}
          />
        </div>

        {/* Card Front (Revealed) */}
        <div
          className={`
            absolute inset-0 rounded-xl overflow-hidden shadow-xl
            transition-all duration-300
            ${isRevealed && isHovering ? 'shadow-2xl shadow-indigo-500/40' : ''}
          `}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Card Image */}
          <img
            src={card.imageUrl || '/deck-back.webp'}
            alt={card.name}
            className="w-full h-full object-cover"
          />

          {/* Card Info Overlay (shown on hover) */}
          <div
            className={`
              absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent
              flex flex-col justify-end p-4
              transition-opacity duration-300
              ${isRevealed && isHovering && !isTalkHovering ? 'opacity-100' : 'opacity-0'}
            `}
          >
            <h3 className="text-lg font-bold text-white mb-2">
              {card.name}
            </h3>
            {displayKeywords.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {displayKeywords.map((keyword: string, i: number) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-0.5 bg-white/20 rounded-full text-gray-200"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Talk Overlay */}
          {primaryTalk && (
            <div
              className={`
                absolute bottom-0 right-0 left-0
                bg-gradient-to-t from-black/95 to-black/70
                rounded-b-xl overflow-hidden
                transition-all duration-300 ease-out
                ${isTalkHovering ? 'h-2/5 opacity-100' : 'h-1/4 opacity-40'}
              `}
              onMouseEnter={() => setIsTalkHovering(true)}
              onMouseLeave={() => setIsTalkHovering(false)}
              onClick={handleTalkClick}
            >
              <div className="p-3 h-full flex flex-col justify-end">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                    <Play className="w-3 h-3 text-white fill-white" />
                  </div>
                  <span className="text-xs text-gray-400">TED Talk</span>
                </div>
                <p
                  className={`
                    text-sm font-medium text-white leading-tight
                    transition-all duration-300
                    ${isTalkHovering ? 'line-clamp-2' : 'line-clamp-1'}
                  `}
                >
                  {primaryTalk.title}
                </p>
                {isTalkHovering && (
                  <p className="text-xs text-gray-400 mt-1">
                    {primaryTalk.speakerName}
                    {primaryTalk.durationSeconds && (
                      <span className="ml-2">{formatDuration(primaryTalk.durationSeconds)}</span>
                    )}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
