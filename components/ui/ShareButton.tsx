'use client';

import { useState, useEffect } from 'react';
import { Share2 } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  className?: string;
}

export function ShareButton({ title, text, url, className = '' }: ShareButtonProps) {
  const [isStandalone, setIsStandalone] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    // Check if running as installed PWA (standalone mode)
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(standalone);
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  // Only show in standalone mode (PWA), not in browser
  if (!isStandalone) {
    return null;
  }

  const handleShare = async () => {
    const shareUrl = url || window.location.href;

    if (canShare) {
      try {
        await navigator.share({
          title,
          text: text || title,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed - that's okay
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        // Could add a toast notification here
      } catch (err) {
        console.error('Copy failed:', err);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`p-2 hover:bg-gray-800 rounded-lg transition-colors ${className}`}
      aria-label={`Share ${title}`}
    >
      <Share2 className="w-5 h-5 text-gray-400 hover:text-gray-300" />
    </button>
  );
}
