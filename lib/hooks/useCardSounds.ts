'use client';

import { useRef, useEffect, useCallback, useState } from 'react';

const STORAGE_KEY = 'tarotted-sound-muted';

/**
 * Audio management hook for ritual card interactions
 *
 * - Preloads audio files on mount
 * - Respects browser autoplay policies (requires user gesture)
 * - Persists mute preference in localStorage
 * - Gracefully handles missing or failed audio
 */
export function useCardSounds() {
  const shuffleAndDealAudioRef = useRef<HTMLAudioElement | null>(null);
  const flipAudioRef = useRef<HTMLAudioElement | null>(null);
  const flip2AudioRef = useRef<HTMLAudioElement | null>(null);
  const shuffleAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const hasInteractedRef = useRef(false);
  const pendingShuffleAndDealRef = useRef(false); // Queue shuffleanddeal for first interaction

  // Load mute preference from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem(STORAGE_KEY);
      if (savedMute === 'true') {
        setIsMuted(true);
      }
    }
  }, []);

  // Preload audio files
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const shuffleAndDeal = new Audio('/sounds/shuffleanddeal.mp3');
    const flip = new Audio('/sounds/flip.mp3');
    const flip2 = new Audio('/sounds/flip2.mp3');
    const shuffle = new Audio('/sounds/shuffle.mp3');

    // Configure audio elements
    shuffleAndDeal.volume = 0.4; // Initial deal sound
    flip.volume = 0.3; // First card flip
    flip2.volume = 0.3; // Second/third card flip
    shuffle.volume = 0.4; // Stacked to spread transition

    shuffleAndDeal.preload = 'auto';
    flip.preload = 'auto';
    flip2.preload = 'auto';
    shuffle.preload = 'auto';

    shuffleAndDealAudioRef.current = shuffleAndDeal;
    flipAudioRef.current = flip;
    flip2AudioRef.current = flip2;
    shuffleAudioRef.current = shuffle;

    // Track when all are ready
    let loadedCount = 0;
    const onCanPlay = () => {
      loadedCount++;
      if (loadedCount >= 4) {
        setIsReady(true);
      }
    };

    shuffleAndDeal.addEventListener('canplaythrough', onCanPlay);
    flip.addEventListener('canplaythrough', onCanPlay);
    flip2.addEventListener('canplaythrough', onCanPlay);
    shuffle.addEventListener('canplaythrough', onCanPlay);

    // Fallback: mark ready after timeout even if load fails
    const timeout = setTimeout(() => {
      if (!isReady) {
        setIsReady(true);
      }
    }, 3000);

    return () => {
      clearTimeout(timeout);
      shuffleAndDeal.removeEventListener('canplaythrough', onCanPlay);
      flip.removeEventListener('canplaythrough', onCanPlay);
      flip2.removeEventListener('canplaythrough', onCanPlay);
      shuffle.removeEventListener('canplaythrough', onCanPlay);
    };
  }, [isReady]);

  // Track user interaction (for autoplay policy)
  // Play pending shuffleanddeal sound on first interaction
  useEffect(() => {
    const markInteracted = () => {
      hasInteractedRef.current = true;

      // Play pending shuffleanddeal sound on first interaction
      if (pendingShuffleAndDealRef.current && shuffleAndDealAudioRef.current && !isMuted) {
        pendingShuffleAndDealRef.current = false;
        shuffleAndDealAudioRef.current.currentTime = 0;
        shuffleAndDealAudioRef.current.play().catch(() => {});
      }
    };

    document.addEventListener('click', markInteracted, { once: true });
    document.addEventListener('touchstart', markInteracted, { once: true });

    return () => {
      document.removeEventListener('click', markInteracted);
      document.removeEventListener('touchstart', markInteracted);
    };
  }, [isMuted]);

  const playShuffleAndDealSound = useCallback(() => {
    if (isMuted || !shuffleAndDealAudioRef.current) return;

    // If user hasn't interacted yet, queue for first interaction
    if (!hasInteractedRef.current) {
      pendingShuffleAndDealRef.current = true;
      return;
    }

    try {
      shuffleAndDealAudioRef.current.currentTime = 0;
      shuffleAndDealAudioRef.current.play().catch(() => {
        // Silently fail if autoplay blocked
      });
    } catch {
      // Gracefully handle any errors
    }
  }, [isMuted]);

  const playFlipSound = useCallback(() => {
    if (isMuted || !flipAudioRef.current || !hasInteractedRef.current) return;

    try {
      flipAudioRef.current.currentTime = 0;
      flipAudioRef.current.play().catch(() => {
        // Silently fail if autoplay blocked
      });
    } catch {
      // Gracefully handle any errors
    }
  }, [isMuted]);

  const playFlip2Sound = useCallback(() => {
    if (isMuted || !flip2AudioRef.current || !hasInteractedRef.current) return;

    try {
      flip2AudioRef.current.currentTime = 0;
      flip2AudioRef.current.play().catch(() => {
        // Silently fail if autoplay blocked
      });
    } catch {
      // Gracefully handle any errors
    }
  }, [isMuted]);

  const playShuffleSound = useCallback(() => {
    if (isMuted || !shuffleAudioRef.current || !hasInteractedRef.current) return;

    try {
      shuffleAudioRef.current.currentTime = 0;
      shuffleAudioRef.current.play().catch(() => {
        // Silently fail if autoplay blocked
      });
    } catch {
      // Gracefully handle any errors
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newValue = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, String(newValue));
      }
      return newValue;
    });
  }, []);

  return {
    playShuffleAndDealSound,
    playFlipSound,
    playFlip2Sound,
    playShuffleSound,
    isMuted,
    toggleMute,
    isReady,
  };
}
