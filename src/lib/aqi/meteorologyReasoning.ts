/**
 * Meteorological Reasoning Engine
 *
 * Derives a strictly factual one-liner explanation for:
 * "Why is it like this today?"
 * based on measured wind speed, precipitation, temperature, humidity, and dominant pollutant.
 */

import { AQICategory, PollutantValues } from './types';
import { WeatherContext } from '../../types/airQuality';

export interface MeteorologicalExplanation {
  headline: string;
  factor: 'wind-trap' | 'wind-transport' | 'rain-cleansing' | 'ozone-photochemical' | 'humidity-haze' | 'clean-ventilation' | 'general';
  icon: 'wind' | 'cloud-rain' | 'sun' | 'droplets' | 'sparkles';
}

export function getMeteorologicalExplanation(
  category: AQICategory,
  dominantPollutant: keyof PollutantValues | null,
  weather: WeatherContext
): MeteorologicalExplanation {
  // 1. Good Air Day
  if (category.level === 'good') {
    if (weather.windSpeed >= 12) {
      return {
        headline: `Active breezes (${weather.windSpeed} km/h) are continuously clearing urban emissions and keeping skies fresh.`,
        factor: 'clean-ventilation',
        icon: 'sparkles'
      };
    }
    return {
      headline: 'Favorable atmospheric conditions and low emissions are keeping air quality in the healthy zone.',
      factor: 'clean-ventilation',
      icon: 'sparkles'
    };
  }

  // 2. Rain Cleansing Effect (if rain > 0.5 mm)
  if (weather.precipitation >= 0.5) {
    return {
      headline: `Recent rainfall (${weather.precipitation} mm) is actively washing airborne dust and particulates out of the lower atmosphere.`,
      factor: 'rain-cleansing',
      icon: 'cloud-rain'
    };
  }

  // 3. Ground-level Ozone Photochemical Formation (O3 + Warm Sun)
  if (dominantPollutant === 'o3' && weather.temperature >= 28) {
    return {
      headline: `Warm sunlight (${weather.temperature}°C) is accelerating chemical reactions between vehicular exhaust and sunlight, producing ground-level ozone.`,
      factor: 'ozone-photochemical',
      icon: 'sun'
    };
  }

  // 4. Low Wind Trapping (Wind < 10 km/h with Particulates PM2.5 or PM10)
  if (weather.windSpeed < 10 && (dominantPollutant === 'pm25' || dominantPollutant === 'pm10')) {
    const pName = dominantPollutant === 'pm25' ? 'fine PM2.5 particulates' : 'coarse PM10 dust';
    return {
      headline: `Calm surface winds (${weather.windSpeed} km/h) are preventing dispersion, trapping ${pName} close to ground level.`,
      factor: 'wind-trap',
      icon: 'wind'
    };
  }

  // 5. High Humidity Haze Trapping (Humidity >= 75% + Light Winds + Elevated PM)
  if (weather.humidity >= 75 && weather.windSpeed < 14 && (dominantPollutant === 'pm25' || dominantPollutant === 'pm10')) {
    return {
      headline: `High humidity (${weather.humidity}%) and stagnant winds are holding moisture and fine particulates together, creating heavy smog.`,
      factor: 'humidity-haze',
      icon: 'droplets'
    };
  }

  // 6. Regional Wind Transport (Wind >= 20 km/h with elevated pollution)
  if (
    weather.windSpeed >= 20 &&
    ['poor', 'very-poor', 'severe', 'unhealthy', 'very-unhealthy', 'hazardous'].includes(category.level)
  ) {
    return {
      headline: `Brisk winds (${weather.windSpeed} km/h from ${weather.windDirectionCompass}) are carrying regional dust and smoke plumes across the city.`,
      factor: 'wind-transport',
      icon: 'wind'
    };
  }

  // 7. General Urban Baseline
  const dominantName = dominantPollutant ? dominantPollutant.toUpperCase() : 'particulates';
  return {
    headline: `Steady urban traffic and combustion emissions are maintaining elevated ${dominantName} under moderate atmospheric mixing.`,
    factor: 'general',
    icon: 'wind'
  };
}
