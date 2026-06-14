import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreData } from '@/hooks/useStoreData';
import { useSettings } from '@/hooks/useSettings';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  BarChart3,
  TrendingUp,
  Package,
  Sparkles,
  Zap,
  Shield,
  ChevronRight,
  Store,
  Globe,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES } from '@/i18n';
import type { Language } from '@/types';

export default function LandingPage() {
  const navigate = useNavigate();
  const { loadSampleData, hasData } = useStoreData();
  const { settings, setLanguage } = useSettings();
  const { t } = useTranslation(['common', 'landing']);

  const handleTryDemo = useCallback(() => {
    loadSampleData();
    navigate('/dashboard');
  }, [loadSampleData, navigate]);

  const handleUpload = useCallback(() => {
    navigate('/upload');
  }, [navigate]);

  const handleGoToDashboard = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const features = [
    {
      icon: <BarChart3 size={24} />,
      title: t('sales:title'),
      description: t('sales:subtitle'),
    },
    {
      icon: <TrendingUp size={24} />,
      title: t('forecast:title'),
      description: t('forecast:subtitle'),
    },
    {
      icon: <Package size={24} />,
      title: t('inventory:title'),
      description: t('inventory:subtitle'),
    },
  ];

  const benefits = [
    { icon: <Zap size={20} />, text: t('landing:benefit1') },
    { icon: <Shield size={20} />, text: t('landing:benefit2') },
    { icon: <Sparkles size={20} />, text: t('landing:benefit3') },
  ];

  const isRTL = settings.language === 'ar' || settings.language === 'ckb';

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Store size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">{t('common:appName')}</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
              <Globe size={14} className="text-slate-400 ml-1" />
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang as Language)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${settings.language === lang
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                >
                  {LANGUAGE_NAMES[lang as Language]}
                </button>
              ))}
            </div>
            {hasData && (
              <button
                onClick={handleGoToDashboard}
                className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                {t('navigation:dashboard')}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
                <Sparkles size={14} />
                {t('common:appSubtitle')}
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
                {t('landing:heroTitle')}
              </h1>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-lg">
                {t('landing:heroDescription')}
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Button
                  onClick={handleTryDemo}
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-6 text-base font-semibold shadow-lg shadow-emerald-500/20"
                >
                  {t('landing:tryDemo')}
                  <ArrowRight size={18} className={`${isRTL ? 'mr-2' : 'ml-2'}`} />
                </Button>
                <Button
                  onClick={handleUpload}
                  size="lg"
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 px-8 py-6 text-base"
                >
                  {t('landing:uploadData')}
                </Button>
              </div>

              <div className="flex flex-wrap gap-6">
                {benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-400">
                    <div className="text-emerald-400">{b.icon}</div>
                    <span>{b.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl shadow-emerald-500/10">
                <div className="aspect-video bg-slate-900 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                      <BarChart3 size={40} className="text-emerald-400" />
                    </div>
                    <p className="text-slate-400 text-sm">{t('landing:demoDashboard')}</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              {t('landing:featuresTitle')}
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              {t('landing:featuresSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 transition-all duration-300 hover:bg-slate-900/80"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">{t('landing:howItWorks')}</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              {t('landing:howItWorksDesc')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: t('landing:step1Title'), desc: t('landing:step1Desc') },
              { step: '02', title: t('landing:step2Title'), desc: t('landing:step2Desc') },
              { step: '03', title: t('landing:step3Title'), desc: t('landing:step3Desc') },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative p-8 rounded-2xl bg-slate-900/30 border border-slate-800"
              >
                <span className="text-5xl font-black text-emerald-500/20">{item.step}</span>
                <h3 className="text-xl font-semibold text-white mt-4 mb-3">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ChevronRight size={24} className="text-slate-600" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-emerald-900/30 to-slate-900 border border-emerald-500/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-teal-500/10" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t('landing:ctaTitle')}
              </h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                {t('landing:ctaDescription')}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  onClick={handleTryDemo}
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-8"
                >
                  {t('landing:demoDashboard')}
                  <ArrowRight size={18} className={`${isRTL ? 'mr-2' : 'ml-2'}`} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Store size={16} className="text-emerald-400" />
            <span className="text-sm text-slate-400">{t('common:appSubtitle')}</span>
          </div>
          <p className="text-sm text-slate-500">
            {t('landing:footerText')}
          </p>
        </div>
      </footer>
    </div>
  );
}