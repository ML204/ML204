'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toc } from '@/lib/toc';
import { useCompletedSlugs } from '@/lib/progress';

export function CurriculumView() {
  const [query, setQuery] = useState('');
  const completed = useCompletedSlugs();

  const totalTopics = toc.reduce(
    (acc, part) => acc + part.chapters.reduce((cAcc, chap) => cAcc + chap.subchapters.length, 0),
    0
  );
  const doneCount = completed.size;
  const progressPct = totalTopics > 0 ? Math.round((doneCount / totalTopics) * 100) : 0;

  const q = query.trim().toLowerCase();

  return (
    <div>
      {/* Search & Stats Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search topics (e.g. gradient descent, vectors, CNN, entropy, PCA)..."
              className="w-full text-sm pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50
                         focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400
                         placeholder:text-slate-400 transition-all"
            />
            <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 flex-shrink-0 px-2 sm:px-4 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Overall Progress
              </p>
              <p className="text-xs font-bold text-slate-800">
                <span className="text-brand-600 font-mono text-sm">{doneCount}</span> / {totalTopics} completed ({progressPct}%)
              </p>
            </div>
            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Parts List */}
      <div className="space-y-6">
        {toc.map((part) => {
          const matchedChapters = part.chapters.map((chap) => {
            const matchedSubs = chap.subchapters.filter((sub) =>
              !q || sub.title.toLowerCase().includes(q) || chap.title.toLowerCase().includes(q) || part.title.toLowerCase().includes(q)
            );
            return { ...chap, subchapters: matchedSubs };
          }).filter((chap) => chap.subchapters.length > 0);

          if (q && matchedChapters.length === 0) return null;

          const totalSubchapters = part.chapters.reduce((acc, c) => acc + c.subchapters.length, 0);
          const firstSub = part.chapters[0]?.subchapters[0];

          return (
            <div
              key={part.slug}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-brand-300 transition-all"
            >
              <div className="flex items-start justify-between gap-4 p-6 bg-slate-50/50 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                    {part.icon}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                      Part {part.number}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900">
                      <Link href={`/learn/${part.slug}`} className="hover:text-brand-600 transition-colors">
                        {part.title}
                      </Link>
                    </h2>
                  </div>
                </div>

                <Link
                  href={`/learn/${part.slug}`}
                  className="px-4 py-2 text-xs font-semibold text-brand-600 bg-white border border-brand-200 hover:bg-brand-50 rounded-xl transition-colors whitespace-nowrap shadow-2xs"
                >
                  View Part →
                </Link>
              </div>

              {/* Chapters list */}
              <div className="divide-y divide-slate-100">
                {matchedChapters.map((chapter) => (
                  <div key={chapter.slug} className="p-5">
                    <div className="flex items-center justify-between mb-2.5">
                      <Link
                        href={`/learn/${part.slug}/${chapter.slug}`}
                        className="text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-brand-600 transition-colors"
                      >
                        {chapter.title} →
                      </Link>
                      <span className="text-[11px] text-slate-400">
                        {chapter.subchapters.length} topics
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {chapter.subchapters.map((sub) => {
                        const isDone = completed.has(sub.slug);

                        return (
                          <Link
                            key={sub.slug}
                            href={`/learn/${part.slug}/${chapter.slug}/${sub.slug}`}
                            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs group ${
                              isDone
                                ? 'bg-green-50/50 border-green-200 text-green-900'
                                : 'bg-slate-50/50 border-slate-100 hover:border-brand-200 hover:bg-white text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                                isDone ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-600'
                              }`}>
                                {isDone ? '✓' : '•'}
                              </span>
                              <span className="font-medium truncate group-hover:text-brand-600 transition-colors">
                                {sub.title}
                              </span>
                            </div>

                            <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">
                              {sub.estimatedMinutes ? `${sub.estimatedMinutes}m` : ''}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
