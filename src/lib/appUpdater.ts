'use client';

import { isDeviceOnline } from './resourceDownload';
import { Capacitor } from '@capacitor/core';
import { openExternalUrl } from './externalLinks';

export const CURRENT_APP_VERSION = '1.0.0';

export interface VersionInfo {
  version: string;
  name?: string;
  releaseDate?: string;
  minAndroidVersion?: string;
  apkUrl: string;
  releaseNotesUrl: string;
  notes?: string;
}

export type UpdateStatus = 'idle' | 'checking' | 'up_to_date' | 'update_available' | 'offline' | 'error';

export interface UpdateCheckResult {
  status: UpdateStatus;
  currentVersion: string;
  latestVersion?: string;
  versionInfo?: VersionInfo;
  errorMessage?: string;
}

/**
 * Compares two semantic version strings (e.g., '1.0.1' and '1.0.0').
 * Returns > 0 if v1 > v2, < 0 if v1 < v2, 0 if equal.
 */
export function compareSemver(v1: string, v2: string): number {
  const clean1 = v1.replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0);
  const clean2 = v2.replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0);

  const maxLen = Math.max(clean1.length, clean2.length);
  for (let i = 0; i < maxLen; i++) {
    const num1 = clean1[i] || 0;
    const num2 = clean2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

/**
 * Checks for application updates from production version metadata or GitHub Releases.
 */
export async function checkForAppUpdate(): Promise<UpdateCheckResult> {
  const online = await isDeviceOnline();
  if (!online) {
    return {
      status: 'offline',
      currentVersion: CURRENT_APP_VERSION,
      errorMessage: 'You are offline. Connect to the internet to check for updates.',
    };
  }

  // 1. Primary: fetch from high-speed production server (avoids GitHub rate limits)
  try {
    const res = await fetch(`https://mlens-theta.vercel.app/version.json?_t=${Date.now()}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = (await res.json()) as VersionInfo;
      const isNewer = compareSemver(data.version, CURRENT_APP_VERSION) > 0;
      return {
        status: isNewer ? 'update_available' : 'up_to_date',
        currentVersion: CURRENT_APP_VERSION,
        latestVersion: data.version,
        versionInfo: data,
      };
    }
  } catch (err) {
    console.warn('[AppUpdater] Primary version check failed, attempting GitHub API fallback:', err);
  }

  // 2. Fallback: query GitHub Releases API
  try {
    const ghRes = await fetch('https://api.github.com/repos/ML204/ML204/releases/latest', {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });
    if (ghRes.ok) {
      const release = await ghRes.json();
      const tagName = (release.tag_name || '').replace(/^v/, '');
      const apkAsset = release.assets?.find((a: { name?: string }) => a.name?.endsWith('.apk'));
      const apkUrl = apkAsset?.browser_download_url || `https://github.com/ML204/ML204/releases/download/${release.tag_name}/app.apk`;

      const versionInfo: VersionInfo = {
        version: tagName,
        name: release.name || `ML204 v${tagName}`,
        releaseDate: release.published_at ? release.published_at.split('T')[0] : undefined,
        apkUrl,
        releaseNotesUrl: release.html_url || `https://github.com/ML204/ML204/releases/tag/${release.tag_name}`,
        notes: release.body || undefined,
      };

      const isNewer = compareSemver(tagName, CURRENT_APP_VERSION) > 0;
      return {
        status: isNewer ? 'update_available' : 'up_to_date',
        currentVersion: CURRENT_APP_VERSION,
        latestVersion: tagName,
        versionInfo,
      };
    }
  } catch (err) {
    console.error('[AppUpdater] GitHub fallback failed:', err);
  }

  return {
    status: 'error',
    currentVersion: CURRENT_APP_VERSION,
    errorMessage: 'Could not connect to update server. Please try again later.',
  };
}

/**
 * Initiates the download and installation of the updated APK.
 * In native Android app: delegates to Android's native DownloadManager.
 * On web: opens the APK download link.
 */
export async function downloadAppUpdate(apkUrl: string, latestVersion: string = 'latest'): Promise<boolean> {
  const filename = `ml204-v${latestVersion}.apk`;

  if (Capacitor.isNativePlatform()) {
    if (
      typeof window !== 'undefined' &&
      (window as unknown as { AndroidDownloader?: { downloadFile: (url: string, filename: string, mime: string) => void } }).AndroidDownloader?.downloadFile
    ) {
      try {
        (window as unknown as { AndroidDownloader: { downloadFile: (url: string, filename: string, mime: string) => void } }).AndroidDownloader.downloadFile(
          apkUrl,
          filename,
          'application/vnd.android.package-archive'
        );
        return true;
      } catch (err) {
        console.warn('[AppUpdater] AndroidDownloader invocation error, falling back:', err);
      }
    }

    // Fallback: open in external browser
    openExternalUrl(apkUrl);
    return true;
  }

  // Web fallback: standard anchor download
  if (typeof window !== 'undefined') {
    const a = document.createElement('a');
    a.href = apkUrl;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  }

  return false;
}
