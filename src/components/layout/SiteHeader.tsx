'use client';

import Link from 'next/link';
import { useMobileNav } from '@/components/layout/MobileNavContext';

export function SiteHeader() {
  const { toggle, isOpen } = useMobileNav();

  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-[var(--header-height)]
                        flex items-center px-4 md:px-6
                        bg-white/95 backdrop-blur border-b border-slate-200">
      {/* Mobile Menu Button */}
      <button
        onClick={toggle}
        className="md:hidden mr-3 p-2 -ml-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 mr-8">
        <span className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white text-sm font-black shadow-sm">
          M
        </span>
        <span className="text-lg tracking-tight">
          ML<span className="text-brand-600">204</span>
        </span>
      </Link>

      {/* Desktop Nav links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
        <Link href="/learn" className="hover:text-brand-600 transition-colors">Curriculum</Link>
        <Link href="/resources" className="hover:text-brand-600 transition-colors">Resources</Link>
        <Link href="/#contents" className="hover:text-brand-600 transition-colors">Contents</Link>
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2.5">
        <Link
          href="/learn"
          className="md:hidden text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors"
        >
          Curriculum
        </Link>
        {/* Language toggle placeholder */}
        <button
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium
                     text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          title="Bangla coming soon"
          disabled
        >
          🌐 EN
        </button>
      </div>
    </header>
  );
}
