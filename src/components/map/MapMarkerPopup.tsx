import React from 'react';
import { MapPoint } from '../../types/map';
import { AQIStandard } from '../../lib/aqi';
import { X, Clock, Database, Radio, Cpu } from 'lucide-react';

interface MapMarkerPopupProps {
  point: MapPoint | null;
  standard: AQIStandard;
  onClose: () => void;
}

export const MapMarkerPopup: React.FC<MapMarkerPopupProps> = ({
  point,
  standard,
  onClose
}) => {
  if (!point) return null;

  const aqi = standard === 'cpcb' ? point.cpcbAqi : point.usepaAqi;
  const category = standard === 'cpcb' ? point.cpcbCategory : point.usepaCategory;

  return (
    <div
      role="dialog"
      aria-label={`Air quality details for ${point.name}`}
      className="rounded-2xl bg-slate-900 border border-sky-500/40 p-4 shadow-xl space-y-3 relative animate-in fade-in zoom-in-95 duration-150"
    >
      <button
        onClick={onClose}
        aria-label="Close station details"
        className="absolute top-3.5 right-3.5 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Point Name and Type Badge */}
      <div className="pr-6">
        <div className="flex items-center space-x-1.5 mb-1">
          {point.isRealStation ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
              <Radio className="w-2.5 h-2.5 mr-1" />
              <span>Physical Monitoring Station</span>
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center space-x-1">
              <Cpu className="w-2.5 h-2.5 mr-1" />
              <span>Sampled Model Point</span>
            </span>
          )}
        </div>
        <h3 className="text-sm font-bold text-white tracking-tight">{point.name}</h3>
      </div>

      {/* Score Hero */}
      <div className="flex items-baseline justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            Current AQI
          </span>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="text-4xl font-black font-mono" style={{ color: category.color }}>
              {aqi}
            </span>
            <span className="text-xs font-semibold text-slate-400">AQI</span>
          </div>
        </div>

        <div className="text-right">
          <span
            className="text-xs font-extrabold uppercase px-2.5 py-1 rounded-full border shadow-sm block"
            style={{
              backgroundColor: `${category.color}15`,
              borderColor: `${category.color}35`,
              color: category.color
            }}
          >
            {category.name}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {standard === 'cpcb' ? 'CPCB NAQI' : 'US EPA'}
          </span>
        </div>
      </div>

      {/* Pollutant Summary */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded-lg bg-slate-800/30 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400 text-[11px]">PM2.5:</span>
          <span className="font-bold text-white font-mono">
            {point.pollutants.pm25 !== null && point.pollutants.pm25 !== undefined
              ? `${Math.round(point.pollutants.pm25)} µg/m³`
              : 'N/A'}
          </span>
        </div>
        <div className="p-2 rounded-lg bg-slate-800/30 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400 text-[11px]">PM10:</span>
          <span className="font-bold text-white font-mono">
            {point.pollutants.pm10 !== null && point.pollutants.pm10 !== undefined
              ? `${Math.round(point.pollutants.pm10)} µg/m³`
              : 'N/A'}
          </span>
        </div>
      </div>

      {/* Metadata */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
        <span className="flex items-center">
          <Database className="w-3 h-3 text-slate-500 mr-1" />
          {point.source}
        </span>
        <span className="flex items-center">
          <Clock className="w-3 h-3 text-slate-500 mr-1" />
          {point.lastUpdated}
        </span>
      </div>
    </div>
  );
};
