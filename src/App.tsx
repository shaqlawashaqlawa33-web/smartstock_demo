/**
 * ============================================================================
 *  APP — Root Component with Routing
 * ============================================================================
 *  Configures all routes with proper layout, protected routes, and
 *  error boundaries. Wrapped by all context providers.
 * ============================================================================
 */

import { Routes, Route } from 'react-router-dom';
import { CurrencyProvider } from '@/hooks/useCurrency';
import { StoreDataProvider } from '@/hooks/useStoreData';
import { SettingsProvider } from '@/hooks/useSettings';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ThemeProvider } from '@/components/ThemeProvider'; // ← زیاد بکە
// Pages
import LandingPage from '@/pages/LandingPage';
import UploadPage from '@/pages/UploadPage';
import DashboardPage from '@/pages/DashboardPage';
import SalesAnalysisPage from '@/pages/SalesAnalysisPage';
import ForecastingPage from '@/pages/ForecastingPage';
import InventoryPage from '@/pages/InventoryPage';
import SettingsPage from '@/pages/SettingsPage';
import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <ThemeProvider>
          <CurrencyProvider>
            <StoreDataProvider>
              <Routes>
                {/* Landing page - no sidebar */}
                <Route path="/" element={<LandingPage />} />

                {/* App pages - with sidebar layout */}
                <Route element={<Layout />}>
                  <Route path="/upload" element={<UploadPage />} />
                  <Route path="/settings" element={<SettingsPage />} />

                  {/* Protected routes - require data */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute><DashboardPage /></ProtectedRoute>
                  } />
                  <Route path="/sales" element={
                    <ProtectedRoute><SalesAnalysisPage /></ProtectedRoute>
                  } />
                  <Route path="/forecast" element={
                    <ProtectedRoute><ForecastingPage /></ProtectedRoute>
                  } />
                  <Route path="/inventory" element={
                    <ProtectedRoute><InventoryPage /></ProtectedRoute>
                  } />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </StoreDataProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </SettingsProvider>
    </ErrorBoundary >
  );
}