/** ============================================================================
 *  SETTINGS CONTEXT
 *  ============================================================================
 *  Centralized settings management with i18n integration.
 *  Handles language switching, RTL direction, and all user preferences.
 *  ============================================================================
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { AppSettings, Language } from '@/types';
import { loadState, saveState, DEFAULT_SETTINGS } from '@/lib/storage';
import { applyTextDirection, SUPPORTED_LANGUAGES } from '@/i18n';
import i18n from '@/i18n';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  setLanguage: (lang: Language) => void;
  resetSettings: () => void;
  isHydrated: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate settings from localStorage on mount
  useEffect(() => {
    const saved = loadState();
    if (saved.settings) {
      const merged = { ...DEFAULT_SETTINGS, ...saved.settings };
      setSettings(merged);

      // Apply language and direction
      if (SUPPORTED_LANGUAGES.includes(merged.language)) {
        i18n.changeLanguage(merged.language);
        applyTextDirection(merged.language);
      }
    }
    setIsHydrated(true);
  }, []);

  // Persist settings changes
  useEffect(() => {
    if (isHydrated) {
      saveState({ settings });
    }
  }, [settings, isHydrated]);

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    if (SUPPORTED_LANGUAGES.includes(lang)) {
      updateSettings({ language: lang });
      i18n.changeLanguage(lang);
      applyTextDirection(lang);
    }
  }, [updateSettings]);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    i18n.changeLanguage(DEFAULT_SETTINGS.language);
    applyTextDirection(DEFAULT_SETTINGS.language);
  }, []);

  const value = useMemo(() => ({
    settings,
    updateSettings,
    setLanguage,
    resetSettings,
    isHydrated,
  }), [settings, updateSettings, setLanguage, resetSettings, isHydrated]);

  if (!isHydrated) {
    // Return a loading state or null during hydration
    return (
      <SettingsContext.Provider value={value}>
        {children}
      </SettingsContext.Provider>
    );
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
