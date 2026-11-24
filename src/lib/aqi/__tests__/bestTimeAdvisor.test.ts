import { describe, it, expect } from 'vitest';
import { calculateBestTimeWindow } from '../bestTimeAdvisor';
import { HourlyForecastPoint } from '../../../types/airQuality';
import { getCPCBCategory, getUSEPACategory } from '../index';

function createMockHour(hour: number, cpcbAqi: number, windSpeed = 10): HourlyForecastPoint {
  const formattedTime =
    hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  return {
    time: `2026-11-25T${hour.toString().padStart(2, '0')}:00`,
    formattedTime,
    hour,
    pollutants: { pm25: cpcbAqi * 0.8 },
    cpcbAqi,
    cpcbCategory: getCPCBCategory(cpcbAqi),
    usepaAqi: cpcbAqi - 10,
    usepaCategory: getUSEPACategory(cpcbAqi - 10),
    dominantPollutant: 'PM2.5',
    temperature: 24,
    windSpeed,
    precipitation: 0
  };
}

describe('Best Time to Go Outside Advisor', () => {
  it('identifies the lowest AQI window during daylight hours', () => {
    // 24 hours with morning inversion, afternoon dip, evening rise
    const hours: HourlyForecastPoint[] = [];
    for (let h = 0; h < 24; h++) {
      let aqi = 180;
      if (h >= 13 && h <= 15) {
        aqi = 65; // Lowest dip at 1 PM - 3 PM
      } else if (h < 6 || h > 20) {
        aqi = 300;
      }
      hours.push(createMockHour(h, aqi, h >= 13 && h <= 15 ? 16 : 6));
    }

    const best = calculateBestTimeWindow(hours, 'cpcb');
    expect(best.startHour).toBe(13);
    expect(best.averageAqi).toBe(65);
    expect(best.headline).toContain('1 PM');
    expect(best.isAllDayPoor).toBe(false);
  });

  it('correctly handles all-day severe pollution and warns user', () => {
    const hours: HourlyForecastPoint[] = [];
    for (let h = 0; h < 24; h++) {
      hours.push(createMockHour(h, 340)); // All daylight hours severe
    }

    const best = calculateBestTimeWindow(hours, 'cpcb');
    expect(best.isAllDayPoor).toBe(true);
    expect(best.headline).toContain('Caution: No ideal clean window today');
    expect(best.precaution).toContain('N95 mask');
  });

  it('correctly handles all-day good air and encourages outdoor activities', () => {
    const hours: HourlyForecastPoint[] = [];
    for (let h = 0; h < 24; h++) {
      hours.push(createMockHour(h, 35)); // All hours Good
    }

    const best = calculateBestTimeWindow(hours, 'cpcb');
    expect(best.isAllDayClean).toBe(true);
    expect(best.headline).toContain('Great air all day');
    expect(best.precaution).toContain('Enjoy outdoor workouts');
  });

  it('handles empty forecast arrays safely', () => {
    const best = calculateBestTimeWindow([], 'cpcb');
    expect(best.startTime).toBe('N/A');
    expect(best.headline).toContain('Forecast data unavailable');
  });
});
