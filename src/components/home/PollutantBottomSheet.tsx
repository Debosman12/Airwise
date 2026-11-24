import React, { useEffect } from 'react';
import { AQICalculationResult } from '../../lib/aqi';
import { X, ChevronUp, Layers, Info } from 'lucide-react';

interface PollutantBottomSheetProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  aqiResult: AQICalculationResult;
}

export const PollutantBottomSheet: React.FC<PollutantBottomSheetProps> = ({
  isOpen,
  onOpen,
  onClose,
  aqiResult
}) => {
  const { subIndices, dominantPollutant } = aqiResult;
  const items = Object.values(subIndices);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Tap Trigger Button on Home Screen */}
      <button
        onClick={onOpen}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-850 active:scale-[0.99] border border-slate-800 text-slate-200 flex items-center justify-between shadow-sm transition-all group"
      >
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:bg-sky-500/20 transition-colors">
            <Layers className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="text-left">
            <span className="text-xs font-bold text-white block">
              Pollutant Breakdown
            </span>
            <span className="text-[11px] text-slate-400">
              {items.length} monitored (PM2.5, PM10, NO₂, O₃...)
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-xs font-semibold text-sky-400">
          <span>View All</span>
          <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" aria-hidden="true" />
        </div>
      </button>

      {/* Modal / Bottom Sheet Overlay */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Detailed Pollutant Breakdown"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        >
          {/* Bottom Sheet Container */}
          <div
            className="w-full max-w-[420px] max-h-[85vh] bg-slate-900 border-t border-slate-750 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <div className="w-full pt-3 pb-1 flex justify-center">
              <div className="w-12 h-1.5 rounded-full bg-slate-700" aria-hidden="true" />
            </div>

            {/* Sheet Header */}
            <div className="px-5 py-3 flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  Pollutant Concentrations
                </h3>
                <p className="text-xs text-slate-400">
                  Calculated against official standard breakpoints
                </p>
              </div>

              <button
                onClick={onClose}
                aria-label="Close pollutant breakdown sheet"
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Sheet Scrollable Content */}
            <div className="px-5 py-4 overflow-y-auto space-y-3 flex-1">
              {items.map((item) => {
                const isDominant = item.pollutant === dominantPollutant;
                return (
                  <div
                    key={item.pollutant}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isDominant
                        ? 'bg-slate-800/80 border-sky-500/40 shadow-sm'
                        : 'bg-slate-800/40 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white">
                          {item.displayName}
                        </span>
                        {isDominant && (
                          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                            Dominant
                          </span>
                        )}
                      </div>

                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: `${item.category.color}15`,
                          borderColor: `${item.category.color}35`,
                          color: item.category.color
                        }}
                      >
                        {item.category.name}
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-end justify-between">
                      <div>
                        <span className="text-2xl font-black text-white">
                          {item.concentration < 1
                            ? item.concentration.toFixed(2)
                            : Math.round(item.concentration)}
                        </span>
                        <span className="text-xs text-slate-400 ml-1.5">
                          {item.unit}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-medium">
                          Sub-index
                        </span>
                        <span
                          className="text-base font-bold font-mono"
                          style={{ color: item.category.color }}
                        >
                          {item.subIndex}
                        </span>
                      </div>
                    </div>

                    {/* Relative horizontal gauge */}
                    <div className="mt-2.5 w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(Math.max((item.subIndex / 500) * 100, 3), 100)}%`,
                          backgroundColor: item.category.color
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 flex items-start space-x-2 text-xs text-slate-400">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="leading-relaxed">
                  Overall AQI is determined by the pollutant with the highest sub-index (dominant pollutant), following official NAQI & EPA guidelines.
                </p>
              </div>
            </div>

            {/* Bottom Dismiss */}
            <div className="p-4 border-t border-slate-800 bg-slate-900">
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
