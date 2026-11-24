import React from 'react';
import { DailyForecastPoint } from '../../types/airQuality';
import { AQIStandard } from '../../lib/aqi';
import { Calendar, Wind, Thermometer, CloudRain } from 'lucide-react';

interface ThreeDayOutlookProps {
  dailyPoints: DailyForecastPoint[];
  standard: AQIStandard;
}

export const ThreeDayOutlook: React.FC<ThreeDayOutlookProps> = ({
  dailyPoints,
  standard
}) => {
  if (!dailyPoints || dailyPoints.length === 0) return null;

  return (
    <section
      role="region"
      aria-label="3-day air quality outlook"
      className="rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-sm space-y-3"
    >
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center">
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            3-Day Outlook
          </h2>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">Daily Range</span>
      </div>

      <div className="space-y-2.5">
        {dailyPoints.map((point) => {
          const category = standard === 'cpcb' ? point.cpcbCategory : point.usepaCategory;
          const minAqi = standard === 'cpcb' ? point.cpcbMin : point.usepaMin;
          const maxAqi = standard === 'cpcb' ? point.cpcbMax : point.usepaMax;
          const avgAqi = standard === 'cpcb' ? point.cpcbAvg : point.usepaAvg;

          return (
            <div
              key={point.date}
              className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-white block">
                    {point.dayName}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {point.formattedDate}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <span className="text-xs font-bold text-white font-mono block">
                      {minAqi} – {maxAqi}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Avg: ~{avgAqi}
                    </span>
                  </div>

                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full border shadow-sm"
                    style={{
                      backgroundColor: `${category.color}15`,
                      borderColor: `${category.color}35`,
                      color: category.color
                    }}
                  >
                    {category.name}
                  </span>
                </div>
              </div>

              {/* Progress bar showing AQI span across 0-500 scale */}
              <div className="mt-2.5 w-full bg-slate-700/40 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    marginLeft: `${Math.min((minAqi / 500) * 100, 90)}%`,
                    width: `${Math.max(((maxAqi - minAqi) / 500) * 100, 8)}%`,
                    backgroundColor: category.color
                  }}
                />
              </div>

              {/* Weather & dominant pollutant context */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center">
                    <Thermometer className="w-3 h-3 text-slate-500 mr-1" />
                    {point.temperatureMax}°C
                  </span>
                  <span className="flex items-center">
                    <Wind className="w-3 h-3 text-slate-500 mr-1" />
                    {point.windSpeedAvg} km/h
                  </span>
                  {point.precipitationSum > 0 && (
                    <span className="flex items-center text-blue-400">
                      <CloudRain className="w-3 h-3 mr-1" />
                      {point.precipitationSum} mm
                    </span>
                  )}
                </div>

                <span className="text-[10px] text-slate-400 font-medium">
                  Main: {point.dominantPollutant}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
