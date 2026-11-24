import React from 'react';

export const MapLegend: React.FC = () => {
  const categories = [
    { name: 'Good', range: '0–50', color: '#10b981' },
    { name: 'Satisfactory', range: '51–100', color: '#84cc16' },
    { name: 'Moderate', range: '101–200', color: '#f59e0b' },
    { name: 'Poor', range: '201–300', color: '#f97316' },
    { name: 'Very Poor', range: '301–400', color: '#ef4444' },
    { name: 'Severe', range: '401+', color: '#7f1d1d' }
  ];

  return (
    <div
      role="region"
      aria-label="Map AQI color legend"
      className="rounded-2xl bg-slate-900 border border-slate-800 p-3 shadow-sm space-y-2"
    >
      <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-0.5">
        <span>Map Legend</span>
        <span className="text-[10px] text-slate-500 font-mono">Numbers & Labels on Pins</span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 text-[10px]">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="flex items-center space-x-1.5 p-1.5 rounded-lg bg-slate-800/40 border border-slate-800"
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/20"
              style={{ backgroundColor: cat.color }}
              aria-hidden="true"
            />
            <div className="overflow-hidden">
              <span className="font-bold text-slate-200 block truncate">{cat.name}</span>
              <span className="text-slate-400 font-mono">{cat.range}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
