/**
 * Open-Meteo Air Quality and Weather Adapter
 *
 * Official Docs:
 * Air Quality: https://open-meteo.com/en/docs/air-quality-api
 * Weather: https://open-meteo.com/en/docs
 * Geocoding: https://open-meteo.com/en/docs/geocoding-api
 */

import {
  calculateCPCBAQI,
  calculateUSEPAAQI,
  getCPCBCategory,
  getUSEPACategory,
  PollutantValues
} from '../lib/aqi';
import {
  AirQualitySnapshot,
  DailyForecastPoint,
  FullForecastData,
  HourlyForecastPoint,
  LocationInfo,
  WeatherContext
} from '../types/airQuality';
import { AirQualityAdapter } from './apiAdapter';
import { calculateBestTimeWindow } from '../lib/aqi/bestTimeAdvisor';

const AQ_BASE_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const WEATHER_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const GEO_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const REQUEST_TIMEOUT_MS = 8000;

function degreesToCompass(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((degrees % 360) + 360) % 360 / 22.5) % 16;
  return directions[index];
}

function getWeatherDescription(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code === 1) return 'Mainly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code >= 45 && code <= 48) return 'Foggy / Hazy';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 61 && code <= 65) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Fair';
}

async function fetchWithTimeout(url: string, timeoutMs: number = REQUEST_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export class OpenMeteoAdapter implements AirQualityAdapter {
  name = 'Open-Meteo API';

  async getAirQuality(location: LocationInfo): Promise<AirQualitySnapshot> {
    const aqUrl = `${AQ_BASE_URL}?latitude=${location.latitude}&longitude=${location.longitude}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi&timezone=auto`;
    const weatherUrl = `${WEATHER_BASE_URL}?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation,weather_code&timezone=auto`;

    const [aqRes, weatherRes] = await Promise.all([
      fetchWithTimeout(aqUrl),
      fetchWithTimeout(weatherUrl)
    ]);

    const aqData = await aqRes.json();
    const weatherData = await weatherRes.json();

    const currentAQ = aqData.current || {};
    const currentW = weatherData.current || {};

    const rawCO = currentAQ.carbon_monoxide;
    const coInMg = typeof rawCO === 'number' ? rawCO / 1000 : null;

    const pollutants: PollutantValues = {
      pm25: typeof currentAQ.pm2_5 === 'number' ? currentAQ.pm2_5 : null,
      pm10: typeof currentAQ.pm10 === 'number' ? currentAQ.pm10 : null,
      no2: typeof currentAQ.nitrogen_dioxide === 'number' ? currentAQ.nitrogen_dioxide : null,
      o3: typeof currentAQ.ozone === 'number' ? currentAQ.ozone : null,
      so2: typeof currentAQ.sulphur_dioxide === 'number' ? currentAQ.sulphur_dioxide : null,
      co: coInMg
    };

    const cpcbAqi = calculateCPCBAQI(pollutants);
    const usepaAqi = calculateUSEPAAQI(pollutants);

    const windDir = currentW.wind_direction_10m ?? 0;
    const weather: WeatherContext = {
      temperature: Math.round(currentW.temperature_2m ?? 0),
      humidity: Math.round(currentW.relative_humidity_2m ?? 0),
      windSpeed: Math.round((currentW.wind_speed_10m ?? 0) * 10) / 10,
      windDirection: windDir,
      windDirectionCompass: degreesToCompass(windDir),
      precipitation: currentW.precipitation ?? 0,
      weatherCode: currentW.weather_code ?? 0,
      weatherDescription: getWeatherDescription(currentW.weather_code ?? 0)
    };

    const readingTime = currentAQ.time
      ? new Date(currentAQ.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
      location,
      pollutants,
      rawOpenMeteoAqi: currentAQ.us_aqi,
      cpcbAqi,
      usepaAqi,
      weather,
      provenance: {
        sourceName: 'Open-Meteo Air Quality & Weather API',
        sourceUrl: 'https://open-meteo.com',
        recordedAt: readingTime,
        fetchedAt: Date.now(),
        isDemo: false,
        isStale: false
      }
    };
  }

  async getForecast(location: LocationInfo): Promise<FullForecastData> {
    const aqUrl = `${AQ_BASE_URL}?latitude=${location.latitude}&longitude=${location.longitude}&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&forecast_days=4&timezone=auto`;
    const weatherUrl = `${WEATHER_BASE_URL}?latitude=${location.latitude}&longitude=${location.longitude}&hourly=temperature_2m,wind_speed_10m,precipitation&forecast_days=4&timezone=auto`;

    const [aqRes, weatherRes] = await Promise.all([
      fetchWithTimeout(aqUrl),
      fetchWithTimeout(weatherUrl)
    ]);

    const aqData = await aqRes.json();
    const weatherData = await weatherRes.json();

    const hourlyTimes: string[] = aqData.hourly?.time || [];
    const hourlyPM25: number[] = aqData.hourly?.pm2_5 || [];
    const hourlyPM10: number[] = aqData.hourly?.pm10 || [];
    const hourlyCO: number[] = aqData.hourly?.carbon_monoxide || [];
    const hourlyNO2: number[] = aqData.hourly?.nitrogen_dioxide || [];
    const hourlySO2: number[] = aqData.hourly?.sulphur_dioxide || [];
    const hourlyO3: number[] = aqData.hourly?.ozone || [];

    const weatherTimes: string[] = weatherData.hourly?.time || [];
    const weatherTemp: number[] = weatherData.hourly?.temperature_2m || [];
    const weatherWind: number[] = weatherData.hourly?.wind_speed_10m || [];
    const weatherPrecip: number[] = weatherData.hourly?.precipitation || [];

    // Find index of current hour
    const now = new Date();
    let startIndex = 0;
    const nowIsoPrefix = now.toISOString().slice(0, 13); // "2026-11-24T21"

    for (let i = 0; i < hourlyTimes.length; i++) {
      if (hourlyTimes[i].startsWith(nowIsoPrefix)) {
        startIndex = i;
        break;
      }
    }

    // Process all points from startIndex onwards
    const allProcessedPoints: HourlyForecastPoint[] = [];

    for (let i = startIndex; i < hourlyTimes.length; i++) {
      const timeStr = hourlyTimes[i];
      const pDate = new Date(timeStr);
      const hour = pDate.getHours();

      const pm25 = hourlyPM25[i] ?? null;
      const pm10 = hourlyPM10[i] ?? null;
      const coRaw = hourlyCO[i] ?? null;
      const coInMg = typeof coRaw === 'number' ? coRaw / 1000 : null;
      const no2 = hourlyNO2[i] ?? null;
      const so2 = hourlySO2[i] ?? null;
      const o3 = hourlyO3[i] ?? null;

      const pollutants: PollutantValues = {
        pm25,
        pm10,
        no2,
        o3,
        so2,
        co: coInMg
      };

      const cpcb = calculateCPCBAQI(pollutants);
      const usepa = calculateUSEPAAQI(pollutants);

      const wIdx = weatherTimes.indexOf(timeStr);
      const temp = wIdx !== -1 ? Math.round(weatherTemp[wIdx] ?? 20) : 20;
      const wind = wIdx !== -1 ? Math.round((weatherWind[wIdx] ?? 8) * 10) / 10 : 8;
      const precip = wIdx !== -1 ? weatherPrecip[wIdx] ?? 0 : 0;

      const formattedTime =
        hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;

      allProcessedPoints.push({
        time: timeStr,
        formattedTime,
        hour,
        pollutants,
        cpcbAqi: cpcb.aqi,
        cpcbCategory: cpcb.category,
        usepaAqi: usepa.aqi,
        usepaCategory: usepa.category,
        dominantPollutant: cpcb.dominantPollutantName,
        temperature: temp,
        windSpeed: wind,
        precipitation: precip
      });
    }

    // 1. Next 24 hours
    const hourly24h = allProcessedPoints.slice(0, 24);

    // 2. 3-day daily summary (Tomorrow, Day +2, Day +3)
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const daily3d: DailyForecastPoint[] = [];

    // Group remaining hours by calendar date starting tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    for (let d = 1; d <= 3; d++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + d);
      const targetIsoDate = targetDate.toISOString().split('T')[0];

      const dayPoints = allProcessedPoints.filter((p) => p.time.startsWith(targetIsoDate));

      if (dayPoints.length > 0) {
        const cpcbValues = dayPoints.map((p) => p.cpcbAqi);
        const usepaValues = dayPoints.map((p) => p.usepaAqi);

        const cpcbMin = Math.min(...cpcbValues);
        const cpcbMax = Math.max(...cpcbValues);
        const cpcbAvg = Math.round(cpcbValues.reduce((a, b) => a + b, 0) / cpcbValues.length);

        const usepaMin = Math.min(...usepaValues);
        const usepaMax = Math.max(...usepaValues);
        const usepaAvg = Math.round(usepaValues.reduce((a, b) => a + b, 0) / usepaValues.length);

        const dayName = d === 1 ? 'Tomorrow' : dayNames[targetDate.getDay()];
        const formattedDate = targetDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

        const maxTemp = Math.max(...dayPoints.map((p) => p.temperature));
        const avgWind = Math.round(
          dayPoints.reduce((acc, p) => acc + p.windSpeed, 0) / dayPoints.length
        );
        const totalPrecip = Math.round(
          dayPoints.reduce((acc, p) => acc + p.precipitation, 0) * 10
        ) / 10;

        daily3d.push({
          date: targetIsoDate,
          dayName,
          formattedDate,
          cpcbMin,
          cpcbMax,
          cpcbAvg,
          cpcbCategory: getCPCBCategory(cpcbAvg),
          usepaMin,
          usepaMax,
          usepaAvg,
          usepaCategory: getUSEPACategory(usepaAvg),
          dominantPollutant: dayPoints[0].dominantPollutant,
          temperatureMax: maxTemp,
          windSpeedAvg: avgWind,
          precipitationSum: totalPrecip
        });
      }
    }

    const bestTime = calculateBestTimeWindow(hourly24h, 'cpcb');

    return {
      location,
      hourly24h,
      daily3d,
      bestTime,
      provenance: {
        sourceName: 'Open-Meteo Air Quality Forecast Model',
        sourceUrl: 'https://open-meteo.com/en/docs/air-quality-api',
        recordedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fetchedAt: Date.now(),
        isDemo: false,
        isStale: false
      }
    };
  }

  async getWeather(location: LocationInfo): Promise<WeatherContext> {
    const weatherUrl = `${WEATHER_BASE_URL}?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation,weather_code&timezone=auto`;
    const res = await fetchWithTimeout(weatherUrl);
    const data = await res.json();
    const currentW = data.current || {};
    const windDir = currentW.wind_direction_10m ?? 0;

    return {
      temperature: Math.round(currentW.temperature_2m ?? 0),
      humidity: Math.round(currentW.relative_humidity_2m ?? 0),
      windSpeed: Math.round((currentW.wind_speed_10m ?? 0) * 10) / 10,
      windDirection: windDir,
      windDirectionCompass: degreesToCompass(windDir),
      precipitation: currentW.precipitation ?? 0,
      weatherCode: currentW.weather_code ?? 0,
      weatherDescription: getWeatherDescription(currentW.weather_code ?? 0)
    };
  }

  async searchCities(query: string): Promise<LocationInfo[]> {
    if (!query || query.trim().length < 2) return [];

    const url = `${GEO_BASE_URL}?name=${encodeURIComponent(query.trim())}&count=6&language=en&format=json`;
    const res = await fetchWithTimeout(url);
    const data = await res.json();

    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((r: { id: number; name: string; country: string; admin1?: string; latitude: number; longitude: number }) => ({
      id: r.id,
      name: r.name,
      country: r.country,
      admin1: r.admin1,
      latitude: r.latitude,
      longitude: r.longitude
    }));
  }
}

export const openMeteoAdapter = new OpenMeteoAdapter();
