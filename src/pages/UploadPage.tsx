import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreData } from '@/hooks/useStoreData';
import { useSettings } from '@/hooks/useSettings';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { parseSalesData } from '@/lib/dataProcessor';
import { generateSampleCSV } from '@/lib/sampleData';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Download,
  Database,
  ArrowRight,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function UploadPage() {
  const navigate = useNavigate();
  const { setRecords, setFileName, isLoading, setIsLoading, loadSampleData } = useStoreData();
  const { settings } = useSettings();
  const { t } = useTranslation(['upload', 'common']);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isRTL = settings.language === 'ar' || settings.language === 'ckb';

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const processFile = async (file: File) => {
    setIsLoading(true);
    setUploadStatus('idle');
    setWarnings([]);

    try {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error(t('upload:uploadError'));
      }

      const extension = file.name.split('.').pop()?.toLowerCase();
      let data: any[][] = [];

      if (extension === 'csv' || extension === 'txt') {
        const text = await file.text();
        data = text.split('\n').map(row => row.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')));
      } else if (extension === 'xlsx' || extension === 'xls') {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];
      } else {
        throw new Error(t('upload:uploadError'));
      }

      if (data.length < 2) {
        throw new Error(t('upload:uploadError'));
      }

      // Enhanced validation
      const result = parseSalesData(data);
      setWarnings(result.warnings);

      if (!result.valid) {
        throw new Error(result.error || t('upload:uploadError'));
      }

      setRecords(result.records);
      setFileName(file.name);
      setUploadStatus('success');
      setUploadMessage(t('upload:uploadSuccess'));

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      setUploadStatus('error');
      setUploadMessage(error instanceof Error ? error.message : t('upload:uploadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const downloadSample = () => {
    const csv = generateSampleCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_sales_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadDemo = useCallback(() => {
    loadSampleData();
    setTimeout(() => navigate('/dashboard'), 800);
  }, [loadSampleData, navigate]);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('upload:title')}</h1>
        <p className="text-slate-600 dark:text-slate-300">
          {t('upload:subtitle')}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            aria-label="File upload area"
            className={`
              relative p-12 rounded-2xl border-2 border-dashed cursor-pointer
              transition-all duration-300 text-center
              ${dragActive
                ? 'border-emerald-500 bg-emerald-500/5'
                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/50 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'
              }
              ${uploadStatus === 'success' ? 'border-emerald-500/50 bg-emerald-500/5' : ''}
              ${uploadStatus === 'error' ? 'border-red-500/50 bg-red-500/5' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Choose file to upload"
            />

            {isLoading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 size={48} className="text-emerald-400 animate-spin" />
                <p className="text-slate-700 dark:text-slate-300 font-medium">{t('upload:processing')}</p>
              </div>
            ) : uploadStatus === 'success' ? (
              <div className="flex flex-col items-center gap-4">
                <CheckCircle size={48} className="text-emerald-400" />
                <div>
                  <p className="text-emerald-400 font-semibold mb-1">{t('upload:uploadSuccess')}</p>
                  <p className="text-slate-600 dark:text-slate-300 text-sm">{uploadMessage}</p>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{t('upload:redirecting')}</p>
              </div>
            ) : uploadStatus === 'error' ? (
              <div className="flex flex-col items-center gap-4">
                <AlertCircle size={48} className="text-red-400" />
                <div>
                  <p className="text-red-400 font-semibold mb-1">{t('upload:uploadError')}</p>
                  <p className="text-slate-600 dark:text-slate-300 text-sm">{uploadMessage}</p>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{t('upload:clickToRetry')}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Upload size={28} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-slate-900 dark:text-white font-semibold mb-1">
                    {t('upload:dragDrop')}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {t('upload:supportedFormats')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Warnings */}
          {warnings.length > 0 && (
            <Alert className="bg-amber-500/5 border-amber-500/20">
              <AlertTriangle size={16} className="text-amber-400" />
              <AlertDescription className="text-amber-400 text-sm">
                <ul className="mt-1 space-y-1">
                  {warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Expected Format */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FileSpreadsheet size={16} className="text-emerald-400" />
              {t('upload:expectedFormat')}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className={`${isRTL ? 'text-right' : 'text-left'} py-2 px-3 text-slate-700 dark:text-slate-400 font-medium`}>{t('common:months.jan')}</th>
                    <th className={`${isRTL ? 'text-right' : 'text-left'} py-2 px-3 text-slate-700 dark:text-slate-400 font-medium`}>{t('inventory:product')}</th>
                    <th className={`${isRTL ? 'text-right' : 'text-left'} py-2 px-3 text-slate-700 dark:text-slate-400 font-medium`}>{t('inventory:category')}</th>
                    <th className={`${isRTL ? 'text-right' : 'text-left'} py-2 px-3 text-slate-700 dark:text-slate-400 font-medium`}>{t('sales:quantity')}</th>
                    <th className={`${isRTL ? 'text-right' : 'text-left'} py-2 px-3 text-slate-700 dark:text-slate-400 font-medium`}>{t('common:currency.usd')}</th>
                    <th className={`${isRTL ? 'text-right' : 'text-left'} py-2 px-3 text-slate-700 dark:text-slate-400 font-medium`}>{t('sales:revenue')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-slate-700 dark:text-slate-300">
                    <td className="py-2 px-3">2024-01-15</td>
                    <td className="py-2 px-3">{t('inventory:product')}</td>
                    <td className="py-2 px-3">{t('inventory:category')}</td>
                    <td className="py-2 px-3">2</td>
                    <td className="py-2 px-3">3.49</td>
                    <td className="py-2 px-3">6.98</td>
                  </tr>
                  <tr className="text-slate-700 dark:text-slate-300">
                    <td className="py-2 px-3">2024-01-15</td>
                    <td className="py-2 px-3">{t('inventory:product')}</td>
                    <td className="py-2 px-3">{t('inventory:category')}</td>
                    <td className="py-2 px-3">1</td>
                    <td className="py-2 px-3">2.99</td>
                    <td className="py-2 px-3">2.99</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Quick Start */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Database size={18} className="text-emerald-400" />
              {t('upload:quickStart')}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              {t('upload:quickStartDesc')}
            </p>
            <Button
              onClick={handleLoadDemo}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white mb-3"
            >
              {t('upload:loadDemo')}
              <ArrowRight size={16} className={`${isRTL ? 'mr-2' : 'ml-2'}`} />
            </Button>
            <Button
              onClick={downloadSample}
              variant="outline"
              className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <Download size={16} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('upload:downloadSample')}
            </Button>
          </div>

          {/* Tips */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">{t('upload:tips')}</h3>
            <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                <span>{t('upload:tip1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                <span>{t('upload:tip2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                <span>{t('upload:tip3')}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                <span>{t('upload:tip4')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}