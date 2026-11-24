'use client';

import { Network } from '@capacitor/network';
import { Capacitor } from '@capacitor/core';
import { getTopicLocation } from './toc';

export interface DownloadableFile {
  name: string;
  href: string;
  githubUrl?: string;
  topicSlug?: string;
  size?: string;
}

/**
 * Maps common file extensions to standard MIME types.
 */
function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'md':
    case 'markdown':
      return 'text/markdown';
    case 'tex':
      return 'application/x-tex';
    case 'ipynb':
      return 'application/x-ipynb+json';
    case 'py':
      return 'text/x-python';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'zip':
      return 'application/zip';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Checks whether the device currently has active network connectivity.
 */
export async function isDeviceOnline(): Promise<boolean> {
  if (typeof window === 'undefined') return true;

  // In native Capacitor on Android/iOS, use @capacitor/network directly.
  // navigator.onLine is unreliable in WebViews serving from local assets.
  if (Capacitor.isNativePlatform()) {
    try {
      const status = await Network.getStatus();
      return Boolean(status.connected);
    } catch {
      return true; // Fail-open so downloads are never blocked by status failure
    }
  }

  // Web fallback:
  if (typeof navigator !== 'undefined') {
    return navigator.onLine;
  }
  return true;
}

/**
 * Computes the canonical online download URL from ML204/resources repository.
 */
export function getOnlineDownloadUrl(topicSlug: string, filename: string): string {
  const encFile = encodeURIComponent(filename);
  const loc = getTopicLocation(topicSlug);
  if (loc) {
    return `https://raw.githubusercontent.com/ML204/resources/main/${loc.partSlug}/${loc.chapterSlug}/${topicSlug}/${encFile}`;
  }
  return `https://raw.githubusercontent.com/ML204/resources/main/${topicSlug}/${encFile}`;
}

/**
 * Handles downloading a study resource with native Android DownloadManager support.
 * - In offline mode: invokes `onOffline()` and returns false.
 * - In native Android app: delegates to Android's system DownloadManager with system notifications.
 * - On web: triggers on-demand browser download.
 */
export async function downloadStudyResource(
  file: DownloadableFile,
  topicSlug: string,
  onOffline: () => void
): Promise<boolean> {
  const isNative = Capacitor.isNativePlatform();
  const remoteDownloadUrl = getOnlineDownloadUrl(topicSlug, file.name);

  // In native Android/iOS app:
  if (isNative) {
    const online = await isDeviceOnline();
    if (!online) {
      onOffline();
      return false;
    }

    // 1. Android Native Downloader via system DownloadManager
    if (typeof window !== 'undefined' && (window as unknown as { AndroidDownloader?: { downloadFile: (url: string, filename: string, mime: string) => void } }).AndroidDownloader?.downloadFile) {
      try {
        const mime = getMimeType(file.name);
        (window as unknown as { AndroidDownloader: { downloadFile: (url: string, filename: string, mime: string) => void } }).AndroidDownloader.downloadFile(remoteDownloadUrl, file.name, mime);
        return true;
      } catch (err) {
        console.warn('[ResourceDownload] AndroidDownloader invocation error, falling back:', err);
      }
    }

    // 2. Fallback: Open in external system browser so browser handles the download
    try {
      if (typeof window !== 'undefined') {
        window.open(remoteDownloadUrl, '_system');
      }
      return true;
    } catch (err) {
      console.warn('[ResourceDownload] Fallback window.open failed:', err);
      return false;
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
