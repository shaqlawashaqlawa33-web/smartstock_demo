/** ============================================================================
 *  CURRENCY CONTEXT
 *  ============================================================================
 *  Provides currency configuration with localStorage persistence.
 *  Integrated with the global settings system for consistency.
 *  ============================================================================
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Currency, CurrencyConfig, AppSettings } from '@/types';
import { DEFAULT_EXCHANGE_RATE } from '@/lib/currency';
import { loadState, saveState } from '@/lib/storage';

interface CurrencyContextType {
  config: CurrencyConfig;
  setCurrency: (currency: Currency) => void;
  setExchangeRate: (rate: number) => void;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<CurrencyConfig>(() => {
    const saved = loadState();
    if (saved.settings) {
      return {
        currency: saved.settings.currency,
        exchangeRate: saved.settings.exchangeRate,
      };
    }
    return {
      currency: 'IQD',
      exchangeRate: DEFAULT_EXCHANGE_RATE,
    };
  });

  // Persist currency changes to global state
  useEffect(() => {
    const current = loadState();
    if (current.settings) {
      const updatedSettings: AppSettings = {
        ...current.settings,
        currency: config.currency,
        exchangeRate: config.exchangeRate,
      };
      saveState({ settings: updatedSettings });
    }
  }, [config]);

  const setCurrency = useCallback((currency: Currency) => {
    setConfig(prev => ({ ...prev, currency }));
  }, []);

  const setExchangeRate = useCallback((rate: number) => {
    if (rate > 0) {
      setConfig(prev => ({ ...prev, exchangeRate: rate }));
    }
  }, []);

  const value = useMemo(() => ({
    config,
    setCurrency,
    setExchangeRate,
  }), [config, setCurrency, setExchangeRate]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
