/** ============================================================================
 *  LAYOUT — Application Shell
 *  ============================================================================
 *  Main layout with sidebar, content area, and route-based rendering.
 *  Handles landing page (full-screen) vs. app pages (with sidebar).
 *  ============================================================================
 */

import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useSettings } from '@/hooks/useSettings';
import { cn } from '@/lib/utils';

export default function Layout() {
  const location = useLocation();
  const { settings } = useSettings();
  const isRTL = settings.language === 'ar' || settings.language === 'ckb';

  const isLanding = location.pathname === '/';


  if (isLanding) {
    return (
      <main className={`flex-1 min-h-screen overflow-auto ${isRTL ? 'mr-64' : 'ml-64'}`}>
        <Outlet />
      </main>
    );
  }

  return (
    <div className={`flex min-h-screen bg-slate-50 dark:bg-slate-950 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
      <Sidebar />
      <main
        className={cn(
          "flex-1 min-h-screen overflow-auto transition-all duration-300",
          "md:ml-64" // desktop: sidebar width
        )}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Skip link for accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <div id="main-content" className="focus:outline-none">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
