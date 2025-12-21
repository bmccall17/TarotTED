'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

type Props = {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
};

export function Toast({ message, type, onClose, duration = 5000 }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const Icon = type === 'success' ? CheckCircle : XCircle;
  const bgColor = type === 'success' ? 'bg-green-900/90' : 'bg-red-900/90';
  const borderColor = type === 'success' ? 'border-green-500/50' : 'border-red-500/50';
  const textColor = type === 'success' ? 'text-green-100' : 'text-red-100';
  const iconColor = type === 'success' ? 'text-green-400' : 'text-red-400';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div
        className={`flex items-center gap-3 ${bgColor} border ${borderColor} ${textColor} rounded-lg shadow-lg px-4 py-3 min-w-[300px]`}
      >
        <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0`} />
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
