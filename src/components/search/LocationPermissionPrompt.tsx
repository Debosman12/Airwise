import React from 'react';
import { ShieldCheck, MapPin, X } from 'lucide-react';

interface LocationPermissionPromptProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LocationPermissionPrompt: React.FC<LocationPermissionPromptProps> = ({
  isOpen,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Location privacy notice"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[380px] bg-slate-900 border border-slate-850 rounded-3xl p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          aria-label="Close location notice"
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center mb-4">
          <MapPin className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-white tracking-tight">
          Find Local Air Quality
        </h3>

        <div className="mt-3 space-y-2.5 text-xs text-slate-300 leading-relaxed">
          <p>
            AirWise checks real-time ambient pollution from the nearest monitoring stations.
          </p>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-start space-x-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-snug">
              <strong className="text-white">Strict Privacy Guarantee:</strong> Your coordinates are computed directly on your phone and sent only to Open-Meteo. AirWise has no backend, no analytics, and never tracks or stores your location.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <button
            onClick={onConfirm}
            className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-[0.99] text-white font-semibold text-xs transition-colors shadow-sm"
          >
            Allow Location Access
          </button>
          <button
            onClick={onCancel}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium text-xs transition-colors"
          >
            Not Now, I'll Pick a City
          </button>
        </div>
      </div>
    </div>
  );
};
