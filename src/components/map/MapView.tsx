import React, { useState } from 'react';
import { AQIStandard } from '../../lib/aqi';
import { LocationInfo } from '../../types/airQuality';
import { MapPoint, MapPointsResult } from '../../types/map';
import { StandardToggle } from '../aqi/StandardToggle';
import { AirQualityMap } from './AirQualityMap';
import { MapProvenanceBanner } from './MapProvenanceBanner';
import { MapLegend } from './MapLegend';
import { MapMarkerPopup } from './MapMarkerPopup';
import { Loader2, MapPin } from 'lucide-react';

interface MapViewProps {
  location: LocationInfo;
  mapData: MapPointsResult | null;
  loading: boolean;
  standard: AQIStandard;
  onStandardChange: (standard: AQIStandard) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  location,
  mapData,
  loading,
  standard,
  onStandardChange
}) => {
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);

  if (loading && !mapData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Fetching 9-point atmospheric grid...</p>
      </div>
    );
  }

  const points = mapData?.points || [];

  return (
    <div
      role="tabpanel"
      id="panel-map"
      aria-labelledby="tab-map"
      className="space-y-4 animate-in fade-in duration-200"
    >
      {/* Standard Switcher */}
      <StandardToggle standard={standard} onStandardChange={onStandardChange} />

      {/* Desktop: map takes full width with sidebar info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map fills 2/3 on desktop */}
        <div className="lg:col-span-2 space-y-3">
          {/* 1. Model vs. Real Station Transparency Banner */}
          <MapProvenanceBanner
            isRealStations={mapData?.isRealStations ?? false}
            isDemo={mapData?.isDemo ?? false}
            pointsCount={points.length}
          />

          {/* 2. Interactive Leaflet Map */}
          <AirQualityMap
            centerLat={location.latitude}
            centerLon={location.longitude}
            points={points}
            standard={standard}
            selectedPoint={selectedPoint}
            onSelectPoint={(p) => setSelectedPoint(p)}
          />
        </div>

        {/* Sidebar: popup details + legend */}
        <div className="space-y-3">
          {/* Tap Instruction / Selected Marker Details Popup */}
          {selectedPoint ? (
            <MapMarkerPopup
              point={selectedPoint}
              standard={standard}
              onClose={() => setSelectedPoint(null)}
            />
          ) : (
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/60 text-center text-xs text-slate-400 flex items-center justify-center space-x-2 backdrop-blur-xl">
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>Tap any marker pin on the map to inspect station details</span>
            </div>
          )}

          {/* 3. Category Legend */}
          <MapLegend />
        </div>
      </div>
    </div>
  );
};
