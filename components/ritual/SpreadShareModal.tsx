'use client';

import { useState } from 'react';
import { X, Copy, ExternalLink } from 'lucide-react';

const POSITION_LABELS = ['Aware Self', 'Supporting Shadow', 'Emerging Path'];
const GPT_URL = 'https://chatgpt.com/g/g-6965a1a328ec8191bc976bd89d963972-tarottalks-spread-reader';

type CardData = {
  id: string;
  name: string;
};

interface SpreadShareModalProps {
  cards: CardData[];
  revealedCards: number[];
  onClose: () => void;
}

export function SpreadShareModal({ cards, revealedCards, onClose }: SpreadShareModalProps) {
  const [copied, setCopied] = useState(false);

  // Build the spread text from revealed cards in position order
  const getSpreadText = () => {
    const parts: string[] = [];

    // Sort revealed indices to maintain position order
    const sortedIndices = [...revealedCards].sort((a, b) => a - b);

    for (const index of sortedIndices) {
      const card = cards[index];
      if (card) {
        parts.push(`${POSITION_LABELS[index]}: ${card.name}`);
      }
    }

    return parts.join(', ');
  };

  const spreadText = getSpreadText();

  const handleCopyAndContinue = async () => {
    try {
      await navigator.clipboard.writeText(spreadText);
      setCopied(true);

      // Open GPT in new tab
      window.open(GPT_URL, '_blank', 'noopener,noreferrer');

      // Close modal after a brief delay
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Still open GPT even if copy fails
      window.open(GPT_URL, '_blank', 'noopener,noreferrer');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl border border-gray-700 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-gray-100">Share Your Spread</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-400">
            Copy your spread below, then paste it into the GPT to get your reading.
          </p>

          {/* Spread Text Box */}
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
            <p className="text-gray-100 text-sm leading-relaxed font-medium">
              {spreadText}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCopyAndContinue}
              className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Copy className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  Copy & Continue
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
