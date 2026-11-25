'use client';

import { useState, useEffect } from 'react';

interface ExplainInOwnWordsProps {
  subchapterSlug: string;
  topicTitle: string;
  referenceChecklist: string[];
}

export function ExplainInOwnWords({
  subchapterSlug,
  topicTitle,
  referenceChecklist,
}: ExplainInOwnWordsProps) {
  const STORAGE_KEY = `mltheta:explain:${subchapterSlug}`;
  const LEGACY_STORAGE_KEY = `ml204:explain:${subchapterSlug}`;
  const OLD_LEGACY_STORAGE_KEY = `mlens:explain:${subchapterSlug}`;
  const [text, setText] = useState('');
  const [showChecklist, setShowChecklist] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedText =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem(LEGACY_STORAGE_KEY) ||
      localStorage.getItem(OLD_LEGACY_STORAGE_KEY);
    if (savedText) setText(savedText);
  }, [STORAGE_KEY, LEGACY_STORAGE_KEY, OLD_LEGACY_STORAGE_KEY]);

  function handleChange(val: string) {
    setText(val);
    localStorage.setItem(STORAGE_KEY, val);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="my-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">✍️</span>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Active Recall Practice
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Explain {topicTitle} in your own words
            </h3>
          </div>
        </div>

        {saved && (
          <span className="text-xs text-green-600 font-medium animate-pulse">
            Saved
          </span>
        )}
      </div>

      <p className="text-xs text-slate-500 mb-3 leading-relaxed">
        Imagine you are explaining this idea to a friend or classmate with no math background.
        Writing it out forces your brain to bridge gaps in your intuition.
      </p>

      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={`"To explain ${topicTitle}, I would say..."`}
        rows={4}
        className="w-full text-sm p-3.5 rounded-xl border border-slate-200 bg-slate-50/50
                   focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400
                   transition-all placeholder:text-slate-400"
      />

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={() => setShowChecklist(!showChecklist)}
          className="text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors"
        >
          {showChecklist ? 'Hide self-check criteria ▲' : 'Check your explanation criteria ▼'}
        </button>

        <span className="text-[11px] text-slate-400">
          Saved locally on your device
        </span>
      </div>

      {showChecklist && (
        <div className="mt-3 p-4 rounded-xl bg-brand-50/50 border border-brand-100 text-xs">
          <p className="font-semibold text-slate-700 mb-2">
            Did your explanation touch on these points?
          </p>
          <ul className="space-y-1.5 text-slate-600">
            {referenceChecklist.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="text-brand-500 font-bold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
