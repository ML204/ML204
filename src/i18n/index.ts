import en from './locales/en.json';
import bn from './locales/bn.json';

export type Language = 'en' | 'bn';

const translations: Record<Language, typeof en> = {
  en,
  bn: bn as typeof en,
};

let currentLanguage: Language = 'en';

export function setLanguage(lang: Language) {
  currentLanguage = lang;
  if (typeof window !== 'undefined') {
    localStorage.setItem('ml204:language', lang);
    window.dispatchEvent(new Event('ml204:language-change'));
  }
}

export function getLanguage(): Language {
  if (typeof window !== 'undefined') {
    const saved = (localStorage.getItem('ml204:language') || localStorage.getItem('mlens:language')) as Language;
    if (saved === 'en' || saved === 'bn') return saved;
  }
  return currentLanguage;
}

export function t(path: string): string {
  const lang = getLanguage();
  const keys = path.split('.');
  let current: unknown = translations[lang] || translations.en;

  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = (current as Record<string, unknown>)[k];
    } else {
      // Fallback to English
      let fallback: unknown = translations.en;
      for (const fk of keys) {
        if (fallback && typeof fallback === 'object' && fk in fallback) {
          fallback = (fallback as Record<string, unknown>)[fk];
        } else {
          return path;
        }
      }
      return typeof fallback === 'string' ? fallback : path;
    }
  }

  return typeof current === 'string' ? current : path;
}
