'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toc } from '@/lib/toc';
import { useMobileNav } from '@/components/layout/MobileNavContext';
import { useCompletedSlugs } from '@/lib/progress';
import { CURRENT_APP_VERSION } from '@/lib/appUpdater';

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
          bg-[#ede5cb] border-r border-[#d4c6a0] overflow-hidden z-50
          shadow-2xl md:shadow-[1px_0_3px_0_rgba(0,0,0,0.03)]
          transition-transform duration-300 ease-out flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Mobile Drawer Header (Hidden on Desktop) */}
        <div className="flex items-center justify-between px-5 h-[var(--header-height)] border-b border-[#d4c6a0] md:hidden flex-shrink-0 bg-[#eae1c5]">
          <Link href="/" onClick={close} className="flex items-center gap-2.5 font-bold text-stone-900">
            <Image
              src="/logo.png"
              alt="MLTheta Logo"
              width={28}
              height={28}
              className="w-7 h-7 object-contain drop-shadow-xs"
            />
            <span className="text-lg tracking-tight">
              ML<span className="text-brand-600">Theta</span>
            </span>
          </Link>

          <button
            onClick={close}
            className="p-2 -mr-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-[#ded1af] transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search & Quick Progress Header */}
        <div className="p-3.5 border-b border-[#d4c6a0] bg-[#e5dcbf]/85 flex-shrink-0 space-y-2.5">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter topics (e.g. matrix, loss)..."
              className="w-full text-xs pl-7 pr-3 py-1.5 rounded-lg border border-[#cbbe99] bg-[#faf6eb] text-stone-900
                         focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white placeholder:text-stone-500"
            />
            <span className="absolute left-2.5 top-1.5 text-stone-400 text-xs">🔍</span>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1.5 text-stone-500 hover:text-stone-800 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Mastery Progress Bar */}
          <div>
            <div className="flex justify-between items-center text-[11px] text-stone-700 mb-1">
              <span className="font-semibold text-stone-900">Checklist Mastery</span>
              <span className="font-mono text-brand-800 font-bold">{doneCount} / {totalTopics} ({progressPct}%)</span>
            </div>
            <div className="h-1.5 w-full bg-[#d2c49c] rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <nav className="p-3 flex-1 overflow-y-auto">
          {/* Quick links to curriculum and resources */}
          <div className="pb-2.5 mb-2 border-b border-[#d4c6a0] space-y-1.5">
            <Link
              href="/learn"
              onClick={close}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-stone-900 bg-[#f5eed7] hover:bg-[#ded1af] hover:text-brand-700 rounded-lg border border-[#d2c49c] transition-colors group shadow-2xs"
            >
              <span>🧭</span>
              <span>All Curriculum Directory</span>
              <span className="ml-auto text-stone-400 group-hover:text-brand-700">→</span>
            </Link>
            <Link
              href="/resources"
              onClick={close}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-stone-900 bg-[#f5eed7] hover:bg-[#ded1af] hover:text-brand-700 rounded-lg border border-[#d2c49c] transition-colors group shadow-2xs"
            >
              <span>📚</span>
              <span>Resources & GitHub Code</span>
              <span className="ml-auto text-stone-400 group-hover:text-brand-700">→</span>
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
                  className="flex items-center gap-2 px-2.5 py-1.5 text-stone-800 hover:text-brand-700 hover:bg-[#ded1af] rounded-lg transition-colors group"
                >
                  <span className="text-sm">{part.icon}</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-brand-700">
                    {part.title}
                  </span>
                </Link>

                {/* Chapters */}
                {filteredChapters.map((chapter) => (
                  <div key={chapter.slug} className="mt-1 mb-2">
                    <Link
                      href={`/learn/${part.slug}/${chapter.slug}`}
                      onClick={close}
                      className="block px-5 py-0.5 text-[11px] font-semibold text-stone-600 hover:text-brand-700 transition-colors uppercase tracking-wide"
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
                                ? 'text-stone-900 font-medium hover:bg-emerald-100/70'
                                : 'text-stone-700 hover:text-brand-700 hover:bg-[#ded1af]'
                            }`}
                          >
                            {isDone ? (
                              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                ✓
                              </span>
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-stone-400 group-hover:bg-brand-500 flex-shrink-0 ml-1.5" />
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
        <div className="p-3 border-t border-[#d4c6a0] bg-[#e5dcbf]/85 flex-shrink-0">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-[#d2c49c] bg-[#f5eed7] shadow-2xs">
            <Link
              href="/about"
              onClick={close}
              className="text-xs font-bold text-stone-900 hover:text-brand-700 transition-colors flex items-center gap-2 group"
            >
              <Image
                src="/logo.png"
                alt="MLTheta Logo"
                width={20}
                height={20}
                className="w-5 h-5 object-contain"
              />
              <span>About ML<span className="text-brand-600">Theta</span></span>
              <span className="text-stone-400 group-hover:text-brand-700">→</span>
            </Link>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#ded1af] text-stone-900 border border-[#cbbe99] font-mono">
              v{CURRENT_APP_VERSION}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
