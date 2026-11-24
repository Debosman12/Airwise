/**
 * US EPA (Environmental Protection Agency) AQI Calculator
 *
 * Source:
 * United States Environmental Protection Agency (US EPA), Office of Air Quality Planning and Standards.
 * Reference: "Technical Assistance Document for the Reporting of Daily Air Quality – the Air Quality Index (AQI)"
 * Document: EPA-454/B-18-007 (and 40 CFR Part 58, Appendix G).
 * URL: https://www.airnow.gov/sites/default/files/2020-05/aqi-technical-assistance-document-sept-2018.pdf
 */

import {
  AQICategory,
  AQICalculationResult,
  Breakpoint,
  PollutantSubIndex,
  PollutantValues
} from './types';
import { POLLUTANT_NAMES } from './cpcb';

export const USEPA_CATEGORIES: Record<string, AQICategory> = {
  good: {
    name: 'Good',
    level: 'good',
    color: '#10b981', // emerald-500
    bgColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    textColor: 'text-emerald-500',
    description: 'Air quality is satisfactory and poses little or no risk',
    generalAdvice: 'Great air day. Ideal conditions for outdoor activities and exercise.',
    sensitiveAdvice: 'None.',
    maskAdvice: 'No mask required.',
    indoorAdvice: 'Good day to open windows and let fresh air circulate.'
  },
  moderate: {
    name: 'Moderate',
    level: 'moderate',
    color: '#f59e0b', // amber-500
    bgColor: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    textColor: 'text-amber-500',
    description: 'Acceptable air quality; moderate health concern for a very small number of people',
    generalAdvice: 'Air quality is acceptable for most people.',
    sensitiveAdvice: 'Unusually sensitive individuals should consider reducing prolonged or heavy exertion.',
    maskAdvice: 'Not necessary for general public.',
    indoorAdvice: 'Normal indoor ventilation is fine.'
  },
  unhealthySensitive: {
    name: 'Unhealthy for Sensitive Groups',
    level: 'unhealthy-sensitive',
    color: '#f97316', // orange-500
    bgColor: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
    textColor: 'text-orange-500',
    description: 'Members of sensitive groups may experience health effects',
    generalAdvice: 'General public is less likely to be affected. Safe for moderate outdoor tasks.',
    sensitiveAdvice: 'Children, older adults, and people with lung or heart disease should reduce prolonged exertion.',
    maskAdvice: 'Sensitive individuals should wear an N95 outdoors.',
    indoorAdvice: 'Keep windows closed if smoke or smog is visible outdoors.'
  },
  unhealthy: {
    name: 'Unhealthy',
    level: 'unhealthy',
    color: '#ef4444', // red-500
    bgColor: 'bg-red-500/10 border-red-500/20 text-red-400',
    textColor: 'text-red-500',
    description: 'Some members of the general public may experience health effects',
    generalAdvice: 'Everyone should reduce prolonged or heavy outdoor exertion.',
    sensitiveAdvice: 'Sensitive groups should avoid all prolonged outdoor exertion.',
    maskAdvice: 'Wear a certified N95/KN95 mask if outdoors for longer periods.',
    indoorAdvice: 'Keep windows closed and run an indoor HEPA air purifier.'
  },
  veryUnhealthy: {
    name: 'Very Unhealthy',
    level: 'very-unhealthy',
    color: '#a855f7', // purple-500
    bgColor: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    textColor: 'text-purple-400',
    description: 'Health alert: The risk of health effects is increased for everyone',
    generalAdvice: 'Avoid strenuous outdoor activities. Plan essential trips only.',
    sensitiveAdvice: 'Sensitive groups should remain strictly indoors in clean air spaces.',
    maskAdvice: 'N95/KN95 mask strongly advised for any outdoor exposure.',
    indoorAdvice: 'Keep all windows tightly sealed and run air purifiers.'
  },
  hazardous: {
    name: 'Hazardous',
    level: 'hazardous',
    color: '#7f1d1d', // maroon / deep red
    bgColor: 'bg-red-950/50 border-red-800 text-red-300',
    textColor: 'text-red-400',
    description: 'Health warning of emergency conditions: Everyone is more likely to be affected',
    generalAdvice: 'Stay indoors and avoid physical exertion outdoors.',
    sensitiveAdvice: 'Remain indoors. Keep medication accessible and monitor respiratory comfort.',
    maskAdvice: 'High-filtration N95/FFP2 mask required for any outside exposure.',
    indoorAdvice: 'Seal door and window gaps. Run air purifiers at maximum setting.'
  }
};

/**
 * Official US EPA Breakpoint Tables
 * Sources: EPA-454/B-18-007
 * Units: PM in µg/m³, CO in mg/m³, NO2/SO2/O3 in µg/m³
 */
