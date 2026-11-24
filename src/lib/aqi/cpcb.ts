/**
 * Indian CPCB (Central Pollution Control Board) AQI Calculator
 *
 * Source:
 * Central Pollution Control Board (CPCB), Ministry of Environment, Forest & Climate Change,
 * Government of India. Reference: "National Air Quality Index (NAQI) Final Report" (2014-2015).
 * URL: https://cpcb.nic.in/upload/NAQI_report.pdf
 */

import {
  AQICategory,
  AQICalculationResult,
  Breakpoint,
  PollutantSubIndex,
  PollutantValues
} from './types';

export const CPCB_CATEGORIES: Record<string, AQICategory> = {
  good: {
    name: 'Good',
    level: 'good',
    color: '#10b981', // emerald-500
    bgColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    textColor: 'text-emerald-500',
    description: 'Minimal health impact',
    generalAdvice: 'Air quality is ideal for all outdoor activities.',
    sensitiveAdvice: 'No precautions needed.',
    maskAdvice: 'No mask required.',
    indoorAdvice: 'Great time to open windows and air out your home.'
  },
  satisfactory: {
    name: 'Satisfactory',
    level: 'satisfactory',
    color: '#84cc16', // lime-500
    bgColor: 'bg-lime-500/10 border-lime-500/20 text-lime-400',
    textColor: 'text-lime-500',
    description: 'Minor breathing discomfort to sensitive people',
    generalAdvice: 'Air quality is acceptable. Enjoy normal outdoor activities.',
    sensitiveAdvice: 'Unusually sensitive individuals should monitor symptoms if coughing or fatigued.',
    maskAdvice: 'No mask needed for general public.',
    indoorAdvice: 'Safe to open windows.'
  },
  moderate: {
    name: 'Moderate',
    level: 'moderate',
    color: '#f59e0b', // amber-500
    bgColor: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    textColor: 'text-amber-500',
    description: 'Breathing discomfort to people with lungs, asthma and heart diseases',
    generalAdvice: 'General public can stay active outdoors, but take breaks if tired.',
    sensitiveAdvice: 'People with asthma or heart conditions should reduce prolonged outdoor exertion.',
    maskAdvice: 'Consider wearing a mask near high-traffic corridors.',
    indoorAdvice: 'Keep windows closed during peak commute hours.'
  },
  poor: {
    name: 'Poor',
    level: 'poor',
    color: '#f97316', // orange-500
    bgColor: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
    textColor: 'text-orange-500',
    description: 'Breathing discomfort to most people on prolonged exposure',
    generalAdvice: 'Limit strenuous outdoor exercise. Take frequent breaks indoors.',
    sensitiveAdvice: 'Children, elderly, and those with heart/lung disease should avoid prolonged outdoor exertion.',
    maskAdvice: 'Wear an N95 or well-fitting mask when commuting outdoors.',
    indoorAdvice: 'Keep windows closed. Turn on indoor air purifiers.'
  },
  veryPoor: {
    name: 'Very Poor',
    level: 'very-poor',
    color: '#ef4444', // red-500
    bgColor: 'bg-red-500/10 border-red-500/20 text-red-400',
    textColor: 'text-red-500',
    description: 'Respiratory illness on prolonged exposure',
    generalAdvice: 'Avoid outdoor exercise and intense activities outside.',
    sensitiveAdvice: 'Children, seniors, and sensitive individuals should remain indoors.',
    maskAdvice: 'Wear an N95 mask for all outdoor movement.',
    indoorAdvice: 'Run air purifiers continuously. Keep all doors and windows sealed.'
  },
  severe: {
    name: 'Severe',
    level: 'severe',
    color: '#7f1d1d', // deep red-900 / maroon
    bgColor: 'bg-red-950/40 border-red-800 text-red-300',
    textColor: 'text-red-400',
    description: 'Affects healthy people and seriously impacts those with existing diseases',
    generalAdvice: 'Emergency conditions: Avoid all outdoor activity. Stay indoors.',
    sensitiveAdvice: 'Strictly remain indoors. Keep emergency medical contacts ready.',
    maskAdvice: 'Strict N95/FFP2 mask required if stepping outside is inevitable.',
    indoorAdvice: 'Operate HEPA purifiers on high. Do not open windows or use unsealed exhaust.'
  }
};

