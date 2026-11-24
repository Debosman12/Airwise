import React from 'react';
import { DataSourceProvenance } from '../../types/airQuality';
import { ExternalLink, Database, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

interface DataSourceFooterProps {
  provenance: DataSourceProvenance;
  onToggleDemoMode: () => void;
  isDemoModeForced: boolean;
}

export const DataSourceFooter: React.FC<DataSourceFooterProps> = ({
  provenance,
  onToggleDemoMode,
  isDemoModeForced
}) => {
  return (
    <footer className="mt-4 pt-4 pb-8 border-t border-slate-800 text-xs text-slate-400 space-y-3">
      {/* Demo Data Banner if in demo mode */}
      {provenance.isDemo && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
          <div className="flex items-center space-x-2 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Demo Data Mode Active</span>
          </div>
          <p className="text-[11px] text-amber-200/80 mt-1 leading-relaxed">
            Displaying realistic simulated air quality data because network access is unavailable or demo mode is engaged.
          </p>
        </div>
      )}

      {/* Stale Cache Banner if cached after network failure */}
      {provenance.isStale && !provenance.isDemo && (
        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300">
          <div className="flex items-center space-x-2 font-bold text-xs">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Cached Reading (Offline)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Live network was unreachable. Showing cached data from {provenance.cacheAgeMinutes} minutes ago.
          </p>
        </div>
      )}

      {/* Provenance Details */}
      <div className="space-y-1.5 px-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 flex items-center">
            <Database className="w-3 h-3 mr-1" />
            Data Source:
          </span>
          <a
            href={provenance.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:text-sky-300 flex items-center underline-offset-2 hover:underline font-medium"
          >
            <span>{provenance.sourceName}</span>
            <ExternalLink className="w-2.5 h-2.5 ml-1" />
          </a>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Last Updated:
          </span>
          <span className="text-slate-300 font-mono">
            {provenance.recordedAt}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 flex items-center">
            <ShieldCheck className="w-3 h-3 mr-1 text-emerald-400" />
            Privacy:
          </span>
          <span className="text-slate-400">
            Stored locally on-device. No tracking.
          </span>
        </div>
      </div>

      {/* Testing & Fallback Toggle */}
      <div className="pt-2 text-center">
        <button
          onClick={onToggleDemoMode}
          className="text-[11px] px-3 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-colors"
        >
          {isDemoModeForced ? 'Switch back to Live API' : 'Simulate Offline Demo Mode'}
        </button>
      </div>
    </footer>
  );
};
