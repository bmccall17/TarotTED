/**
 * Social Media Handle Utilities for Tag Pack feature
 */

// Organization handles (constants)
export const ORG_HANDLES = {
  twitter: {
    ted: 'TED',
    tedx: 'TEDx',
  },
  bluesky: {
    ted: 'ted.com',
  },
} as const;

/**
 * Normalize a social media handle by removing @ prefix and trimming whitespace
 * Handles comma-separated multiple handles
 */
export function normalizeHandle(handle: string): string {
  if (!handle) return '';

  return handle
    .split(',')
    .map((h) => h.trim().replace(/^@/, ''))
    .filter(Boolean)
    .join(', ');
}

/**
 * Validate Twitter/X handle format
 * Rules: alphanumeric + underscore, max 15 chars per handle
 */
export function isValidTwitterHandle(handle: string): boolean {
  if (!handle) return true; // Empty is valid (optional field)

  const handles = handle.split(',').map((h) => h.trim().replace(/^@/, ''));

  return handles.every((h) => {
    if (!h) return true;
    // Twitter handle: 1-15 chars, alphanumeric + underscore
    return /^[a-zA-Z0-9_]{1,15}$/.test(h);
  });
}

/**
 * Validate Bluesky handle format
 * Rules: domain-like format (e.g., user.bsky.social)
 */
export function isValidBlueskyHandle(handle: string): boolean {
  if (!handle) return true; // Empty is valid (optional field)

  const handles = handle.split(',').map((h) => h.trim().replace(/^@/, ''));

  return handles.every((h) => {
    if (!h) return true;
    // Bluesky handle: domain-like format
    // Allow: letters, numbers, dots, hyphens
    return /^[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]$/.test(h) || /^[a-zA-Z0-9]$/.test(h);
  });
}

/**
 * Format tag pack for a specific platform
 * Includes speaker handle(s) and optionally org handle
 */
export function formatTagPack(
  platform: 'twitter' | 'bluesky',
  speakerHandle: string | null | undefined,
  includeOrg: boolean = true
): string {
  const parts: string[] = [];

  if (speakerHandle) {
    const handles = speakerHandle.split(',').map((h) => h.trim());
    handles.forEach((h) => {
      if (h) {
        parts.push(`@${h.replace(/^@/, '')}`);
      }
    });
  }

  if (includeOrg) {
    if (platform === 'twitter') {
      parts.push(`@${ORG_HANDLES.twitter.ted}`);
    } else if (platform === 'bluesky') {
      parts.push(`@${ORG_HANDLES.bluesky.ted}`);
    }
  }

  return parts.join(' ');
}

/**
 * Format tag pack for both platforms
 */
export function formatAllTagPacks(
  twitterHandle: string | null | undefined,
  blueskyHandle: string | null | undefined,
  includeOrg: boolean = true
): { twitter: string; bluesky: string } {
  return {
    twitter: formatTagPack('twitter', twitterHandle, includeOrg),
    bluesky: formatTagPack('bluesky', blueskyHandle, includeOrg),
  };
}
