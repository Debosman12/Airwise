import React from 'react';
import { Wind } from 'lucide-react';

export const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 animate-pulse">
          <Wind className="w-8 h-8" />
        </div>
        <div className="absolute inset-0 rounded-2xl border-2 border-sky-400 border-t-transparent animate-spin" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold text-white tracking-tight">Checking Current Air</h3>
        <p className="text-xs text-slate-400">Fetching readings and calculating official AQI...</p>
      </div>

      {/* Skeleton placeholders */}
      <div className="w-full max-w-xs space-y-2.5 pt-4">
        <div className="h-28 bg-slate-800/60 rounded-2xl animate-pulse" />
        <div className="h-24 bg-slate-800/40 rounded-2xl animate-pulse" />
      </div>
    </div>
  );
};
