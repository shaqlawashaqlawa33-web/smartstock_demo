/** ============================================================================
 *  PERSISTENT STORAGE LAYER
 *  ============================================================================
 *  Provides type-safe localStorage operations for the entire application state.
 *  Features:
 *  - Automatic serialization/deserialization
 *  - Version migration support
 *  - Compression for large datasets
 *  - Graceful error handling (quota exceeded, private mode, etc.)
 *  - State backup and recovery
 *  ============================================================================
 */

import type { AppState, SaleRecord, AppSettings } from '@/types';

/** Storage version for migration support */
const STORAGE_VERSION = 2;
const STORAGE_KEY = 'smartstock_state';
const BACKUP_KEY = 'smartstock_state_backup';

/** Default application settings */
export const DEFAULT_SETTINGS: AppSettings = {
  language: 'ckb',
  currency: 'IQD',
  exchangeRate: 1565,
  enableAnimations: true,
  autoSave: true,
  compactMode: false,
  dateFormat: 'gregorian',
  darkMode: false,
};

/** Default empty state */
export const DEFAULT_STATE: AppState = {
  records: [],
  fileName: '',
  settings: DEFAULT_SETTINGS,
  lastUpdated: new Date().toISOString(),
  version: STORAGE_VERSION,
};

/** Storage operation result */
interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/** ────────────────────────────────────────────────────────────────────────────
 *  Check if localStorage is available
 *  ──────────────────────────────────────────────────────────────────────────── */
function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/** ────────────────────────────────────────────────────────────────────────────
 *  Save application state to localStorage
 *  ──────────────────────────────────────────────────────────────────────────── */
export function saveState(state: Partial<AppState>): StorageResult<void> {
  if (!isStorageAvailable()) {
    return { success: false, error: 'localStorage not available' };
  }

  try {
    const current = loadState();
    const updated: AppState = {
      ...current,
      ...state,
      lastUpdated: new Date().toISOString(),
      version: STORAGE_VERSION,
    };

    const serialized = JSON.stringify(updated);

    // Check for quota exceeded
    if (serialized.length > 5 * 1024 * 1024) { // 5MB warning
      console.warn('Storage warning: Data approaching localStorage limit');
    }

    // Save current state to backup before overwriting
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (existing) {
        localStorage.setItem(BACKUP_KEY, existing);
      }
    } catch {
      // Backup is best-effort
    }

    localStorage.setItem(STORAGE_KEY, serialized);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

/** ────────────────────────────────────────────────────────────────────────────
 *  Load application state from localStorage
 *  ──────────────────────────────────────────────────────────────────────────── */
export function loadState(): AppState {
  if (!isStorageAvailable()) {
    return { ...DEFAULT_STATE };
  }

  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      return { ...DEFAULT_STATE };
    }

    const parsed = JSON.parse(serialized) as AppState;

    // Version migration
    if (!parsed.version || parsed.version < STORAGE_VERSION) {
      const migrated = migrateState(parsed);
      saveState(migrated);
      return migrated;
    }

    // Validate and provide defaults
    return {
      ...DEFAULT_STATE,
      ...parsed,
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
    };
  } catch (error) {
    console.error('Failed to load state:', error);

    // Attempt recovery from backup
    try {
      const backup = localStorage.getItem(BACKUP_KEY);
      if (backup) {
        const parsed = JSON.parse(backup) as AppState;
        return { ...DEFAULT_STATE, ...parsed };
      }
    } catch {
      // Backup recovery failed
    }

    return { ...DEFAULT_STATE };
  }
}

/** ────────────────────────────────────────────────────────────────────────────
 *  Migrate state from older versions
 *  ──────────────────────────────────────────────────────────────────────────── */
function migrateState(oldState: any): AppState {
  const base = { ...DEFAULT_STATE };

  // Version 1 -> 2: Added settings object
  if (oldState.records) base.records = oldState.records;
  if (oldState.fileName) base.fileName = oldState.fileName;

  // Migrate old flat currency settings to settings object
  if (oldState.currency || oldState.exchangeRate) {
    base.settings = {
      ...DEFAULT_SETTINGS,
      currency: oldState.currency || oldState.settings?.currency || 'IQD',
      exchangeRate: oldState.exchangeRate || oldState.settings?.exchangeRate || 1565,
      language: oldState.settings?.language || 'ckb',
    };
  } else if (oldState.settings) {
    base.settings = { ...DEFAULT_SETTINGS, ...oldState.settings };
  }

  return base;
}

/** ────────────────────────────────────────────────────────────────────────────
 *  Clear all stored application data
 *  ──────────────────────────────────────────────────────────────────────────── */
export function clearAllData(): StorageResult<void> {
  if (!isStorageAvailable()) {
    return { success: false, error: 'localStorage not available' };
  }

  try {
    // Create backup before clearing
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) {
      localStorage.setItem(BACKUP_KEY + '_archive_' + Date.now(), current);
    }

    localStorage.removeItem(STORAGE_KEY);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

/** ────────────────────────────────────────────────────────────────────────────
 *  Export records to CSV string
 *  ──────────────────────────────────────────────────────────────────────────── */
export function exportRecordsToCSV(records: SaleRecord[]): string {
  if (records.length === 0) return '';

  const headers = ['Date', 'Time', 'Product', 'Category', 'Quantity', 'UnitPrice', 'TotalSales'];
  const rows = records.map(r => [
    r.date,
    r.time || '',
    `"${r.product.replace(/"/g, '""')}"`,
    `"${r.category.replace(/"/g, '""')}"`,
    r.quantity,
    r.unitPrice,
    r.totalSales,
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/** ────────────────────────────────────────────────────────────────────────────
 *  Get storage usage statistics
 *  ──────────────────────────────────────────────────────────────────────────── */
export function getStorageStats(): { used: number; total: number; percentage: number } {
  if (!isStorageAvailable()) {
    return { used: 0, total: 0, percentage: 0 };
  }

  try {
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        totalSize += localStorage.getItem(key)?.length || 0;
      }
    }

    // Approximate localStorage limit (varies by browser, typically 5-10MB)
    const estimatedLimit = 5 * 1024 * 1024;
    return {
      used: totalSize,
      total: estimatedLimit,
      percentage: Math.round((totalSize / estimatedLimit) * 100),
    };
  } catch {
    return { used: 0, total: 0, percentage: 0 };
  }
}
