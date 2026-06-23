import React, { ErrorInfo, ReactNode } from 'react';
import { RefreshCw, LogOut, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error captured by ErrorBoundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-2xl w-full bg-slate-900 border border-red-500/30 rounded-2.5xl p-8 shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-400">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-display tracking-tight text-white">Application Thread Crashed</h1>
                <p className="text-xs text-slate-400 mt-0.5">The ErrorBoundary caught an unhandled rendering error.</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-red-400 font-mono font-bold uppercase tracking-widest block">Error Signature</span>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 font-mono text-xs text-rose-300 overflow-x-auto leading-relaxed select-text">
                {this.state.error?.toString() || "Unknown Error"}
              </div>
            </div>

            {this.state.errorInfo && (
              <div className="space-y-2">
                <span className="text-[10px] text-slate-450 font-mono font-bold uppercase tracking-widest block">Component Stack Trace</span>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 font-mono text-[10px] text-slate-400 overflow-x-auto max-h-40 overflow-y-auto leading-relaxed select-text whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </div>
              </div>
            )}

            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-850 space-y-2 text-xs">
              <h3 className="font-semibold text-slate-200">Recommended Troubleshooting Steps:</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Check your internet connection and reload the active browser tab.</li>
                <li>Clear corrupt session properties by using the "Hard Reset Application State" action below.</li>
                <li>Make sure you are logged in with valid Supabase Auth credentials.</li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-550 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Screen
              </button>
              
              <button
                onClick={this.handleReset}
                className="px-4 py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-850 text-rose-400 font-mono font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Hard Reset Application State
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
