import React from 'react';
import { AQICategory, AQIStandard, getActionGuidance } from '../../lib/aqi';
import { ShieldCheck, ShieldAlert, Sparkles, AlertOctagon, HeartHandshake } from 'lucide-react';

interface ActionGuidanceCardProps {
  category: AQICategory;
  standard: AQIStandard;
}

export const ActionGuidanceCard: React.FC<ActionGuidanceCardProps> = ({
  category,
  standard
}) => {
  const guidance = getActionGuidance(category, standard);
  const { activities, keyAdvice, headline } = guidance;

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-sm">
      <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
        <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight">
            What should I do right now?
          </h2>
          <p className="text-[11px] text-slate-400">Actionable advice for your day</p>
        </div>
      </div>

      {/* Main advisory banner */}
      <div className="mt-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/40">
        <p className="text-xs font-semibold text-slate-200">
          {headline}
        </p>
      </div>

      {/* Action items grid */}
      <div className="grid grid-cols-2 gap-2.5 mt-3">
        {/* Outdoor exercise */}
        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center space-x-1.5 mb-1.5">
            {activities.canExerciseOutdoors ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span className="text-xs font-bold text-slate-200">Outdoor Exercise</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            {activities.exerciseText}
          </p>
        </div>

        {/* Mask */}
        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center space-x-1.5 mb-1.5">
            {activities.maskRequired ? (
              <AlertOctagon className="w-4 h-4 text-orange-400 shrink-0" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span className="text-xs font-bold text-slate-200">Mask Advice</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            {activities.maskText}
          </p>
        </div>

        {/* Windows */}
        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center space-x-1.5 mb-1.5">
            <span className="text-xs font-bold text-slate-200">Home Windows</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            {activities.windowsText}
          </p>
        </div>

        {/* Purifier */}
        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center space-x-1.5 mb-1.5">
            <span className="text-xs font-bold text-slate-200">Air Purifier</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            {activities.purifierText}
          </p>
        </div>
      </div>

      {/* Sensitive groups highlight */}
      <div className="mt-3 p-2.5 rounded-xl bg-slate-800/30 border border-slate-800/60 flex items-start space-x-2 text-[11px] text-slate-300">
        <HeartHandshake className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">Sensitive Groups: </span>
          <span>{category.sensitiveAdvice}</span>
        </div>
      </div>

      {/* Key Advice points */}
      {keyAdvice && keyAdvice.length > 0 && (
        <ul className="mt-2.5 space-y-1 text-[11px] text-slate-400 pl-1">
          {keyAdvice.map((advice, idx) => (
            <li key={idx} className="flex items-start space-x-1.5">
              <span className="text-sky-400 font-bold">•</span>
              <span>{advice}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
