// Local progress tracking — no account needed.

const PREFIX = 'mlens:progress:';

export function markComplete(slug: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PREFIX + slug, 'done');
}

export function isComplete(slug: string): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(PREFIX + slug) === 'done';
}

export function getProgress(): { total: number; done: number } {
  if (typeof window === 'undefined') return { total: 0, done: 0 };
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(PREFIX));
  const done = keys.filter((k) => localStorage.getItem(k) === 'done').length;
  return { total: keys.length, done };
}

export function clearProgress() {
  if (typeof window === 'undefined') return;
  Object.keys(localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => localStorage.removeItem(k));
}
