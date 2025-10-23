import en from './locales/en.json';
import id from './locales/id.json';

export type Locale = 'en' | 'id';

export interface Translations {
  [key: string]: any;
}

const translations: Record<Locale, Translations> = {
  en,
  id,
};

let currentLocale: Locale = 'en';

/**
 * Set current locale
 */
export function setLocale(locale: Locale) {
  if (translations[locale]) {
    currentLocale = locale;
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', locale);
    }
  }
}

/**
 * Get current locale
 */
export function getLocale(): Locale {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('locale') as Locale;
    if (stored && translations[stored]) {
      currentLocale = stored;
    }
  }
  return currentLocale;
}

/**
 * Translate a key with optional variables
 * Usage: t('common.save') or t('invoices.total', { amount: 1000 })
 */
export function t(key: string, variables?: Record<string, any>): string {
  const keys = key.split('.');
  let value: any = translations[currentLocale];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English if key not found
      let fallback: any = translations['en'];
      for (const fk of keys) {
        if (fallback && typeof fallback === 'object' && fk in fallback) {
          fallback = fallback[fk];
        } else {
          return key; // Return key if not found in any locale
        }
      }
      value = fallback;
      break;
    }
  }

  if (typeof value !== 'string') {
    return key;
  }

  // Replace variables
  if (variables) {
    return value.replace(/\{(\w+)\}/g, (match, variable) => {
      return variables[variable] !== undefined ? String(variables[variable]) : match;
    });
  }

  return value;
}

/**
 * Get all available locales
 */
export function getAvailableLocales(): Locale[] {
  return Object.keys(translations) as Locale[];
}

/**
 * Get locale display name
 */
export function getLocaleDisplayName(locale: Locale): string {
  const names: Record<Locale, string> = {
    en: 'English',
    id: 'Bahasa Indonesia',
  };
  return names[locale] || locale;
}
