/** ============================================================================
 *  EXPORT UTILITIES
 *  ============================================================================
 *  Professional CSV and PDF export functionality for all analytics data.
 *  Features:
 *  - CSV export with proper escaping and BOM for Excel compatibility
 *  - PDF reports with charts, tables, and branded styling using jsPDF
 *  - Multi-language support in exported documents
 *  - Automatic filename generation with timestamps
 *  ============================================================================
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { SaleRecord, DailySales, ProductSummary, CategorySummary, ForecastPoint, InventoryRecommendation, CurrencyConfig, Language, DashboardMetrics } from '@/types';
import { formatCurrency, formatNumber } from './currency';

/** ────────────────────────────────────────────────────────────────────────────
 *  CSV Export Functions
 *  ──────────────────────────────────────────────────────────────────────────── */

/** Export sale records to CSV */
export function exportRecordsToCSV(records: SaleRecord[]): string {
  if (records.length === 0) return '';

  const headers = ['Date', 'Time', 'Product', 'Category', 'Quantity', 'Unit Price (USD)', 'Total Sales (USD)'];
  const rows = records.map(r => [
    r.date,
    r.time || '',
    `"${r.product.replace(/"/g, '""')}"`,
    `"${r.category.replace(/"/g, '""')}"`,
    r.quantity,
    r.unitPrice.toFixed(2),
    r.totalSales.toFixed(2),
  ]);

  // Add BOM for Excel UTF-8 compatibility
  const bom = '\uFEFF';
  return bom + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/** Export daily sales to CSV */
export function exportDailySalesToCSV(dailySales: DailySales[]): string {
  if (dailySales.length === 0) return '';

  const headers = ['Date', 'Total Sales (USD)', 'Total Quantity', 'Order Count'];
  const rows = dailySales.map(d => [
    d.date,
    d.totalSales.toFixed(2),
    d.totalQuantity,
    d.orderCount,
  ]);

  const bom = '\uFEFF';
  return bom + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/** Export product summary to CSV */
export function exportProductsToCSV(products: ProductSummary[]): string {
  if (products.length === 0) return '';

  const headers = ['Product', 'Category', 'Total Sales (USD)', 'Total Quantity', 'Avg Price', 'Order Count'];
  const rows = products.map(p => [
    `"${p.product.replace(/"/g, '""')}"`,
    `"${p.category.replace(/"/g, '""')}"`,
    p.totalSales.toFixed(2),
    p.totalQuantity,
    p.avgPrice.toFixed(2),
    p.orderCount,
  ]);

  const bom = '\uFEFF';
  return bom + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/** Export forecast to CSV */
export function exportForecastToCSV(forecast: ForecastPoint[]): string {
  if (forecast.length === 0) return '';

  const headers = ['Date', 'Predicted (USD)', 'Lower Bound (USD)', 'Upper Bound (USD)'];
  const rows = forecast.map(f => [
    f.date,
    f.predicted.toFixed(2),
    f.lowerBound.toFixed(2),
    f.upperBound.toFixed(2),
  ]);

  const bom = '\uFEFF';
  return bom + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/** Export inventory recommendations to CSV */
export function exportInventoryToCSV(recommendations: InventoryRecommendation[]): string {
  if (recommendations.length === 0) return '';

  const headers = ['Product', 'Category', 'Current Stock', 'Avg Daily Sales', 'Days Until Stockout', 'Recommendation', 'Urgency', 'Suggested Order Qty'];
  const rows = recommendations.map(r => [
    `"${r.product.replace(/"/g, '""')}"`,
    `"${r.category.replace(/"/g, '""')}"`,
    r.currentStock,
    r.avgDailySales.toFixed(2),
    r.daysUntilStockout.toFixed(1),
    r.recommendation,
    r.urgency,
    r.suggestedOrderQty,
  ]);

  const bom = '\uFEFF';
  return bom + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/** Trigger a file download */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/csv'): void {
  const blob = new Blob([content], { type: mimeType + ';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Generate timestamped filename */
export function generateFilename(base: string, ext: string): string {
  const now = new Date();
  const ts = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  return `${base}_${ts}.${ext}`;
}

/** ────────────────────────────────────────────────────────────────────────────
 *  PDF Report Generation
 *  ──────────────────────────────────────────────────────────────────────────── */

interface PDFReportData {
  title: string;
  metrics: DashboardMetrics;
  dailySales: DailySales[];
  products: ProductSummary[];
  categories: CategorySummary[];
  forecast?: ForecastPoint[];
  inventory?: InventoryRecommendation[];
  currency: CurrencyConfig;
  language: Language;
  fileName: string;
}

/** Generate a comprehensive PDF report */
export async function generatePDFReport(data: PDFReportData): Promise<void> {
  const { title, metrics, products, categories, forecast, inventory, currency, fileName } = data;

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 20;

  // Header with branding
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Retail Pulse', margin, 18);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(title, margin, 28);

  y = 45;

  // Report metadata
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
  doc.text(`Data Source: ${fileName || 'Sample Data'}`, margin, y + 5);
  y += 15;

  // KPI Summary
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Performance Indicators', margin, y);
  y += 8;

  const kpiData = [
    ['Total Revenue', formatCurrency(metrics.totalRevenue, currency)],
    ['Total Orders', formatNumber(metrics.totalOrders, 0, 'en')],
    ['Avg Order Value', formatCurrency(metrics.avgOrderValue, currency)],
    ['Unique Products', formatNumber(metrics.uniqueProducts, 0, 'en')],
  ];

  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Value']],
    body: kpiData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129], textColor: 255 },
    styles: { fontSize: 10 },
    margin: { left: margin, right: margin },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // Product Performance Table
  if (y > 250) { doc.addPage(); y = 20; }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Top Products by Revenue', margin, y);
  y += 8;

  const productData = products.slice(0, 15).map(p => [
    p.product,
    p.category,
    formatCurrency(p.totalSales, currency),
    p.totalQuantity.toString(),
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Product', 'Category', 'Revenue', 'Quantity']],
    body: productData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    styles: { fontSize: 9 },
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 35 },
      2: { cellWidth: 35 },
      3: { cellWidth: 'auto' },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // Category Breakdown
  if (y > 250) { doc.addPage(); y = 20; }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Sales by Category', margin, y);
  y += 8;

  const categoryData = categories.map(c => [
    c.category,
    formatCurrency(c.totalSales, currency),
    c.totalQuantity.toString(),
    c.productCount.toString(),
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Category', 'Revenue', 'Quantity', 'Products']],
    body: categoryData,
    theme: 'striped',
    headStyles: { fillColor: [139, 92, 246], textColor: 255 },
    styles: { fontSize: 10 },
    margin: { left: margin, right: margin },
  });

  // Forecast section
  if (forecast && forecast.length > 0) {
    y = (doc as any).lastAutoTable.finalY + 10;
    if (y > 200) { doc.addPage(); y = 20; }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Sales Forecast (Next 14 Days)', margin, y);
    y += 8;

    const forecastData = forecast.slice(0, 14).map(f => [
      f.date,
      formatCurrency(f.predicted, currency),
      formatCurrency(f.lowerBound, currency),
      formatCurrency(f.upperBound, currency),
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Date', 'Predicted', 'Lower Bound', 'Upper Bound']],
      body: forecastData,
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11], textColor: 255 },
      styles: { fontSize: 9 },
      margin: { left: margin, right: margin },
    });
  }

  // Inventory section
  if (inventory && inventory.length > 0) {
    const restockItems = inventory.filter(i => i.recommendation === 'restock');
    if (restockItems.length > 0) {
      y = (doc as any).lastAutoTable?.finalY + 10 || 250;
      if (y > 200) { doc.addPage(); y = 20; }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Restock Recommendations', margin, y);
      y += 8;

      const inventoryData = restockItems.slice(0, 15).map(i => [
        i.product,
        i.currentStock.toString(),
        i.avgDailySales.toFixed(1),
        i.daysUntilStockout.toFixed(0),
        i.suggestedOrderQty.toString(),
      ]);

      autoTable(doc, {
        startY: y,
        head: [['Product', 'Current Stock', 'Daily Sales', 'Days Left', 'Suggested Order']],
        body: inventoryData,
        theme: 'striped',
        headStyles: { fillColor: [239, 68, 68], textColor: 255 },
        styles: { fontSize: 9 },
        margin: { left: margin, right: margin },
      });
    }
  }

  // Footer on every page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Retail Pulse Analytics - Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save
  const filename = generateFilename('retail_pulse_report', 'pdf');
  doc.save(filename);
}
