import React from 'react';
import { WeatherContext } from '../../types/airQuality';
import { Droplets, Compass, CloudRain } from 'lucide-react';

interface WeatherStripProps {
  weather: WeatherContext;
}

export const WeatherStrip: React.FC<WeatherStripProps> = ({ weather }) => {
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-sm">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight">
            Weather & Ventilation Context
          </h2>
          <p className="text-[11px] text-slate-400">{weather.weatherDescription}</p>
        </div>
        <span className="text-xs text-sky-400 font-semibold">
          {weather.temperature}°C
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3 text-center">
        {/* Humidity */}
        <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="flex items-center justify-center space-x-1 text-slate-400 text-[11px] mb-1">
            <Droplets className="w-3.5 h-3.5 text-sky-400" />
            <span>Humidity</span>
          </div>
          <span className="text-sm font-bold text-slate-100">{weather.humidity}%</span>
        </div>

        {/* Wind */}
        <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="flex items-center justify-center space-x-1 text-slate-400 text-[11px] mb-1">
            <Compass className="w-3.5 h-3.5 text-teal-400" />
            <span>Wind</span>
          </div>
          <span className="text-sm font-bold text-slate-100">
            {weather.windSpeed} <span className="text-[10px] font-normal text-slate-400">km/h</span>
          </span>
          <span className="text-[10px] text-slate-400 block font-mono">
            {weather.windDirectionCompass}
          </span>
        </div>

        {/* Rain */}
        <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="flex items-center justify-center space-x-1 text-slate-400 text-[11px] mb-1">
            <CloudRain className="w-3.5 h-3.5 text-blue-400" />
            <span>Precipitation</span>
          </div>
          <span className="text-sm font-bold text-slate-100">
            {weather.precipitation} <span className="text-[10px] font-normal text-slate-400">mm</span>
          </span>
        </div>
      </div>

      <p className="mt-2 text-[10px] text-slate-400 leading-snug">
        Low wind speeds ({weather.windSpeed} km/h) trap airborne particulates near ground level.
      </p>
    </div>
  );
};
