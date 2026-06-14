import { useState, useCallback } from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import { useSettings } from '@/hooks/useSettings';
import { useStoreData } from '@/hooks/useStoreData';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';
import { Moon, Sun } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Save, TrendingUp, DollarSign, Globe, Palette, Database,
  Trash2, Download, Info, CheckCircle
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES } from '@/i18n';
import type { Language } from '@/types';
import { exportRecordsToCSV, downloadFile, generateFilename } from '@/lib/export';
import { getStorageStats } from '@/lib/storage';
import { DEFAULT_EXCHANGE_RATE } from '@/lib/currency';

export default function SettingsPage() {
  const { config, setCurrency, setExchangeRate } = useCurrency();
  const { settings, updateSettings, setLanguage, resetSettings } = useSettings();
  const { records, clearData } = useStoreData();
  const { t } = useTranslation(['settings', 'common']);
  const [rate, setRate] = useState(config.exchangeRate.toString());
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const { theme, toggleTheme } = useTheme();

  const storageStats = getStorageStats();

  const handleSaveRate = useCallback(() => {
    const newRate = parseFloat(rate);
    if (!isNaN(newRate) && newRate > 0) {
      setExchangeRate(newRate);
      setSavedMessage(t('settings:saveRate'));
      setTimeout(() => setSavedMessage(''), 3000);
    }
  }, [rate, setExchangeRate, t]);

  const handleUseMarketRate = useCallback(() => {
    const marketRate = 1565;
    setRate(marketRate.toString());
    setExchangeRate(marketRate);
    setSavedMessage(t('settings:saveRate'));
    setTimeout(() => setSavedMessage(''), 3000);
  }, [setExchangeRate, t]);

  const handleExportData = useCallback(() => {
    const csv = exportRecordsToCSV(records);
    downloadFile(csv, generateFilename('sales_export', 'csv'));
  }, [records]);

  const handleClearData = useCallback(() => {
    clearData();
    setShowClearDialog(false);
    setSavedMessage(t('settings:dataCleared'));
    setTimeout(() => setSavedMessage(''), 3000);
  }, [clearData, t]);

  const handleResetSettings = useCallback(() => {
    resetSettings();
    setRate(DEFAULT_EXCHANGE_RATE.toString());
    setShowResetDialog(false);
    setSavedMessage(t('settings:dataCleared'));
    setTimeout(() => setSavedMessage(''), 3000);
  }, [resetSettings, t]);

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('settings:title')}</h1>
        <p className="text-slate-600 dark:text-gray-300">{t('settings:subtitle')}</p>
      </div>

      {/* Saved message */}
      {savedMessage && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 border border-emerald-300 dark:border-emerald-900 flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" />
          <span className="text-emerald-600 dark:text-emerald-400 text-sm">{savedMessage}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Language Settings */}
        <Card className="bg-white dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
              <Globe size={20} className="text-emerald-400" />
              {t('settings:languageSettings')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label className="text-slate-600 dark:text-gray-300">{t('settings:selectLanguage')}</Label>
            <div className="flex gap-2 flex-wrap">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang as Language)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${settings.language === lang
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-neutral-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  {LANGUAGE_NAMES[lang as Language]}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Currency Settings */}
        <Card className="bg-white dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign size={20} className="text-emerald-400" />
              {t('settings:currencySettings')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Rate Display */}
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600 dark:text-gray-400 text-sm">{t('settings:currentRate')}:</span>
                <span className="text-slate-900 dark:text-white font-bold text-xl">1 USD = {config.exchangeRate.toLocaleString()} IQD</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-gray-400 text-sm">{t('settings:selectedCurrency')}:</span>
                <div className="flex gap-2">
                  <button onClick={() => setCurrency('IQD')}
                    className={`px-3 py-1 rounded-md text-sm ${config.currency === 'IQD' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-neutral-900 text-slate-600 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-neutral-800'}`}>
                    {t('common:currency.iqd')}
                  </button>
                  <button onClick={() => setCurrency('USD')}
                    className={`px-3 py-1 rounded-md text-sm ${config.currency === 'USD' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-neutral-900 text-slate-600 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-neutral-800'}`}>
                    {t('common:currency.usd')}
                  </button>
                </div>
              </div>
            </div>

            {/* Edit Exchange Rate */}
            <div className="space-y-3">
              <Label className="text-slate-600 dark:text-gray-300">{t('settings:editExchangeRate')}</Label>
              <div className="flex gap-3">
                <Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder={t('settings:editExchangeRate')} className="bg-slate-100 dark:bg-neutral-900 border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white" />
                <Button onClick={handleSaveRate} className="bg-emerald-600 hover:bg-emerald-500">
                  <Save size={16} className="ml-2" />
                  {t('common:save')}
                </Button>
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400 dark:text-gray-400">{t('settings:marketRateInfo')}</p>
            </div>

            {/* Quick Set Current Market Rate */}
            <div className="pt-4 border-t border-slate-200 dark:border-neutral-700">
              <Button onClick={handleUseMarketRate} variant="outline" className="border-emerald-500/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 w-full">
                <TrendingUp size={16} className="ml-2" />
                {t('settings:useMarketRate')}
              </Button>
            </div>

            {/* Info Note */}
            <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-900">
              <p className="text-xs text-amber-800 dark:text-amber-300">
                {t('settings:marketRateInfo')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="bg-white dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
              <Palette size={20} className="text-emerald-400" />
              {t('settings:appearanceSettings')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-900 dark:text-white">{t('settings:enableAnimations')}</Label>
                <p className="text-xs text-slate-600 dark:text-gray-400">{t('settings:enableAnimations')}</p>
              </div>
              <Switch checked={settings.enableAnimations} onCheckedChange={(v) => updateSettings({ enableAnimations: v })} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-900 dark:text-white">{t('settings:compactMode')}</Label>
                <p className="text-xs text-slate-600 dark:text-gray-400">{t('settings:compactMode')}</p>
              </div>
              <Switch checked={settings.compactMode} onCheckedChange={(v) => updateSettings({ compactMode: v })} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-900 dark:text-white">{t('settings:darkMode')}</Label>
                <p className="text-xs text-slate-600 dark:text-gray-400">{t('common:toggleDarkMode', { defaultValue: 'Toggle dark mode' })}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="border-slate-300 dark:border-neutral-700 text-slate-600 dark:text-gray-300"
              >
                {theme === 'dark' ? <Sun size={16} className="mr-2" /> : <Moon size={16} className="mr-2" />}
                {theme === 'dark' ? 'Light' : 'Dark'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="bg-white dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
              <Database size={20} className="text-emerald-400" />
              {t('settings:dataManagement')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-900 dark:text-white font-medium">{t('settings:exportData')}</p>
                <p className="text-xs text-slate-600 dark:text-gray-400">{t('settings:exportDataDesc')}</p>
              </div>
              <Button onClick={handleExportData} variant="outline" size="sm" className="border-slate-300 dark:border-neutral-700 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-neutral-900">
                <Download size={14} className="ml-2" />
                {t('common:export')}
              </Button>
            </div>

            {storageStats.percentage > 0 && (
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-neutral-900/50">
                <div className="flex justify-between text-xs text-slate-600 dark:text-gray-300 mb-1">
                  <span>{t('settings:dataManagement')}</span>
                  <span>{storageStats.percentage}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${storageStats.percentage}%` }} />
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 dark:border-neutral-700 flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{t('settings:clearAllData')}</p>
                <p className="text-xs text-slate-600 dark:text-gray-300">{t('settings:clearDataDesc')}</p>
              </div>
              <Button onClick={() => setShowClearDialog(true)} variant="outline" size="sm" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                <Trash2 size={14} className="ml-2" />
                {t('common:delete')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reset Settings */}
        <Card className="bg-white dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Info size={20} className="text-emerald-400" />
              {t('settings:about')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600 dark:text-gray-300 text-sm">{t('settings:version')}</p>
            <Button onClick={() => setShowResetDialog(true)} variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 w-full">
              {t('settings:resetSettings')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Clear Data Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent className="bg-slate-900 border-slate-200 dark:border-neutral-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">{t('settings:clearAllData')}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-gray-300">
              {t('settings:clearDataConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700">{t('common:cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearData} className="bg-red-600 hover:bg-red-500 text-white">{t('common:confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Settings Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="bg-slate-900 border-slate-200 dark:border-neutral-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">{t('settings:resetSettings')}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-gray-300">
              {t('settings:clearDataConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700">{t('common:cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetSettings} className="bg-amber-600 hover:bg-amber-500 text-white">{t('common:confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
