import React, { useState, useEffect, useRef } from 'react';
import { LocationInfo } from '../../types/airQuality';
import { airQualityService } from '../../services/airQualityService';
import { MOCK_CITIES } from '../../services/mockData';
import { Search, MapPin, X, Loader2, Sparkles } from 'lucide-react';

interface CitySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCity: (city: LocationInfo) => void;
  onPromptGPS: () => void;
}

export const CitySearchModal: React.FC<CitySearchModalProps> = ({
  isOpen,
  onClose,
  onSelectCity,
  onPromptGPS
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await airQualityService.searchCities(query.trim());
        setResults(res);
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search city"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-12 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center space-x-2.5">
          <Search className="w-5 h-5 text-slate-400 shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any city worldwide..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
            aria-label="Search city name"
          />
          {loading ? (
            <Loader2 className="w-4 h-4 text-sky-400 animate-spin shrink-0" />
          ) : query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-white ml-2"
          >
            Cancel
          </button>
        </div>

        {/* GPS Button inside search */}
        <div className="px-4 py-2.5 bg-slate-850 border-b border-slate-800/80">
          <button
            onClick={() => {
              onClose();
              onPromptGPS();
            }}
            className="w-full py-2 px-3 rounded-xl bg-sky-600/15 hover:bg-sky-600/25 border border-sky-500/30 text-sky-300 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span>Find Air Near Me (GPS)</span>
          </button>
        </div>

        {/* Search Results or Preset Quick-picks */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {results.length > 0 ? (
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Matching Cities
              </span>
              <div className="space-y-1.5">
                {results.map((city, idx) => (
                  <button
                    key={`${city.latitude}-${city.longitude}-${idx}`}
                    onClick={() => {
                      onSelectCity(city);
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
                        {city.name}
                      </span>
                      <span className="text-xs text-slate-400 block">
                        {city.admin1 ? `${city.admin1}, ` : ''}{city.country}
                      </span>
                    </div>
                    <MapPin className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          ) : query.trim().length >= 2 && !loading ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No matching cities found for "{query}".
            </div>
          ) : (
            <div>
              <div className="flex items-center space-x-1.5 mb-2.5 text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Popular Quick-Picks
                </span>
              </div>
              <div className="space-y-1.5">
                {MOCK_CITIES.map((city) => (
                  <button
                    key={city.id || city.name}
                    onClick={() => {
                      onSelectCity(city);
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
                        {city.name}
                      </span>
                      <span className="text-xs text-slate-400 block">
                        {city.admin1 ? `${city.admin1}, ` : ''}{city.country}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {city.name.includes('Delhi') ? 'Poor AQI test' : city.name.includes('Bengaluru') ? 'Good AQI test' : 'Live'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
