'use client';

import Link from 'next/link';
import { useIsNative } from '@/lib/useNative';

export function HomeHeroActions() {
  const isNative = useIsNative();

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8 max-w-xs sm:max-w-none mx-auto">
      <Link
        href="/learn"
        className="px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md text-center"
      >
        Start Learning →
      </Link>

      {!isNative && (
        <a
          href="https://github.com/ML204/ML204/releases/latest/download/app.apk"
          className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md text-center flex items-center justify-center gap-2"
        >
          <span>📱</span>
          <span>Download APK</span>
        </a>
      )}

      <Link
        href="/resources"
        className="px-6 py-3 bg-brand-50 text-brand-700 font-semibold rounded-xl border border-brand-200 hover:bg-brand-100 active:scale-95 transition-all duration-200 shadow-xs text-center flex items-center justify-center gap-2"
      >
        <span>📚</span>
        <span>Resources</span>
      </Link>

      <Link
        href="/about"
        className="px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 active:scale-95 transition-all duration-200 hover:border-slate-400 text-center"
      >
        About ML204
      </Link>
    </div>
  );
}
