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
  const shuffleAudioRef = useRef<HTMLAudioElement | null>(null);
  const flipAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const hasInteractedRef = useRef(false);
  const pendingShuffleRef = useRef(false); // Queue shuffle for first interaction

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

    const shuffle = new Audio('/sounds/shuffle.mp3');
    const flip = new Audio('/sounds/flip.mp3');

    // Configure audio elements
    shuffle.volume = 0.4; // Subtle shuffle sound
    flip.volume = 0.3; // Very subtle flip sound
    shuffle.preload = 'auto';
    flip.preload = 'auto';

    shuffleAudioRef.current = shuffle;
    flipAudioRef.current = flip;

    // Track when both are ready
    let loadedCount = 0;
    const onCanPlay = () => {
      loadedCount++;
      if (loadedCount >= 2) {
        setIsReady(true);
      }
    };

    shuffle.addEventListener('canplaythrough', onCanPlay);
    flip.addEventListener('canplaythrough', onCanPlay);

    // Fallback: mark ready after timeout even if load fails
    const timeout = setTimeout(() => {
      if (!isReady) {
        setIsReady(true);
      }
    }, 3000);

    return () => {
      clearTimeout(timeout);
      shuffle.removeEventListener('canplaythrough', onCanPlay);
      flip.removeEventListener('canplaythrough', onCanPlay);
    };
  }, [isReady]);

  // Track user interaction (for autoplay policy)
  // Play pending shuffle sound on first interaction
  useEffect(() => {
    const markInteracted = () => {
      hasInteractedRef.current = true;

      // Play pending shuffle sound on first interaction
      if (pendingShuffleRef.current && shuffleAudioRef.current && !isMuted) {
        pendingShuffleRef.current = false;
        shuffleAudioRef.current.currentTime = 0;
        shuffleAudioRef.current.play().catch(() => {});
      }
    };

    document.addEventListener('click', markInteracted, { once: true });
    document.addEventListener('touchstart', markInteracted, { once: true });

    return () => {
      document.removeEventListener('click', markInteracted);
      document.removeEventListener('touchstart', markInteracted);
    };
  }, [isMuted]);

  const playShuffleSound = useCallback(() => {
    if (isMuted || !shuffleAudioRef.current) return;

    // If user hasn't interacted yet, queue for first interaction
    if (!hasInteractedRef.current) {
      pendingShuffleRef.current = true;
      return;
    }

    try {
      shuffleAudioRef.current.currentTime = 0;
      shuffleAudioRef.current.play().catch(() => {
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
    playShuffleSound,
    playFlipSound,
    isMuted,
    toggleMute,
    isReady,
  };
}
