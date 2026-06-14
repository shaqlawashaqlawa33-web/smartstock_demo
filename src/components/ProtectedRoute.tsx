/** ============================================================================
 *  PROTECTED ROUTE
 *  ============================================================================
 *  Redirects to upload page if no data is available.
 *  ============================================================================
 */

import { Navigate } from 'react-router-dom';
import { useStoreData } from '@/hooks/useStoreData';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { hasData, isLoading } = useStoreData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">بارکردن...</p>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return <Navigate to="/upload" replace />;
  }

  return <>{children}</>;
}
