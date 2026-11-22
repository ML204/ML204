'use client';

import { useState } from 'react';
import { offlineQueue } from '@/lib/offlineQueue';

interface FeedbackBarProps {
  subchapterSlug: string;
}

export function FeedbackBar({ subchapterSlug }: FeedbackBarProps) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState('');
  const [sent, setSent] = useState(false);

  function pick(v: string) {
    setChosen(v);
    offlineQueue.enqueue('rating', subchapterSlug, { rating: v });
  }

  function sendSuggestion() {
    if (!suggestion.trim()) return;
    offlineQueue.enqueue('suggestion', subchapterSlug, { text: suggestion.trim() });
    setSent(true);
  }

  return (
    <div className="mt-10 pt-8 border-t border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-sm font-semibold text-slate-700">Was this clear?</p>
        <div className="flex gap-2">
          {[
            { label: '😊 Yes', value: 'yes' },
            { label: '😐 Somewhat', value: 'somewhat' },
            { label: '😕 Not yet', value: 'no' },
          ].map(({ label, value }) => (
            <button
              key={value}
              onClick={() => pick(value)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                chosen === value
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Suggestion box */}
      <div className="mt-4">
        {sent ? (
          <p className="text-sm text-green-600 font-medium">✅ Thanks for the feedback!</p>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="Suggest a correction or improvement…"
              className="flex-1 text-sm px-3 py-2 rounded-xl border border-slate-300
                         focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white"
              onKeyDown={(e) => e.key === 'Enter' && sendSuggestion()}
            />
            <button
              onClick={sendSuggestion}
              className="px-4 py-2 text-sm font-medium rounded-xl bg-slate-100 text-slate-700
                         hover:bg-slate-200 transition-colors border border-slate-200"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
