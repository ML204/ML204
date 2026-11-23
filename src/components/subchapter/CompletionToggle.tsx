'use client';

import { useState, useEffect } from 'react';
import { isComplete, toggleComplete } from '@/lib/progress';

interface CompletionToggleProps {
  slug: string;
}

export function CompletionToggle({ slug }: CompletionToggleProps) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDone(isComplete(slug));
  }, [slug]);

  function handleToggle() {
    const nextState = toggleComplete(slug);
    setDone(nextState);
  }

  return (
    <div className="my-6 p-4 rounded-xl border border-[#ded5bd] bg-[#fcfaf2]/95 flex items-center justify-between gap-4 shadow-2xs">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{done ? '🏆' : '🎯'}</span>
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {done ? 'Topic Mastered!' : 'Mastered this concept?'}
          </p>
          <p className="text-xs text-slate-500">
            {done
              ? 'Marked as finished in your curriculum progress.'
              : 'Tick this box when you feel confident explaining it.'}
          </p>
        </div>
      </div>

      <button
        onClick={handleToggle}
        className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
          done
            ? 'bg-green-600 text-white border-green-600 shadow-sm hover:bg-green-700'
            : 'bg-white text-slate-700 border-slate-300 hover:border-brand-400 hover:bg-brand-50'
        }`}
      >
        {done ? '✓ Completed' : 'Mark as Complete'}
      </button>
    </div>
  );
}
