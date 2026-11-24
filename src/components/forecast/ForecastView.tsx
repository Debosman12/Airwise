import React from 'react';
import { AQIStandard } from '../../lib/aqi';
import { FullForecastData } from '../../types/airQuality';
import { StandardToggle } from '../aqi/StandardToggle';
import { BestTimeCard } from './BestTimeCard';
import { HourlyChart } from './HourlyChart';
import { ThreeDayOutlook } from './ThreeDayOutlook';
import { ForecastDisclaimer } from './ForecastDisclaimer';
import { Loader2 } from 'lucide-react';

interface ForecastViewProps {
  forecast: FullForecastData | null;
  loading: boolean;
  standard: AQIStandard;
  onStandardChange: (standard: AQIStandard) => void;
}

export const ForecastView: React.FC<ForecastViewProps> = ({
  forecast,
  loading,
  standard,
  onStandardChange
}) => {
  if (loading && !forecast) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Computing 24-hour atmospheric model forecast...</p>
      </div>
    );
  }

  if (!forecast) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        Forecast data is currently unavailable.
      </div>
    );
  }

  return (
    <div
      role="tabpanel"
      id="panel-forecast"
      aria-labelledby="tab-forecast"
      className="space-y-4 animate-in fade-in duration-200"
    >
      {/* Standard Switcher */}
      <StandardToggle standard={standard} onStandardChange={onStandardChange} />

      {/* 1. Best Time to Go Outside Daylight Card */}
      <BestTimeCard bestTime={forecast.bestTime} />

      {/* 2. 24-Hour Recharts Chart */}
      <HourlyChart hourlyPoints={forecast.hourly24h} standard={standard} />

      {/* 3. 3-Day Outlook Cards */}
      <ThreeDayOutlook dailyPoints={forecast.daily3d} standard={standard} />

      {/* 4. Forecast Attribution & Model Label */}
      <ForecastDisclaimer provenance={forecast.provenance} standard={standard} />
    </div>
  );
};
