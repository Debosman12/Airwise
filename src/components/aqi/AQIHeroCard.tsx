import React from 'react';
import { AQICalculationResult } from '../../lib/aqi';
import { AlertCircle } from 'lucide-react';

interface AQIHeroCardProps {
  aqiResult: AQICalculationResult;
}

export const AQIHeroCard: React.FC<AQIHeroCardProps> = ({ aqiResult }) => {
  const { aqi, category, dominantPollutantName, notes, standardName } = aqiResult;

  // Percentage for the gauge bar (max 500)
  const barPercent = Math.min(Math.round((aqi / 500) * 100), 100);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-800 p-5 shadow-lg">
      {/* Decorative ambient color glow */}
      <div
        className="absolute -right-12 -top-12 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: category.color }}
      />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
            Current Air Quality
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span
              className="text-5xl font-black tracking-tight"
              style={{ color: category.color }}
            >
              {aqi}
            </span>
            <span className="text-sm font-semibold text-slate-400">AQI</span>
          </div>
        </div>

        {/* Category Pill */}
        <div
          className={`px-3 py-1.5 rounded-full text-xs font-bold border tracking-wide uppercase shadow-sm ${category.bgColor}`}
        >
          {category.name}
        </div>
      </div>

      {/* Progress scale */}
      <div className="mt-4">
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${Math.max(barPercent, 4)}%`,
              backgroundColor: category.color
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
          <span>0 (Clean)</span>
          <span>100</span>
          <span>200</span>
          <span>300</span>
          <span>500 (Hazardous)</span>
        </div>
      </div>

      {/* Summary message */}
      <p className="mt-3.5 text-xs text-slate-300 font-normal leading-relaxed">
        {category.description}.
      </p>

      {/* Dominant pollutant info */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center text-slate-400">
          <span className="text-slate-500 mr-1.5">Dominant Pollutant:</span>
          <span className="font-semibold text-slate-200 bg-slate-800 px-2 py-0.5 rounded text-[11px]">
            {dominantPollutantName}
          </span>
        </div>

        <span className="text-[11px] text-slate-500">
          Standard: {standardName}
        </span>
      </div>

      {/* Warning note if minimum pollutants criteria was estimated */}
      {notes && (
        <div className="mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300/90 text-[11px] flex items-start space-x-1.5">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400" />
          <span>{notes}</span>
        </div>
      )}
    </div>
  );
};
