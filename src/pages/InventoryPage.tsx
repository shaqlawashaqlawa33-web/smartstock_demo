import { useState, useMemo, useCallback } from 'react';
import { useStoreData } from '@/hooks/useStoreData';
import { useSettings } from '@/hooks/useSettings';
import { useTranslation } from 'react-i18next';
import { getInventoryRecommendations } from '@/lib/dataProcessor';
import { exportInventoryToCSV, downloadFile, generateFilename } from '@/lib/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package, AlertTriangle, CheckCircle, TrendingDown,
  ShoppingCart, Filter, ArrowUpRight, ArrowDownRight, Boxes, Download
} from 'lucide-react';
import { motion } from 'framer-motion';

type FilterType = 'all' | 'restock' | 'overstock' | 'normal';

export default function InventoryPage() {
  const { records } = useStoreData();
  const { settings } = useSettings();
  const { t } = useTranslation(['inventory', 'common']);
  const [filter, setFilter] = useState<FilterType>('all');

  const isRTL = settings.language === 'ar' || settings.language === 'ckb';

  const recommendations = useMemo(() => getInventoryRecommendations(records), [records]);

  const filtered = useMemo(() =>
    filter === 'all' ? recommendations : recommendations.filter(r => r.recommendation === filter),
    [recommendations, filter]
  );

  const restockCount = useMemo(() => recommendations.filter(r => r.recommendation === 'restock').length, [recommendations]);
  const overstockCount = useMemo(() => recommendations.filter(r => r.recommendation === 'overstock').length, [recommendations]);
  const normalCount = useMemo(() => recommendations.filter(r => r.recommendation === 'normal').length, [recommendations]);
  const highUrgency = useMemo(() => recommendations.filter(r => r.urgency === 'high').length, [recommendations]);

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'restock': return <ShoppingCart size={16} className="text-amber-400" />;
      case 'overstock': return <TrendingDown size={16} className="text-red-400" />;
      case 'normal': return <CheckCircle size={16} className="text-emerald-400" />;
      default: return null;
    }
  };

  const getRecommendationBadge = (rec: string) => {
    switch (rec) {
      case 'restock': return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">{t('inventory:restockLabel')}</Badge>;
      case 'overstock': return <Badge className="bg-red-500/10 text-red-400 border-red-500/20">{t('inventory:overstockLabel')}</Badge>;
      case 'normal': return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{t('inventory:normalLabel')}</Badge>;
      default: return null;
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'high': return <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">{t('inventory:highUrgencyLabel')}</Badge>;
      case 'medium': return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">{t('inventory:mediumUrgencyLabel')}</Badge>;
      case 'low': return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">{t('inventory:lowUrgencyLabel')}</Badge>;
      default: return null;
    }
  };

  const handleExport = useCallback(() => {
    const csv = exportInventoryToCSV(recommendations);
    downloadFile(csv, generateFilename('inventory', 'csv'));
  }, [recommendations]);

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
            <Boxes size={28} className="text-emerald-400" />
            {t('inventory:title')}
          </h1>
          <p className="text-slate-600 dark:text-gray-300">{t('inventory:subtitle')}</p>
        </div>
        <Button size="sm" variant="outline" onClick={handleExport} className="border-slate-300 text-slate-600 dark:border-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-900">
          <Download size={14} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
          CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: t('inventory:restockNeeded'), value: restockCount.toString(), sub: t('inventory:restockItems'), icon: <ShoppingCart size={18} />, color: 'amber', trend: 'up' },
          { label: t('inventory:highUrgency'), value: highUrgency.toString(), sub: t('inventory:highUrgencyItems'), icon: <AlertTriangle size={18} />, color: 'red', trend: 'up' },
          { label: t('inventory:overstock'), value: overstockCount.toString(), sub: t('inventory:slowMovingItems'), icon: <TrendingDown size={18} />, color: 'red', trend: 'down' },
          { label: t('inventory:healthyStock'), value: normalCount.toString(), sub: t('inventory:healthyItems'), icon: <CheckCircle size={18} />, color: 'emerald', trend: 'up' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: settings.enableAnimations ? 0 : 1, y: settings.enableAnimations ? 20 : 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={settings.enableAnimations ? { duration: 0.4, delay: i * 0.1 } : { duration: 0 }}
          >
            <Card className={`bg-white dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 transition-colors ${settings.compactMode ? 'shadow-none' : ''}`}>
              <CardContent className={settings.compactMode ? 'p-3' : 'p-5'}>
                <div className={`flex items-center gap-2 text-${stat.color}-400 mb-3`}>
                  {stat.icon}
                  <span className="text-xs font-medium uppercase tracking-wider">{stat.label}</span>
                </div>
                <div className="flex items-end gap-2">
                  <p className={`${settings.compactMode ? 'text-2xl' : 'text-3xl'} font-bold text-slate-900 dark:text-white`}>{stat.value}</p>
                  {stat.trend === 'up' ? <ArrowUpRight size={18} className={`text-${stat.color}-400 mb-1`} /> : <ArrowDownRight size={18} className={`text-${stat.color}-400 mb-1`} />}
                </div>
                <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <Filter size={16} />
          <span className="text-sm">{t('common:filter')}:</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {([
            { key: 'all', label: t('inventory:allProducts') },
            { key: 'restock', label: t('inventory:restockFilter') },
            { key: 'overstock', label: t('inventory:overstockFilter') },
            { key: 'normal', label: t('inventory:normalFilter') },
          ] as const).map(f => (
            <Button key={f.key} onClick={() => setFilter(f.key)} variant={filter === f.key ? 'default' : 'outline'} size="sm"
              className={filter === f.key ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white' : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'}>:
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Recommendations Table */}
      <Card className={`bg-white dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 transition-colors ${settings.compactMode ? 'shadow-none' : ''}`}>
        <CardHeader className={settings.compactMode ? 'pb-1 pt-3 px-3' : ''}>
          <CardTitle className="text-slate-900 dark:text-white">
            {t('inventory:purchaseRecommendation')}
            <span className="text-slate-500 text-sm font-normal ml-2">({filtered.length} {t('common:recordsCount', { count: filtered.length })})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className={settings.compactMode ? 'p-3' : ''}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-700 dark:text-slate-400 font-medium">{t('inventory:product')}</th>
                  <th className="text-left py-3 px-4 text-slate-700 dark:text-slate-400 font-medium">{t('inventory:category')}</th>
                  <th className="text-right py-3 px-4 text-slate-700 dark:text-slate-400 font-medium">{t('inventory:currentStock')}</th>
                  <th className="text-right py-3 px-4 text-slate-700 dark:text-slate-400 font-medium">{t('inventory:dailySales')}</th>
                  <th className="text-right py-3 px-4 text-slate-700 dark:text-slate-400 font-medium">{t('inventory:daysRemaining')}</th>
                  <th className="text-center py-3 px-4 text-slate-700 dark:text-slate-400 font-medium">{t('inventory:status')}</th>
                  <th className="text-center py-3 px-4 text-slate-700 dark:text-slate-400 font-medium">{t('inventory:urgency')}</th>
                  <th className="text-right py-3 px-4 text-slate-700 dark:text-slate-400 font-medium">{t('inventory:suggestedOrder')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <motion.tr
                    key={`${item.product}-${i}`}
                    initial={{ opacity: settings.enableAnimations ? 0 : 1 }}
                    animate={{ opacity: 1 }}
                    transition={settings.enableAnimations ? { duration: 0.3, delay: i * 0.02 } : { duration: 0 }}
                    className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getRecommendationIcon(item.recommendation)}
                        <span className="text-slate-900 dark:text-white font-medium">{item.product}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4"><span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs">{item.category}</span></td>
                    <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">{item.currentStock.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">{item.avgDailySales.toFixed(1)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-medium ${item.daysUntilStockout < 5 ? 'text-red-400' : item.daysUntilStockout < 14 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {item.daysUntilStockout > 999 ? 'N/A' : item.daysUntilStockout.toFixed(0)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">{getRecommendationBadge(item.recommendation)}</td>
                    <td className="py-3 px-4 text-center">{getUrgencyBadge(item.urgency)}</td>
                    <td className="py-3 px-4 text-right">
                      {item.suggestedOrderQty > 0 ? (
                        <span className="text-emerald-400 font-medium">+{item.suggestedOrderQty.toLocaleString()}</span>
                      ) : (<span className="text-slate-500">—</span>)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Package size={48} className="text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-gray-300">{t('inventory:noResults')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Summary */}
      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <Card className={`bg-amber-500/5 border-amber-500/10 transition-colors ${settings.compactMode ? 'shadow-none' : ''}`}>
          <CardContent className={settings.compactMode ? 'p-3' : 'p-5'}>
            <div className="flex items-start gap-3">
              <ShoppingCart size={20} className="text-amber-400 mt-1 shrink-0" />
              <div>
                <h3 className="text-slate-900 dark:text-white font-semibold mb-2">{t('inventory:purchaseRecommendation')}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">{t('inventory:purchaseRecommendation')}</p>
                <div className="space-y-2">
                  {recommendations.filter(r => r.recommendation === 'restock').slice(0, 5).map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 dark:text-slate-300">{item.product}</span>
                      <span className="text-amber-400 font-medium">+{item.suggestedOrderQty} {t('common:currency.iqd')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-emerald-500/5 border-emerald-500/10 transition-colors ${settings.compactMode ? 'shadow-none' : ''}`}>
          <CardContent className={settings.compactMode ? 'p-3' : 'p-5'}>
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-emerald-400 mt-1 shrink-0" />
              <div>
                <h3 className="text-slate-900 dark:text-white font-semibold mb-2">{t('inventory:improvementTips')}</h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2"><ArrowUpRight size={14} className="text-emerald-400 mt-0.5 shrink-0" /><span>{t('inventory:tip1')}</span></li>
                  <li className="flex items-start gap-2"><ArrowUpRight size={14} className="text-emerald-400 mt-0.5 shrink-0" /><span>{t('inventory:tip2')}</span></li>
                  <li className="flex items-start gap-2"><ArrowUpRight size={14} className="text-emerald-400 mt-0.5 shrink-0" /><span>{t('inventory:tip3')}</span></li>
                  <li className="flex items-start gap-2"><ArrowUpRight size={14} className="text-emerald-400 mt-0.5 shrink-0" /><span>{t('inventory:tip4')}</span></li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
