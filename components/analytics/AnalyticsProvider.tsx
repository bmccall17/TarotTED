'use client';

import { Analytics } from '@vercel/analytics/react';
import { usePathname } from 'next/navigation';

export function AnalyticsProvider() {
  const pathname = usePathname();

  // Don't render Analytics on admin routes at all
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return <Analytics />;
}
