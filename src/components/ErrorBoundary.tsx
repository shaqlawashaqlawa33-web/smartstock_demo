/** ============================================================================
 *  ERROR BOUNDARY
 *  ============================================================================
 *  Catches JavaScript errors anywhere in the child component tree,
 *  logs them, and displays a fallback UI instead of crashing the app.
 *  ============================================================================
 */

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import i18n from '@/i18n';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = './';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const t = (key: string) => i18n.t(key, { ns: 'common' });

      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6" role="alert" aria-live="assertive">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} className="text-red-400" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-3">
              {t('error')}
            </h1>
            <p className="text-slate-400 mb-6">
              {t('error')}
            </p>

            {this.state.error && (
              <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 mb-6 text-left">
                <p className="text-red-400 text-sm font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                onClick={this.handleReset}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <RefreshCw size={16} className="ml-2" />
                {t('refresh')}
              </Button>
              <Button
                onClick={this.handleReload}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                {t('refresh')}
              </Button>
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <Home size={16} className="ml-2" />
                {t('back')}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/** Simpler error boundary for smaller sections */
export function SectionErrorBoundary({ children, sectionName }: { children: ReactNode; sectionName: string }) {
  const t = (key: string) => i18n.t(key, { ns: 'common' });

  return (
    <ErrorBoundary
      fallback={
        <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/10">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <AlertTriangle size={18} />
            <span className="font-medium">{t('error')} {sectionName}</span>
          </div>
          <p className="text-sm text-slate-400">{t('refresh')}</p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}