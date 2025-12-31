'use client';

import { useState, useEffect } from 'react';

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

const INVOCATIONS: Record<TimeOfDay, string> = {
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

export function Invocation() {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeOfDay(getTimeOfDay());
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <p className="text-indigo-300/70 text-sm md:text-base italic animate-gentle-pulse h-6">
        &nbsp;
      </p>
    );
  }

  return (
    <p className="text-indigo-300/70 text-sm md:text-base italic animate-gentle-pulse">
      {INVOCATIONS[timeOfDay]}
    </p>
  );
}
