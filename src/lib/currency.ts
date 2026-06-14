/** ============================================================================
 *  CURRENCY UTILITIES
 *  ============================================================================
 *  Type-safe currency conversion and formatting with multi-language support.
 *  Supports USD and IQD with configurable exchange rates.
 *  ============================================================================
 */

import type { Currency, CurrencyConfig, Language } from '@/types';

/** Default exchange rate (1 USD = ? IQD) - June 2026 */
export const DEFAULT_EXCHANGE_RATE = 1565;

/** Convert USD amount to target currency */
export function convertPrice(
  amountUSD: number,
  targetCurrency: Currency,
  rate: number
): number {
  if (targetCurrency === 'USD') return amountUSD;
  return amountUSD * rate;
}

/** Format amount as currency string with locale support */
export function formatCurrency(
  amount: number,
  config: CurrencyConfig,
  compact: boolean = false
): string {
  const converted = config.currency === 'USD'
    ? amount
    : convertPrice(amount, config.currency, config.exchangeRate);

  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: config.currency === 'IQD' ? 0 : 2,
    maximumFractionDigits: config.currency === 'IQD' ? 0 : 2,
    notation: compact ? 'compact' : 'standard',
  });

  return formatter.format(converted);
}

/** Format chart axis values in compact currency notation */
export function formatChartAxis(value: number, config: CurrencyConfig): string {
  const converted = config.currency === 'USD'
    ? value
    : value * config.exchangeRate;

  if (config.currency === 'IQD') {
    if (converted >= 1_000_000) return `${(converted / 1_000_000).toFixed(1)}M`;
    if (converted >= 1_000) return `${(converted / 1_000).toFixed(0)}k`;
    return converted.toString();
  }

  if (converted >= 1_000) return `$${(converted / 1_000).toFixed(1)}k`;
  return `$${converted.toFixed(0)}`;
}

/** Get currency symbol for display */
export function getCurrencySymbol(currency: Currency): string {
  return currency === 'USD' ? '$' : 'د.ع';
}

/** Format number with locale-appropriate separators */
export function formatNumber(
  value: number,
  decimals: number = 0,
  language: Language = 'ckb'
): string {
  const locales: Record<Language, string> = {
    ckb: 'ckb-IQ',
    ar: 'ar-IQ',
    en: 'en-US',
  };

  return new Intl.NumberFormat(locales[language], {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