/**
 * Official CPCB Breakpoint Tables (Concentrations in µg/m³, CO in mg/m³)
 * Source: CPCB NAQI Guidelines (2014)
 */
export const CPCB_BREAKPOINTS: Record<keyof PollutantValues, Breakpoint[]> = {
  pm25: [
    { cLow: 0, cHigh: 30, iLow: 0, iHigh: 50 },
    { cLow: 31, cHigh: 60, iLow: 51, iHigh: 100 },
    { cLow: 61, cHigh: 90, iLow: 101, iHigh: 200 },
    { cLow: 91, cHigh: 120, iLow: 201, iHigh: 300 },
    { cLow: 121, cHigh: 250, iLow: 301, iHigh: 400 },
    { cLow: 251, cHigh: 380, iLow: 401, iHigh: 500 }
  ],
  pm10: [
    { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
    { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100 },
    { cLow: 101, cHigh: 250, iLow: 101, iHigh: 200 },
    { cLow: 251, cHigh: 350, iLow: 201, iHigh: 300 },
    { cLow: 351, cHigh: 430, iLow: 301, iHigh: 400 },
    { cLow: 431, cHigh: 510, iLow: 401, iHigh: 500 }
  ],
  no2: [
    { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
    { cLow: 41, cHigh: 80, iLow: 51, iHigh: 100 },
    { cLow: 81, cHigh: 180, iLow: 101, iHigh: 200 },
    { cLow: 181, cHigh: 280, iLow: 201, iHigh: 300 },
    { cLow: 281, cHigh: 400, iLow: 301, iHigh: 400 },
    { cLow: 401, cHigh: 520, iLow: 401, iHigh: 500 }
  ],
  o3: [
    { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
    { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100 },
    { cLow: 101, cHigh: 168, iLow: 101, iHigh: 200 },
    { cLow: 169, cHigh: 208, iLow: 201, iHigh: 300 },
    { cLow: 209, cHigh: 748, iLow: 301, iHigh: 400 },
    { cLow: 749, cHigh: 948, iLow: 401, iHigh: 500 }
  ],
  so2: [
    { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
    { cLow: 41, cHigh: 80, iLow: 51, iHigh: 100 },
    { cLow: 81, cHigh: 380, iLow: 101, iHigh: 200 },
    { cLow: 381, cHigh: 800, iLow: 201, iHigh: 300 },
    { cLow: 801, cHigh: 1600, iLow: 301, iHigh: 400 },
    { cLow: 1601, cHigh: 2000, iLow: 401, iHigh: 500 }
  ],
  co: [
    { cLow: 0, cHigh: 1.0, iLow: 0, iHigh: 50 },
    { cLow: 1.1, cHigh: 2.0, iLow: 51, iHigh: 100 },
    { cLow: 2.1, cHigh: 10.0, iLow: 101, iHigh: 200 },
    { cLow: 10.1, cHigh: 17.0, iLow: 201, iHigh: 300 },
    { cLow: 17.1, cHigh: 34.0, iLow: 301, iHigh: 400 },
    { cLow: 34.1, cHigh: 50.0, iLow: 401, iHigh: 500 }
  ]
};

export const POLLUTANT_NAMES: Record<keyof PollutantValues, { name: string; unit: string }> = {
  pm25: { name: 'PM2.5', unit: 'µg/m³' },
  pm10: { name: 'PM10', unit: 'µg/m³' },
  no2: { name: 'NO₂', unit: 'µg/m³' },
  o3: { name: 'O₃', unit: 'µg/m³' },
  so2: { name: 'SO₂', unit: 'µg/m³' },
  co: { name: 'CO', unit: 'mg/m³' }
};

/**
 * Maps an AQI score to its CPCB category.
 */
export function getCPCBCategory(aqi: number): AQICategory {
  if (aqi <= 50) return CPCB_CATEGORIES.good;
  if (aqi <= 100) return CPCB_CATEGORIES.satisfactory;
  if (aqi <= 200) return CPCB_CATEGORIES.moderate;
  if (aqi <= 300) return CPCB_CATEGORIES.poor;
  if (aqi <= 400) return CPCB_CATEGORIES.veryPoor;
  return CPCB_CATEGORIES.severe;
}

/**
 * Calculates the CPCB sub-index for a single pollutant given its concentration.
 */
export function calculateCPCBSubIndex(
  pollutant: keyof PollutantValues,
  concentration: number
): number | null {
  if (concentration < 0 || isNaN(concentration)) return null;

  const breakpoints = CPCB_BREAKPOINTS[pollutant];
  if (!breakpoints || breakpoints.length === 0) return null;

  // Handle concentration below or equal to zero
  if (concentration === 0) return 0;

  // Find corresponding breakpoint bracket
  for (let i = 0; i < breakpoints.length; i++) {
    const bp = breakpoints[i];
    if (concentration >= bp.cLow && concentration <= bp.cHigh) {
      const subIndex =
        ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (concentration - bp.cLow) + bp.iLow;
      return Math.round(subIndex);
    }
  }

  // If concentration exceeds highest bracket
  const highestBp = breakpoints[breakpoints.length - 1];
  if (concentration > highestBp.cHigh) {
    // CPCB caps index at 500 or extrapolates above 400
    const extra = ((500 - 401) / (highestBp.cHigh - highestBp.cLow)) * (concentration - highestBp.cLow) + 401;
    return Math.min(Math.round(extra), 500);
  }

  return null;
}

/**
 * Computes overall Indian CPCB AQI from available pollutant concentrations.
 *
 * CPCB Rule:
 * Requires minimum 3 pollutants out of which at least one must be PM2.5 or PM10.
 * Overall AQI is the maximum of all valid sub-indices.
 */
export function calculateCPCBAQI(values: PollutantValues): AQICalculationResult {
  const subIndices: Record<string, PollutantSubIndex> = {};
  let maxAQI = 0;
  let dominantPollutant: keyof PollutantValues | null = null;
  let validCount = 0;
  let hasPM = false;

  const pollutantKeys: (keyof PollutantValues)[] = ['pm25', 'pm10', 'no2', 'o3', 'so2', 'co'];

  for (const key of pollutantKeys) {
    const val = values[key];
    if (val !== undefined && val !== null && !isNaN(val) && val >= 0) {
      const subIndex = calculateCPCBSubIndex(key, val);
      if (subIndex !== null) {
        validCount++;
        if (key === 'pm25' || key === 'pm10') {
          hasPM = true;
        }

        subIndices[key] = {
          pollutant: key,
          displayName: POLLUTANT_NAMES[key].name,
          concentration: val,
          unit: POLLUTANT_NAMES[key].unit,
          subIndex,
          category: getCPCBCategory(subIndex)
        };

        if (subIndex >= maxAQI) {
          maxAQI = subIndex;
          dominantPollutant = key;
        }
      }
    }
  }

  const isComplete = validCount >= 3 && hasPM;
  let notes: string | undefined = undefined;

  if (validCount === 0) {
    notes = 'No valid pollutant data available.';
  } else if (!isComplete) {
    notes = 'CPCB NAQI standard recommends at least 3 pollutants with PM2.5 or PM10. Showing estimate based on available readings.';
  }

  return {
    standard: 'cpcb',
    standardName: 'Indian CPCB NAQI',
    aqi: maxAQI,
    category: getCPCBCategory(maxAQI),
    dominantPollutant,
    dominantPollutantName: dominantPollutant ? POLLUTANT_NAMES[dominantPollutant].name : 'N/A',
    subIndices,
    isComplete,
    notes
  };
}
