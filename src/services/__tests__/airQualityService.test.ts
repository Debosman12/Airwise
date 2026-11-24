import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cacheManager } from '../../lib/cache/cacheManager';
import { airQualityService } from '../airQualityService';
import { DEFAULT_CITY } from '../mockData';

describe('CacheManager and AirQualityService', () => {
  beforeEach(() => {
    cacheManager.clear();
    airQualityService.setDemoMode(false);
    vi.restoreAllMocks();
  });

  it('stores and retrieves items from cache correctly', () => {
    cacheManager.set('test_key', { aqi: 150 }, 1000);
    const result = cacheManager.get<{ aqi: number }>('test_key');
    expect(result).not.toBeNull();
    expect(result?.data.aqi).toBe(150);
    expect(result?.isStale).toBe(false);
  });

  it('detects stale entries when TTL has elapsed', () => {
    // Set with 0ms TTL so it expires immediately
    cacheManager.set('expired_key', { aqi: 220 }, -10);
    const result = cacheManager.get<{ aqi: number }>('expired_key');
    expect(result).not.toBeNull();
    expect(result?.data.aqi).toBe(220);
    expect(result?.isStale).toBe(true);
  });

  it('returns mock data with isDemo flag when demo mode is forced', async () => {
    const snapshot = await airQualityService.getCurrentAirQuality(DEFAULT_CITY, { forceDemo: true });
    expect(snapshot.provenance.isDemo).toBe(true);
    expect(snapshot.provenance.sourceName).toContain('Demo Data');
    expect(snapshot.cpcbAqi.aqi).toBeGreaterThan(0);
    expect(snapshot.usepaAqi.aqi).toBeGreaterThan(0);
  });

  it('calculates both Indian CPCB and US EPA AQI on snapshot', async () => {
    const snapshot = await airQualityService.getCurrentAirQuality(DEFAULT_CITY, { forceDemo: true });
    expect(snapshot.cpcbAqi.standard).toBe('cpcb');
    expect(snapshot.usepaAqi.standard).toBe('usepa');
    expect(snapshot.cpcbAqi.dominantPollutant).toBeDefined();
    expect(snapshot.weather.temperature).toBeDefined();
  });

  it('generates 24-hour and 3-day forecast with best-time window', async () => {
    const forecast = await airQualityService.getForecast(DEFAULT_CITY, { forceDemo: true });
    expect(forecast.hourly24h.length).toBe(24);
    expect(forecast.daily3d.length).toBe(3);
    expect(forecast.bestTime).toBeDefined();
    expect(forecast.bestTime.headline).toBeDefined();
    expect(forecast.provenance.isDemo).toBe(true);
  });
});
