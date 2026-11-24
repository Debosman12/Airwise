import { calculateCPCBAQI, calculateUSEPAAQI, PollutantValues, getCPCBCategory, getUSEPACategory } from '../lib/aqi';
import {
  AirQualitySnapshot,
  DailyForecastPoint,
  FullForecastData,
  HourlyForecastPoint,
  LocationInfo,
  WeatherContext
} from '../types/airQuality';
import { calculateBestTimeWindow } from '../lib/aqi/bestTimeAdvisor';

export const DEFAULT_CITY: LocationInfo = {
  id: 'delhi-in',
  name: 'New Delhi',
  country: 'India',
  admin1: 'Delhi',
  latitude: 28.6139,
  longitude: 77.2090
};

export const MOCK_CITIES: LocationInfo[] = [
  DEFAULT_CITY,
  {
    id: 'bengaluru-in',
    name: 'Bengaluru',
    country: 'India',
    admin1: 'Karnataka',
    latitude: 12.9716,
    longitude: 77.5946
  },
  {
    id: 'mumbai-in',
    name: 'Mumbai',
    country: 'India',
    admin1: 'Maharashtra',
    latitude: 19.0760,
    longitude: 72.8777
  },
  {
    id: 'london-uk',
    name: 'London',
    country: 'United Kingdom',
    latitude: 51.5072,
    longitude: -0.1276
  },
  {
    id: 'newyork-us',
    name: 'New York',
    country: 'United States',
    admin1: 'New York',
    latitude: 40.7128,
    longitude: -74.0060
  }
];

export function getMockPollutantsForLocation(location: LocationInfo): PollutantValues {
  if (location.name.toLowerCase().includes('delhi')) {
    return {
      pm25: 142.5,
      pm10: 268.0,
      no2: 64.2,
      o3: 28.4,
      so2: 18.0,
      co: 1.85
    };
  } else if (location.name.toLowerCase().includes('bengaluru')) {
    return {
      pm25: 28.4,
      pm10: 48.0,
      no2: 24.0,
      o3: 35.0,
      so2: 9.5,
      co: 0.65
    };
  } else if (location.name.toLowerCase().includes('mumbai')) {
    return {
      pm25: 68.0,
      pm10: 115.0,
      no2: 38.0,
      o3: 42.0,
      so2: 12.0,
      co: 1.1
    };
  } else {
    return {
      pm25: 18.5,
      pm10: 34.0,
      no2: 22.0,
      o3: 48.0,
      so2: 8.0,
      co: 0.5
    };
  }
}

export function getMockWeatherForLocation(location: LocationInfo): WeatherContext {
  const isDelhi = location.name.toLowerCase().includes('delhi');
  return {
    temperature: isDelhi ? 22 : 26,
    humidity: isDelhi ? 62 : 70,
    windSpeed: isDelhi ? 6.5 : 12.0,
    windDirection: 285,
    windDirectionCompass: 'WNW',
    precipitation: 0.0,
    weatherCode: isDelhi ? 2 : 1,
    weatherDescription: isDelhi ? 'Haze / Particulate smog' : 'Partly cloudy'
  };
}

export function createMockSnapshot(location: LocationInfo = DEFAULT_CITY): AirQualitySnapshot {
  const pollutants = getMockPollutantsForLocation(location);
  const weather = getMockWeatherForLocation(location);

  const cpcbAqi = calculateCPCBAQI(pollutants);
  const usepaAqi = calculateUSEPAAQI(pollutants);

  return {
    location,
    pollutants,
    cpcbAqi,
    usepaAqi,
    weather,
    provenance: {
      sourceName: 'Demo Data (Offline Fallback)',
      sourceUrl: 'https://air-quality-api.open-meteo.com',
      recordedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fetchedAt: Date.now(),
      isDemo: true,
      isStale: false
    }
  };
}

