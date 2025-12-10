'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CardDetailClientProps {
  uprightMeaning: string | null;
  reversedMeaning: string | null;
  symbolism: string | null;
  adviceWhenDrawn: string | null;
  journalingPrompts: string | null; // JSON array string
  astrologicalCorrespondence: string | null;
  numerologicalSignificance: string | null;
  cardName: string;
}

export function CardDetailClient({
  uprightMeaning,
  reversedMeaning,
  symbolism,
  adviceWhenDrawn,
  journalingPrompts,
  astrologicalCorrespondence,
  numerologicalSignificance,
  cardName
}: CardDetailClientProps) {
  const [showFullMeaning, setShowFullMeaning] = useState(false);
  const [showSymbolism, setShowSymbolism] = useState(false);
  const [showAdvice, setShowAdvice] = useState(false);
  const [showJournaling, setShowJournaling] = useState(false);
  const [showCorrespondences, setShowCorrespondences] = useState(false);

  // Parse journaling prompts if they exist
  let prompts: string[] = [];
  if (journalingPrompts) {
    try {
      prompts = JSON.parse(journalingPrompts);
    } catch (e) {
      console.error('Failed to parse journaling prompts:', e);
    }
  }

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
            <div className="px-4 pb-4 border-t border-gray-700 pt-4 space-y-4 text-sm text-gray-300">
              {uprightMeaning && (
                <div>
                  <p className="text-indigo-300 font-semibold mb-2">Upright</p>
                  <p className="leading-relaxed">{uprightMeaning}</p>
                </div>
              )}
              {reversedMeaning && (
                <div>
                  <p className="text-indigo-300 font-semibold mb-2">Reversed</p>
                  <p className="leading-relaxed">{reversedMeaning}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Symbolism Accordion */}
      {symbolism && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
          <button
            onClick={() => setShowSymbolism(!showSymbolism)}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
          >
            <span className="text-gray-300 font-medium">Symbolism & Imagery</span>
            {showSymbolism ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {showSymbolism && (
            <div className="px-4 pb-4 border-t border-gray-700 pt-4 text-sm text-gray-300 leading-relaxed">
              {symbolism}
            </div>
          )}
        </div>
      )}

      {/* Advice Accordion */}
      {adviceWhenDrawn && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
          <button
            onClick={() => setShowAdvice(!showAdvice)}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
          >
            <span className="text-gray-300 font-medium">Advice When Drawn</span>
            {showAdvice ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {showAdvice && (
            <div className="px-4 pb-4 border-t border-gray-700 pt-4 text-sm text-gray-300 leading-relaxed">
              {adviceWhenDrawn}
            </div>
          )}
        </div>
      )}

      {/* Journaling Prompts Accordion */}
      {prompts.length > 0 && (
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
            <div className="px-4 pb-4 border-t border-gray-700 pt-4 space-y-2 text-sm text-gray-300">
              <p className="text-gray-400 mb-3">Reflect on these questions:</p>
              <ul className="space-y-3">
                {prompts.map((prompt, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="text-indigo-400 font-semibold">{index + 1}.</span>
                    <span className="leading-relaxed">{prompt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Correspondences Accordion */}
      {(astrologicalCorrespondence || numerologicalSignificance) && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
          <button
            onClick={() => setShowCorrespondences(!showCorrespondences)}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
          >
            <span className="text-gray-300 font-medium">Correspondences</span>
            {showCorrespondences ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {showCorrespondences && (
            <div className="px-4 pb-4 border-t border-gray-700 pt-4 space-y-3 text-sm text-gray-300">
              {astrologicalCorrespondence && (
                <div>
                  <p className="text-indigo-300 font-semibold mb-1">Astrological</p>
                  <p className="leading-relaxed">{astrologicalCorrespondence}</p>
                </div>
              )}
              {numerologicalSignificance && (
                <div>
                  <p className="text-indigo-300 font-semibold mb-1">Numerological</p>
                  <p className="leading-relaxed">{numerologicalSignificance}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
