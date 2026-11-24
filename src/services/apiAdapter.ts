import { AirQualitySnapshot, LocationInfo, WeatherContext } from '../types/airQuality';

export interface AirQualityAdapter {
  name: string;
  getAirQuality(location: LocationInfo): Promise<AirQualitySnapshot>;
  getWeather(location: LocationInfo): Promise<WeatherContext>;
  searchCities(query: string): Promise<LocationInfo[]>;
}
