/** ============================================================================
 *  DETERMINISTIC SAMPLE DATA GENERATOR
 *  ============================================================================
 *  Generates reproducible sample sales data using an LCG PRNG.
 *  Same seed always produces identical data - essential for testing and demos.
 *  ============================================================================
 */

import type { SaleRecord } from '@/types';

let prngSeed = 42;

function seededRandom(): number {
  prngSeed = (1664525 * prngSeed + 1013904223) >>> 0;
  return prngSeed / 4294967296;
}

export function resetPRNG(seed: number = 42): void {
  prngSeed = seed >>> 0;
}

const PRODUCTS = [
  { name: 'شیرێکی ئۆرگانیک ١لیتر', category: 'شیر' },
  { name: 'هێلکەی تازە ١٢دانە', category: 'شیر' },
  { name: 'پەنیرێکی چێدار ٢٠٠گرام', category: 'شیر' },
  { name: 'ماستی یۆنانی ٥٠٠گرام', category: 'شیر' },
  { name: 'کەرە ٢٥٠گرام', category: 'شیر' },
  { name: 'نانێکی سپی', category: 'نانەوا' },
  { name: 'کرواسان ٤دانە', category: 'نانەوا' },
  { name: 'نانێکی گەنم', category: 'نانەوا' },
  { name: 'مافینی شۆکۆلات ٢دانە', category: 'نانەوا' },
  { name: 'بەیگل ٦دانە', category: 'نانەوا' },
  { name: 'موزی ١ کیلۆ', category: 'سەوزە' },
  { name: 'سێوی سور ١ کیلۆ', category: 'سەوزە' },
  { name: 'گێزەر ٥٠٠گرام', category: 'سەوزە' },
  { name: 'سپیەیەک', category: 'سەوزە' },
  { name: 'تەماتە ٥٠٠گرام', category: 'سەوزە' },
  { name: 'پەتاتە ١ کیلۆ', category: 'سەوزە' },
  { name: 'پیاز ٥٠٠گرام', category: 'سەوزە' },
  { name: 'سینگی مریشک ٥٠٠گرام', category: 'گۆشت' },
  { name: 'گۆشتی ڕەقە ٥٠٠گرام', category: 'گۆشت' },
  { name: 'فیلێی ساڵمۆن ٣٠٠گرام', category: 'گۆشت' },
  { name: 'قەدەی بەراز ٤٠٠گرام', category: 'گۆشت' },
  { name: 'سۆسەیس ٤٠٠گرام', category: 'گۆشت' },
  { name: 'شیرەی پرتەقاڵ ١لیتر', category: 'خواردنەوە' },
  { name: 'کۆلا ٢لیتر', category: 'خواردنەوە' },
  { name: 'ئاوی مەعەدنی ٦دانە', category: 'خواردنەوە' },
  { name: 'چای سەوز ٢٠تۆز', category: 'خواردنەوە' },
  { name: 'دانەی قاوە ٢٥٠گرام', category: 'خواردنەوە' },
  { name: 'برنج ١ کیلۆ', category: 'پەنیر' },
  { name: 'پاستا ٥٠٠گرام', category: 'پەنیر' },
  { name: 'ڕۆنی زەیتون ٥٠٠مل', category: 'پەنیر' },
  { name: 'سریال ٤٠٠گرام', category: 'پەنیر' },
  { name: 'تونەی قووتي ٣دانە', category: 'پەنیر' },
  { name: 'سۆسی تەماتە ٤٠٠گرام', category: 'پەنیر' },
  { name: 'شەکر ١ کیلۆ', category: 'پەنیر' },
  { name: 'ئارد ١ کیلۆ', category: 'پەنیر' },
];

