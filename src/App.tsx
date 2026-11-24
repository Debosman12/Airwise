import React, { useEffect, useState, useCallback } from 'react';
import { AQIStandard } from './lib/aqi';
import { AirQualitySnapshot, FullForecastData, LocationInfo } from './types/airQuality';
import { MapPointsResult } from './types/map';
import { airQualityService } from './services/airQualityService';
import { mapPointsService } from './services/mapPointsService';
import { DEFAULT_CITY } from './services/mockData';
import { Header } from './components/common/Header';
import { ViewTabs, ActiveTab } from './components/navigation/ViewTabs';
import { StandardToggle } from './components/aqi/StandardToggle';
import { HeroAQI } from './components/home/HeroAQI';
import { AdviceBanner } from './components/home/AdviceBanner';
import { WhyIsItBad } from './components/home/WhyIsItBad';
import { ActionTipsCard } from './components/home/ActionTipsCard';
import { PollutantBottomSheet } from './components/home/PollutantBottomSheet';
import { ForecastView } from './components/forecast/ForecastView';
import { MapView } from './components/map/MapView';
import { DataSourceFooter } from './components/common/DataSourceFooter';
import { LoadingState } from './components/common/LoadingState';
import { ErrorState } from './components/common/ErrorState';
import { CitySearchModal } from './components/search/CitySearchModal';
import { LocationPermissionPrompt } from './components/search/LocationPermissionPrompt';

