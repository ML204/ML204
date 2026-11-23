// Local progress tracking — no account needed.
import { useState, useEffect } from 'react';

const PREFIX = 'ml204:progress:';
const LEGACY_PREFIX = 'mlens:progress:';

export function markComplete(slug: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PREFIX + slug, 'done');
  window.dispatchEvent(new Event('ml204:progress-update'));
}

export function unmarkComplete(slug: string) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PREFIX + slug);
  localStorage.removeItem(LEGACY_PREFIX + slug);
  window.dispatchEvent(new Event('ml204:progress-update'));
}

export function toggleComplete(slug: string): boolean {
  if (typeof window === 'undefined') return false;
  const isDone = isComplete(slug);
  if (isDone) {
    unmarkComplete(slug);
    return false;
  } else {
    markComplete(slug);
    return true;
  }
}

export function isComplete(slug: string): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(PREFIX + slug) === 'done' || localStorage.getItem(LEGACY_PREFIX + slug) === 'done';
}

export function getCompletedSlugs(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  const set = new Set<string>();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(PREFIX) && localStorage.getItem(key) === 'done') {
      set.add(key.replace(PREFIX, ''));
    } else if (key?.startsWith(LEGACY_PREFIX) && localStorage.getItem(key) === 'done') {
      set.add(key.replace(LEGACY_PREFIX, ''));
    }
  }
  return set;
}

export function useCompletedSlugs(): Set<string> {
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    const update = () => setCompleted(getCompletedSlugs());
    update();
    window.addEventListener('ml204:progress-update', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('ml204:progress-update', update);
      window.removeEventListener('storage', update);
    };
  }, []);

  return completed;
}
