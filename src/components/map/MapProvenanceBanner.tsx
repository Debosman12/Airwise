import React from 'react';
import { ShieldAlert, Cpu, Radio } from 'lucide-react';

interface MapProvenanceBannerProps {
  isRealStations: boolean;
  isDemo: boolean;
  pointsCount: number;
}

export const MapProvenanceBanner: React.FC<MapProvenanceBannerProps> = ({
  isRealStations,
  isDemo,
  pointsCount
}) => {
  return (
    <div
      role="note"
      className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 shadow-sm space-y-1"
    >
      <div className="flex items-center space-x-2">
        {isDemo ? (
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
        ) : isRealStations ? (
          <Radio className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
        ) : (
          <Cpu className="w-4 h-4 text-sky-400 shrink-0" aria-hidden="true" />
        )}

        <span className="font-bold text-white text-xs">
          {isDemo
            ? 'Demo Grid Simulation'
            : isRealStations
            ? 'Physical Ground Monitoring Stations'
            : 'Sampled Atmospheric Model Points'}
        </span>
      </div>

      <p className="text-[11px] text-slate-400 pl-6 leading-relaxed">
        {isDemo
          ? `Showing ${pointsCount} simulated regional data points because network is offline.`
          : isRealStations
          ? `Displaying ${pointsCount} verified ground-based monitoring stations from the OpenAQ network.`
          : `Showing a 9-point geographic grid sampled from Open-Meteo's atmospheric chemistry model. These are calculated model points across city sectors, not physical sensor stations.`}
      </p>
    </div>
  );
};
