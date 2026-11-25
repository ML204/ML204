'use client';

import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

export async function shareMLTheta() {
  const shareData = {
    title: 'MLTheta — Interactive Machine Learning Book',
    text: 'Learn machine learning visually with interactive figures and quizzes — free & 100% offline!',
    url: 'https://github.com/mltheta/ML204-mobile/releases/latest',
    dialogTitle: 'Share MLTheta with Friends',
  };

  try {
    if (Capacitor.isNativePlatform()) {
      await Share.share(shareData);
      return true;
    }
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share(shareData);
      return true;
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(shareData.url);
      alert('MLTheta download link copied to clipboard!');
      return true;
    }
  } catch (err: unknown) {
    // If the user cancelled the share dialog, do not treat as an error
    if (err instanceof Error && err.name === 'AbortError') return false;
    console.warn('[Share] Share failed:', err);
  }
  return false;
}

