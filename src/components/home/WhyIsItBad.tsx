import React from 'react';
import { AQICategory, PollutantValues } from '../../lib/aqi';
import { WeatherContext } from '../../types/airQuality';
import { getMeteorologicalExplanation } from '../../lib/aqi/meteorologyReasoning';
import { Wind, CloudRain, Sun, Droplets, Sparkles, HelpCircle } from 'lucide-react';

interface WhyIsItBadProps {
  category: AQICategory;
  dominantPollutant: keyof PollutantValues | null;
  weather: WeatherContext;
}

export const WhyIsItBad: React.FC<WhyIsItBadProps> = ({
  category,
  dominantPollutant,
  weather
}) => {
  const explanation = getMeteorologicalExplanation(category, dominantPollutant, weather);

  const renderIcon = () => {
    switch (explanation.icon) {
      case 'cloud-rain':
        return <CloudRain className="w-4 h-4 text-blue-400 shrink-0" aria-hidden="true" />;
      case 'sun':
        return <Sun className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />;
      case 'droplets':
        return <Droplets className="w-4 h-4 text-cyan-400 shrink-0" aria-hidden="true" />;
      case 'sparkles':
        return <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />;
      case 'wind':
      default:
        return <Wind className="w-4 h-4 text-sky-400 shrink-0" aria-hidden="true" />;
    }
  };

  const isGood = category.level === 'good' || category.level === 'satisfactory';
  const title = isGood ? 'Atmospheric Conditions' : 'Why is it bad today?';

  return (
    <div
      role="region"
      aria-label={title}
      className="rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-sm"
    >
      <div className="flex items-center space-x-2 mb-2.5">
        <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
        </div>
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          {title}
        </h2>
      </div>

      <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/40">
        <div className="mt-0.5">{renderIcon()}</div>
        <p className="text-xs text-slate-200 leading-relaxed font-normal">
          {explanation.headline}
        </p>
      </div>

      {/* Meteorological Micro-Stats */}
      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
        <span>Wind: {weather.windSpeed} km/h {weather.windDirectionCompass}</span>
        <span>Temp: {weather.temperature}°C</span>
        <span>Rain: {weather.precipitation} mm</span>
      </div>
    </div>
  );
};
