import React from 'react';
import { AQICategory } from '../../lib/aqi';
import { AlertCircle, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

interface AdviceBannerProps {
  category: AQICategory;
}

export function getPlainLanguageAdvice(category: AQICategory): { text: string; icon: React.ReactNode } {
  switch (category.level) {
    case 'good':
      return {
        text: 'Good air: Ideal conditions for all outdoor activities and exercise.',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
      };
    case 'satisfactory':
      return {
        text: 'Satisfactory: Safe for most; unusually sensitive individuals should watch for cough.',
        icon: <CheckCircle2 className="w-5 h-5 text-lime-400 shrink-0" aria-hidden="true" />
      };
    case 'moderate':
      return {
        text: 'Moderate: Acceptable for most; sensitive groups should reduce heavy outdoor workouts.',
        icon: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" aria-hidden="true" />
      };
    case 'poor':
      return {
        text: 'Poor: Consider a mask outdoors today and reduce prolonged strenuous exertion.',
        icon: <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0" aria-hidden="true" />
      };
    case 'very-poor':
      return {
        text: 'Very Poor: Wear an N95 mask outside, keep windows shut, and run air purifiers indoors.',
        icon: <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" aria-hidden="true" />
      };
    case 'severe':
    case 'hazardous':
    default:
      return {
        text: 'Severe emergency: Avoid all outdoor activity. Remain indoors with clean air filtration.',
        icon: <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" aria-hidden="true" />
      };
  }
}

export const AdviceBanner: React.FC<AdviceBannerProps> = ({ category }) => {
  const { text, icon } = getPlainLanguageAdvice(category);

  return (
    <div
      role="region"
      aria-label="Plain language air quality advice"
      className="rounded-2xl p-4 bg-slate-900/90 border border-slate-800 shadow-md backdrop-blur-sm flex items-start space-x-3"
    >
      <div className="mt-0.5">{icon}</div>
      <p className="text-sm font-medium text-slate-100 leading-snug tracking-tight">
        {text}
      </p>
    </div>
  );
};
