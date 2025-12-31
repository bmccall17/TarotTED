'use client';

import { useState, useEffect } from 'react';

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

const TIME_INVOCATIONS: Record<TimeOfDay, string> = {
  morning: 'What wisdom does today hold?',
  afternoon: 'What insight calls to you now?',
  evening: 'What does the sunset reveal?',
  night: 'What speaks in the stillness?',
};

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

type InvocationProps = {
  journalPrompts?: string[][];
};

export function Invocation({ journalPrompts }: InvocationProps) {
  const [mounted, setMounted] = useState(false);
  const [invocation, setInvocation] = useState<string | null>(null);
  const [showInvocation, setShowInvocation] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!journalPrompts || journalPrompts.length === 0) {
      // No prompts yet, stay hidden
      return;
    }

    // Get the ones digit of the current minute
    const onesDigit = new Date().getMinutes() % 10;

    let selectedPrompt: string | null = null;

    if (onesDigit === 0) {
      // Use time-of-day fallback
      selectedPrompt = TIME_INVOCATIONS[getTimeOfDay()];
    } else {
      // Map ones digit to card index and prompt index
      // 1,2,3 → card 0, prompts 0,1,2
      // 4,5,6 → card 1, prompts 0,1,2
      // 7,8,9 → card 2, prompts 0,1,2
      const cardIndex = Math.floor((onesDigit - 1) / 3);
      const promptIndex = (onesDigit - 1) % 3;

      const cardPrompts = journalPrompts[cardIndex];
      if (cardPrompts && cardPrompts[promptIndex]) {
        selectedPrompt = cardPrompts[promptIndex];
      } else {
        // Fallback if prompt doesn't exist
        selectedPrompt = TIME_INVOCATIONS[getTimeOfDay()];
      }
    }

    setInvocation(selectedPrompt);

    // Trigger fade-in after a brief delay (cards have appeared)
    const timer = setTimeout(() => {
      setShowInvocation(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [journalPrompts]);

  // Prevent hydration mismatch - show placeholder until mounted
  if (!mounted) {
    return (
      <p className="text-indigo-300/70 text-sm md:text-base italic h-6">
        &nbsp;
      </p>
    );
  }

  // Show empty space while waiting for cards to load
  if (!invocation) {
    return (
      <p className="text-indigo-300/70 text-sm md:text-base italic h-6">
        &nbsp;
      </p>
    );
  }

  return (
    <p
      className={`
        text-indigo-300/70 text-sm md:text-base italic
        transition-all duration-700 ease-out
        ${showInvocation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      {invocation}
    </p>
  );
}
