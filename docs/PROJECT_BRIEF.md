# AirWise — Project Brief

Core question: every screen answers "What's the air like right now, and what should I do about it?" Simple and friendly, not a science dashboard.

## Stack (do not deviate without asking)
- React + TypeScript + Vite, Tailwind CSS, React Router
- Recharts for charts, Leaflet + OpenStreetMap tiles for the map
- vite-plugin-pwa for installability and offline caching
- No custom backend. All API calls go through a single data-layer module.
- Data: Open-Meteo Air Quality API (current + hourly forecast, no key), Open-Meteo Geocoding API for city search, Open-Meteo Weather API for wind/rain context. Optional: OpenAQ v3 for nearby stations if OPENAQ_API_KEY is set in .env.
- Compute Indian CPCB AQI from pollutant concentrations (PM2.5, PM10, NO2, O3, SO2, CO) using official CPCB breakpoints. Also support US EPA AQI. Both calculators live in /src/lib/aqi with unit tests.
- Every data call goes through an adapter interface with a mock-data fallback, so the app works with no keys and no network.
- Do not guess API parameter names or response fields. Read the official docs.

## Rules
- Never show fake numbers. If data is missing or stale, say so clearly. Mock data must be visibly labeled "Demo data".
- Show data source and last-updated time on every reading.
- Store minimal data on-device only. No analytics, no location sharing.
- Clear loading, empty, and error states on every screen.
- Ask before major assumptions or adding dependencies not listed above.

## Out of Scope
- Health profiles
- Exposure tracking
- Indoor sensors
- Community reports
- Clean-route navigation
- Conversational assistant
- Native home screen widget (PWAs can't do this)
