/** ============================================================================
 *  INTERNATIONALIZATION (i18n) CONFIGURATION
 *  ============================================================================
 *  Supports three languages: Kurdish (Central/CKB), Arabic (AR), English (EN).
 *  Features:
 *  - RTL/LTR direction handling
 *  - Language detection from localStorage and browser
 *  - Namespace-based translations for modularity
 *  - Dynamic language switching without page reload
 *  ============================================================================
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import type { Language } from '@/types';

// Translation resources
import ckbCommon from './locales/ckb/common.json';
import ckbDashboard from './locales/ckb/dashboard.json';
import ckbNavigation from './locales/ckb/navigation.json';
import ckbUpload from './locales/ckb/upload.json';
import ckbSales from './locales/ckb/sales.json';
import ckbForecast from './locales/ckb/forecast.json';
import ckbInventory from './locales/ckb/inventory.json';
import ckbSettings from './locales/ckb/settings.json';
import ckbLanding from './locales/ckb/landing.json';

import arCommon from './locales/ar/common.json';
import arDashboard from './locales/ar/dashboard.json';
import arNavigation from './locales/ar/navigation.json';
import arUpload from './locales/ar/upload.json';
import arSales from './locales/ar/sales.json';
import arForecast from './locales/ar/forecast.json';
import arInventory from './locales/ar/inventory.json';
import arSettings from './locales/ar/settings.json';
import arLanding from './locales/ar/landing.json';

import enCommon from './locales/en/common.json';
import enDashboard from './locales/en/dashboard.json';
import enNavigation from './locales/en/navigation.json';
import enUpload from './locales/en/upload.json';
import enSales from './locales/en/sales.json';
import enForecast from './locales/en/forecast.json';
import enInventory from './locales/en/inventory.json';
import enSettings from './locales/en/settings.json';
import enLanding from './locales/en/landing.json';

/** Map of supported languages to their RTL status */
export const RTL_LANGUAGES: Record<Language, boolean> = {
  ckb: true,
  ar: true,
  en: false,
};

/** Display names for each language */
export const LANGUAGE_NAMES: Record<Language, string> = {
  ckb: 'کوردی',
  ar: 'العربية',
  en: 'English',
};

/** All supported language codes */
export const SUPPORTED_LANGUAGES: Language[] = ['ckb', 'ar', 'en'];

/** Default language fallback */
export const DEFAULT_LANGUAGE: Language = 'ckb';

/** Get text direction for a language */
export function getTextDirection(lang: Language): 'rtl' | 'ltr' {
  return RTL_LANGUAGES[lang] ? 'rtl' : 'ltr';
}

/** Apply text direction to the document */
export function applyTextDirection(lang: Language): void {
  const dir = getTextDirection(lang);
  document.documentElement.dir = dir;
  document.documentElement.lang = lang;
}

/** Initialize i18n instance */
export function initializeI18n(): typeof i18n {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        ckb: {
          common: ckbCommon,
          dashboard: ckbDashboard,
          navigation: ckbNavigation,
          upload: ckbUpload,
          sales: ckbSales,
          forecast: ckbForecast,
          inventory: ckbInventory,
          settings: ckbSettings,
          landing: ckbLanding,
        },
        ar: {
          common: arCommon,
          dashboard: arDashboard,
          navigation: arNavigation,
          upload: arUpload,
          sales: arSales,
          forecast: arForecast,
          inventory: arInventory,
          settings: arSettings,
          landing: arLanding,
        },
        en: {
          common: enCommon,
          dashboard: enDashboard,
          navigation: enNavigation,
          upload: enUpload,
          sales: enSales,
          forecast: enForecast,
          inventory: enInventory,
          settings: enSettings,
          landing: enLanding,
        },
      },
      fallbackLng: DEFAULT_LANGUAGE,
      defaultNS: 'common',
      ns: ['common', 'dashboard', 'navigation', 'upload', 'sales', 'forecast', 'inventory', 'settings', 'landing'],
      interpolation: {
        escapeValue: false, // React already escapes
      },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: 'app_language',
      },
      react: {
        useSuspense: false,
      },
    });

  // Apply initial direction
  applyTextDirection(i18n.language as Language || DEFAULT_LANGUAGE);

  // Listen for language changes to update document direction
  i18n.on('languageChanged', (lng: string) => {
    applyTextDirection(lng as Language);
  });

  return i18n;
}

export default i18n;