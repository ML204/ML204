'use client';

import { useIsNative } from '@/lib/useNative';
import { shareMLens } from '@/lib/share';

export function AboutAppCard() {
  const isNative = useIsNative();

  if (isNative) {
    return (
      <section className="mb-14 p-6 sm:p-8 rounded-2xl border-2 border-brand-200 bg-gradient-to-br from-brand-50/70 via-white to-indigo-50/40 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold bg-brand-100 text-brand-800 border border-brand-300">
              <span className="w-2 h-2 rounded-full bg-brand-600" />
              Installed · Version 1.0.0
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Share MLens with Classmates
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Finding the visual interactive figures and quizzes helpful? Share MLens with your study
              group, students, or fellow researchers.
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
              <span>⚡ Standalone Native Runtime</span>
              <span>•</span>
              <span>🔒 100% Offline & Private</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 min-w-[200px]">
            <button
              onClick={shareMLens}
              className="px-6 py-3.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="text-lg">🔗</span>
              <span>Share MLens</span>
            </button>
            <a
              href="https://github.com/ML204/ML204"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub Repository</span>
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-14 p-6 sm:p-8 rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            Official Android Release · v1.0.0
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Take MLens Anywhere — 100% Offline
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Install the standalone native Android app. Enjoy fully functional interactive figures,
            math renderers, and quiz revision banks with <strong>zero internet connection</strong> required.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
            <span>📦 Size: <strong>10.7 MB</strong></span>
            <span>•</span>
            <span>🔑 Signed Release Build</span>
            <span>•</span>
            <span>⚡ Android 7.0+ (API 24+)</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-3 min-w-[200px]">
          <a
            href="https://github.com/ML204/ML204/releases/download/v1.0.0/app.apk"
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-center flex items-center justify-center gap-2"
          >
            <span className="text-xl">📱</span>
            <span>Download APK</span>
          </a>
          <a
            href="https://github.com/ML204/ML204/releases/tag/v1.0.0"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub Release Notes</span>
          </a>
        </div>
      </div>

      {/* Quick Android Install Instructions */}
      <div className="mt-6 pt-5 border-t border-emerald-200/70 text-xs text-slate-600 space-y-1">
        <p className="font-semibold text-slate-800">💡 How to install on your Android phone:</p>
        <ol className="list-decimal list-inside space-y-0.5 text-slate-600">
          <li>Download the <code>app.apk</code> file above.</li>
          <li>Tap the downloaded file in your browser or Downloads folder.</li>
          <li>If prompted, enable <em>&quot;Allow from this source&quot;</em> in Android Settings.</li>
          <li>Tap <strong>Install</strong> and launch MLens anytime!</li>
        </ol>
      </div>
    </section>
  );
}
