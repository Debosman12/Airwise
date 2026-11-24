# AirWise

A mobile-first Progressive Web App that answers one question: **"What's the air like right now, and what should I do about it?"**

Built for general urban users. Simple, friendly, and not a science dashboard.

## Features

- Live AQI for any city, with color-coded status and a plain-language advice line
- Pollutant breakdown (PM2.5, PM10, NO2, O3, SO2, CO) one tap away
- 24-hour forecast, 3-day outlook, and a "best time to go outside" suggestion
- Map of nearby air quality with colored markers
- Saved places and a morning briefing comparing them
- Optional alerts (daily summary and sharp-worsening warnings)
- Indian CPCB AQI by default, with a US EPA toggle
- English, Hindi, and Bengali
- Works offline with the last cached reading

## Tech stack

React, TypeScript, Vite, Tailwind CSS, React Router, Recharts, Leaflet + OpenStreetMap, vite-plugin-pwa

## Getting started

```bash
npm install
npm run dev
```

The app runs with **no API keys**. If the network or data is unavailable, it falls back to mock data, which is always labeled "Demo data".

Run the tests:

```bash
npm test
```

## Configuration (optional)

Copy `.env.example` to `.env`:

| Variable | Purpose |
|---|---|
| `OPENAQ_API_KEY` | Enables real monitoring stations on the map via OpenAQ v3 |

## Data sources

- **Open-Meteo** Air Quality, Weather, and Geocoding APIs (no key needed)
- **OpenAQ v3** (optional) for nearby stations

Every reading shows its source and last-updated time.

## How AQI is calculated

AQI is computed from pollutant concentrations using official breakpoint tables, in `src/lib/aqi`. The overall AQI is the highest sub-index among the pollutants, and that pollutant is shown as dominant. Both CPCB and US EPA calculators have unit tests covering category boundaries.

## Project structure

```
src/
  lib/aqi/        AQI calculators and tests
  data/           API adapters, caching, mock fallback
  components/     Reusable UI
  pages/          Home, Forecast, Map, Places, Settings
docs/
  PROJECT_BRIEF.md
```

## Principles

- Never show fake numbers. Missing or stale data is labeled as such.
- Minimal data stored on-device only. No analytics, no location sharing.
- Location permission is requested only after the user has seen value.

## Known limitations

- Web notifications may not be delivered when the app is closed, especially on iOS
- Map markers without an OpenAQ key are sampled model points, not real monitoring stations
- A PWA cannot provide a true home screen widget (planned for a future native wrapper)
- Forecast values are model-based and may differ from ground sensors

## Roadmap

Health profiles, exposure tracking, clean-route navigation, a conversational assistant, and a native app with a home screen widget.
