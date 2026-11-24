/**
 * Map Points Service
 *
 * Implements:
 * 1. 9-Point sampled grid around center coordinates
 * 2. Batched Open-Meteo multi-coordinate query (single HTTP request)
 * 3. Optional OpenAQ v3 physical stations when VITE_OPENAQ_API_KEY is present
 * 4. 10-minute caching and offline mock fallback
 */

import { calculateCPCBAQI, calculateUSEPAAQI, PollutantValues } from '../lib/aqi';
import { cacheManager } from '../lib/cache/cacheManager';
import { LocationInfo } from '../types/airQuality';
import { MapPoint, MapPointsResult } from '../types/map';

const AQ_BASE_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const OPENAQ_BASE_URL = 'https://api.openaq.org/v3/locations';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const REQUEST_TIMEOUT_MS = 8000;

interface GridDefinition {
  nameSuffix: string;
  latOffset: number;
  lonOffset: number;
}

export const GRID_OFFSETS: GridDefinition[] = [
  { nameSuffix: 'Central', latOffset: 0.0, lonOffset: 0.0 },
  { nameSuffix: 'North', latOffset: 0.08, lonOffset: 0.0 },
  { nameSuffix: 'Northeast', latOffset: 0.07, lonOffset: 0.07 },
  { nameSuffix: 'East', latOffset: 0.0, lonOffset: 0.08 },
  { nameSuffix: 'Southeast', latOffset: -0.07, lonOffset: 0.07 },
  { nameSuffix: 'South', latOffset: -0.08, lonOffset: 0.0 },
  { nameSuffix: 'Southwest', latOffset: -0.07, lonOffset: -0.07 },
  { nameSuffix: 'West', latOffset: 0.0, lonOffset: -0.08 },
  { nameSuffix: 'Northwest', latOffset: 0.07, lonOffset: -0.07 }
];

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = REQUEST_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export class MapPointsService {
  /**
   * Generates a 9-point geographic grid centered on the target location
   */
  generateGridCoordinates(location: LocationInfo) {
    return GRID_OFFSETS.map((def, idx) => ({
      id: `grid-${idx}`,
      name: `${location.name} (${def.nameSuffix})`,
      latitude: Math.round((location.latitude + def.latOffset) * 10000) / 10000,
      longitude: Math.round((location.longitude + def.lonOffset) * 10000) / 10000
    }));
  }

  /**
   * Retrieves map points: checks cache -> OpenAQ (if key set) -> Batched Open-Meteo -> Mock fallback
   */
  async getMapPoints(
    location: LocationInfo,
    options: { forceRefresh?: boolean; forceDemo?: boolean } = {}
  ): Promise<MapPointsResult> {
    const cacheKey = `map_grid_${location.latitude.toFixed(2)}_${location.longitude.toFixed(2)}`;

    if (options.forceDemo) {
      return this.generateMockGrid(location);
    }

    // 1. Check Cache
    if (!options.forceRefresh) {
      const cached = cacheManager.get<MapPointsResult>(cacheKey);
      if (cached && !cached.isStale) {
        return cached.data;
      }
    }

    // 2. Check for OpenAQ physical stations if API key configured
    const openAqKey = import.meta.env.VITE_OPENAQ_API_KEY;
    if (openAqKey && openAqKey.trim() !== '') {
      try {
        const realStations = await this.fetchOpenAQStations(location, openAqKey.trim());
        if (realStations && realStations.points.length > 0) {
          cacheManager.set(cacheKey, realStations, CACHE_TTL_MS);
          return realStations;
        }
      } catch (e) {
        console.warn('OpenAQ query failed, falling back to batched Open-Meteo grid:', e);
      }
    }

    // 3. Batched Open-Meteo Query (Single call for all 9 coordinates)
    try {
      const gridResult = await this.fetchBatchedOpenMeteoGrid(location);
      cacheManager.set(cacheKey, gridResult, CACHE_TTL_MS);
      return gridResult;
    } catch (e) {
      console.warn('Batched Open-Meteo grid fetch failed, checking cached data...', e);

      const cached = cacheManager.get<MapPointsResult>(cacheKey);
      if (cached) {
        return cached.data;
      }

      return this.generateMockGrid(location);
    }
  }

  /**
   * Batched Open-Meteo multi-coordinate query
   */
  private async fetchBatchedOpenMeteoGrid(location: LocationInfo): Promise<MapPointsResult> {
    const gridPoints = this.generateGridCoordinates(location);

    const latParam = gridPoints.map((p) => p.latitude).join(',');
    const lonParam = gridPoints.map((p) => p.longitude).join(',');

    const url = `${AQ_BASE_URL}?latitude=${latParam}&longitude=${lonParam}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto`;

    const response = await fetchWithTimeout(url);
    const rawData = await response.json();

    // When multiple coordinates are sent, Open-Meteo returns an Array of objects
    const responsesArray = Array.isArray(rawData) ? rawData : [rawData];

    const readingTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const points: MapPoint[] = gridPoints.map((gridPoint, idx) => {
      const dataItem = responsesArray[idx] || {};
      const current = dataItem.current || {};

      const rawCO = current.carbon_monoxide;
      const coInMg = typeof rawCO === 'number' ? rawCO / 1000 : null;

      const pollutants: PollutantValues = {
        pm25: typeof current.pm2_5 === 'number' ? current.pm2_5 : null,
        pm10: typeof current.pm10 === 'number' ? current.pm10 : null,
        no2: typeof current.nitrogen_dioxide === 'number' ? current.nitrogen_dioxide : null,
        o3: typeof current.ozone === 'number' ? current.ozone : null,
        so2: typeof current.sulphur_dioxide === 'number' ? current.sulphur_dioxide : null,
        co: coInMg
      };

      const cpcbResult = calculateCPCBAQI(pollutants);
      const usepaResult = calculateUSEPAAQI(pollutants);

      return {
        id: gridPoint.id,
        name: gridPoint.name,
        latitude: gridPoint.latitude,
        longitude: gridPoint.longitude,
        isRealStation: false,
        stationType: 'model-grid',
        pollutants,
        cpcbAqi: cpcbResult.aqi,
        cpcbCategory: cpcbResult.category,
        usepaAqi: usepaResult.aqi,
        usepaCategory: usepaResult.category,
        dominantPollutant: cpcbResult.dominantPollutantName,
        source: 'Open-Meteo Model Grid Point',
        lastUpdated: readingTime
      };
    });

    return {
      points,
      isRealStations: false,
      centerLatitude: location.latitude,
      centerLongitude: location.longitude,
      sourceName: 'Open-Meteo Atmospheric Chemistry Model',
      isDemo: false,
      fetchedAt: Date.now()
    };
  }

  /**
   * Optional OpenAQ v3 Physical Stations query
   */
  private async fetchOpenAQStations(
    location: LocationInfo,
    apiKey: string
  ): Promise<MapPointsResult | null> {
    const url = `${OPENAQ_BASE_URL}?coordinates=${location.latitude},${location.longitude}&radius=25000&limit=9`;
    const res = await fetchWithTimeout(url, {
      headers: { 'X-API-Key': apiKey }
    });
    const data = await res.json();

    if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
      return null;
    }

    const readingTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const points: MapPoint[] = data.results.slice(0, 9).map((st: {
      id: number;
      name: string;
      coordinates: { latitude: number; longitude: number };
      sensors?: Array<{ parameter: { name: string }; value: number }>;
    }, idx: number) => {
      // Map sensor values to PollutantValues
      const pollutants: PollutantValues = {};
      st.sensors?.forEach((s) => {
        const pName = s.parameter.name.toLowerCase();
        if (pName === 'pm25' || pName === 'pm2.5') pollutants.pm25 = s.value;
        else if (pName === 'pm10') pollutants.pm10 = s.value;
        else if (pName === 'no2') pollutants.no2 = s.value;
        else if (pName === 'o3') pollutants.o3 = s.value;
        else if (pName === 'so2') pollutants.so2 = s.value;
        else if (pName === 'co') pollutants.co = s.value;
      });

      const cpcbResult = calculateCPCBAQI(pollutants);
      const usepaResult = calculateUSEPAAQI(pollutants);

      return {
        id: `openaq-${st.id || idx}`,
        name: st.name || `Station ${idx + 1}`,
        latitude: st.coordinates.latitude,
        longitude: st.coordinates.longitude,
        isRealStation: true,
        stationType: 'physical',
        pollutants,
        cpcbAqi: cpcbResult.aqi,
        cpcbCategory: cpcbResult.category,
        usepaAqi: usepaResult.aqi,
        usepaCategory: usepaResult.category,
        dominantPollutant: cpcbResult.dominantPollutantName,
        source: 'OpenAQ Physical Station',
        lastUpdated: readingTime
      };
    });

    return {
      points,
      isRealStations: true,
      centerLatitude: location.latitude,
      centerLongitude: location.longitude,
      sourceName: 'OpenAQ Physical Monitoring Network',
      isDemo: false,
      fetchedAt: Date.now()
    };
  }

  /**
   * Generates realistic simulated grid points for offline demo testing
   */
  generateMockGrid(location: LocationInfo): MapPointsResult {
    const isDelhi = location.name.toLowerCase().includes('delhi');
    const basePm25 = isDelhi ? 135 : 28;
    const basePm10 = isDelhi ? 250 : 50;

    const gridPoints = this.generateGridCoordinates(location);
    const readingTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Variance multipliers across districts
    const multipliers = [1.0, 0.85, 0.95, 1.15, 1.25, 1.1, 1.05, 0.9, 0.8];

    const points: MapPoint[] = gridPoints.map((gp, i) => {
      const factor = multipliers[i % multipliers.length];
      const pm25 = Math.round(basePm25 * factor * 10) / 10;
      const pm10 = Math.round(basePm10 * factor * 10) / 10;

      const pollutants: PollutantValues = {
        pm25,
        pm10,
        no2: Math.round(45 * factor),
        o3: Math.round(28 / factor),
        so2: 14,
        co: Math.round(1.6 * factor * 10) / 10
      };

      const cpcbResult = calculateCPCBAQI(pollutants);
      const usepaResult = calculateUSEPAAQI(pollutants);

      return {
        id: gp.id,
        name: gp.name,
        latitude: gp.latitude,
        longitude: gp.longitude,
        isRealStation: false,
        stationType: 'model-grid',
        pollutants,
        cpcbAqi: cpcbResult.aqi,
        cpcbCategory: cpcbResult.category,
        usepaAqi: usepaResult.aqi,
        usepaCategory: usepaResult.category,
        dominantPollutant: cpcbResult.dominantPollutantName,
        source: 'Demo Sampled Model Grid (Offline Fallback)',
        lastUpdated: readingTime
      };
    });

    return {
      points,
      isRealStations: false,
      centerLatitude: location.latitude,
      centerLongitude: location.longitude,
      sourceName: 'Demo Sampled Model Grid',
      isDemo: true,
      fetchedAt: Date.now()
    };
  }
}

export const mapPointsService = new MapPointsService();
