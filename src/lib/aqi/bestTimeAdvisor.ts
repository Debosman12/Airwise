/**
 * Best Time to Go Outside Advisor
 *
 * Pinpoints the lowest-AQI window during daylight hours (06:00 – 18:00)
 * with a plain-language explanation and actionable precautions.
 */

import { AQIStandard, getCPCBCategory, getUSEPACategory } from './index';
import { BestTimeWindow, HourlyForecastPoint } from '../../types/airQuality';

export function calculateBestTimeWindow(
  hourlyPoints: HourlyForecastPoint[],
  standard: AQIStandard = 'cpcb'
): BestTimeWindow {
  if (!hourlyPoints || hourlyPoints.length === 0) {
    return {
      startTime: 'N/A',
      endTime: 'N/A',
      startHour: 12,
      endHour: 14,
      averageAqi: 0,
      category: standard === 'cpcb' ? getCPCBCategory(0) : getUSEPACategory(0),
      headline: 'Forecast data unavailable',
      explanation: 'Could not determine the best daylight window due to missing forecast data.',
      isAllDayPoor: false,
      isAllDayClean: false,
      precaution: 'Check current air quality before stepping outside.'
    };
  }

  // Filter daylight hours (06:00 to 18:00)
  // If points span multiple days, prefer today's daylight hours; if past 18:00, take tomorrow's daylight
  const nowHour = new Date().getHours();
  let daylightHours = hourlyPoints.filter((p) => p.hour >= 6 && p.hour <= 18);

  // If current hour is during the day, focus on remaining daylight hours
  if (nowHour >= 6 && nowHour < 18) {
    const remainingDaylight = daylightHours.filter((p) => p.hour >= nowHour);
    if (remainingDaylight.length >= 2) {
      daylightHours = remainingDaylight;
    }
  }

  // Fallback if no daylight hours filtered
  if (daylightHours.length === 0) {
    daylightHours = hourlyPoints.slice(0, 12);
  }

  // Find 2-hour sliding window with the lowest average AQI
  let bestStartIndex = 0;
  let lowestAvgAqi = Infinity;

  const windowSize = Math.min(2, daylightHours.length);

  for (let i = 0; i <= daylightHours.length - windowSize; i++) {
    const slice = daylightHours.slice(i, i + windowSize);
    const sum = slice.reduce(
      (acc, p) => acc + (standard === 'cpcb' ? p.cpcbAqi : p.usepaAqi),
      0
    );
    const avg = sum / slice.length;

    if (avg < lowestAvgAqi) {
      lowestAvgAqi = avg;
      bestStartIndex = i;
    }
  }

  const bestWindowSlice = daylightHours.slice(bestStartIndex, bestStartIndex + windowSize);
  const roundedAqi = Math.round(lowestAvgAqi);
  const category = standard === 'cpcb' ? getCPCBCategory(roundedAqi) : getUSEPACategory(roundedAqi);

  const startPoint = bestWindowSlice[0];
  const endPoint = bestWindowSlice[bestWindowSlice.length - 1];

  const startTime = startPoint ? startPoint.formattedTime : '12 PM';
  // If 2-hour window e.g. 2 PM to 3 PM, end display is "4 PM"
  const nextHourNum = (endPoint.hour + 1) % 24;
  const nextHourFormatted =
    nextHourNum === 0
      ? '12 AM'
      : nextHourNum === 12
      ? '12 PM'
      : nextHourNum > 12
      ? `${nextHourNum - 12} PM`
      : `${nextHourNum} AM`;

  const avgWind = Math.round(
    bestWindowSlice.reduce((acc, p) => acc + p.windSpeed, 0) / bestWindowSlice.length
  );

  // Check all-day conditions
  const allAqiValues = daylightHours.map((p) => (standard === 'cpcb' ? p.cpcbAqi : p.usepaAqi));
  const isAllDayPoor = allAqiValues.every((aqi) => aqi > 200);
  const isAllDayClean = allAqiValues.every((aqi) => aqi <= 50);

  let headline = `Best window: ${startTime} – ${nextHourFormatted} (AQI ~${roundedAqi}, ${category.name})`;
  let explanation = '';
  let precaution = '';

  if (isAllDayPoor) {
    headline = `Caution: No ideal clean window today (all daylight hours >200 AQI)`;
    explanation = `Pollution levels remain high all day due to stagnant air. The lowest relative exposure is around ${startTime} (AQI ~${roundedAqi}, ${category.name}).`;
    precaution = 'Wear an N95 mask for any outdoor transit. Reschedule outdoor runs and high-intensity workouts.';
  } else if (isAllDayClean) {
    headline = `Great air all day: Ideal for outdoor activities`;
    explanation = `Favorable atmospheric mixing keeps pollution low from morning to evening. The lowest reading is around ${startTime} – ${nextHourFormatted} (AQI ~${roundedAqi}).`;
    precaution = 'Enjoy outdoor workouts, cycling, and airing out your home anytime.';
  } else {
    if (avgWind >= 12) {
      explanation = `Afternoon breezes (${avgWind} km/h) help disperse ground particulates, making this window the clearest time to be outside.`;
    } else {
      explanation = `Atmospheric dispersion reaches its peak efficiency during these hours before nocturnal inversion traps pollutants in the evening.`;
    }
    precaution = `Great time for daily errands, walking, or opening windows before evening traffic builds up.`;
  }

  return {
    startTime,
    endTime: nextHourFormatted,
    startHour: startPoint.hour,
    endHour: nextHourNum,
    averageAqi: roundedAqi,
    category,
    headline,
    explanation,
    isAllDayPoor,
    isAllDayClean,
    precaution
  };
}
