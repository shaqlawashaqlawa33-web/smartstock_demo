import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={32} className="text-slate-400" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">404</h1>
        <p className="text-slate-400 mb-8">{t('notFound')}</p>
        <Button onClick={() => navigate('/')} className="bg-emerald-600 hover:bg-emerald-500 text-white">
          <Home size={16} className="ml-2" />
          {t('goHome')}
        </Button>
      </div>
    </div>
  );
}