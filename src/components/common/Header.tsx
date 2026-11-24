import React from 'react';
import { Wind, RefreshCw, Search, Navigation } from 'lucide-react';
import { LocationInfo } from '../../types/airQuality';

interface HeaderProps {
  location: LocationInfo;
  isRefreshing: boolean;
  isDemo: boolean;
  isStale: boolean;
  onRefresh: () => void;
  onOpenSearch: () => void;
  onOpenGPS: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  location,
  isRefreshing,
  isDemo,
  isStale,
  onRefresh,
  onOpenSearch,
  onOpenGPS
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-2xl border-b border-slate-800/50 px-4 lg:px-8 xl:px-12 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand & City pill */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500/20 to-teal-500/20 border border-sky-500/25 flex items-center justify-center text-sky-400 shadow-lg shadow-sky-500/5">
            <Wind className="w-4.5 h-4.5" aria-hidden="true" />
          </div>
          <button
            onClick={onOpenSearch}
            aria-label={`Current city: ${location.name}. Tap to search cities`}
            className="text-left group"
          >
            <div className="flex items-center space-x-2">
              <span className="font-extrabold tracking-tight text-white text-base lg:text-lg group-hover:text-sky-400 transition-colors">
                AirWise
              </span>
              {isDemo && (
                <span className="text-[10px] uppercase font-bold tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-md">
                  Demo
                </span>
              )}
              {isStale && !isDemo && (
                <span className="text-[10px] uppercase font-semibold tracking-wider bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded-md">
                  Cached
                </span>
              )}
            </div>
            <div className="flex items-center text-xs text-slate-400 font-medium mt-0.5">
              <span className="truncate max-w-[180px] lg:max-w-xs">{location.name}</span>
              {location.country && (
                <span className="text-slate-500 ml-1 hidden sm:inline">· {location.country}</span>
              )}
              <span className="text-slate-500 ml-1">▾</span>
            </div>
          </button>
        </div>

        {/* Action icons: Search, GPS, Refresh */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={onOpenSearch}
            aria-label="Search city"
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 transition-all hover:border-slate-600 hover:shadow-lg"
            title="Search another city"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenGPS}
            aria-label="Find local air near me"
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-sky-400 border border-slate-700/50 transition-all hover:border-sky-500/30 hover:shadow-lg hover:shadow-sky-500/5"
            title="Use device location"
          >
            <Navigation className="w-4 h-4" />
          </button>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Refresh air quality reading"
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 active:scale-95 text-slate-300 hover:text-white border border-slate-700/50 transition-all disabled:opacity-50 hover:border-slate-600 hover:shadow-lg"
            title="Refresh reading"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
