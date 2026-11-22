// Shared figure state: serialize/deserialize to URL hash
// so figures can be shared as links.

export type FigureState = Record<string, number | string | boolean>;

export function serializeState(state: FigureState): string {
  return btoa(JSON.stringify(state));
}

export function deserializeState(encoded: string): FigureState | null {
  try {
    return JSON.parse(atob(encoded));
  } catch {
    return null;
  }
}

export function getStateFromURL(): FigureState | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.slice(1);
  if (!hash) return null;
  return deserializeState(hash);
}

export function setStateInURL(state: FigureState) {
  if (typeof window === 'undefined') return;
  window.history.replaceState(null, '', '#' + serializeState(state));
}
