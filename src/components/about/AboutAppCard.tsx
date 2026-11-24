'use client';

import { useState, useEffect } from 'react';
import { useIsNative } from '@/lib/useNative';
import { shareML204 } from '@/lib/share';
import { openExternalUrl } from '@/lib/externalLinks';
import {
  CURRENT_APP_VERSION,
  getAppVersion,
  checkForAppUpdate,
  downloadAppUpdate,
  type UpdateCheckResult,
} from '@/lib/appUpdater';

export function AboutAppCard() {
  const isNative = useIsNative();
  const [appVersion, setAppVersion] = useState(CURRENT_APP_VERSION);
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [updateResult, setUpdateResult] = useState<UpdateCheckResult | null>(null);

  useEffect(() => {
    getAppVersion().then((v) => setAppVersion(v));
  }, []);

  async function handleCheckUpdate() {
    if (checking) return;
    setChecking(true);
    setUpdateResult(null);
    setDownloadStarted(false);

    const safetyTimer = setTimeout(() => {
      setChecking(false);
      setUpdateResult({
        status: 'error',
        currentVersion: CURRENT_APP_VERSION,
        errorMessage: 'Update check timed out. Please check your connection.',
      });
    }, 5000);

    try {
      const result = await checkForAppUpdate();
      clearTimeout(safetyTimer);
      setUpdateResult(result);
    } catch {
      clearTimeout(safetyTimer);
      setUpdateResult({
        status: 'error',
        currentVersion: CURRENT_APP_VERSION,
        errorMessage: 'Failed to verify updates.',
      });
    } finally {
      clearTimeout(safetyTimer);
      setChecking(false);
    }
  }

  async function handleInstallUpdate() {
    if (!updateResult?.versionInfo?.apkUrl) return;
    setDownloading(true);
    try {
      await downloadAppUpdate(
        updateResult.versionInfo.apkUrl,
        updateResult.latestVersion || 'latest'
      );
      setDownloadStarted(true);
    } finally {
      setDownloading(false);
    }
  }

  if (isNative) {
    return (
      <section className="mb-14 p-6 sm:p-8 rounded-2xl border-2 border-brand-200 bg-gradient-to-br from-brand-50/70 via-white to-indigo-50/40 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold bg-brand-100 text-brand-800 border border-brand-300">
                <span className="w-2 h-2 rounded-full bg-brand-600" />
                Installed · Version {appVersion}
              </div>

              {/* Dynamic Update Pill */}
              {updateResult?.status === 'up_to_date' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span>✓</span> Up to date
                </span>
              )}

              {updateResult?.status === 'update_available' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300 animate-pulse">
                  <span>🚀</span> Update available (v{updateResult.latestVersion})
                </span>
              )}
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              ML204 Offline Learning Suite
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Standalone native offline runtime for interactive geometry, rigorous derivations,
              and test bank revision. All figures and quizzes work completely offline.
            </p>

            <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
              <span>⚡ Standalone Native Runtime</span>
              <span>•</span>
              <span>🔒 100% Offline & Private</span>
              <span>•</span>
              <span>📦 APK v{appVersion}</span>
            </div>

            {/* Update details banner if an update is found */}
            {updateResult?.status === 'update_available' && (
              <div className="mt-4 p-4 rounded-xl border border-amber-200 bg-amber-50/80 text-amber-900 space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    New Version v{updateResult.latestVersion} Available
                  </span>
                  {updateResult.versionInfo?.releaseDate && (
                    <span className="text-[11px] text-amber-600">
                      Released {updateResult.versionInfo.releaseDate}
                    </span>
                  )}
                </div>
                {updateResult.versionInfo?.notes && (
                  <p className="text-xs text-amber-800 leading-relaxed">
                    {updateResult.versionInfo.notes}
                  </p>
                )}
                {downloadStarted ? (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-100/80 border border-emerald-300 text-emerald-950 text-xs font-medium animate-pulse">
                    <span className="text-base">⏳</span>
                    <span>
                      Downloading APK in background... Check your notifications or Downloads folder to install once completed!
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleInstallUpdate}
                      disabled={downloading}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                      <span>{downloading ? '⏳' : '⬇'}</span>
                      <span>{downloading ? 'Starting Download...' : 'Download Update APK'}</span>
                    </button>
                    {updateResult.versionInfo?.releaseNotesUrl && (
                      <button
                        onClick={() => openExternalUrl(updateResult.versionInfo!.releaseNotesUrl)}
                        className="px-3 py-2 bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Release Notes ↗
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {updateResult?.status === 'offline' && (
              <div className="mt-2 text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <span>📡</span>
                <span>Connect to the internet to check for updates.</span>
              </div>
            )}

            {updateResult?.status === 'error' && (
              <div className="mt-2 text-xs font-medium text-rose-600 flex items-center gap-1.5">
                <span>⚠️</span>
                <span>{updateResult.errorMessage || 'Could not reach update server.'}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 min-w-[210px] w-full md:w-auto">
            {/* Check for Updates Button */}
            <button
              onClick={handleCheckUpdate}
              disabled={checking}
              className="px-5 py-3 bg-white hover:bg-slate-50 active:scale-95 border-2 border-brand-500 text-brand-700 font-bold rounded-xl shadow-xs transition-all text-center flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <span className={checking ? 'animate-spin' : ''}>🔄</span>
              <span>{checking ? 'Checking Updates...' : 'Check for Updates'}</span>
            </button>

            {/* Share App Button */}
            <button
              onClick={shareML204}
              className="px-5 py-3 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold rounded-xl shadow-xs transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🔗</span>
              <span>Share App</span>
            </button>

            {/* GitHub Repo */}
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

  // Web Browser Presentation
  return (
    <section className="mb-14 p-6 sm:p-8 rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            Official Android Release · v{appVersion}
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Take ML204 Anywhere — 100% Offline
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Install the standalone native Android app. Enjoy fully functional interactive figures,
            math renderers, and quiz revision banks with <strong>zero internet connection</strong> required.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
            <span>📦 Size: <strong>11 MB</strong></span>
            <span>•</span>
            <span>🔑 Signed Release Build</span>
            <span>•</span>
            <span>⚡ Android 7.0+ (API 24+)</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-3 min-w-[200px]">
          <a
            href="https://github.com/ML204/ML204-mobile/releases/latest/download/app-release.apk"
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-center flex items-center justify-center gap-2"
          >
            <span className="text-xl">📱</span>
            <span>Download APK</span>
          </a>
          <a
            href="https://github.com/ML204/ML204-mobile/releases/latest"
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
    </section>
  );
}
