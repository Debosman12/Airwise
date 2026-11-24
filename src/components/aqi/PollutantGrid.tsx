import React from 'react';
import { AQICalculationResult } from '../../lib/aqi';

interface PollutantGridProps {
  aqiResult: AQICalculationResult;
}

export const PollutantGrid: React.FC<PollutantGridProps> = ({ aqiResult }) => {
  const { subIndices } = aqiResult;
  const items = Object.values(subIndices);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight">
            Key Pollutants
          </h2>
          <p className="text-[11px] text-slate-400">Concentrations & individual sub-indices</p>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          {items.length} monitored
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mt-3">
        {items.map((item) => (
          <div
            key={item.pollutant}
            className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700/60 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">
                {item.displayName}
              </span>
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded border"
                style={{
                  backgroundColor: `${item.category.color}15`,
                  borderColor: `${item.category.color}30`,
                  color: item.category.color
                }}
              >
                {item.category.name}
              </span>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <span className="text-lg font-bold text-white">
                  {item.concentration < 1 ? item.concentration.toFixed(2) : Math.round(item.concentration)}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">
                  {item.unit}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Sub-index</span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: item.category.color }}
                >
                  {item.subIndex}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
