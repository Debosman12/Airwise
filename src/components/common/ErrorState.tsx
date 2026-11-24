import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  onUseDemo: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  onUseDemo
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <div className="space-y-1 max-w-xs">
        <h3 className="text-base font-bold text-white tracking-tight">Could Not Reach Stations</h3>
        <p className="text-xs text-slate-400 leading-relaxed">{message}</p>
      </div>

      <div className="flex flex-col w-full max-w-xs space-y-2 pt-2">
        <button
          onClick={onRetry}
          className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Live Network</span>
        </button>

        <button
          onClick={onUseDemo}
          className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
        >
          Load Demo Data (Offline)
        </button>
      </div>
    </div>
  );
};
