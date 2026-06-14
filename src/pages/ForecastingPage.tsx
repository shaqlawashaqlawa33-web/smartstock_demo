import { useState, useCallback, useMemo } from 'react';
import { useStoreData } from '@/hooks/useStoreData';
import { useCurrency } from '@/hooks/useCurrency';
import { useSettings } from '@/hooks/useSettings';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatChartAxis } from '@/lib/currency';
import { generateForecast, getDailySales } from '@/lib/dataProcessor';
import { exportForecastToCSV, downloadFile, generateFilename } from '@/lib/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CurrencyToggle from '@/components/CurrencyToggle';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, ComposedChart, ReferenceLine, Line
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, AlertTriangle, CheckCircle, Brain, Download, TrendingDown, Minus } from 'lucide-react';

export default function ForecastingPage() {
  const { records } = useStoreData();
  const { config } = useCurrency();
  const { settings } = useSettings();
  const { t } = useTranslation(['forecast', 'common']);
  const [forecastDays, setForecastDays] = useState(30);

  const isRTL = settings.language === 'ar' || settings.language === 'ckb';

  const dailySales = useMemo(() => getDailySales(records), [records]);
  const forecastResult = useMemo(() => generateForecast(records, forecastDays), [records, forecastDays]);

  const fmt = useCallback((val: number) => formatCurrency(val, config), [config]);
  const fmtAxis = useCallback((val: number) => formatChartAxis(val, config), [config]);

  const last30Days = useMemo(() => dailySales.slice(-30).map(d => ({
    date: d.date, actual: d.totalSales, predicted: null, lowerBound: null, upperBound: null,
  })), [dailySales]);

  const forecastData = useMemo(() => forecastResult.points.map(f => ({
    date: f.date, actual: null, predicted: f.predicted, lowerBound: f.lowerBound, upperBound: f.upperBound,
  })), [forecastResult.points]);

  const combinedData = useMemo(() => [...last30Days, ...forecastData], [last30Days, forecastData]);

  const totalPredicted = useMemo(() => forecastResult.points.reduce((s, f) => s + f.predicted, 0), [forecastResult.points]);
  const avgDaily = useMemo(() => totalPredicted / (forecastResult.points.length || 1), [totalPredicted, forecastResult.points.length]);
  const avgHistorical = useMemo(() => dailySales.slice(-30).reduce((s, d) => s + d.totalSales, 0) / Math.min(30, dailySales.length || 1), [dailySales]);
  const projectedGrowth = useMemo(() => avgHistorical > 0 ? ((avgDaily - avgHistorical) / avgHistorical) * 100 : 0, [avgDaily, avgHistorical]);

  const peakForecastDays = useMemo(() => [...forecastResult.points].sort((a, b) => b.predicted - a.predicted).slice(0, 5), [forecastResult.points]);

  const forecastOptions = [7, 14, 30];

  const handleExportForecast = useCallback(() => {
    const csv = exportForecastToCSV(forecastResult.points);
    downloadFile(csv, generateFilename('forecast', 'csv'));
  }, [forecastResult.points]);

  // Trend icon based on direction
  const TrendIcon = forecastResult.trendDirection === 'up' ? TrendingUp : forecastResult.trendDirection === 'down' ? TrendingDown : Minus;
  const trendColor = forecastResult.trendDirection === 'up' ? 'text-emerald-400' : forecastResult.trendDirection === 'down' ? 'text-red-400' : 'text-amber-400';

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
              <Brain size={28} className="text-emerald-400" />
              {t('forecast:title')}
            </h1>
            <p className="text-slate-600 dark:text-slate-300">{t('forecast:subtitle')}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <CurrencyToggle />
            <Button size="sm" variant="outline" onClick={handleExportForecast} className="border-slate-300 text-slate-600 dark:border-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-900">
              <Download size={14} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
              CSV
            </Button>
            <div className="flex gap-2">
              {forecastOptions.map(days => (
                <Button key={days} onClick={() => setForecastDays(days)} variant={forecastDays === days ? 'default' : 'outline'}
                  className={forecastDays === days ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}>
                  {days} {t('forecast:forecastDays')}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Forecast method badge */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
          <Brain size={12} className="mr-1" /> Holt-Winters
        </Badge>
        <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/5">
          {t('forecast:confidenceRange')}: {forecastResult.accuracy}%
        </Badge>
        <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/5">
          {t('forecast:confidenceRange')}: {forecastResult.seasonalityStrength}%
        </Badge>
        <Badge variant="outline" className={forecastResult.trendDirection === 'up' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' : forecastResult.trendDirection === 'down' ? 'border-red-500/30 text-red-400 bg-red-500/5' : 'border-amber-500/30 text-amber-400 bg-amber-500/5'}>
          <TrendIcon size={12} className="mr-1" />
          {forecastResult.trendDirection === 'up' ? t('forecast:growth') : forecastResult.trendDirection === 'down' ? t('forecast:decline') : t('forecast:stable')}
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: t('forecast:predictedRevenue'), value: fmt(totalPredicted), sub: `${forecastDays} ${t('forecast:forecastDays')}`, icon: <TrendingUp size={18} />, color: 'emerald' },
          { label: t('forecast:dailyForecast'), value: fmt(avgDaily), sub: `${projectedGrowth >= 0 ? '+' : ''}${projectedGrowth.toFixed(1)}% ${t('forecast:trendProjectedDesc', { direction: projectedGrowth >= 0 ? t('forecast:growth') : t('forecast:decline'), growth: Math.abs(projectedGrowth).toFixed(1), days: 30 })}`, icon: <Calendar size={18} />, color: projectedGrowth >= 0 ? 'emerald' : 'red' },
          { label: t('forecast:historicalAvg'), value: fmt(avgHistorical), sub: t('forecast:historicalAvg'), icon: <CheckCircle size={18} />, color: 'blue' },
          { label: t('forecast:confidenceRange'), value: '±95%', sub: t('forecast:confidenceRange'), icon: <AlertTriangle size={18} />, color: 'amber' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: settings.enableAnimations ? 0 : 1, y: settings.enableAnimations ? 20 : 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={settings.enableAnimations ? { duration: 0.4, delay: i * 0.1 } : { duration: 0 }}
          >
            <Card className={`bg-white dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 transition-colors ${settings.compactMode ? 'shadow-none' : ''
              }`}>
              <CardContent className={settings.compactMode ? 'p-3' : 'p-5'}>
                <div className={`flex items-center gap-2 text-${stat.color}-400 mb-3`}>
                  {stat.icon}
                  <span className="text-xs font-medium uppercase tracking-wider">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-slate-400 mt-1">{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Forecast Chart */}
      <Card className={`bg-white dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 mb-6 transition-colors ${settings.compactMode ? 'shadow-none' : ''
        }`}>
        <CardHeader className={settings.compactMode ? 'pb-1 pt-3 px-3' : ''}>
          <CardTitle className="text-slate-900 dark:text-white">{t('forecast:forecastTitle', { days: forecastDays })}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={combinedData}>
              <defs>
                <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tickFormatter={(val) => format(parseISO(val), 'MMM dd')} stroke="#64748b" fontSize={12} />
              <YAxis tickFormatter={fmtAxis} stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }}
                formatter={(value: number, name: string) => {
                  if (name === 'actual') return [fmt(value), t('forecast:actualSales')];
                  if (name === 'predicted') return [fmt(value), t('forecast:predictedSales')];
                  if (name === 'lowerBound') return [fmt(value), t('forecast:confidenceBand')];
                  if (name === 'upperBound') return [fmt(value), t('forecast:confidenceBand')];
                  return [value, name];
                }}
                labelFormatter={(label) => format(parseISO(label), 'MMM dd, yyyy')}
              />
              <Area type="monotone" dataKey="upperBound" stroke="none" fill="url(#colorConfidence)" />
              <Area type="monotone" dataKey="lowerBound" stroke="none" fill="#0f172a" />
              <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} dot={false} connectNulls={false} />
              <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#3b82f6' }} connectNulls={false} />
              <ReferenceLine x={dailySales[dailySales.length - 1]?.date} stroke="#f59e0b" strokeDasharray="3 3"
                label={{ value: t('forecast:today'), fill: '#f59e0b', fontSize: 12, position: 'top' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-8 mt-4 flex-wrap">
            <div className="flex items-center gap-2"><div className="w-4 h-0.5 bg-emerald-500" /><span className="text-sm text-slate-400">{t('forecast:actualSales')}</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-0.5 bg-blue-500" /><span className="text-sm text-slate-400">{t('forecast:predictedSales')}</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-500/10 rounded" /><span className="text-sm text-slate-400">{t('forecast:confidenceBand')}</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Peak Days & Insights */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className={`bg-white dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 transition-colors ${settings.compactMode ? 'shadow-none' : ''
          }`}>
          <CardHeader className={settings.compactMode ? 'pb-1 pt-3 px-3' : ''}>
            <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-400" />
              {t('forecast:peakDays')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {peakForecastDays.map((day, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <span className="text-emerald-400 font-bold text-sm">{i + 1}</span>
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-white font-medium">{format(parseISO(day.date), 'EEEE, MMM dd')}</p>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">{t('forecast:confidenceRange')}: {fmt(day.lowerBound)} - {fmt(day.upperBound)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold">{fmt(day.predicted)}</p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">{t('forecast:predictedSales')}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-white dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 transition-colors ${settings.compactMode ? 'shadow-none' : ''
          }`}>
          <CardHeader className={settings.compactMode ? 'pb-1 pt-3 px-3' : ''}>
            <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
              <Brain size={18} className="text-blue-400" />
              {t('forecast:forecastInsights')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-slate-900 dark:text-white font-medium mb-1">{t('forecast:weekendPattern')}</p>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">{t('forecast:weekendPatternDesc')}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                <div className="flex items-start gap-3">
                  <TrendIcon size={18} className={`${trendColor} mt-0.5 shrink-0`} />
                  <div>
                    <p className="text-slate-900 dark:text-white font-medium mb-1">{t('forecast:trendProjected')}</p>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">{t('forecast:trendProjectedDesc', { direction: projectedGrowth >= 0 ? t('forecast:growth') : t('forecast:decline'), growth: Math.abs(projectedGrowth).toFixed(1), days: forecastDays })}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/10">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className="text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-slate-900 dark:text-white font-medium mb-1">{t('forecast:inventoryAlert')}</p>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">{t('forecast:inventoryAlertDesc', { date: format(parseISO(peakForecastDays[0]?.date), 'MMM dd') })}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
