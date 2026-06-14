import { useStoreData } from '@/hooks/useStoreData';
import { useCurrency } from '@/hooks/useCurrency';
import { useSettings } from '@/hooks/useSettings';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatChartAxis } from '@/lib/currency';
import { getDailySales, getProductSummary, getCategorySummary, getWeeklySales, getMonthlySales } from '@/lib/dataProcessor';
import { exportProductsToCSV, downloadFile, generateFilename } from '@/lib/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import CurrencyToggle from '@/components/CurrencyToggle';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { TrendingUp, Package, Layers, Calendar, Download } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#ec4899', '#06b6d4'];

export default function SalesAnalysisPage() {
  const { records } = useStoreData();
  const { config } = useCurrency();
  const { settings } = useSettings();
  const { t } = useTranslation(['sales', 'common']);

  const isRTL = settings.language === 'ar' || settings.language === 'ckb';

  const dailySales = useMemo(() => getDailySales(records), [records]);
  const products = useMemo(() => getProductSummary(records), [records]);
  const categories = useMemo(() => getCategorySummary(records), [records]);
  const weeklySales = useMemo(() => getWeeklySales(records), [records]);
  const monthlySales = useMemo(() => getMonthlySales(records), [records]);

  const formatCurrencyFn = useMemo(() => (val: number) => formatCurrency(val, config), [config]);
  const fmtAxis = useMemo(() => (val: number) => formatChartAxis(val, config), [config]);

  // Day of week analysis
  const dowData = useMemo(() => {
    const data = new Array(7).fill(0).map((_, i) => ({ day: t(`common:days.${['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][i]}`), sales: 0, count: 0 }));
    dailySales.forEach(d => {
      const dow = parseISO(d.date).getDay();
      data[dow].sales += d.totalSales;
      data[dow].count += 1;
    });
    return data.map(d => ({ day: d.day, avgSales: d.count > 0 ? Number((d.sales / d.count).toFixed(2)) : 0 }));
  }, [dailySales, t]);

  // Hourly sales
  const hasTimeData = records.some(r => r.time && r.time.length > 0);
  const hourlyData = useMemo(() => {
    if (!hasTimeData) {
      return [
        { hour: '6 AM', sales: 5 }, { hour: '7 AM', sales: 12 }, { hour: '8 AM', sales: 25 },
        { hour: '9 AM', sales: 35 }, { hour: '10 AM', sales: 45 }, { hour: '11 AM', sales: 55 },
        { hour: '12 PM', sales: 70 }, { hour: '1 PM', sales: 65 }, { hour: '2 PM', sales: 50 },
        { hour: '3 PM', sales: 45 }, { hour: '4 PM', sales: 55 }, { hour: '5 PM', sales: 75 },
        { hour: '6 PM', sales: 85 }, { hour: '7 PM', sales: 70 }, { hour: '8 PM', sales: 45 },
        { hour: '9 PM', sales: 25 }, { hour: '10 PM', sales: 10 },
      ];
    }

    const hourLabels: Record<number, string> = {
      6: '6 AM', 7: '7 AM', 8: '8 AM', 9: '9 AM', 10: '10 AM', 11: '11 AM',
      12: '12 PM', 13: '1 PM', 14: '2 PM', 15: '3 PM', 16: '4 PM', 17: '5 PM',
      18: '6 PM', 19: '7 PM', 20: '8 PM', 21: '9 PM', 22: '10 PM',
    };

    const hourly = new Array(17).fill(0).map((_, i) => ({
      hour: hourLabels[i + 6],
      sales: 0,
      count: 0,
    }));

    records.forEach(r => {
      if (!r.time) return;
      const hour = parseInt(r.time.split(':')[0], 10);
      if (hour >= 6 && hour <= 22) {
        const idx = hour - 6;
        hourly[idx].sales += r.totalSales;
        hourly[idx].count += r.quantity;
      }
    });

    return hourly.map(h => ({ hour: h.hour, sales: h.count > 0 ? Math.round(h.sales) : 0 }));
  }, [records, hasTimeData]);

  const handleExportProducts = () => {
    const csv = exportProductsToCSV(products);
    downloadFile(csv, generateFilename('products', 'csv'));
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('sales:title')}</h1>
          <p className="text-slate-600 dark:text-slate-400">{t('sales:subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <CurrencyToggle />
          <Button size="sm" variant="outline" onClick={handleExportProducts} className="border-slate-300 text-slate-600 dark:border-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-900">
            <Download size={14} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
            CSV
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: t('sales:topProduct'), value: products[0]?.product || 'N/A', sub: formatCurrencyFn(products[0]?.totalSales || 0), icon: <Package size={18} /> },
          { label: t('sales:topCategory'), value: categories[0]?.category || 'N/A', sub: formatCurrencyFn(categories[0]?.totalSales || 0), icon: <Layers size={18} /> },
          { label: t('sales:avgDailyRevenue'), value: formatCurrencyFn(dailySales.reduce((s, d) => s + d.totalSales, 0) / (dailySales.length || 1)), sub: `${dailySales.length} ${t('common:days.saturday')}`, icon: <TrendingUp size={18} /> },
          { label: t('sales:bestDay'), value: dowData.reduce((max, d) => d.avgSales > max.avgSales ? d : max, dowData[0])?.day || 'N/A', sub: t('sales:bestDay'), icon: <Calendar size={18} /> },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: settings.enableAnimations ? 0 : 1, y: settings.enableAnimations ? 20 : 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={settings.enableAnimations ? { duration: 0.4, delay: i * 0.1 } : { duration: 0 }}
          >
            <Card className={`bg-white dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 transition-colors ${settings.compactMode ? 'shadow-none' : ''}`}>
              <CardContent className={settings.compactMode ? 'p-3' : 'p-5'}>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-3">
                  {stat.icon}
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{stat.label}</span>
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white truncate">{stat.value}</p>
                <p className="text-sm text-slate-600 dark:text-slate-500">{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex-wrap h-auto">
          <TabsTrigger value="trends" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-slate-900 dark:text-white">{t('sales:trendsTab')}</TabsTrigger>
          <TabsTrigger value="products" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-slate-900 dark:text-white">{t('sales:productsTab')}</TabsTrigger>
          <TabsTrigger value="patterns" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-slate-900 dark:text-white">{t('sales:patternsTab')}</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <Card className={`bg-white dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 transition-colors ${settings.compactMode ? 'shadow-none' : ''}`}>
            <CardHeader className={settings.compactMode ? 'pb-1 pt-3 px-3' : ''}>
              <CardTitle className="text-slate-900 dark:text-white">{t('sales:dailyTrend')}</CardTitle>
            </CardHeader>
            <CardContent className={settings.compactMode ? 'p-3' : ''}>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={dailySales}>
                  <defs><linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-neutral-700" />
                  <XAxis dataKey="date" tickFormatter={(val) => format(parseISO(val), 'MMM dd')} stroke="#94a3b8" className="dark:stroke-gray-500" fontSize={12} />
                  <YAxis tickFormatter={fmtAxis} stroke="#94a3b8" className="dark:stroke-gray-500" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#000' }} formatter={(value: number) => [formatCurrencyFn(value), t('sales:revenue')]} labelFormatter={(label) => format(parseISO(label), 'MMM dd, yyyy')} />
                  <Area type="monotone" dataKey="totalSales" stroke="#10b981" strokeWidth={2} fill="url(#colorDaily)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className={`bg-white dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 transition-colors ${settings.compactMode ? 'shadow-none' : ''}`}>
              <CardHeader className={settings.compactMode ? 'pb-1 pt-3 px-3' : ''}>
                <CardTitle className="text-slate-900 dark:text-white">{t('sales:weeklySales')}</CardTitle>
              </CardHeader>
              <CardContent className={settings.compactMode ? 'p-3' : ''}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={weeklySales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-neutral-700" />
                    <XAxis dataKey="week" tickFormatter={(val) => format(parseISO(val), 'MMM dd')} stroke="#94a3b8" className="dark:stroke-gray-500" fontSize={11} />
                    <YAxis tickFormatter={fmtAxis} stroke="#94a3b8" className="dark:stroke-gray-500" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#000' }} formatter={(value: number) => [formatCurrencyFn(value), t('sales:revenue')]} />
                    <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className={`bg-white dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 transition-colors ${settings.compactMode ? 'shadow-none' : ''}`}>
              <CardHeader className={settings.compactMode ? 'pb-1 pt-3 px-3' : ''}>
                <CardTitle className="text-slate-900 dark:text-white">{t('sales:monthlySales')}</CardTitle>
              </CardHeader>
              <CardContent className={settings.compactMode ? 'p-3' : ''}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={monthlySales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-neutral-700" />
                    <XAxis dataKey="month" tickFormatter={(val) => format(parseISO(val + '-01'), 'MMM yyyy')} stroke="#94a3b8" className="dark:stroke-gray-500" fontSize={12} />
                    <YAxis tickFormatter={fmtAxis} stroke="#94a3b8" className="dark:stroke-gray-500" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#000' }} formatter={(value: number) => [formatCurrencyFn(value), t('sales:revenue')]} />
                    <Bar dataKey="sales" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className={`bg-white dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 transition-colors ${settings.compactMode ? 'shadow-none' : ''}`}>
              <CardHeader className={settings.compactMode ? 'pb-1 pt-3 px-3' : ''}>
                <CardTitle className="text-slate-900 dark:text-white">{t('sales:topProductsByRevenue')}</CardTitle>
              </CardHeader>
              <CardContent className={settings.compactMode ? 'p-3' : ''}>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={products.slice(0, 15)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-neutral-700" />
                    <XAxis type="number" tickFormatter={fmtAxis} stroke="#94a3b8" className="dark:stroke-gray-500" fontSize={12} />
                    <YAxis type="category" dataKey="product" width={130} tick={{ fontSize: 10 }} stroke="#94a3b8" className="dark:stroke-gray-500" />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#000' }} formatter={(value: number) => [formatCurrencyFn(value), t('sales:revenue')]} />
                    <Bar dataKey="totalSales" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className={`bg-white dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 transition-colors ${settings.compactMode ? 'shadow-none' : ''}`}>
              <CardHeader className={settings.compactMode ? 'pb-1 pt-3 px-3' : ''}>
                <CardTitle className="text-slate-900 dark:text-white">{t('sales:categoryDistribution')}</CardTitle>
              </CardHeader>
              <CardContent className={settings.compactMode ? 'p-3' : ''}>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie data={categories} cx="50%" cy="50%" innerRadius={70} outerRadius={120} paddingAngle={4} dataKey="totalSales" nameKey="category" label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {categories.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#000' }} formatter={(value: number) => formatCurrencyFn(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className={`bg-white dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 transition-colors ${settings.compactMode ? 'shadow-none' : ''}`}>
            <CardHeader className={settings.compactMode ? 'pb-1 pt-3 px-3' : ''}>
              <CardTitle className="text-slate-900 dark:text-white">{t('sales:productSummary')}</CardTitle>
            </CardHeader>
            <CardContent className={settings.compactMode ? 'p-3' : ''}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">{t('sales:revenue')}</th>
                    <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">{t('sales:quantity')}</th>
                    <th className="text-right py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">{t('sales:revenue')}</th>
                    <th className="text-right py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">{t('sales:quantity')}</th>
                    <th className="text-right py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">{t('sales:revenue')}</th>
                    <th className="text-right py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">{t('sales:quantity')}</th>
                  </tr></thead>
                  <tbody>
                    {products.slice(0, 20).map((product, i) => (
                      <tr key={i} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="py-3 px-4 text-slate-900 dark:text-slate-300 font-medium">{product.product}</td>
                        <td className="py-3 px-4"><span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs">{product.category}</span></td>
                        <td className="py-3 px-4 text-right text-emerald-400 font-medium">{formatCurrencyFn(product.totalSales)}</td>
                        <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">{product.totalQuantity.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">${product.avgPrice.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">{product.orderCount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className={`bg-white dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 transition-colors ${settings.compactMode ? 'shadow-none' : ''}`}>
              <CardHeader className={settings.compactMode ? 'pb-1 pt-3 px-3' : ''}>
                <CardTitle className="text-slate-900 dark:text-white">{t('sales:dayOfWeekPattern')}</CardTitle>
              </CardHeader>
              <CardContent className={settings.compactMode ? 'p-3' : ''}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dowData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-neutral-700" />
                    <XAxis dataKey="day" stroke="#94a3b8" className="dark:stroke-gray-500" fontSize={12} />
                    <YAxis tickFormatter={fmtAxis} stroke="#94a3b8" className="dark:stroke-gray-500" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#000' }} formatter={(value: number) => [formatCurrencyFn(value), t('sales:avgDailyRevenue')]} />
                    <Bar dataKey="avgSales" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className={`bg-white dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 transition-colors ${settings.compactMode ? 'shadow-none' : ''}`}>
              <CardHeader className={settings.compactMode ? 'pb-1 pt-3 px-3' : ''}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-900 dark:text-white">{t('sales:hourlySales')}</CardTitle>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {hasTimeData ? (
                    <><span className="text-xs text-emerald-400 font-medium">{t('sales:realHourlyData')}</span><span className="text-xs text-slate-500 dark:text-slate-400">| {t('sales:realHourlyData')}</span></>
                  ) : (
                    <><span className="text-xs text-amber-400 font-medium">{t('sales:simulatedHourly')}</span><span className="text-xs text-slate-500 dark:text-slate-400">| {t('sales:simulatedHourly')}</span></>
                  )}
                </div>
              </CardHeader>
              <CardContent className={settings.compactMode ? 'p-3' : ''}>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={hourlyData}>
                    <defs><linearGradient id="colorHourly" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-neutral-700" />
                    <XAxis dataKey="hour" stroke="#94a3b8" className="dark:stroke-gray-500" fontSize={11} />
                    <YAxis stroke="#94a3b8" className="dark:stroke-gray-500" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#000' }} formatter={(value: number) => [`${value}%`, t('sales:quantity')]} />
                    <Area type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorHourly)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className={`bg-white dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 transition-colors ${settings.compactMode ? 'shadow-none' : ''}`}>
            <CardHeader className={settings.compactMode ? 'pb-1 pt-3 px-3' : ''}>
              <CardTitle className="text-slate-900 dark:text-white">{t('sales:categoryComparison')}</CardTitle>
            </CardHeader>
            <CardContent className={settings.compactMode ? 'p-3' : ''}>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={categories}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-neutral-700" />
                  <XAxis dataKey="category" stroke="#94a3b8" className="dark:stroke-gray-500" fontSize={12} />
                  <YAxis yAxisId="left" tickFormatter={fmtAxis} stroke="#94a3b8" className="dark:stroke-gray-500" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" className="dark:stroke-gray-500" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#000' }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="totalSales" name={t('sales:revenue')} fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="totalQuantity" name={t('sales:quantity')} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
