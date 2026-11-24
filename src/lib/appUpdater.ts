'use client';

import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { App } from '@capacitor/app';
import { isDeviceOnline } from './resourceDownload';
import { openExternalUrl } from './externalLinks';

export const CURRENT_APP_VERSION = '1.0.2';

/**
 * Gets the actual running version from Android package metadata,
 * falling back to the compile-time CURRENT_APP_VERSION.
 */
export async function getAppVersion(): Promise<string> {
  if (Capacitor.isNativePlatform()) {
    try {
      const info = await App.getInfo();
      if (info && info.version) {
        return info.version;
      }
    } catch {
      // ignore
    }
  }
  return CURRENT_APP_VERSION;
}

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
 * Robust JSON fetcher with guaranteed timeout and native CapacitorHttp support.
 */
async function fetchJsonWithTimeout<T>(url: string, timeoutMs = 4000): Promise<T | null> {
  const isNative = Capacitor.isNativePlatform();

  // On Native Android/iOS: use CapacitorHttp (Java/Obj-C HTTP stack) to bypass WebView socket limits
  if (isNative) {
    try {
      const response = await CapacitorHttp.get({
        url,
        connectTimeout: timeoutMs,
        readTimeout: timeoutMs,
        headers: {
          'Cache-Control': 'no-cache',
          Accept: 'application/json',
        },
      });
      if (response.status === 200 && response.data) {
        return typeof response.data === 'string' ? JSON.parse(response.data) : (response.data as T);
      }
    } catch (err) {
      console.warn('[AppUpdater] CapacitorHttp failed for url:', url, err);
    }
  }

  // Web or fallback: standard fetch with AbortController timeout
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    clearTimeout(timer);

    if (res.ok) {
      return (await res.json()) as T;
    }
  } catch (err) {
    console.warn('[AppUpdater] Web fetch failed for url:', url, err);
  }

  return null;
}

/**
 * Checks for application updates from production version metadata or GitHub Releases.
 * Guaranteed to resolve within 5 seconds.
 */
export async function checkForAppUpdate(): Promise<UpdateCheckResult> {
  const currentVersion = await getAppVersion();

  try {
    // 1. Fast connectivity check with timeout
    const online = await Promise.race([
      isDeviceOnline(),
      new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 1500)),
    ]);

    if (!online) {
      return {
        status: 'offline',
        currentVersion,
        errorMessage: 'You are offline. Connect to the internet to check for updates.',
      };
    }

    // 2. Primary check: Vercel CDN metadata
    const versionUrl = `https://mlens-theta.vercel.app/version.json?_t=${Date.now()}`;
    const primaryData = await fetchJsonWithTimeout<VersionInfo>(versionUrl, 3500);

    if (primaryData && primaryData.version) {
      const isNewer = compareSemver(primaryData.version, currentVersion) > 0;
      return {
        status: isNewer ? 'update_available' : 'up_to_date',
        currentVersion,
        latestVersion: primaryData.version,
        versionInfo: primaryData,
      };
    }

    // 3. Fallback: GitHub Releases API
    const ghUrl = 'https://api.github.com/repos/ML204/ML204/releases/latest';
    interface GhRelease {
      tag_name: string;
      name?: string;
      published_at?: string;
      body?: string;
      html_url?: string;
      assets?: Array<{ name?: string; browser_download_url?: string }>;
    }
    const ghRelease = await fetchJsonWithTimeout<GhRelease>(ghUrl, 3500);

    if (ghRelease && ghRelease.tag_name) {
      const tagName = ghRelease.tag_name.replace(/^v/, '');
      const apkAsset = ghRelease.assets?.find((a) => a.name?.endsWith('.apk'));
      const apkUrl = apkAsset?.browser_download_url || `https://github.com/ML204/ML204/releases/download/${ghRelease.tag_name}/app.apk`;

      const versionInfo: VersionInfo = {
        version: tagName,
        name: ghRelease.name || `ML204 v${tagName}`,
        releaseDate: ghRelease.published_at ? ghRelease.published_at.split('T')[0] : undefined,
        apkUrl,
        releaseNotesUrl: ghRelease.html_url || `https://github.com/ML204/ML204/releases/tag/${ghRelease.tag_name}`,
        notes: ghRelease.body || undefined,
      };

      const isNewer = compareSemver(tagName, currentVersion) > 0;
      return {
        status: isNewer ? 'update_available' : 'up_to_date',
        currentVersion,
        latestVersion: tagName,
        versionInfo,
      };
    }

    return {
      status: 'error',
      currentVersion,
      errorMessage: 'Could not connect to update server. Check your connection.',
    };
  } catch (err) {
    console.error('[AppUpdater] Unexpected error checking update:', err);
    return {
      status: 'error',
      currentVersion,
      errorMessage: 'Unable to check for updates right now.',
    };
  }
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

    openExternalUrl(apkUrl);
    return true;
  }

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
