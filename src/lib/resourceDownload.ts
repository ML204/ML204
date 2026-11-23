'use client';

import { Network } from '@capacitor/network';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

export interface DownloadableFile {
  name: string;
  href: string;
  githubUrl?: string;
  topicSlug?: string;
  size?: string;
}

/**
 * Checks whether the device currently has active network connectivity.
 */
export async function isDeviceOnline(): Promise<boolean> {
  if (typeof window === 'undefined') return true;

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }

  try {
    const status = await Network.getStatus();
    return Boolean(status.connected);
  } catch {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }
}

/**
 * Computes the canonical online download URL from GitHub for a resource.
 */
export function getOnlineDownloadUrl(topicSlug: string, filename: string): string {
  const encFile = encodeURIComponent(filename);
  return `https://raw.githubusercontent.com/ML204/ML204/main/public/resources/${topicSlug}/${encFile}`;
}

/**
 * Handles downloading a study resource with offline detection and native Android support.
 * - In offline mode: invokes `onOffline()` and returns false.
 * - In native Android app: opens the remote GitHub raw URL via system browser / download manager.
 * - On web: triggers on-demand download.
 */
export async function downloadStudyResource(
  file: DownloadableFile,
  topicSlug: string,
  onOffline: () => void
): Promise<boolean> {
  const isNative = Capacitor.isNativePlatform();
  const remoteDownloadUrl = getOnlineDownloadUrl(topicSlug, file.name);

  // In native Android/iOS app: check connectivity before streaming from GitHub
  if (isNative) {
    const online = await isDeviceOnline();
    if (!online) {
      onOffline();
      return false;
    }

    try {
      await Browser.open({
        url: remoteDownloadUrl,
        windowName: '_system',
      });
      return true;
    } catch (err) {
      console.warn('[ResourceDownload] Native browser open failed, falling back:', err);
      if (typeof window !== 'undefined') {
        window.open(remoteDownloadUrl, '_system');
      }
      return true;
    }
  }

  // Web platform: trigger direct same-origin download from /resources/...
  if (typeof window !== 'undefined') {
    const targetUrl = file.href || remoteDownloadUrl;
    const anchor = document.createElement('a');
    anchor.href = targetUrl;
    anchor.download = file.name;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    return true;
  }

  return false;
}
