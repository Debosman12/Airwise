import React from 'react';
import { DataSourceProvenance } from '../../types/airQuality';
import { AQIStandard } from '../../lib/aqi';
import { Sparkles, Database, ExternalLink, ShieldAlert } from 'lucide-react';

interface ForecastDisclaimerProps {
  provenance: DataSourceProvenance;
  standard: AQIStandard;
}

export const ForecastDisclaimer: React.FC<ForecastDisclaimerProps> = ({
  provenance,
  standard
}) => {
  return (
    <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
      {provenance.isDemo ? (
        <div className="flex items-start space-x-2 text-amber-300">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-snug">
            <strong>Demo Forecast:</strong> Showing simulated 24-hour diurnal cycle and 3-day projections because live network is unreachable or demo mode is engaged.
          </p>
        </div>
      ) : (
        <div className="flex items-start space-x-2 text-slate-300">
          <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-snug">
            <strong>Forecast Model:</strong> Projections derived from Open-Meteo European and global chemistry models. All forecast numbers are computed through official {standard === 'cpcb' ? 'CPCB NAQI' : 'US EPA'} breakpoint tables.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
        <span className="flex items-center">
          <Database className="w-3 h-3 mr-1 text-slate-500" />
          Source: {provenance.sourceName}
        </span>
        <a
          href={provenance.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-400 hover:text-sky-300 flex items-center hover:underline"
        >
          <span>Open-Meteo Docs</span>
          <ExternalLink className="w-2.5 h-2.5 ml-1" />
        </a>
      </div>
    </div>
  );
};
