import { AQICategory, PollutantValues } from '../lib/aqi';

export interface MapPoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  isRealStation: boolean;
  stationType: 'physical' | 'model-grid';
  pollutants: PollutantValues;
  cpcbAqi: number;
  cpcbCategory: AQICategory;
  usepaAqi: number;
  usepaCategory: AQICategory;
  dominantPollutant: string;
  source: string;
  lastUpdated: string;
}

export interface MapPointsResult {
  points: MapPoint[];
  isRealStations: boolean;
  centerLatitude: number;
  centerLongitude: number;
  sourceName: string;
  isDemo: boolean;
  fetchedAt: number;
}
