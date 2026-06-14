/** ============================================================================
 *  CORE TYPE DEFINITIONS
 *  ============================================================================
 *  All data structures used across the SmartStock AI application.
 *  These types enforce type safety and provide clear contracts between
 *  the UI, data processing layer, and storage layer.
 *  ============================================================================
 */

/** ────────────────────────────────────────────────────────────────────────────
 *  SaleRecord: Core sales transaction record
 *  ──────────────────────────────────────────────────────────────────────────── */
export interface SaleRecord {
  date: string;
  time?: string;
  product: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalSales: number;
}

/** ────────────────────────────────────────────────────────────────────────────
 *  DailySales: Aggregated daily sales totals
 *  ──────────────────────────────────────────────────────────────────────────── */
export interface DailySales {
  date: string;
  totalSales: number;
  totalQuantity: number;
  orderCount: number;
}

/** ────────────────────────────────────────────────────────────────────────────
 *  ProductSummary: Per-product aggregated statistics
 *  ──────────────────────────────────────────────────────────────────────────── */
export interface ProductSummary {
  product: string;
  category: string;
  totalSales: number;
  totalQuantity: number;
  avgPrice: number;
  orderCount: number;
  salesTrend: number[];
}

/** ────────────────────────────────────────────────────────────────────────────
 *  CategorySummary: Per-category aggregated statistics
 *  ──────────────────────────────────────────────────────────────────────────── */
export interface CategorySummary {
  category: string;
  totalSales: number;
  totalQuantity: number;
  productCount: number;
}

/** ────────────────────────────────────────────────────────────────────────────
 *  ForecastPoint: Single forecast data point with confidence bounds
 *  ──────────────────────────────────────────────────────────────────────────── */
export interface ForecastPoint {
  date: string;
  predicted: number;
  lowerBound: number;
  upperBound: number;
}

/** ────────────────────────────────────────────────────────────────────────────
 *  InventoryRecommendation: AI-driven inventory advice per product
 *  ──────────────────────────────────────────────────────────────────────────── */
export interface InventoryRecommendation {
  product: string;
  category: string;
  currentStock: number;
  avgDailySales: number;
  daysUntilStockout: number;
  recommendation: 'restock' | 'overstock' | 'normal';
  suggestedOrderQty: number;
  urgency: 'high' | 'medium' | 'low';
}

/** ────────────────────────────────────────────────────────────────────────────
 *  DashboardMetrics: Key Performance Indicators for the dashboard
 *  ──────────────────────────────────────────────────────────────────────────── */
export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  uniqueProducts: number;
  revenueChange: number;
  ordersChange: number;
  aovChange: number;
}

/** ────────────────────────────────────────────────────────────────────────────
 *  Page: Legacy page identifier (kept for compatibility)
 *  ──────────────────────────────────────────────────────────────────────────── */
export type Page = 'landing' | 'upload' | 'dashboard' | 'sales' | 'forecast' | 'inventory' | 'settings';

/** ────────────────────────────────────────────────────────────────────────────
 *  Language: Supported UI languages
 *  ──────────────────────────────────────────────────────────────────────────── */
export type Language = 'ckb' | 'ar' | 'en';

/** ────────────────────────────────────────────────────────────────────────────
 *  Currency: Supported currencies
 *  ──────────────────────────────────────────────────────────────────────────── */
export type Currency = 'USD' | 'IQD';

/** ────────────────────────────────────────────────────────────────────────────
 *  CurrencyConfig: User's currency preferences
 *  ──────────────────────────────────────────────────────────────────────────── */
export interface CurrencyConfig {
  currency: Currency;
  exchangeRate: number; // 1 USD = ? IQD
}

/** ────────────────────────────────────────────────────────────────────────────
 *  AppSettings: User-configurable application settings
 *  ──────────────────────────────────────────────────────────────────────────── */
export interface AppSettings {
  language: Language;
  currency: Currency;
  exchangeRate: number;
  enableAnimations: boolean;
  autoSave: boolean;
  compactMode: boolean;
  dateFormat: 'gregorian' | 'islamic';
  darkMode: boolean;
}

/** ────────────────────────────────────────────────────────────────────────────
 *  AppState: Serializable application state for persistence
 *  ──────────────────────────────────────────────────────────────────────────── */
export interface AppState {
  records: SaleRecord[];
  fileName: string;
  settings: AppSettings;
  lastUpdated: string;
  version: number;
}

/** ────────────────────────────────────────────────────────────────────────────
 *  UploadValidationResult: Result of file upload validation
 *  ──────────────────────────────────────────────────────────────────────────── */
export interface UploadValidationResult {
  valid: boolean;
  records: SaleRecord[];
  error?: string;
  warnings: string[];
  stats: {
    totalRows: number;
    validRows: number;
    skippedRows: number;
    dateRange: { start: string; end: string } | null;
  };
}

/** ────────────────────────────────────────────────────────────────────────────
 *  ForecastResult: Enhanced forecast output with metadata
 *  ──────────────────────────────────────────────────────────────────────────── */
export interface ForecastResult {
  points: ForecastPoint[];
  method: string;
  confidence: number;
  seasonalityStrength: number;
  trendDirection: 'up' | 'down' | 'stable';
  accuracy: number; // MAPE on recent history
}
