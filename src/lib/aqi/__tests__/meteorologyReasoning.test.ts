import { describe, it, expect } from 'vitest';
import { getMeteorologicalExplanation } from '../meteorologyReasoning';
import { CPCB_CATEGORIES } from '../cpcb';
import { WeatherContext } from '../../../types/airQuality';

const baseWeather: WeatherContext = {
  temperature: 24,
  humidity: 50,
  windSpeed: 6.0,
  windDirection: 270,
  windDirectionCompass: 'W',
  precipitation: 0.0,
  weatherCode: 1,
  weatherDescription: 'Clear'
};

describe('Meteorological Reasoning Engine', () => {
  it('explains low wind trapping particulate pollution', () => {
    const explanation = getMeteorologicalExplanation(
      CPCB_CATEGORIES.veryPoor,
      'pm25',
      { ...baseWeather, windSpeed: 5.5 }
    );
    expect(explanation.factor).toBe('wind-trap');
    expect(explanation.headline).toContain('Calm surface winds (5.5 km/h) are preventing dispersion');
    expect(explanation.headline).toContain('PM2.5');
  });

  it('explains rain cleansing effect when precipitation is present', () => {
    const explanation = getMeteorologicalExplanation(
      CPCB_CATEGORIES.moderate,
      'pm10',
      { ...baseWeather, precipitation: 2.4 }
    );
    expect(explanation.factor).toBe('rain-cleansing');
    expect(explanation.headline).toContain('Recent rainfall (2.4 mm) is actively washing airborne dust');
  });

  it('explains photochemical ozone formation in warm sunlight', () => {
    const explanation = getMeteorologicalExplanation(
      CPCB_CATEGORIES.poor,
      'o3',
      { ...baseWeather, temperature: 32, windSpeed: 14 }
    );
    expect(explanation.factor).toBe('ozone-photochemical');
    expect(explanation.headline).toContain('Warm sunlight (32°C) is accelerating chemical reactions');
  });

  it('explains healthy ventilation on clean air days', () => {
    const explanation = getMeteorologicalExplanation(
      CPCB_CATEGORIES.good,
      'pm25',
      { ...baseWeather, windSpeed: 15 }
    );
    expect(explanation.factor).toBe('clean-ventilation');
    expect(explanation.headline).toContain('Active breezes (15 km/h)');
  });
});
