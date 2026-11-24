import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPoint } from '../../types/map';
import { AQIStandard } from '../../lib/aqi';
import { Crosshair } from 'lucide-react';

interface AirQualityMapProps {
  centerLat: number;
  centerLon: number;
  points: MapPoint[];
  standard: AQIStandard;
  selectedPoint: MapPoint | null;
  onSelectPoint: (point: MapPoint) => void;
}

export const AirQualityMap: React.FC<AirQualityMapProps> = ({
  centerLat,
  centerLon,
  points,
  standard,
  selectedPoint,
  onSelectPoint
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLon],
      zoom: 11,
      minZoom: 4,
      maxZoom: 17,
      zoomControl: false // custom position
    });

    // Add standard OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Zoom control at bottom right for easy thumb access on mobile
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, []); // Run once on mount

  // Update center when city changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([centerLat, centerLon], 11, { animate: true });
    }
  }, [centerLat, centerLon]);

  // Update Markers when points, standard, or selectedPoint changes
  useEffect(() => {
    if (!markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    points.forEach((point) => {
      const aqi = standard === 'cpcb' ? point.cpcbAqi : point.usepaAqi;
      const category = standard === 'cpcb' ? point.cpcbCategory : point.usepaCategory;
      const isSelected = selectedPoint?.id === point.id;

      // Custom accessible HTML marker with BOTH numerical score AND text label
      const iconHtml = `
        <div
          class="aqi-map-pin"
          style="
            background-color: ${category.color};
            ${isSelected ? 'transform: translate(-50%, -50%) scale(1.25); border-color: #38bdf8; box-shadow: 0 0 16px rgba(56, 189, 248, 0.8);' : ''}
          "
          title="${point.name}: AQI ${aqi} (${category.name})"
          aria-label="${point.name}: AQI ${aqi}, ${category.name}"
        >
          <span class="pin-val">${aqi}</span>
          <span class="pin-label">${category.name}</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-aqi-icon',
        html: iconHtml,
        iconSize: [60, 24],
        iconAnchor: [30, 12]
      });

      const marker = L.marker([point.latitude, point.longitude], {
        icon: customIcon,
        riseOnHover: true,
        title: point.name
      });

      marker.on('click', () => {
        onSelectPoint(point);
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [points, standard, selectedPoint, onSelectPoint]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([centerLat, centerLon], 11, { animate: true });
    }
  };

  return (
    <div className="relative w-full h-[380px] lg:h-[520px] xl:h-[600px] rounded-3xl overflow-hidden border border-slate-800/60 shadow-2xl bg-slate-950">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Re-center floating button */}
      <button
        onClick={handleRecenter}
        aria-label="Re-center map on city"
        className="absolute top-3 right-3 z-20 p-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 shadow-lg backdrop-blur-md transition-colors"
        title="Re-center map"
      >
        <Crosshair className="w-4 h-4" />
      </button>
    </div>
  );
};
