'use client';

import Link from 'next/link';
import { useIsNative } from '@/lib/useNative';
import { CURRENT_APP_VERSION } from '@/lib/appUpdater';

export function HomeDownloadBanner() {
  const isNative = useIsNative();

  // Do not show download banner inside the downloaded native app
  if (isNative) {
    return null;
  }

  return (
    <div className="mb-16 p-5 sm:p-6 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50/70 via-white to-teal-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl flex-shrink-0">📱</span>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              MLTheta for Android — 100% Offline
            </h3>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              v{CURRENT_APP_VERSION}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Install the standalone APK to read theory, interact with live figures, and take quizzes without internet.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
        <a
          href="https://github.com/mltheta/mltheta-mobile/releases/latest/download/app-release.apk"
          className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-2xs text-center"
        >
          Download APK (10.7 MB)
        </a>
        <Link
          href="/about"
          className="px-3 py-2 bg-white text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-center"
        >
          About →
        </Link>
      </div>
    </div>
  );
}
