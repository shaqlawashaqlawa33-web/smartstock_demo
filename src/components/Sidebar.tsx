/** ============================================================================
 *  SIDEBAR — Navigation Component
 *  ============================================================================
 *  Responsive sidebar with React Router navigation, mobile drawer support,
 *  and keyboard accessibility.
 *  ============================================================================
 */

import { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStoreData } from '@/hooks/useStoreData';
import { useSettings } from '@/hooks/useSettings';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Upload,
  BarChart3,
  TrendingUp,
  Package,
  ChevronRight,
  Store,
  Menu,
  X,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  path: string;
  labelKey: string;
  icon: React.ReactNode;
  requiresData: boolean;
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasData } = useStoreData();
  const { settings } = useSettings();
  const { t } = useTranslation('navigation');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const currentPath = location.pathname;

  const navItems: NavItem[] = [
    { path: '/upload', labelKey: 'uploadData', icon: <Upload size={20} />, requiresData: false },
    { path: '/dashboard', labelKey: 'dashboard', icon: <LayoutDashboard size={20} />, requiresData: true },
    { path: '/sales', labelKey: 'salesAnalysis', icon: <BarChart3 size={20} />, requiresData: true },
    { path: '/forecast', labelKey: 'forecasting', icon: <TrendingUp size={20} />, requiresData: true },
    { path: '/inventory', labelKey: 'inventory', icon: <Package size={20} />, requiresData: true },
  ];

  const handleNavClick = useCallback((path: string) => {
    navigate(path);
    setIsMobileOpen(false);
  }, [navigate]);

  const isRTL = settings.language === 'ar' || settings.language === 'ckb';

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 z-50 bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl shadow-lg transition-all duration-200"
        style={{ [isRTL ? 'right' : 'left']: '1rem' }}
        aria-label={t('menu')}
        aria-expanded={isMobileOpen}
        aria-controls="sidebar"
      >
        {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={cn(
          "w-64 h-screen bg-white dark:bg-black border-r border-slate-200 dark:border-neutral-800 flex flex-col fixed top-0 z-40 transition-transform duration-300 ease-in-out",
          "md:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Store size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{t('appName', { ns: 'common' })}</h1>
              <p className="text-xs text-slate-500 dark:text-gray-300">{t('appSubtitle', { ns: 'common' })}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto" role="navigation">
          <p className="px-3 py-2 text-xs font-semibold text-slate-400 dark:text-gray-400 uppercase tracking-wider">
            {t('mainMenu')}
          </p>

          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            const isDisabled = item.requiresData && !hasData;

            return (
              <button
                key={item.path}
                onClick={() => !isDisabled && handleNavClick(item.path)}
                disabled={isDisabled}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30"
                    : isDisabled
                      ? "text-slate-400 dark:text-gray-600 cursor-not-allowed"
                      : "text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                )}
                aria-current={isActive ? 'page' : undefined}
                aria-disabled={isDisabled}
                role="link"
              >
                {item.icon}
                <span>{t(item.labelKey)}</span>
                {isActive && <ChevronRight size={14} className="ml-auto" />}
              </button>
            );
          })}

          {/* Settings */}
          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-neutral-800">
            <button
              onClick={() => handleNavClick('/settings')}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                currentPath === '/settings'
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30"
                  : "text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              )}
              aria-current={currentPath === '/settings' ? 'page' : undefined}
              role="link"
            >
              <Settings size={18} />
              <span>{t('settings')}</span>
              {currentPath === '/settings' && <ChevronRight size={14} className="ml-auto" />}
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-neutral-800">
          <div className="bg-slate-100 dark:bg-neutral-900/50 rounded-lg p-3">
            <p className="text-xs text-slate-600 dark:text-gray-400 mb-1">{t('dataStatus')}</p>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                hasData ? "bg-emerald-500" : "bg-amber-500"
              )} />
              <span className={cn(
                "text-xs font-medium",
                hasData ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
              )}>
                {hasData ? t('dataAvailable') : t('noData')}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}