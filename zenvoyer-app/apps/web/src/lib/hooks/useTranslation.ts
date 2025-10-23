/**
 * useTranslation Hook
 * React hook for i18n translation
 */

import { useState } from 'react';
import { t, setLocale, getLocale, Locale, getAvailableLocales, getLocaleDisplayName } from '../i18n/i18n';

export function useTranslation() {
  const [currentLocale, setCurrentLocale] = useState<Locale>(getLocale());

  const changeLocale = (locale: Locale) => {
    setLocale(locale);
    setCurrentLocale(locale);
    // Trigger re-render by updating state
  };

  return {
    t,
    locale: currentLocale,
    changeLocale,
    availableLocales: getAvailableLocales(),
    getLocaleDisplayName,
  };
}

export default useTranslation;
