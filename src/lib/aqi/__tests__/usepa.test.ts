import { describe, it, expect } from 'vitest';
import {
  calculateUSEPASubIndex,
  calculateUSEPAAQI,
  getUSEPACategory
} from '../usepa';

describe('US EPA AQI Calculator', () => {
  describe('Category boundaries and labels', () => {
    it('correctly maps AQI values to US EPA categories', () => {
      expect(getUSEPACategory(0).level).toBe('good');
      expect(getUSEPACategory(50).level).toBe('good');
      expect(getUSEPACategory(51).level).toBe('moderate');
      expect(getUSEPACategory(100).level).toBe('moderate');
      expect(getUSEPACategory(101).level).toBe('unhealthy-sensitive');
      expect(getUSEPACategory(150).level).toBe('unhealthy-sensitive');
      expect(getUSEPACategory(151).level).toBe('unhealthy');
      expect(getUSEPACategory(200).level).toBe('unhealthy');
      expect(getUSEPACategory(201).level).toBe('very-unhealthy');
      expect(getUSEPACategory(300).level).toBe('very-unhealthy');
      expect(getUSEPACategory(301).level).toBe('hazardous');
      expect(getUSEPACategory(500).level).toBe('hazardous');
    });
  });

  describe('PM2.5 Sub-Index boundary tests', () => {
    it('evaluates exact category boundaries for PM2.5 according to EPA TAD', () => {
      // 0.0 to 12.0 -> 0 to 50 (Good)
      expect(calculateUSEPASubIndex('pm25', 0)).toBe(0);
      expect(calculateUSEPASubIndex('pm25', 12.0)).toBe(50);

      // 12.1 to 35.4 -> 51 to 100 (Moderate)
      expect(calculateUSEPASubIndex('pm25', 12.1)).toBe(51);
      expect(calculateUSEPASubIndex('pm25', 35.4)).toBe(100);

      // 35.5 to 55.4 -> 101 to 150 (Unhealthy for Sensitive Groups)
      expect(calculateUSEPASubIndex('pm25', 35.5)).toBe(101);
      expect(calculateUSEPASubIndex('pm25', 55.4)).toBe(150);

      // 55.5 to 150.4 -> 151 to 200 (Unhealthy)
      expect(calculateUSEPASubIndex('pm25', 55.5)).toBe(151);
      expect(calculateUSEPASubIndex('pm25', 150.4)).toBe(200);

      // 150.5 to 250.4 -> 201 to 300 (Very Unhealthy)
      expect(calculateUSEPASubIndex('pm25', 150.5)).toBe(201);
      expect(calculateUSEPASubIndex('pm25', 250.4)).toBe(300);

      // 250.5 to 500.4 -> 301 to 500 (Hazardous)
      expect(calculateUSEPASubIndex('pm25', 250.5)).toBe(301);
      expect(calculateUSEPASubIndex('pm25', 500.4)).toBe(500);

      // Truncation to 1 decimal place check (e.g. 12.09 truncated to 12.0 => AQI 50)
      expect(calculateUSEPASubIndex('pm25', 12.09)).toBe(50);
    });
  });

  describe('PM10 Sub-Index boundary tests', () => {
    it('evaluates exact category boundaries for PM10 according to EPA TAD', () => {
      // 0 to 54 -> 0 to 50 (Good)
      expect(calculateUSEPASubIndex('pm10', 0)).toBe(0);
      expect(calculateUSEPASubIndex('pm10', 54)).toBe(50);

      // 55 to 154 -> 51 to 100 (Moderate)
      expect(calculateUSEPASubIndex('pm10', 55)).toBe(51);
      expect(calculateUSEPASubIndex('pm10', 154)).toBe(100);

      // 155 to 254 -> 101 to 150 (Unhealthy for Sensitive Groups)
      expect(calculateUSEPASubIndex('pm10', 155)).toBe(101);
      expect(calculateUSEPASubIndex('pm10', 254)).toBe(150);

      // 255 to 354 -> 151 to 200 (Unhealthy)
      expect(calculateUSEPASubIndex('pm10', 255)).toBe(151);
      expect(calculateUSEPASubIndex('pm10', 354)).toBe(200);

      // 355 to 424 -> 201 to 300 (Very Unhealthy)
      expect(calculateUSEPASubIndex('pm10', 355)).toBe(201);
      expect(calculateUSEPASubIndex('pm10', 424)).toBe(300);

      // 425 to 604 -> 301 to 500 (Hazardous)
      expect(calculateUSEPASubIndex('pm10', 425)).toBe(301);
      expect(calculateUSEPASubIndex('pm10', 604)).toBe(500);
    });
  });

  describe('Comprehensive EPA calculation & rules', () => {
    it('calculates multi-pollutant US EPA AQI and selects dominant pollutant', () => {
      const result = calculateUSEPAAQI({
        pm25: 65.2, // ~156 (Unhealthy)
        pm10: 80,   // ~63 (Moderate)
        no2: 45,    // ~23 (Good)
        co: 1.5     // ~15 (Good)
      });

      expect(result.dominantPollutant).toBe('pm25');
      expect(result.aqi).toBe(156);
      expect(result.category.name).toBe('Unhealthy');
      expect(result.isComplete).toBe(true);
    });

    it('handles negative and non-numeric inputs cleanly', () => {
      const result = calculateUSEPAAQI({
        pm25: -10,
        no2: null
      });

      expect(result.aqi).toBe(0);
      expect(result.dominantPollutant).toBeNull();
      expect(result.notes).toBe('No valid pollutant data available.');
    });
  });
});
