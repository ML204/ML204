'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toc } from '@/lib/toc';

export function Sidebar() {
  const [open, setOpen] = useState(true);

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-white border border-slate-200 shadow-sm"
        onClick={() => setOpen(!open)}
        aria-label="Toggle sidebar"
      >
        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-[var(--header-height)] h-[calc(100vh-var(--header-height))]
          w-[var(--sidebar-width)] bg-white border-r border-slate-200 overflow-y-auto z-40
          transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0`}
      >
        <nav className="py-4">
          {/* Quick link to full curriculum */}
          <div className="px-4 pb-3 mb-2 border-b border-slate-100">
            <Link
              href="/learn"
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-brand-50 hover:text-brand-600 rounded-xl border border-slate-200 transition-colors group"
            >
              <span className="text-sm">📚</span>
              <span>All Curriculum</span>
              <span className="ml-auto text-slate-400 group-hover:text-brand-600">→</span>
            </Link>
          </div>

          {toc.map((part) => (
            <div key={part.slug} className="mb-2">
              {/* Part heading */}
              <Link
                href={`/learn/${part.slug}`}
                className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-brand-600 transition-colors group"
              >
                <span className="text-base">{part.icon}</span>
                <span className="text-xs font-bold uppercase tracking-wider group-hover:text-brand-600">
                  {part.title}
                </span>
              </Link>

              {/* Chapters */}
              {part.chapters.map((chapter) => (
                <div key={chapter.slug} className="mb-1">
                  <Link
                    href={`/learn/${part.slug}/${chapter.slug}`}
                    className="block px-6 py-1 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors"
                  >
                    {chapter.title}
                  </Link>
                  {chapter.subchapters.map((sub) => (
                    <Link
                      key={sub.slug}
                      href={`/learn/${part.slug}/${chapter.slug}/${sub.slug}`}
                      className="flex items-center gap-2 px-8 py-1.5 text-sm text-slate-600
                                 hover:text-brand-600 hover:bg-brand-50 rounded-r-lg
                                 transition-colors group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-brand-400 flex-shrink-0" />
                      {sub.title}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
