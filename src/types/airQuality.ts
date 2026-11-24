import { AQICalculationResult, AQICategory, PollutantValues } from '../lib/aqi';

export interface LocationInfo {
  id?: string | number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

export interface WeatherContext {
  temperature: number;      // °C
  humidity: number;         // %
  windSpeed: number;        // km/h
  windDirection: number;    // degrees (0-360)
  windDirectionCompass: string; // N, NE, E, SE, S, SW, W, NW
  precipitation: number;    // mm
  weatherCode: number;
  weatherDescription: string;
}

export interface DataSourceProvenance {
  sourceName: string;
  sourceUrl: string;
  recordedAt: string;       // ISO or localized timestamp of reading
  fetchedAt: number;        // Date.now() timestamp
  isDemo: boolean;          // True if using mock fallback data
  isStale: boolean;         // True if cached data served after network failure
  cacheAgeMinutes?: number;
}

export interface AirQualitySnapshot {
  location: LocationInfo;
  pollutants: PollutantValues;
  rawOpenMeteoAqi?: number; // US AQI reported directly by Open-Meteo (for reference)
  cpcbAqi: AQICalculationResult;
  usepaAqi: AQICalculationResult;
  weather: WeatherContext;
  provenance: DataSourceProvenance;
}

export interface HourlyForecastPoint {
  time: string;             // ISO string e.g. "2026-11-24T14:00"
  formattedTime: string;    // e.g. "2 PM"
  hour: number;             // 0-23
  pollutants: PollutantValues;
  cpcbAqi: number;
  cpcbCategory: AQICategory;
  usepaAqi: number;
  usepaCategory: AQICategory;
  dominantPollutant: string;
  temperature: number;
  windSpeed: number;
  precipitation: number;
}

export interface DailyForecastPoint {
  date: string;             // "2026-11-25"
  dayName: string;          // "Tomorrow", "Thursday", "Friday"
  formattedDate: string;    // "Nov 25"
  cpcbMin: number;
  cpcbMax: number;
  cpcbAvg: number;
  cpcbCategory: AQICategory;
  usepaMin: number;
  usepaMax: number;
  usepaAvg: number;
  usepaCategory: AQICategory;
  dominantPollutant: string;
  temperatureMax: number;
  windSpeedAvg: number;
  precipitationSum: number;
}

export interface BestTimeWindow {
  startTime: string;        // "2:00 PM"
  endTime: string;          // "4:00 PM"
  startHour: number;
  endHour: number;
  averageAqi: number;
  category: AQICategory;
  headline: string;
  explanation: string;
  isAllDayPoor: boolean;
  isAllDayClean: boolean;
  precaution: string;
}

export interface FullForecastData {
  location: LocationInfo;
  hourly24h: HourlyForecastPoint[];
  daily3d: DailyForecastPoint[];
  bestTime: BestTimeWindow;
  provenance: DataSourceProvenance;
}
