/**
 * Unified Air Quality Service
 *
 * Single data-layer module coordinating API calls, 5-10m caching,
 * stale-data detection, and offline mock fallback.
 */

import { cacheManager } from '../lib/cache/cacheManager';
import { AirQualitySnapshot, FullForecastData, LocationInfo } from '../types/airQuality';
import { openMeteoAdapter } from './openMeteoAdapter';
import { createMockForecast, createMockSnapshot, DEFAULT_CITY, MOCK_CITIES } from './mockData';

const CACHE_TTL_MS = Number(import.meta.env.VITE_CACHE_TTL_MS) || 10 * 60 * 1000; // 10 minutes

export interface FetchOptions {
  forceRefresh?: boolean;
  forceDemo?: boolean;
}

export class AirQualityService {
  private isDemoModeForced = false;

  setDemoMode(enabled: boolean) {
    this.isDemoModeForced = enabled;
  }

  isDemoMode(): boolean {
    return this.isDemoModeForced;
  }

  /**
   * Retrieves current air quality snapshot for a given location.
   */
  async getCurrentAirQuality(
    location: LocationInfo = DEFAULT_CITY,
    options: FetchOptions = {}
  ): Promise<AirQualitySnapshot> {
    const cacheKey = `aq_${location.latitude.toFixed(2)}_${location.longitude.toFixed(2)}`;

    if (options.forceDemo || this.isDemoModeForced) {
      return createMockSnapshot(location);
    }

    // 1. Check cache
    if (!options.forceRefresh) {
      const cached = cacheManager.get<AirQualitySnapshot>(cacheKey);
      if (cached && !cached.isStale) {
        return {
          ...cached.data,
          provenance: {
            ...cached.data.provenance,
            isStale: false,
            cacheAgeMinutes: cached.ageMinutes
          }
        };
      }
    }

    // 2. Fetch live data from Open-Meteo API
    try {
      const liveSnapshot = await openMeteoAdapter.getAirQuality(location);
      cacheManager.set(cacheKey, liveSnapshot, CACHE_TTL_MS);
      return liveSnapshot;
    } catch (networkError) {
      console.warn('Network request failed, checking stale cache fallback...', networkError);

      const cached = cacheManager.get<AirQualitySnapshot>(cacheKey);
      if (cached) {
        return {
          ...cached.data,
          provenance: {
            ...cached.data.provenance,
            isStale: true,
            cacheAgeMinutes: cached.ageMinutes
          }
        };
      }

      return createMockSnapshot(location);
    }
  }

  /**
   * Retrieves 24-hour and 3-day forecast with lowest-AQI daylight advisory.
   */
  async getForecast(
    location: LocationInfo = DEFAULT_CITY,
    options: FetchOptions = {}
  ): Promise<FullForecastData> {
    const cacheKey = `fc_${location.latitude.toFixed(2)}_${location.longitude.toFixed(2)}`;

    if (options.forceDemo || this.isDemoModeForced) {
      return createMockForecast(location);
    }

    // 1. Check cache
    if (!options.forceRefresh) {
      const cached = cacheManager.get<FullForecastData>(cacheKey);
      if (cached && !cached.isStale) {
        return {
          ...cached.data,
          provenance: {
            ...cached.data.provenance,
            isStale: false,
            cacheAgeMinutes: cached.ageMinutes
          }
        };
      }
    }

    // 2. Fetch live forecast
    try {
      const liveForecast = await openMeteoAdapter.getForecast(location);
      cacheManager.set(cacheKey, liveForecast, CACHE_TTL_MS);
      return liveForecast;
    } catch (networkError) {
      console.warn('Forecast network request failed, checking cache fallback...', networkError);

      const cached = cacheManager.get<FullForecastData>(cacheKey);
      if (cached) {
        return {
          ...cached.data,
          provenance: {
            ...cached.data.provenance,
            isStale: true,
            cacheAgeMinutes: cached.ageMinutes
          }
        };
      }

      return createMockForecast(location);
    }
  }

  /**
   * Search for cities using Open-Meteo geocoding with local fallback
   */
  async searchCities(query: string): Promise<LocationInfo[]> {
    try {
      const results = await openMeteoAdapter.searchCities(query);
      if (results.length > 0) return results;
    } catch (e) {
      console.warn('Geocoding search failed, searching offline cities...', e);
    }

    return MOCK_CITIES.filter((c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.country.toLowerCase().includes(query.toLowerCase())
    );
  }
}

export const airQualityService = new AirQualityService();
