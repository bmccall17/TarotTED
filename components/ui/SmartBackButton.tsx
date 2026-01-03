'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRitualState } from '@/lib/hooks/useRitualState';

type SmartBackButtonProps = {
  defaultHref: string;
  ritualHref?: string;
  className?: string;
  showText?: boolean;
  text?: string;
};

/**
 * Smart back button that returns to the ritual page if there's saved state,
 * otherwise returns to the default page (e.g., /cards or /talks)
 */
export function SmartBackButton({
  defaultHref,
  ritualHref = '/',
  className = '',
  showText = false,
  text = 'Back',
}: SmartBackButtonProps) {
  const { hasSavedState } = useRitualState();
  const hasRitual = hasSavedState();
  const href = hasRitual ? ritualHref : defaultHref;

  if (showText) {
    return (
      <Link
        href={href}
        className={`text-indigo-400 hover:text-indigo-300 font-medium ${className}`}
      >
        ← {text}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`p-2 hover:bg-gray-800 rounded-lg transition-colors ${className}`}
    >
      <ArrowLeft className="w-5 h-5 text-gray-400" />
    </Link>
  );
}
