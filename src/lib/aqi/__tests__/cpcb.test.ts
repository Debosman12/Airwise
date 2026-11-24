import { describe, it, expect } from 'vitest';
import {
  calculateCPCBSubIndex,
  calculateCPCBAQI,
  getCPCBCategory
} from '../cpcb';

describe('Indian CPCB AQI Calculator', () => {
  describe('Category boundaries and labels', () => {
    it('correctly maps AQI values to CPCB categories', () => {
      expect(getCPCBCategory(0).level).toBe('good');
      expect(getCPCBCategory(50).level).toBe('good');
      expect(getCPCBCategory(51).level).toBe('satisfactory');
      expect(getCPCBCategory(100).level).toBe('satisfactory');
      expect(getCPCBCategory(101).level).toBe('moderate');
      expect(getCPCBCategory(200).level).toBe('moderate');
      expect(getCPCBCategory(201).level).toBe('poor');
      expect(getCPCBCategory(300).level).toBe('poor');
      expect(getCPCBCategory(301).level).toBe('very-poor');
      expect(getCPCBCategory(400).level).toBe('very-poor');
      expect(getCPCBCategory(401).level).toBe('severe');
      expect(getCPCBCategory(500).level).toBe('severe');
    });
  });

  describe('PM2.5 Sub-Index boundary tests', () => {
    it('evaluates exact category boundaries for PM2.5', () => {
      // 0 to 30 -> 0 to 50 (Good)
      expect(calculateCPCBSubIndex('pm25', 0)).toBe(0);
      expect(calculateCPCBSubIndex('pm25', 15)).toBe(25);
      expect(calculateCPCBSubIndex('pm25', 30)).toBe(50);

      // 31 to 60 -> 51 to 100 (Satisfactory)
      expect(calculateCPCBSubIndex('pm25', 31)).toBe(51);
      expect(calculateCPCBSubIndex('pm25', 60)).toBe(100);

      // 61 to 90 -> 101 to 200 (Moderately Polluted)
      expect(calculateCPCBSubIndex('pm25', 61)).toBe(101);
      expect(calculateCPCBSubIndex('pm25', 90)).toBe(200);

      // 91 to 120 -> 201 to 300 (Poor)
      expect(calculateCPCBSubIndex('pm25', 91)).toBe(201);
      expect(calculateCPCBSubIndex('pm25', 120)).toBe(300);

      // 121 to 250 -> 301 to 400 (Very Poor)
      expect(calculateCPCBSubIndex('pm25', 121)).toBe(301);
      expect(calculateCPCBSubIndex('pm25', 250)).toBe(400);

      // 251 to 380 -> 401 to 500 (Severe)
      expect(calculateCPCBSubIndex('pm25', 251)).toBe(401);
      expect(calculateCPCBSubIndex('pm25', 380)).toBe(500);

      // Extreme high values should cap at 500
      expect(calculateCPCBSubIndex('pm25', 600)).toBe(500);
    });
  });

  describe('PM10 Sub-Index boundary tests', () => {
    it('evaluates exact category boundaries for PM10', () => {
      // 0 to 50 -> 0 to 50 (Good)
      expect(calculateCPCBSubIndex('pm10', 0)).toBe(0);
      expect(calculateCPCBSubIndex('pm10', 50)).toBe(50);

      // 51 to 100 -> 51 to 100 (Satisfactory)
      expect(calculateCPCBSubIndex('pm10', 51)).toBe(51);
      expect(calculateCPCBSubIndex('pm10', 100)).toBe(100);

      // 101 to 250 -> 101 to 200 (Moderate)
      expect(calculateCPCBSubIndex('pm10', 101)).toBe(101);
      expect(calculateCPCBSubIndex('pm10', 250)).toBe(200);

      // 251 to 350 -> 201 to 300 (Poor)
      expect(calculateCPCBSubIndex('pm10', 251)).toBe(201);
      expect(calculateCPCBSubIndex('pm10', 350)).toBe(300);

      // 351 to 430 -> 301 to 400 (Very Poor)
      expect(calculateCPCBSubIndex('pm10', 351)).toBe(301);
      expect(calculateCPCBSubIndex('pm10', 430)).toBe(400);

      // 431 to 510 -> 401 to 500 (Severe)
      expect(calculateCPCBSubIndex('pm10', 431)).toBe(401);
      expect(calculateCPCBSubIndex('pm10', 510)).toBe(500);
    });
  });

  describe('Other pollutants: NO2, O3, SO2, CO', () => {
    it('evaluates boundaries for NO2', () => {
      expect(calculateCPCBSubIndex('no2', 40)).toBe(50);
      expect(calculateCPCBSubIndex('no2', 41)).toBe(51);
      expect(calculateCPCBSubIndex('no2', 80)).toBe(100);
      expect(calculateCPCBSubIndex('no2', 180)).toBe(200);
    });

    it('evaluates boundaries for CO (mg/m³)', () => {
      expect(calculateCPCBSubIndex('co', 1.0)).toBe(50);
      expect(calculateCPCBSubIndex('co', 1.1)).toBe(51);
      expect(calculateCPCBSubIndex('co', 2.0)).toBe(100);
      expect(calculateCPCBSubIndex('co', 10.0)).toBe(200);
    });
  });

  describe('Comprehensive CPCB calculation & rules', () => {
    it('identifies dominant pollutant and computes max AQI correctly', () => {
      const result = calculateCPCBAQI({
        pm25: 121, // sub-index 301 (Very Poor)
        pm10: 80,  // sub-index 80 (Satisfactory)
        no2: 30,   // sub-index 38 (Good)
        co: 0.5
      });

      expect(result.aqi).toBe(301);
      expect(result.dominantPollutant).toBe('pm25');
      expect(result.category.name).toBe('Very Poor');
      expect(result.isComplete).toBe(true);
      expect(result.notes).toBeUndefined();
    });

    it('flags incomplete criteria if fewer than 3 pollutants are present', () => {
      const result = calculateCPCBAQI({
        pm25: 50 // Only 1 pollutant
      });

      expect(result.aqi).toBeGreaterThan(0);
      expect(result.isComplete).toBe(false);
      expect(result.notes).toContain('CPCB NAQI standard recommends at least 3 pollutants');
    });

    it('flags incomplete criteria if PM is missing even with 3 gaseous pollutants', () => {
      const result = calculateCPCBAQI({
        no2: 50,
        so2: 30,
        co: 1.2
      });

      expect(result.isComplete).toBe(false);
      expect(result.notes).toContain('CPCB NAQI standard recommends at least 3 pollutants with PM2.5 or PM10');
    });

    it('gracefully handles empty, negative, or invalid readings', () => {
      const result = calculateCPCBAQI({
        pm25: -5,
        pm10: NaN,
        no2: null
      });

      expect(result.aqi).toBe(0);
      expect(result.dominantPollutant).toBeNull();
      expect(result.notes).toBe('No valid pollutant data available.');
    });
  });
});
