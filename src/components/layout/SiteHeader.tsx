import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[var(--header-height)]
                        flex items-center px-4 md:px-6
                        bg-white/90 backdrop-blur border-b border-slate-200">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 mr-8">
        <span className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white text-sm font-black">
          M
        </span>
        <span className="text-lg tracking-tight">
          ML<span className="text-brand-600">ens</span>
        </span>
      </Link>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
        <Link href="/learn" className="hover:text-brand-600 transition-colors">Curriculum</Link>
        <Link href="/#contents" className="hover:text-brand-600 transition-colors">Contents</Link>
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        {/* Language toggle placeholder */}
        <button
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
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
