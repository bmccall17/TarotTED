'use client';

import { useState } from 'react';
import { X, Download, Share, Plus } from 'lucide-react';
import { useInstallPrompt } from '@/lib/hooks/useInstallPrompt';

export function InstallBanner() {
  const { platform, shouldShow, canInstallNatively, promptInstall, dismiss } = useInstallPrompt();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  if (!shouldShow) return null;

  const handleInstallClick = async () => {
    if (canInstallNatively) {
      // Android: trigger native prompt
      await promptInstall();
    } else if (platform === 'ios') {
      // iOS: show instructions
      setShowIOSInstructions(true);
    }
  };

  // iOS Instructions Modal
  if (showIOSInstructions) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-md mx-4 mb-4 bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden animate-slide-up">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Add to Home Screen</h3>
            <button
              onClick={() => {
                setShowIOSInstructions(false);
                dismiss();
              }}
              className="p-1 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">1</span>
              </div>
              <div>
                <p className="text-white font-medium">Tap the Share button</p>
                <p className="text-gray-400 text-sm flex items-center gap-1">
                  Look for <Share className="w-4 h-4 inline" /> at the bottom of Safari
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">2</span>
              </div>
              <div>
                <p className="text-white font-medium">Scroll and tap "Add to Home Screen"</p>
                <p className="text-gray-400 text-sm flex items-center gap-1">
                  Look for <Plus className="w-4 h-4 inline border border-gray-500 rounded" /> Add to Home Screen
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">3</span>
              </div>
              <div>
                <p className="text-white font-medium">Tap "Add"</p>
                <p className="text-gray-400 text-sm">TarotTED will appear on your home screen</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-800/50">
            <button
              onClick={() => {
                setShowIOSInstructions(false);
                dismiss();
              }}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Banner
  return (
    <div className="fixed bottom-[72px] left-0 right-0 z-40 px-4 pb-2 animate-slide-up">
      <div className="max-w-md mx-auto bg-gradient-to-r from-indigo-900/95 to-purple-900/95 border border-indigo-500/30 rounded-xl p-3 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm">Add TarotTED to Home Screen</p>
            <p className="text-indigo-300 text-xs">One-tap access to your readings</p>
          </div>
          <button
            onClick={handleInstallClick}
            className="px-4 py-2 bg-white text-indigo-900 font-semibold text-sm rounded-lg hover:bg-indigo-100 transition-colors flex-shrink-0"
          >
            {platform === 'ios' ? 'How?' : 'Install'}
          </button>
          <button
            onClick={dismiss}
            className="p-1 text-indigo-300 hover:text-white flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
