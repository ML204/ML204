'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toc } from '@/lib/toc';
import { useMobileNav } from '@/components/layout/MobileNavContext';
import { useCompletedSlugs } from '@/lib/progress';

export function Sidebar() {
  const { isOpen, close } = useMobileNav();
  const completed = useCompletedSlugs();
  const [search, setSearch] = useState('');

  // Total topics in TOC
  const totalTopics = toc.reduce(
    (acc, part) => acc + part.chapters.reduce((cAcc, chap) => cAcc + chap.subchapters.length, 0),
    0
  );
  const doneCount = completed.size;
  const progressPct = totalTopics > 0 ? Math.round((doneCount / totalTopics) * 100) : 0;

  // Filtered TOC based on search
  const query = search.trim().toLowerCase();

  return (
    <>
      {/* Mobile Dimmed Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity animate-in fade-in duration-200"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed left-0 top-0 md:top-[var(--header-height)] bottom-0
          h-full md:h-[calc(100vh-var(--header-height))]
          w-[300px] max-w-[85vw] md:w-[var(--sidebar-width)]
          bg-white border-r border-slate-200 overflow-hidden z-50
          shadow-2xl md:shadow-none
          transition-transform duration-300 ease-out flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Mobile Drawer Header (Hidden on Desktop) */}
        <div className="flex items-center justify-between px-5 h-[var(--header-height)] border-b border-slate-100 md:hidden flex-shrink-0">
          <Link href="/" onClick={close} className="flex items-center gap-2 font-bold text-slate-900">
            <span className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white text-sm font-black shadow-sm">
              M
            </span>
            <span className="text-lg tracking-tight">
              ML<span className="text-brand-600">ens</span>
            </span>
          </Link>

          <button
            onClick={close}
            className="p-2 -mr-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search & Quick Progress Header */}
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex-shrink-0 space-y-2.5">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter topics (e.g. matrix, loss)..."
              className="w-full text-xs pl-7 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white
                         focus:outline-none focus:ring-1 focus:ring-brand-500 placeholder:text-slate-400"
            />
            <span className="absolute left-2.5 top-1.5 text-slate-400 text-xs">🔍</span>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Mastery Progress Bar */}
          <div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 mb-1">
              <span className="font-semibold text-slate-700">Checklist Mastery</span>
              <span className="font-mono text-brand-600 font-bold">{doneCount} / {totalTopics} ({progressPct}%)</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <nav className="p-3 flex-1 overflow-y-auto">
          {/* Quick links to curriculum and resources */}
          <div className="pb-2.5 mb-2 border-b border-slate-100 space-y-1.5">
            <Link
              href="/learn"
              onClick={close}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-brand-50 hover:text-brand-600 rounded-lg border border-slate-200 transition-colors group"
            >
              <span>🧭</span>
              <span>All Curriculum Directory</span>
              <span className="ml-auto text-slate-400 group-hover:text-brand-600">→</span>
            </Link>
            <Link
              href="/resources"
              onClick={close}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-brand-50 hover:text-brand-600 rounded-lg border border-slate-200 transition-colors group"
            >
              <span>📚</span>
              <span>Resources & GitHub Code</span>
              <span className="ml-auto text-slate-400 group-hover:text-brand-600">→</span>
            </Link>
          </div>

          {toc.map((part) => {
            // Check if matches query
            const filteredChapters = part.chapters.map((chap) => {
              const matchedSubs = chap.subchapters.filter((sub) =>
                !query || sub.title.toLowerCase().includes(query) || chap.title.toLowerCase().includes(query)
              );
              return { ...chap, subchapters: matchedSubs };
            }).filter((chap) => chap.subchapters.length > 0);

            if (query && filteredChapters.length === 0) return null;

            return (
              <div key={part.slug} className="mb-3">
                {/* Part heading */}
                <Link
                  href={`/learn/${part.slug}`}
                  onClick={close}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-slate-600 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors group"
                >
                  <span className="text-sm">{part.icon}</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-brand-600">
                    {part.title}
                  </span>
                </Link>

                {/* Chapters */}
                {filteredChapters.map((chapter) => (
                  <div key={chapter.slug} className="mt-1 mb-2">
                    <Link
                      href={`/learn/${part.slug}/${chapter.slug}`}
                      onClick={close}
                      className="block px-5 py-0.5 text-[11px] font-semibold text-slate-400 hover:text-brand-600 transition-colors uppercase tracking-wide"
                    >
                      {chapter.title}
                    </Link>

                    <div className="space-y-0.5 mt-0.5">
                      {chapter.subchapters.map((sub) => {
                        const isDone = completed.has(sub.slug);

                        return (
                          <Link
                            key={sub.slug}
                            href={`/learn/${part.slug}/${chapter.slug}/${sub.slug}`}
                            onClick={close}
                            className={`flex items-center gap-2 px-6 py-1.5 text-xs rounded-lg transition-colors group ${
                              isDone
                                ? 'text-slate-800 font-medium hover:bg-green-50'
                                : 'text-slate-600 hover:text-brand-600 hover:bg-brand-50'
                            }`}
                          >
                            {isDone ? (
                              <span className="w-4 h-4 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                ✓
                              </span>
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-brand-400 flex-shrink-0 ml-1.5" />
                            )}
                            <span className="truncate">{sub.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </nav>

        {/* About Section at the bottom */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/80 flex-shrink-0">
          <div className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-2xs">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-5 h-5 rounded-md bg-brand-600 text-white flex items-center justify-center text-[10px] font-black">
                M
              </span>
              <Link
                href="/about"
                onClick={close}
                className="text-xs font-bold text-slate-800 hover:text-brand-600 transition-colors flex items-center gap-1 group"
              >
                <span>About ML<span className="text-brand-600">ens</span></span>
                <span className="text-slate-400 group-hover:text-brand-600">→</span>
              </Link>
              <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-brand-50 text-brand-600 border border-brand-200/60">
                v1.0.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-2.5">
              An open-source interactive textbook with visual geometry, live sliders, and intuitive quiz notes for high school & university students.
            </p>

            {/* Android APK Download link */}
            <a
              href="https://github.com/hamimLohani/mlens/releases/download/v1.0.0/app.apk"
              className="flex items-center justify-center gap-1.5 w-full py-1.5 px-2 mb-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
            >
              <span>📱</span>
              <span>Download App (v1.0.0 APK)</span>
            </a>

            <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 pt-2 border-t border-slate-100">
              <Link
                href="/about"
                onClick={close}
                className="hover:text-brand-600 transition-colors flex items-center gap-1"
              >
                <span>ℹ️</span> About
              </Link>
              <Link
                href="/resources"
                onClick={close}
                className="hover:text-brand-600 transition-colors flex items-center gap-1"
              >
                <span>📚</span> Resources
              </Link>
              <Link
                href="/credits"
                onClick={close}
                className="hover:text-brand-600 transition-colors flex items-center gap-1"
              >
                <span>⚖️</span> Credits
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
