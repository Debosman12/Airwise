import { describe, it, expect } from 'vitest';
import { mapPointsService } from '../mapPointsService';
import { DEFAULT_CITY } from '../mockData';

describe('MapPointsService', () => {
  it('generates an exact 9-point geographic grid around target coordinates', () => {
    const grid = mapPointsService.generateGridCoordinates(DEFAULT_CITY);
    expect(grid.length).toBe(9);
    // Center point should match city coordinates
    expect(grid[0].latitude).toBe(DEFAULT_CITY.latitude);
    expect(grid[0].longitude).toBe(DEFAULT_CITY.longitude);
  });

  it('generates realistic mock grid points with full CPCB and EPA calculations', () => {
    const result = mapPointsService.generateMockGrid(DEFAULT_CITY);
    expect(result.points.length).toBe(9);
    expect(result.isRealStations).toBe(false);
    expect(result.isDemo).toBe(true);

    result.points.forEach((point) => {
      expect(point.cpcbAqi).toBeGreaterThan(0);
      expect(point.usepaAqi).toBeGreaterThan(0);
      expect(point.cpcbCategory.name).toBeDefined();
      expect(point.source).toBeDefined();
    });
  });
});
