'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'tarotted-ritual-state';
const EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

type LayoutMode = 'stacked' | 'spread-2' | 'spread-3';

export type RitualState = {
  cardSlugs: string[];
  revealedIndices: number[];
  layoutMode: LayoutMode;
  timestamp: number;
};

/**
 * State persistence hook for ritual page
 *
 * Saves ritual state (3 card slugs, reveal indices, layout mode) to sessionStorage
 * with 30-minute expiry. Enables back navigation from card/talk detail pages
 * to restore the same ritual state.
 */
export function useRitualState() {
  const [hasRestoredState, setHasRestoredState] = useState(false);

  // Save ritual state to sessionStorage
  const saveRitualState = useCallback((state: Omit<RitualState, 'timestamp'>) => {
    if (typeof window === 'undefined') return;

    try {
      const ritualState: RitualState = {
        ...state,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ritualState));
    } catch (error) {
      console.warn('Failed to save ritual state:', error);
    }
  }, []);

  // Load ritual state from sessionStorage
  const loadRitualState = useCallback((): RitualState | null => {
    if (typeof window === 'undefined') return null;

    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const state: RitualState = JSON.parse(stored);
      const age = Date.now() - state.timestamp;

      // Check if state has expired
      if (age > EXPIRY_MS) {
        sessionStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return state;
    } catch (error) {
      console.warn('Failed to load ritual state:', error);
      return null;
    }
  }, []);

  // Clear ritual state from sessionStorage
  const clearRitualState = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear ritual state:', error);
    }
  }, []);

  // Check if there's a saved ritual state available
  const hasSavedState = useCallback((): boolean => {
    const state = loadRitualState();
    return state !== null;
  }, [loadRitualState]);

  // Mark that we've restored state (prevents double restoration)
  const markRestored = useCallback(() => {
    setHasRestoredState(true);
  }, []);

  return {
    saveRitualState,
    loadRitualState,
    clearRitualState,
    hasSavedState,
    hasRestoredState,
    markRestored,
  };
}
