/** ============================================================================
 *  STORE DATA CONTEXT — Enhanced State Management with Persistence
 *  ============================================================================
 *  Provides global application state with automatic localStorage persistence.
 *  Features:
 *  - Automatic state hydration from localStorage on mount
 *  - Debounced persistence to reduce storage writes
 *  - Memoized selectors to prevent unnecessary re-renders
 *  - Loading states and error handling
 *  ============================================================================
 */

import { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { SaleRecord } from '@/types';
import { saveState, loadState, clearAllData } from '@/lib/storage';
import { getCachedSampleData, clearSampleDataCache } from '@/lib/sampleData';

interface StoreDataContextType {
  records: SaleRecord[];
  setRecords: (records: SaleRecord[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  hasData: boolean;
  fileName: string;
  setFileName: (name: string) => void;
  loadSampleData: () => void;
  clearData: () => void;
  lastUpdated: string | null;
  storageError: string | null;
}

const StoreDataContext = createContext<StoreDataContextType | undefined>(undefined);

/** Debounce delay for persistence (ms) */
const PERSISTENCE_DELAY = 500;

export function StoreDataProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage
  const [records, setRecordsState] = useState<SaleRecord[]>(() => {
    const saved = loadState();
    return saved.records || [];
  });
  const [fileName, setFileNameState] = useState<string>(() => {
    const saved = loadState();
    return saved.fileName || '';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(() => {
    const saved = loadState();
    return saved.lastUpdated || null;
  });

  const hasData = records.length > 0;

  // Debounced persistence ref
  const persistTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Persist state to localStorage with debouncing */
  const persistState = useCallback((newRecords: SaleRecord[], newFileName: string) => {
    if (persistTimeoutRef.current) {
      clearTimeout(persistTimeoutRef.current);
    }

    persistTimeoutRef.current = setTimeout(() => {
      const currentSettings = loadState().settings;
      const result = saveState({
        records: newRecords,
        fileName: newFileName,
        settings: currentSettings,
      });

      if (result.success) {
        setStorageError(null);
        setLastUpdated(new Date().toISOString());
      } else {
        setStorageError(result.error || 'Failed to save data');
      }
    }, PERSISTENCE_DELAY);
  }, []);

  /** Set records with automatic persistence */
  const setRecords = useCallback((newRecords: SaleRecord[]) => {
    setRecordsState(newRecords);
    persistState(newRecords, fileName);
  }, [fileName, persistState]);

  /** Set file name with automatic persistence */
  const setFileName = useCallback((name: string) => {
    setFileNameState(name);
    persistState(records, name);
  }, [records, persistState]);

  /** Load sample data with simulated loading */
  const loadSampleData = useCallback(() => {
    setIsLoading(true);
    // Simulate async loading
    setTimeout(() => {
      const data = getCachedSampleData();
      setRecordsState(data);
      setFileNameState('sample_sales_data.csv');
      persistState(data, 'sample_sales_data.csv');
      setIsLoading(false);
    }, 600);
  }, [persistState]);

  /** Clear all data */
  const clearData = useCallback(() => {
    setRecordsState([]);
    setFileNameState('');
    clearSampleDataCache();
    const result = clearAllData();
    if (!result.success) {
      setStorageError(result.error || 'Failed to clear data');
    } else {
      setStorageError(null);
      setLastUpdated(null);
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (persistTimeoutRef.current) {
        clearTimeout(persistTimeoutRef.current);
      }
    };
  }, []);

  const value = useMemo(() => ({
    records,
    setRecords,
    isLoading,
    setIsLoading,
    hasData,
    fileName,
    setFileName,
    loadSampleData,
    clearData,
    lastUpdated,
    storageError,
  }), [records, setRecords, isLoading, hasData, fileName, setFileName, loadSampleData, clearData, lastUpdated, storageError]);

  return (
    <StoreDataContext.Provider value={value}>
      {children}
    </StoreDataContext.Provider>
  );
}

export function useStoreData() {
  const context = useContext(StoreDataContext);
  if (!context) {
    throw new Error('useStoreData must be used within StoreDataProvider');
  }
  return context;
}
