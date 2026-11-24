import React from 'react';
import { Clock, TrendingUp, Map } from 'lucide-react';

export type ActiveTab = 'now' | 'forecast' | 'map';

interface ViewTabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  vertical?: boolean;
}

const tabs: { id: ActiveTab; label: string; Icon: typeof Clock }[] = [
  { id: 'now', label: 'Now', Icon: Clock },
  { id: 'forecast', label: 'Forecast', Icon: TrendingUp },
  { id: 'map', label: 'Map', Icon: Map }
];

export const ViewTabs: React.FC<ViewTabsProps> = ({ activeTab, onTabChange, vertical }) => {
  if (vertical) {
    return (
      <nav
        role="tablist"
        aria-label="App views"
        className="flex flex-col items-center space-y-1 w-full"
      >
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            role="tab"
            id={`tab-${id}`}
            aria-selected={activeTab === id}
            aria-controls={`panel-${id}`}
            type="button"
            onClick={() => onTabChange(id)}
            className={`w-14 flex flex-col items-center py-3 px-1 rounded-2xl transition-all space-y-1 ${
              activeTab === id
                ? 'bg-sky-600/90 text-white shadow-lg shadow-sky-600/20 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span className="text-[10px] font-semibold tracking-wide">{label}</span>
          </button>
        ))}
      </nav>
    );
  }

  return (
    <nav
      role="tablist"
      aria-label="App views"
      className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800/60 text-xs font-semibold shadow-inner backdrop-blur-xl"
    >
      {tabs.map(({ id, label, Icon }) => (
        <button
          key={id}
          role="tab"
          id={`tab-${id}`}
          aria-selected={activeTab === id}
          aria-controls={`panel-${id}`}
          type="button"
          onClick={() => onTabChange(id)}
          className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === id
              ? 'bg-sky-600/90 text-white shadow-lg shadow-sky-600/20 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
};
