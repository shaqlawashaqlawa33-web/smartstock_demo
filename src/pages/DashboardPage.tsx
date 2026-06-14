import { useMemo, useCallback } from 'react';
import { useStoreData } from '@/hooks/useStoreData';
import { useCurrency } from '@/hooks/useCurrency';
import { useSettings } from '@/hooks/useSettings';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatChartAxis, formatNumber } from '@/lib/currency';
import { getDashboardMetrics, getDailySales, getCategorySummary, getProductSummary } from '@/lib/dataProcessor';
import { exportRecordsToCSV, exportDailySalesToCSV, exportProductsToCSV, downloadFile, generateFilename } from '@/lib/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import CurrencyToggle from '@/components/CurrencyToggle';
import {
  DollarSign, ShoppingCart, TrendingUp, Package,
  ArrowUpRight, ArrowDownRight, Calendar, Download,
  FileSpreadsheet, FileText
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];

export default function DashboardPage() {
  const { records, fileName, isLoading } = useStoreData();
  const { config } = useCurrency();
  const { settings } = useSettings();
  const { t } = useTranslation(['dashboard', 'common']);

  const isRTL = settings.language === 'ar' || settings.language === 'ckb';

  // Memoized data computations
  const metrics = useMemo(() => getDashboardMetrics(records), [records]);
  const dailySales = useMemo(() => getDailySales(records), [records]);
  const categories = useMemo(() => getCategorySummary(records), [records]);
  const products = useMemo(() => getProductSummary(records).slice(0, 10), [records]);
  const recentSales = useMemo(() => dailySales.slice(-30), [dailySales]);

  const fmt = useCallback((val: number) => formatCurrency(val, config), [config]);
  const fmtCompact = useCallback((val: number) => formatCurrency(val, config, true), [config]);
  const fmtAxis = useCallback((val: number) => formatChartAxis(val, config), [config]);

  const kpiCards = useMemo(() => [
    { title: t('dashboard:totalRevenue'), value: fmt(metrics.totalRevenue), change: metrics.revenueChange, icon: <DollarSign size={20} />, color: 'emerald' },
    { title: t('dashboard:totalOrders'), value: formatNumber(metrics.totalOrders, 0, settings.language), change: metrics.ordersChange, icon: <ShoppingCart size={20} />, color: 'blue' },
    { title: t('dashboard:avgOrderValue'), value: fmt(metrics.avgOrderValue), change: metrics.aovChange, icon: <TrendingUp size={20} />, color: 'amber' },
    { title: t('dashboard:uniqueProducts'), value: formatNumber(metrics.uniqueProducts, 0, settings.language), change: 0, icon: <Package size={20} />, color: 'purple' },
  ], [metrics, fmt, settings.language, t]);

  // Export handlers
  const handleExportCSV = useCallback(() => {
    const csv = exportRecordsToCSV(records);
    downloadFile(csv, generateFilename('sales_records', 'csv'));
  }, [records]);

  const handleExportDailyCSV = useCallback(() => {
    const csv = exportDailySalesToCSV(dailySales);
    downloadFile(csv, generateFilename('daily_sales', 'csv'));
  }, [dailySales]);

  const handleExportProductsCSV = useCallback(() => {
    const csv = exportProductsToCSV(getProductSummary(records));
    downloadFile(csv, generateFilename('products', 'csv'));
  }, [records]);

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{t('dashboard:title')}</h1>
            <p className="text-slate-600 dark:text-gray-300 flex items-center gap-2 flex-wrap">
              <Calendar size={14} />
              {fileName ? `${t('dashboard:source', { fileName })}` : t('dashboard:sampleData')}
              {' · '}
              {t('common:recordsCount', { count: records.length })}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <CurrencyToggle />
            {/* Export dropdown */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportCSV}
                className="border-slate-300 text-slate-600 dark:border-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-900"
              >
                <FileSpreadsheet size={14} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                CSV
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportDailyCSV}
                className="border-slate-300 text-slate-600 dark:border-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-900"
              >
                <FileText size={14} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('common:download')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportProductsCSV}
                className="border-slate-300 text-slate-600 dark:border-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-900"
              >
                <Download size={14} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('common:export')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: settings.enableAnimations ? 0 : 1, y: settings.enableAnimations ? 20 : 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={settings.enableAnimations ? { duration: 0.4, delay: i * 0.1 } : { duration: 0 }}
          >
            <Card className={`bg-white dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600 transition-colors ${settings.compactMode ? 'shadow-none' : ''
              }`}>
              <CardContent className={settings.compactMode ? 'p-3' : 'p-6'}>
                <div className={`flex items-center justify-between ${settings.compactMode ? 'mb-2' : 'mb-4'}`}>
                  <div className={`w-10 h-10 rounded-lg bg-${kpi.color}-500/10 border border-${kpi.color}-500/20 flex items-center justify-center text-${kpi.color}-400 ${settings.compactMode ? 'scale-90' : ''
                    }`}>
                    {kpi.icon}
                  </div>
                  {kpi.change !== 0 && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${kpi.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {kpi.change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      {Math.abs(kpi.change).toFixed(1)}%
                    </div>
                  )}
                </div>
                <p className={`text-slate-600 dark:text-gray-400 text-sm ${settings.compactMode ? 'mb-0' : 'mb-1'}`}>{kpi.title}</p>
                <p className={`${settings.compactMode ? 'text-xl' : 'text-2xl'} font-bold text-slate-900 dark:text-white`}>{kpi.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2 bg-white dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-900 dark:text-white text-lg">{t('dashboard:revenueTrend')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={recentSales}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-neutral-700" />
                <XAxis dataKey="date" tickFormatter={(val) => format(parseISO(val), 'MMM dd')} stroke="#94a3b8" className="dark:stroke-gray-500" fontSize={12} />
                <YAxis tickFormatter={fmtAxis} stroke="#94a3b8" className="dark:stroke-gray-500" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#000' }}
                  formatter={(value: number) => [fmt(value), t('dashboard:totalRevenue')]}
                  labelFormatter={(label) => format(parseISO(label), 'MMM dd, yyyy')}
                />
                <Area type="monotone" dataKey="totalSales" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-900 dark:text-white text-lg">{t('dashboard:salesByCategory')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categories} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="totalSales" nameKey="category">
                  {categories.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#000' }} formatter={(value: number) => fmtCompact(value)} />
                <Legend formatter={(value) => <span className="text-slate-600 dark:text-gray-400">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-900 dark:text-white text-lg">{t('dashboard:topProducts')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={products} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-neutral-700" />
                <XAxis type="number" tickFormatter={fmtAxis} stroke="#94a3b8" className="dark:stroke-gray-500" fontSize={12} />
                <YAxis type="category" dataKey="product" width={140} tick={{ fontSize: 11 }} stroke="#94a3b8" className="dark:stroke-gray-500" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#000' }} formatter={(value: number) => [fmt(value), t('dashboard:totalRevenue')]} />
                <Bar dataKey="totalSales" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-900 dark:text-white text-lg">{t('dashboard:dailyOrders')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={recentSales}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-neutral-700" />
                <XAxis dataKey="date" tickFormatter={(val) => format(parseISO(val), 'MMM dd')} stroke="#94a3b8" className="dark:stroke-gray-500" fontSize={12} />
                <YAxis stroke="#94a3b8" className="dark:stroke-gray-500" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#000' }} formatter={(value: number) => [value.toLocaleString(), t('dashboard:totalOrders')]} labelFormatter={(label) => format(parseISO(label), 'MMM dd, yyyy')} />
                <Area type="monotone" dataKey="orderCount" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorOrders)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}