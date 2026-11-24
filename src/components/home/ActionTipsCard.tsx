import React from 'react';
import { AQICategory, AQIStandard, getActionGuidance } from '../../lib/aqi';
import { ShieldAlert, ShieldCheck, Wind, Home, Activity, Sparkles } from 'lucide-react';

interface ActionTipsCardProps {
  category: AQICategory;
  standard: AQIStandard;
}

export const ActionTipsCard: React.FC<ActionTipsCardProps> = ({
  category,
  standard
}) => {
  const guidance = getActionGuidance(category, standard);
  const { activities, keyAdvice } = guidance;

  return (
    <section
      role="region"
      aria-label="Action tips and recommended precautions"
      className="rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-sm space-y-3"
    >
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Action Tips
          </h2>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          Personal Precautions
        </span>
      </div>

      {/* 4 Pillars Grid: Mask, Windows, Purifier, Outdoor Exercise */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* 1. Mask Advice */}
        <div
          role="article"
          aria-label={`Mask advice: ${activities.maskText}`}
          className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between"
        >
          <div className="flex items-center space-x-1.5 mb-1.5">
            {activities.maskRequired ? (
              <ShieldAlert className="w-4 h-4 text-orange-400 shrink-0" aria-hidden="true" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
            )}
            <span className="text-xs font-bold text-slate-200">Mask</span>
          </div>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded w-fit mb-1 ${
              activities.maskRequired
                ? 'bg-orange-500/20 text-orange-300'
                : 'bg-emerald-500/20 text-emerald-300'
            }`}
          >
            {activities.maskRequired ? 'N95 Advised' : 'Not Needed'}
          </span>
          <p className="text-[11px] text-slate-400 leading-snug">
            {activities.maskText}
          </p>
        </div>

        {/* 2. Windows / Ventilation */}
        <div
          role="article"
          aria-label={`Home windows advice: ${activities.windowsText}`}
          className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between"
        >
          <div className="flex items-center space-x-1.5 mb-1.5">
            <Home className="w-4 h-4 text-sky-400 shrink-0" aria-hidden="true" />
            <span className="text-xs font-bold text-slate-200">Windows</span>
          </div>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded w-fit mb-1 ${
              activities.openWindows
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-amber-500/20 text-amber-300'
            }`}
          >
            {activities.openWindows ? 'Safe to Open' : 'Keep Closed'}
          </span>
          <p className="text-[11px] text-slate-400 leading-snug">
            {activities.windowsText}
          </p>
        </div>

        {/* 3. Air Purifier */}
        <div
          role="article"
          aria-label={`Air purifier advice: ${activities.purifierText}`}
          className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between"
        >
          <div className="flex items-center space-x-1.5 mb-1.5">
            <Wind className="w-4 h-4 text-cyan-400 shrink-0" aria-hidden="true" />
            <span className="text-xs font-bold text-slate-200">Air Purifier</span>
          </div>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded w-fit mb-1 ${
              activities.airPurifierNeeded
                ? 'bg-red-500/20 text-red-300'
                : 'bg-slate-700 text-slate-300'
            }`}
          >
            {activities.airPurifierNeeded ? 'Run Indoors' : 'Optional'}
          </span>
          <p className="text-[11px] text-slate-400 leading-snug">
            {activities.purifierText}
          </p>
        </div>

        {/* 4. Outdoor Exercise */}
        <div
          role="article"
          aria-label={`Outdoor exercise advice: ${activities.exerciseText}`}
          className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between"
        >
          <div className="flex items-center space-x-1.5 mb-1.5">
            <Activity className="w-4 h-4 text-teal-400 shrink-0" aria-hidden="true" />
            <span className="text-xs font-bold text-slate-200">Outdoor Cardio</span>
          </div>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded w-fit mb-1 ${
              activities.canExerciseOutdoors
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-red-500/20 text-red-300'
            }`}
          >
            {activities.canExerciseOutdoors ? 'Recommended' : 'Reduce Exertion'}
          </span>
          <p className="text-[11px] text-slate-400 leading-snug">
            {activities.exerciseText}
          </p>
        </div>
      </div>

      {/* Sensitive groups callout */}
      <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800/60 text-[11px] text-slate-300">
        <span className="font-bold text-white">Sensitive Groups: </span>
        <span>{category.sensitiveAdvice}</span>
      </div>

      {/* Quick bullet points */}
      {keyAdvice && keyAdvice.length > 0 && (
        <ul className="space-y-1 text-[11px] text-slate-400 px-1">
          {keyAdvice.map((advice, i) => (
            <li key={i} className="flex items-start space-x-1.5">
              <span className="text-sky-400 font-bold" aria-hidden="true">•</span>
              <span>{advice}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
