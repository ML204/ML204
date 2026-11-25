'use client';

import Link from 'next/link';
import { useMobileNav } from '@/components/layout/MobileNavContext';

export function SiteHeader() {
  const { toggle, isOpen } = useMobileNav();

  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-[var(--header-height)]
                        flex items-center px-4 md:px-6
                        bg-[#fcfaf3]/95 backdrop-blur border-b border-[#dbd1b5] shadow-[0_1px_3px_0_rgba(70,60,40,0.05)]">
      {/* Mobile Menu Button */}
      <button
        onClick={toggle}
        className="md:hidden mr-3 p-2 -ml-1.5 rounded-lg text-stone-700 hover:text-stone-900 hover:bg-[#f2ecda] transition-colors"
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
      <Link href="/" className="flex items-center gap-2 font-bold text-stone-900 mr-8">
        <span className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white text-sm font-black shadow-sm">
          M
        </span>
        <span className="text-lg tracking-tight">
          ML<span className="text-brand-600">Theta</span>
        </span>
      </Link>

      {/* Desktop Nav links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-700">
        <Link href="/" className="hover:text-brand-700 transition-colors">Home</Link>
        <Link href="/learn" className="hover:text-brand-700 transition-colors">Curriculum</Link>
        <Link href="/resources" className="hover:text-brand-700 transition-colors">Resources</Link>
        <Link href="/#contents" className="hover:text-brand-700 transition-colors">Contents</Link>
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2.5">
        {/* Language toggle placeholder */}
        <button
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium
                     text-stone-700 rounded-lg border border-[#dbd1b5] bg-[#faf6eb] hover:bg-[#efe7d2] transition-colors"
          title="Bangla coming soon"
          disabled
        >
          🌐 EN
        </button>
      </div>
    </header>
  );
}
