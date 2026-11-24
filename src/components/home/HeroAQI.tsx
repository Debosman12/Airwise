import React from 'react';
import { AQICalculationResult } from '../../lib/aqi';
import { DataSourceProvenance, LocationInfo } from '../../types/airQuality';
import { MapPin, Clock, Database, Activity, AlertCircle } from 'lucide-react';

interface HeroAQIProps {
  location: LocationInfo;
  aqiResult: AQICalculationResult;
  provenance: DataSourceProvenance;
  onOpenSearch: () => void;
}

// CPCB category styling gradients & themes
function getHeroTheme(level: string) {
  switch (level) {
    case 'good':
      return {
        bgGradient: 'from-emerald-950/80 via-emerald-900/40 to-slate-950',
        borderColor: 'border-emerald-500/40',
        accentColor: '#10b981',
        glowColor: 'rgba(16, 185, 129, 0.25)',
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      };
    case 'satisfactory':
      return {
        bgGradient: 'from-lime-950/80 via-lime-900/40 to-slate-950',
        borderColor: 'border-lime-500/40',
        accentColor: '#84cc16',
        glowColor: 'rgba(132, 204, 22, 0.25)',
        badgeBg: 'bg-lime-500/20 text-lime-300 border-lime-500/30'
      };
    case 'moderate':
      return {
        bgGradient: 'from-amber-950/80 via-amber-900/40 to-slate-950',
        borderColor: 'border-amber-500/40',
        accentColor: '#f59e0b',
        glowColor: 'rgba(245, 158, 11, 0.25)',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      };
    case 'poor':
      return {
        bgGradient: 'from-orange-950/80 via-orange-900/40 to-slate-950',
        borderColor: 'border-orange-500/40',
        accentColor: '#f97316',
        glowColor: 'rgba(249, 115, 22, 0.25)',
        badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/30'
      };
    case 'very-poor':
    case 'unhealthy':
    case 'very-unhealthy':
      return {
        bgGradient: 'from-red-950/90 via-red-900/50 to-slate-950',
        borderColor: 'border-red-500/50',
        accentColor: '#ef4444',
        glowColor: 'rgba(239, 68, 68, 0.3)',
        badgeBg: 'bg-red-500/20 text-red-300 border-red-500/30'
      };
    case 'severe':
    case 'hazardous':
    default:
      return {
        bgGradient: 'from-red-950 via-stone-950 to-slate-950',
        borderColor: 'border-red-900/80',
        accentColor: '#b91c1c',
        glowColor: 'rgba(185, 28, 28, 0.35)',
        badgeBg: 'bg-red-950 text-red-200 border-red-800'
      };
  }
}

export const HeroAQI: React.FC<HeroAQIProps> = ({
  location,
  aqiResult,
  provenance,
  onOpenSearch
}) => {
  const { aqi, category, dominantPollutantName, notes } = aqiResult;
  const theme = getHeroTheme(category.level);

  return (
    <section
      role="region"
      aria-label={`Air quality for ${location.name}: AQI ${aqi}, ${category.name}`}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-b ${theme.bgGradient} border ${theme.borderColor} p-6 shadow-xl transition-all duration-300`}
    >
      {/* Ambient background glow */}
      <div
        className="absolute top-0 right-0 w-56 h-56 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ backgroundColor: theme.glowColor }}
        aria-hidden="true"
      />

      {/* Top Location & Search Button */}
      <div className="flex items-center justify-between relative z-10">
        <button
          onClick={onOpenSearch}
          aria-label={`Current location: ${location.name}. Tap to change city`}
          className="flex items-center space-x-1.5 py-1 px-2.5 -ml-1 rounded-full bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/60 text-slate-200 text-xs font-medium transition-colors"
        >
          <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" aria-hidden="true" />
          <span className="font-semibold">{location.name}</span>
          <span className="text-slate-400">({location.country})</span>
        </button>

        {/* Data Source Tag */}
        <span
          className="text-[11px] text-slate-400 flex items-center font-mono"
          title={`Source: ${provenance.sourceName}`}
        >
          <Database className="w-3 h-3 mr-1 text-slate-500" aria-hidden="true" />
          <span>{provenance.isDemo ? 'Demo' : 'Open-Meteo'}</span>
        </span>
      </div>

      {/* Hero AQI Number & Category Badge */}
      <div className="mt-6 flex items-baseline justify-between relative z-10">
        <div>
          <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold block">
            Air Quality Index
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <h1
              className="text-7xl font-black tracking-tight leading-none"
              style={{ color: theme.accentColor }}
            >
              {aqi}
            </h1>
            <span className="text-sm font-semibold text-slate-400 tracking-wider">
              AQI
            </span>
          </div>
        </div>

        {/* Category Pill with accessible text */}
        <div className="flex flex-col items-end space-y-1.5">
          <span
            className={`px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border shadow-sm ${theme.badgeBg}`}
          >
            {category.name}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            {aqiResult.standardName}
          </span>
        </div>
      </div>

      {/* Dominant Pollutant & Last Updated Metadata */}
      <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300 relative z-10">
        <div className="flex items-center space-x-1.5">
          <Activity className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          <span className="text-slate-400">Dominant:</span>
          <span className="font-bold text-white bg-slate-800/80 px-2 py-0.5 rounded text-[11px]">
            {dominantPollutantName}
          </span>
        </div>

        <div className="flex items-center space-x-1 text-slate-400 text-[11px] font-mono">
          <Clock className="w-3 h-3 text-slate-500" aria-hidden="true" />
          <span>Updated {provenance.recordedAt}</span>
        </div>
      </div>

      {/* Warning note if CPCB minimum pollutant criteria was estimated */}
      {notes && (
        <div
          role="note"
          className="mt-3 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-start space-x-2"
        >
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
          <span>{notes}</span>
        </div>
      )}
    </section>
  );
};
