'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CardDetailClientProps {
  uprightMeaning: string | null;
  reversedMeaning: string | null;
  cardName: string;
}

export function CardDetailClient({ uprightMeaning, reversedMeaning, cardName }: CardDetailClientProps) {
  const [showFullMeaning, setShowFullMeaning] = useState(false);
  const [showJournaling, setShowJournaling] = useState(false);

  return (
    <div className="space-y-3">
      {/* Full Meaning Accordion */}
      {(uprightMeaning || reversedMeaning) && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
          <button
            onClick={() => setShowFullMeaning(!showFullMeaning)}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
          >
            <span className="text-gray-300 font-medium">Full Card Meaning</span>
            {showFullMeaning ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {showFullMeaning && (
            <div className="px-4 pb-4 border-t border-gray-700 pt-4 space-y-4 text-sm text-gray-400">
              {uprightMeaning && (
                <div>
                  <p className="text-gray-200 font-medium mb-2">Upright</p>
                  <p>{uprightMeaning}</p>
                </div>
              )}
              {reversedMeaning && (
                <div>
                  <p className="text-gray-200 font-medium mb-2">Reversed</p>
                  <p>{reversedMeaning}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Journaling Prompts Accordion */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <button
          onClick={() => setShowJournaling(!showJournaling)}
          className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
        >
          <span className="text-gray-300 font-medium">Journaling Prompts</span>
          {showJournaling ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        {showJournaling && (
          <div className="px-4 pb-4 border-t border-gray-700 pt-4 space-y-2 text-sm text-gray-400">
            <p>After watching the talks, reflect on these questions:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>What resonated most with me about {cardName}&apos;s message?</li>
              <li>How does the talk deepen my understanding of this archetype?</li>
              <li>Where am I seeing this energy show up in my life right now?</li>
              <li>What action or insight am I being called toward?</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