export const App: React.FC = () => {
  // Check for URL query parameters (useful for direct testing and deep linking)
  const queryParams = new URLSearchParams(window.location.search);
  const cityParam = queryParams.get('city')?.toLowerCase();
  const modeParam = queryParams.get('mode')?.toLowerCase();
  const tabParam = queryParams.get('tab')?.toLowerCase();

  const initialTab: ActiveTab =
    tabParam === 'forecast' ? 'forecast' : tabParam === 'map' ? 'map' : 'now';

  const initialCity =
    cityParam === 'bengaluru'
      ? {
          id: 'bengaluru-in',
          name: 'Bengaluru',
          country: 'India',
          admin1: 'Karnataka',
          latitude: 12.9716,
          longitude: 77.5946
        }
      : DEFAULT_CITY;

  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);
  const [currentCity, setCurrentCity] = useState<LocationInfo>(initialCity);
  const [standard, setStandard] = useState<AQIStandard>('cpcb');
  const [snapshot, setSnapshot] = useState<AirQualitySnapshot | null>(null);
  const [forecast, setForecast] = useState<FullForecastData | null>(null);
  const [mapData, setMapData] = useState<MapPointsResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [forecastLoading, setForecastLoading] = useState<boolean>(false);
  const [mapLoading, setMapLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(
    modeParam === 'error' ? 'Station connectivity lost. Network request timed out.' : null
  );
  const [isDemoForced, setIsDemoForced] = useState<boolean>(modeParam === 'demo');

  // Modals & Bottom sheets
  const [isPollutantSheetOpen, setIsPollutantSheetOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGPSPromptOpen, setIsGPSPromptOpen] = useState(false);

  // Fetch current reading
  const fetchCurrentReading = useCallback(
    async (
      cityToFetch = currentCity,
      forceRefresh = false,
      forceDemo = isDemoForced
    ) => {
      try {
        if (!snapshot || cityToFetch !== currentCity) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }
        setError(null);

        const data = await airQualityService.getCurrentAirQuality(cityToFetch, {
          forceRefresh,
          forceDemo
        });

        setSnapshot(data);
      } catch (err: unknown) {
        console.error('Failed to load air quality data:', err);
        const msg = err instanceof Error ? err.message : 'Unknown network error';
        setError(msg);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentCity, isDemoForced, snapshot]
  );

  // Fetch forecast data
  const fetchForecastData = useCallback(
    async (
      cityToFetch = currentCity,
      forceRefresh = false,
      forceDemo = isDemoForced
    ) => {
      try {
        setForecastLoading(true);
        const fc = await airQualityService.getForecast(cityToFetch, {
          forceRefresh,
          forceDemo
        });
        setForecast(fc);
      } catch (err) {
        console.warn('Failed to load forecast data:', err);
      } finally {
        setForecastLoading(false);
      }
    },
    [currentCity, isDemoForced]
  );

  // Fetch map points (batched 9-point grid)
  const fetchMapData = useCallback(
    async (
      cityToFetch = currentCity,
      forceRefresh = false,
      forceDemo = isDemoForced
    ) => {
      try {
        setMapLoading(true);
        const md = await mapPointsService.getMapPoints(cityToFetch, {
          forceRefresh,
          forceDemo
        });
        setMapData(md);
      } catch (err) {
        console.warn('Failed to load map points:', err);
      } finally {
        setMapLoading(false);
      }
    },
    [currentCity, isDemoForced]
  );

  useEffect(() => {
    if (modeParam === 'error') {
      setLoading(false);
      return;
    }
    fetchCurrentReading(currentCity);
    fetchForecastData(currentCity);
    fetchMapData(currentCity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCity]);

  const handleCitySelect = (city: LocationInfo) => {
    setCurrentCity(city);
    fetchCurrentReading(city, true);
    fetchForecastData(city, true);
    fetchMapData(city, true);
  };

  const handleToggleDemoMode = () => {
    const nextState = !isDemoForced;
    setIsDemoForced(nextState);
    airQualityService.setDemoMode(nextState);
    fetchCurrentReading(currentCity, true, nextState);
    fetchForecastData(currentCity, true, nextState);
    fetchMapData(currentCity, true, nextState);
  };

  const handleRefresh = () => {
    fetchCurrentReading(currentCity, true);
    fetchForecastData(currentCity, true);
    fetchMapData(currentCity, true);
  };

  // Triggered when user confirms in the transparent privacy modal
  const handleConfirmGPS = () => {
    setIsGPSPromptOpen(false);

    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLoc: LocationInfo = {
          name: 'My Location',
          country: 'Local Station',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setCurrentCity(userLoc);
        fetchCurrentReading(userLoc, true);
        fetchForecastData(userLoc, true);
        fetchMapData(userLoc, true);
      },
      (err) => {
        console.warn('Geolocation denied or unavailable:', err);
        setLoading(false);
        alert('Could not access device location. You can search any city above.');
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const activeAQIResult =
    snapshot && (standard === 'cpcb' ? snapshot.cpcbAqi : snapshot.usepaAqi);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Full-width responsive container */}
      <div className="w-full min-h-screen bg-transparent flex flex-col relative">
        {/* Top Header */}
        <Header
          location={currentCity}
          isRefreshing={refreshing}
          isDemo={snapshot?.provenance.isDemo ?? isDemoForced}
          isStale={snapshot?.provenance.isStale ?? false}
          onRefresh={handleRefresh}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenGPS={() => setIsGPSPromptOpen(true)}
        />

        {/* Main Content Area — landscape-friendly with sidebar nav on large screens */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Sidebar nav for large screens */}
          <aside className="hidden lg:flex flex-col w-20 bg-slate-900/60 border-r border-slate-800/60 backdrop-blur-xl py-6 items-center space-y-2 shrink-0">
            <ViewTabs activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} vertical />
          </aside>

          {/* Mobile tab bar */}
          <div className="lg:hidden px-4 pt-3">
            <ViewTabs activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />
          </div>

          <main className="flex-1 overflow-y-auto px-4 lg:px-8 xl:px-12 py-4 pb-10">
            <div className="max-w-6xl mx-auto">
              {loading && !snapshot && activeTab === 'now' ? (
                <LoadingState />
              ) : error && !snapshot ? (
                <ErrorState
                  message={error}
                  onRetry={handleRefresh}
                  onUseDemo={() => {
                    setIsDemoForced(true);
                    airQualityService.setDemoMode(true);
                    fetchCurrentReading(currentCity, true, true);
                    fetchForecastData(currentCity, true, true);
                    fetchMapData(currentCity, true, true);
                  }}
                />
              ) : activeTab === 'now' && snapshot && activeAQIResult ? (
                <div id="panel-now" role="tabpanel" aria-labelledby="tab-now" className="space-y-5">
                  {/* Standard Switcher: India CPCB vs US EPA */}
                  <StandardToggle
                    standard={standard}
                    onStandardChange={(std) => setStandard(std)}
                  />

                  {/* Desktop: 2-column grid for hero + advice */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="space-y-4">
                      {/* 1. Large Color-Coded Hero */}
                      <HeroAQI
                        location={snapshot.location}
                        aqiResult={activeAQIResult}
                        provenance={snapshot.provenance}
                        onOpenSearch={() => setIsSearchOpen(true)}
                      />
                      {/* 2. Plain-Language Advice Line */}
                      <AdviceBanner category={activeAQIResult.category} />
                    </div>

                    <div className="space-y-4">
                      {/* 3. "Why is it bad today?" */}
                      <WhyIsItBad
                        category={activeAQIResult.category}
                        dominantPollutant={activeAQIResult.dominantPollutant}
                        weather={snapshot.weather}
                      />
                      {/* 4. Action Tips Card */}
                      <ActionTipsCard
                        category={activeAQIResult.category}
                        standard={standard}
                      />
                    </div>
                  </div>

                  {/* 5. Pollutant Breakdown */}
                  <PollutantBottomSheet
                    isOpen={isPollutantSheetOpen}
                    onOpen={() => setIsPollutantSheetOpen(true)}
                    onClose={() => setIsPollutantSheetOpen(false)}
                    aqiResult={activeAQIResult}
                  />

                  {/* Provenance Footer */}
                  <DataSourceFooter
                    provenance={snapshot.provenance}
                    onToggleDemoMode={handleToggleDemoMode}
                    isDemoModeForced={isDemoForced}
                  />
                </div>
              ) : activeTab === 'forecast' ? (
                <ForecastView
                  forecast={forecast}
                  loading={forecastLoading}
                  standard={standard}
                  onStandardChange={(std) => setStandard(std)}
                />
              ) : activeTab === 'map' ? (
                <MapView
                  location={currentCity}
                  mapData={mapData}
                  loading={mapLoading}
                  standard={standard}
                  onStandardChange={(std) => setStandard(std)}
                />
              ) : null}
            </div>
          </main>
        </div>

        {/* City Search Modal */}
        <CitySearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectCity={handleCitySelect}
          onPromptGPS={() => setIsGPSPromptOpen(true)}
        />

        {/* Value-First Location Permission Prompt */}
        <LocationPermissionPrompt
          isOpen={isGPSPromptOpen}
          onConfirm={handleConfirmGPS}
          onCancel={() => setIsGPSPromptOpen(false)}
        />
      </div>
    </div>
  );
};

export default App;
