'use client';

import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

/**
 * Safely opens an external webpage in the native system browser (e.g. Chrome Custom Tabs or SFSafariViewController)
 * without taking the user away from the app context or causing WebView security blocks.
 */
export async function openExternalUrl(url: string): Promise<void> {
  if (!url) return;

  if (Capacitor.isNativePlatform()) {
    try {
      await Browser.open({
        url,
        windowName: '_blank',
        presentationStyle: 'popover',
        toolbarColor: '#2563eb',
      });
      return;
    } catch (err) {
      console.warn('[ExternalLink] Capacitor Browser failed, falling back to window.open:', err);
    }
  }

  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