export function createMockForecast(location: LocationInfo = DEFAULT_CITY): FullForecastData {
  const isDelhi = location.name.toLowerCase().includes('delhi');
  const basePm25 = isDelhi ? 130 : 25;
  const basePm10 = isDelhi ? 240 : 45;

  const now = new Date();

  // Generate 24 hourly points starting from current hour
  const hourly24h: HourlyForecastPoint[] = [];

  for (let i = 0; i < 24; i++) {
    const pointDate = new Date(now.getTime() + i * 3600 * 1000);
    const hour = pointDate.getHours();

    // Diurnal atmospheric pattern:
    // Morning rush & inversion (7-9 AM): high (+35%)
    // Mid-day solar mixing & wind (1-4 PM): lowest (-40%)
    // Evening commute & cooling (7-10 PM): high (+25%)
    let multiplier = 1.0;
    if (hour >= 7 && hour <= 9) multiplier = 1.35;
    else if (hour >= 13 && hour <= 16) multiplier = 0.60;
    else if (hour >= 19 && hour <= 22) multiplier = 1.25;
    else if (hour >= 1 && hour <= 5) multiplier = 1.10;

    const pm25 = Math.round(basePm25 * multiplier * 10) / 10;
    const pm10 = Math.round(basePm10 * multiplier * 10) / 10;

    const pollutants: PollutantValues = {
      pm25,
      pm10,
      no2: Math.round(40 * multiplier),
      o3: Math.round(30 / multiplier), // Ozone peaks with solar radiation in afternoon
      so2: 15,
      co: Math.round(1.5 * multiplier * 10) / 10
    };

    const cpcbResult = calculateCPCBAQI(pollutants);
    const usepaResult = calculateUSEPAAQI(pollutants);

    const formattedTime =
      hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;

    hourly24h.push({
      time: pointDate.toISOString(),
      formattedTime,
      hour,
      pollutants,
      cpcbAqi: cpcbResult.aqi,
      cpcbCategory: cpcbResult.category,
      usepaAqi: usepaResult.aqi,
      usepaCategory: usepaResult.category,
      dominantPollutant: cpcbResult.dominantPollutantName,
      temperature: hour >= 12 && hour <= 16 ? 26 : 18,
      windSpeed: hour >= 12 && hour <= 16 ? 14 : 6,
      precipitation: 0
    });
  }

  // Generate 3 Daily Forecast Points (Tomorrow, Day +2, Day +3)
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const daily3d: DailyForecastPoint[] = [];

  for (let d = 1; d <= 3; d++) {
    const targetDate = new Date(now.getTime() + d * 24 * 3600 * 1000);
    const dayName = d === 1 ? 'Tomorrow' : dayNames[targetDate.getDay()];
    const formattedDate = targetDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

    // Slight variance per day
    const dayFactor = d === 1 ? 1.0 : d === 2 ? 0.9 : 1.1;
    const cpcbMin = Math.round((isDelhi ? 160 : 25) * dayFactor);
    const cpcbMax = Math.round((isDelhi ? 340 : 55) * dayFactor);
    const cpcbAvg = Math.round((cpcbMin + cpcbMax) / 2);

    const usepaMin = Math.round(cpcbMin * 0.85);
    const usepaMax = Math.round(cpcbMax * 0.85);
    const usepaAvg = Math.round((usepaMin + usepaMax) / 2);

    daily3d.push({
      date: targetDate.toISOString().split('T')[0],
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
      dominantPollutant: 'PM2.5',
      temperatureMax: 24 + d,
      windSpeedAvg: 9 + d,
      precipitationSum: 0
    });
  }

  const bestTime = calculateBestTimeWindow(hourly24h, 'cpcb');

  return {
    location,
    hourly24h,
    daily3d,
    bestTime,
    provenance: {
      sourceName: 'Demo Forecast (Atmospheric Simulation)',
      sourceUrl: 'https://open-meteo.com',
      recordedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fetchedAt: Date.now(),
      isDemo: true,
      isStale: false
    }
  };
}
