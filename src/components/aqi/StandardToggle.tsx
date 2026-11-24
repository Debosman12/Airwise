import React from 'react';
import { AQIStandard } from '../../lib/aqi';

interface StandardToggleProps {
  standard: AQIStandard;
  onStandardChange: (standard: AQIStandard) => void;
}

export const StandardToggle: React.FC<StandardToggleProps> = ({
  standard,
  onStandardChange
}) => {
  return (
    <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-medium">
      <button
        type="button"
        onClick={() => onStandardChange('cpcb')}
        className={`flex-1 py-1.5 px-3 rounded-lg transition-all text-center ${
          standard === 'cpcb'
            ? 'bg-sky-600 text-white shadow-sm font-semibold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <span>India (CPCB NAQI)</span>
      </button>

      <button
        type="button"
        onClick={() => onStandardChange('usepa')}
        className={`flex-1 py-1.5 px-3 rounded-lg transition-all text-center ${
          standard === 'usepa'
            ? 'bg-sky-600 text-white shadow-sm font-semibold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <span>US EPA AQI</span>
      </button>
    </div>
  );
};
