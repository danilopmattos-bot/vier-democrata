import React from 'react';
import { RefreshCw, AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Democrata Craft Lab - Error caught by boundary:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  handleHardReload = (): void => {
    window.location.reload();
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-4 selection:bg-amber-500 selection:text-black">
          <div className="max-w-lg w-full bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-white">
                {this.props.fallbackTitle || 'Democrata Craft Lab'}
              </h2>
              <p className="text-sm text-stone-400 mt-2">
                Ocorreu uma pequena instabilidade visual na renderização. Seus dados e receitas permanecem seguros no seu navegador.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 text-left overflow-auto max-h-32 text-xs font-mono text-stone-400">
                {this.state.error.message || 'Erro inesperado'}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-4 py-3 rounded-xl transition-all cursor-pointer shadow-lg active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Restaurar Painel</span>
              </button>

              <button
                type="button"
                onClick={this.handleHardReload}
                className="flex-1 flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-700 text-white font-medium px-4 py-3 rounded-xl border border-stone-700 transition-all cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Recarregar Página</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
