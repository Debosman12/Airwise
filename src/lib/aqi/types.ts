/**
 * AQI Standard Types and Interfaces
 */

export type AQIStandard = 'cpcb' | 'usepa';

export type AQISeverityLevel =
  | 'good'
  | 'satisfactory'
  | 'moderate'
  | 'unhealthy-sensitive'
  | 'poor'
  | 'unhealthy'
  | 'very-poor'
  | 'very-unhealthy'
  | 'severe'
  | 'hazardous';

export interface AQICategory {
  name: string;
  level: AQISeverityLevel;
  color: string;           // Tailwind color class or hex code
  bgColor: string;         // Background badge color
  textColor: string;       // Text color
  description: string;     // One-sentence summary
  generalAdvice: string;   // Actionable advice for the general public
  sensitiveAdvice: string; // Actionable advice for children, elderly, respiratory patients
  maskAdvice: string;      // Guidance on outdoor mask wear
  indoorAdvice: string;    // Ventilation & purifier guidance
}

export interface PollutantValues {
  pm25?: number | null; // µg/m³
  pm10?: number | null; // µg/m³
  no2?: number | null;  // µg/m³
  o3?: number | null;   // µg/m³
  so2?: number | null;  // µg/m³
  co?: number | null;   // mg/m³
}

export interface Breakpoint {
  cLow: number;  // Concentration low
  cHigh: number; // Concentration high
  iLow: number;  // Index low
  iHigh: number; // Index high
}

export interface PollutantSubIndex {
  pollutant: keyof PollutantValues;
  displayName: string;
  concentration: number;
  unit: string;
  subIndex: number;
  category: AQICategory;
}

export interface AQICalculationResult {
  standard: AQIStandard;
  standardName: string;
  aqi: number;
  category: AQICategory;
  dominantPollutant: keyof PollutantValues | null;
  dominantPollutantName: string;
  subIndices: Record<string, PollutantSubIndex>;
  isComplete: boolean;     // Whether official criteria for minimum required pollutants was met
  notes?: string;          // Warning or explanation (e.g., minimum pollutants warning)
}
