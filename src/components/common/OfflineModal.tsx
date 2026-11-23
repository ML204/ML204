'use client';

import { useEffect } from 'react';

interface OfflineModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName?: string;
}

export function OfflineModal({ isOpen, onClose, fileName }: OfflineModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Offline status indicator */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 shadow-inner">
          <span className="text-2xl select-none">📡</span>
        </div>

        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200 mb-2">
          No Internet Connection
        </span>

        <h3 className="text-lg font-bold text-slate-900 mb-1">
          You are offline
        </h3>

        <p className="text-sm font-medium text-slate-700 mb-4">
          Connect to the internet to download this study resource.
        </p>

        {fileName && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 mb-6 text-xs font-mono text-slate-600 truncate max-w-full">
            📄 {fileName}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold tracking-wide transition-all active:scale-[0.98] shadow-sm"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