const UNIT_PRICES: Record<string, number> = {
  'شیرێکی ئۆرگانیک ١لیتر': 3.49, 'هێلکەی تازە ١٢دانە': 4.99,
  'پەنیرێکی چێدار ٢٠٠گرام': 5.49, 'ماستی یۆنانی ٥٠٠گرام': 4.29,
  'کەرە ٢٥٠گرام': 3.99, 'نانێکی سپی': 2.49,
  'کرواسان ٤دانە': 5.99, 'نانێکی گەنم': 2.99,
  'مافینی شۆکۆلات ٢دانە': 3.49, 'بەیگل ٦دانە': 4.49,
  'موزی ١ کیلۆ': 2.99, 'سێوی سور ١ کیلۆ': 4.49,
  'گێزەر ٥٠٠گرام': 1.99, 'سپیەیەک': 2.49,
  'تەماتە ٥٠٠گرام': 3.49, 'پەتاتە ١ کیلۆ': 2.49,
  'پیاز ٥٠٠گرام': 1.99, 'سینگی مریشک ٥٠٠گرام': 8.99,
  'گۆشتی ڕەقە ٥٠٠گرام': 7.49, 'فیلێی ساڵمۆن ٣٠٠گرام': 12.99,
  'قەدەی بەراز ٤٠٠گرام': 6.99, 'سۆسەیس ٤٠٠گرام': 5.49,
  'شیرەی پرتەقاڵ ١لیتر': 3.99, 'کۆلا ٢لیتر': 2.99,
  'ئاوی مەعەدنی ٦دانە': 4.99, 'چای سەوز ٢٠تۆز': 3.49,
  'دانەی قاوە ٢٥٠گرام': 8.99, 'برنج ١ کیلۆ': 3.49,
  'پاستا ٥٠٠گرام': 2.49, 'ڕۆنی زەیتون ٥٠٠مل': 6.99,
  'سریال ٤٠٠گرام': 4.99, 'تونەی قووتي ٣دانە': 5.49,
  'سۆسی تەماتە ٤٠٠گرام': 1.99, 'شەکر ١ کیلۆ': 2.49,
  'ئارد ١ کیلۆ': 2.99,
};

// Seasonal multipliers for each month (0-11)
const SEASONAL_MULTIPLIERS = [
  0.85, 0.82, 0.95, 1.0, 1.05, 1.1, 1.15, 1.12, 1.0, 0.95, 0.9, 1.2,
];

// Day of week multipliers (0=Sunday, 6=Saturday)
const DOW_MULTIPLIERS = [0.7, 0.85, 0.9, 0.95, 1.0, 1.15, 1.3];

export function generateSampleData(days: number = 90): SaleRecord[] {
  const records: SaleRecord[] = [];
  const endDate = new Date('2024-06-15');

  resetPRNG(42);

  for (let d = days; d >= 0; d--) {
    const date = new Date(endDate);
    date.setDate(date.getDate() - d);

    const dateStr = date.toISOString().split('T')[0];
    const month = date.getMonth();
    const dow = date.getDay();

    const baseTransactions = 80 + seededRandom() * 40;
    const dayMultiplier = DOW_MULTIPLIERS[dow];
    const seasonalMultiplier = SEASONAL_MULTIPLIERS[month];
    const numTransactions = Math.round(baseTransactions * dayMultiplier * seasonalMultiplier);

    for (let t = 0; t < numTransactions; t++) {
      const product = PRODUCTS[Math.floor(seededRandom() * PRODUCTS.length)];
      const basePrice = UNIT_PRICES[product.name];
      const priceVariation = basePrice * (0.95 + seededRandom() * 0.1);
      const qtyRoll = seededRandom();
      const quantity = qtyRoll < 0.7 ? 1 : qtyRoll < 0.9 ? 2 : 3;

      records.push({
        date: dateStr,
        product: product.name,
        category: product.category,
        quantity,
        unitPrice: Number(priceVariation.toFixed(2)),
        totalSales: Number((priceVariation * quantity).toFixed(2)),
      });
    }
  }

  return records.sort((a, b) => a.date.localeCompare(b.date));
}

export function generateSampleCSV(): string {
  const records = generateSampleData(90);
  const headers = ['Date', 'Product', 'Category', 'Quantity', 'UnitPrice', 'TotalSales'];
  const rows = records.map(r =>
    `${r.date},"${r.product}","${r.category}",${r.quantity},${r.unitPrice},${r.totalSales}`,
  );
  return [headers.join(','), ...rows].join('\n');
}

/** Cached sample data for performance */
let cachedSampleData: SaleRecord[] | null = null;

export function getCachedSampleData(): SaleRecord[] {
  if (!cachedSampleData) {
    cachedSampleData = generateSampleData(90);
  }
  return cachedSampleData;
}

export function clearSampleDataCache(): void {
  cachedSampleData = null;
}
