'use client';

import { useRef, useEffect, useCallback, useState } from 'react';

const STORAGE_KEY = 'tarotted-sound-muted';
const INTERACTION_KEY = 'tarotted-has-interacted'; // Track if user has ever interacted

/**
 * Audio management hook for ritual card interactions
 *
 * - Preloads audio files on mount
 * - Respects browser autoplay policies (requires user gesture)
 * - Persists mute preference in localStorage
 * - Gracefully handles missing or failed audio
 * - Detects user interaction early (click, touch, scroll, keydown)
 */
export function useCardSounds() {
  const shuffleAndDealAudioRef = useRef<HTMLAudioElement | null>(null);
  const flipAudioRef = useRef<HTMLAudioElement | null>(null);
  const flip2AudioRef = useRef<HTMLAudioElement | null>(null);
  const shuffleAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const hasInteractedRef = useRef(false);
  const pendingSoundRef = useRef<'shuffleanddeal' | 'shuffle' | null>(null); // Queue sound for first interaction

  // Load mute preference and check for prior interaction
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem(STORAGE_KEY);
      if (savedMute === 'true') {
        setIsMuted(true);
      }
      // Check if user has interacted before (across sessions)
      const hadPriorInteraction = localStorage.getItem(INTERACTION_KEY) === 'true';
      if (hadPriorInteraction) {
        hasInteractedRef.current = true;
      }
    }
  }, []);

  // Preload audio files and initialize AudioContext
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize AudioContext (helps with autoplay in some browsers)
    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass && !audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }
    } catch {
      // AudioContext not supported, continue without it
    }

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
  // Detect interaction early via multiple event types
  // Play pending sound on first interaction
  useEffect(() => {
    if (hasInteractedRef.current) return; // Already interacted

    const markInteracted = () => {
      if (hasInteractedRef.current) return; // Prevent duplicate handling
      hasInteractedRef.current = true;

      // Remember interaction for future sessions
      if (typeof window !== 'undefined') {
        localStorage.setItem(INTERACTION_KEY, 'true');
      }

      // Resume AudioContext if suspended (helps with some browsers)
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {});
      }

      // Play pending sound on first interaction
      if (pendingSoundRef.current && !isMuted) {
        const sound = pendingSoundRef.current;
        pendingSoundRef.current = null;

        if (sound === 'shuffleanddeal' && shuffleAndDealAudioRef.current) {
          shuffleAndDealAudioRef.current.currentTime = 0;
          shuffleAndDealAudioRef.current.play().catch(() => {});
        } else if (sound === 'shuffle' && shuffleAudioRef.current) {
          shuffleAudioRef.current.currentTime = 0;
          shuffleAudioRef.current.play().catch(() => {});
        }
      }

      // Remove all listeners after first interaction
      cleanup();
    };

    const cleanup = () => {
      document.removeEventListener('click', markInteracted);
      document.removeEventListener('touchstart', markInteracted);
      document.removeEventListener('touchend', markInteracted);
      document.removeEventListener('keydown', markInteracted);
      document.removeEventListener('scroll', markInteracted);
    };

    // Listen to multiple interaction types for earlier detection
    document.addEventListener('click', markInteracted, { once: true, passive: true });
    document.addEventListener('touchstart', markInteracted, { once: true, passive: true });
    document.addEventListener('touchend', markInteracted, { once: true, passive: true });
    document.addEventListener('keydown', markInteracted, { once: true, passive: true });
    document.addEventListener('scroll', markInteracted, { once: true, passive: true });

    return cleanup;
  }, [isMuted]);

  const playShuffleAndDealSound = useCallback(() => {
    if (isMuted || !shuffleAndDealAudioRef.current) return;

    // Always attempt to play immediately (browser may block, but we try)
    try {
      shuffleAndDealAudioRef.current.currentTime = 0;
      shuffleAndDealAudioRef.current.play().catch((error) => {
        // If blocked by autoplay policy, queue for first interaction
        if (error.name === 'NotAllowedError' || error.name === 'NotSupportedError') {
          pendingSoundRef.current = 'shuffleanddeal';
        }
      });
    } catch {
      // Gracefully handle any errors
      pendingSoundRef.current = 'shuffleanddeal';
    }
  }, [isMuted]);

  const playFlipSound = useCallback(() => {
    if (isMuted || !flipAudioRef.current) return;

    // Flip sounds are always triggered by user clicks, so no interaction check needed
    // Mark as interacted since user clearly clicked
    hasInteractedRef.current = true;

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
    if (isMuted || !flip2AudioRef.current) return;

    // Flip sounds are always triggered by user clicks, so no interaction check needed
    // Mark as interacted since user clearly clicked
    hasInteractedRef.current = true;

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
    if (isMuted || !shuffleAudioRef.current) return;

    // Try to play immediately (for redraw and restored sessions)
    try {
      shuffleAudioRef.current.currentTime = 0;
      shuffleAudioRef.current.play().catch((error) => {
        // If blocked by autoplay policy, queue for first interaction
        if (error.name === 'NotAllowedError' || error.name === 'NotSupportedError') {
          pendingSoundRef.current = 'shuffle';
        }
      });
    } catch {
      // Gracefully handle any errors
      pendingSoundRef.current = 'shuffle';
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