export const USEPA_BREAKPOINTS: Record<keyof PollutantValues, Breakpoint[]> = {
  pm25: [
    { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50 },
    { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
    { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
    { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
    { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
    { cLow: 250.5, cHigh: 500.4, iLow: 301, iHigh: 500 }
  ],
  pm10: [
    { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
    { cLow: 55, cHigh: 154, iLow: 51, iHigh: 100 },
    { cLow: 155, cHigh: 254, iLow: 101, iHigh: 150 },
    { cLow: 255, cHigh: 354, iLow: 151, iHigh: 200 },
    { cLow: 355, cHigh: 424, iLow: 201, iHigh: 300 },
    { cLow: 425, cHigh: 604, iLow: 301, iHigh: 500 }
  ],
  no2: [
    { cLow: 0, cHigh: 100, iLow: 0, iHigh: 50 },
    { cLow: 101, cHigh: 188, iLow: 51, iHigh: 100 },
    { cLow: 189, cHigh: 677, iLow: 101, iHigh: 150 },
    { cLow: 678, cHigh: 1221, iLow: 151, iHigh: 200 },
    { cLow: 1222, cHigh: 2349, iLow: 201, iHigh: 300 },
    { cLow: 2350, cHigh: 3853, iLow: 301, iHigh: 500 }
  ],
  o3: [
    { cLow: 0, cHigh: 106, iLow: 0, iHigh: 50 },
    { cLow: 107, cHigh: 137, iLow: 51, iHigh: 100 },
    { cLow: 138, cHigh: 167, iLow: 101, iHigh: 150 },
    { cLow: 168, cHigh: 206, iLow: 151, iHigh: 200 },
    { cLow: 207, cHigh: 392, iLow: 201, iHigh: 300 },
    { cLow: 393, cHigh: 800, iLow: 301, iHigh: 500 }
  ],
  so2: [
    { cLow: 0, cHigh: 92, iLow: 0, iHigh: 50 },
    { cLow: 93, cHigh: 197, iLow: 51, iHigh: 100 },
    { cLow: 198, cHigh: 485, iLow: 101, iHigh: 150 },
    { cLow: 486, cHigh: 796, iLow: 151, iHigh: 200 },
    { cLow: 797, cHigh: 1582, iLow: 201, iHigh: 300 },
    { cLow: 1583, cHigh: 2630, iLow: 301, iHigh: 500 }
  ],
  co: [
    { cLow: 0.0, cHigh: 5.0, iLow: 0, iHigh: 50 },
    { cLow: 5.1, cHigh: 10.8, iLow: 51, iHigh: 100 },
    { cLow: 10.9, cHigh: 14.2, iLow: 101, iHigh: 150 },
    { cLow: 14.3, cHigh: 17.6, iLow: 151, iHigh: 200 },
    { cLow: 17.7, cHigh: 34.9, iLow: 201, iHigh: 300 },
    { cLow: 35.0, cHigh: 57.9, iLow: 301, iHigh: 500 }
  ]
};

/**
 * Maps an AQI score to its US EPA category.
 */
export function getUSEPACategory(aqi: number): AQICategory {
  if (aqi <= 50) return USEPA_CATEGORIES.good;
  if (aqi <= 100) return USEPA_CATEGORIES.moderate;
  if (aqi <= 150) return USEPA_CATEGORIES.unhealthySensitive;
  if (aqi <= 200) return USEPA_CATEGORIES.unhealthy;
  if (aqi <= 300) return USEPA_CATEGORIES.veryUnhealthy;
  return USEPA_CATEGORIES.hazardous;
}

/**
 * Calculates the US EPA sub-index for a single pollutant given its concentration.
 */
export function calculateUSEPASubIndex(
  pollutant: keyof PollutantValues,
  concentration: number
): number | null {
  if (concentration < 0 || isNaN(concentration)) return null;

  const breakpoints = USEPA_BREAKPOINTS[pollutant];
  if (!breakpoints || breakpoints.length === 0) return null;

  if (concentration === 0) return 0;

  // EPA truncates PM2.5 to 1 decimal, PM10 to integer
  let truncatedConcentration = concentration;
  if (pollutant === 'pm25') {
    truncatedConcentration = Math.floor(concentration * 10) / 10;
  } else if (pollutant === 'pm10') {
    truncatedConcentration = Math.floor(concentration);
  }

  for (let i = 0; i < breakpoints.length; i++) {
    const bp = breakpoints[i];
    if (truncatedConcentration >= bp.cLow && truncatedConcentration <= bp.cHigh) {
      const subIndex =
        ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) *
          (truncatedConcentration - bp.cLow) +
        bp.iLow;
      return Math.round(subIndex);
    }
  }

  // If concentration exceeds highest bracket
  const highestBp = breakpoints[breakpoints.length - 1];
  if (truncatedConcentration > highestBp.cHigh) {
    const extra =
      ((500 - 301) / (highestBp.cHigh - highestBp.cLow)) *
        (truncatedConcentration - highestBp.cLow) +
      301;
    return Math.min(Math.round(extra), 500);
  }

  return null;
}

/**
 * Computes overall US EPA AQI from available pollutant concentrations.
 * Overall AQI is the maximum of all valid sub-indices.
 */
export function calculateUSEPAAQI(values: PollutantValues): AQICalculationResult {
  const subIndices: Record<string, PollutantSubIndex> = {};
  let maxAQI = 0;
  let dominantPollutant: keyof PollutantValues | null = null;
  let validCount = 0;

  const pollutantKeys: (keyof PollutantValues)[] = ['pm25', 'pm10', 'no2', 'o3', 'so2', 'co'];

  for (const key of pollutantKeys) {
    const val = values[key];
    if (val !== undefined && val !== null && !isNaN(val) && val >= 0) {
      const subIndex = calculateUSEPASubIndex(key, val);
      if (subIndex !== null) {
        validCount++;
        subIndices[key] = {
          pollutant: key,
          displayName: POLLUTANT_NAMES[key].name,
          concentration: val,
          unit: POLLUTANT_NAMES[key].unit,
          subIndex,
          category: getUSEPACategory(subIndex)
        };

        if (subIndex >= maxAQI) {
          maxAQI = subIndex;
          dominantPollutant = key;
        }
      }
    }
  }

  return {
    standard: 'usepa',
    standardName: 'US EPA AQI',
    aqi: maxAQI,
    category: getUSEPACategory(maxAQI),
    dominantPollutant,
    dominantPollutantName: dominantPollutant ? POLLUTANT_NAMES[dominantPollutant].name : 'N/A',
    subIndices,
    isComplete: validCount > 0,
    notes: validCount === 0 ? 'No valid pollutant data available.' : undefined
  };
}
