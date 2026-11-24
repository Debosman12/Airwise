import React from 'react';
import { BestTimeWindow } from '../../types/airQuality';
import { Sun, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface BestTimeCardProps {
  bestTime: BestTimeWindow;
}

export const BestTimeCard: React.FC<BestTimeCardProps> = ({ bestTime }) => {
  const {
    startTime,
    endTime,
    averageAqi,
    category,
    headline,
    explanation,
    isAllDayPoor,
    isAllDayClean,
    precaution
  } = bestTime;

  return (
    <section
      role="region"
      aria-label="Best daylight time to go outside"
      className={`rounded-2xl p-4.5 border transition-all ${
        isAllDayPoor
          ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
          : isAllDayClean
          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
          : 'bg-slate-900 border-slate-800 text-slate-200'
      } shadow-md`}
    >
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
            <Sun className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Best Time to Go Outside
            </h2>
            <span className="text-[10px] text-slate-400">Daylight hours (6 AM – 6 PM)</span>
          </div>
        </div>

        {/* Category Pill */}
        <span
          className="text-xs font-bold px-2.5 py-0.5 rounded-full border shadow-sm"
          style={{
            backgroundColor: `${category.color}15`,
            borderColor: `${category.color}35`,
            color: category.color
          }}
        >
          {category.name}
        </span>
      </div>

      {/* Main Time Range Hero */}
      <div className="mt-3.5 flex items-baseline justify-between">
        <div>
          <span className="text-2xl font-black text-white tracking-tight">
            {startTime} – {endTime}
          </span>
          <span className="text-xs text-slate-400 block mt-0.5 font-medium">
            Lowest expected exposure window
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block font-medium">Expected AQI</span>
          <span
            className="text-2xl font-black font-mono"
            style={{ color: category.color }}
          >
            ~{averageAqi}
          </span>
        </div>
      </div>

      {/* Headline & Explanation */}
      <div className="mt-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-1.5">
        <div className="flex items-start space-x-2">
          {isAllDayPoor ? (
            <ShieldAlert className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" aria-hidden="true" />
          ) : isAllDayClean ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" aria-hidden="true" />
          )}
          <p className="text-xs font-bold text-white leading-snug">
            {headline}
          </p>
        </div>
        <p className="text-[11px] text-slate-300 pl-6 leading-relaxed">
          {explanation}
        </p>
      </div>

      {/* Precautions line */}
      <div className="mt-2.5 px-1 text-[11px] text-slate-400 flex items-start space-x-1.5">
        <span className="text-sky-400 font-bold" aria-hidden="true">•</span>
        <span>{precaution}</span>
      </div>
    </section>
  );
};
