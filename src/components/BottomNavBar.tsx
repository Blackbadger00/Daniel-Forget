import React from 'react';
import { Clapperboard, Search, Grid, Bookmark, Code2 } from 'lucide-react';
import { ActiveTab } from '../types/movie';

interface BottomNavBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  watchlistCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  watchlistCount
}) => {
  const tabs = [
    {
      id: 'home' as ActiveTab,
      label: 'Home',
      icon: Clapperboard
    },
    {
      id: 'search' as ActiveTab,
      label: 'Search',
      icon: Search
    },
    {
      id: 'categories' as ActiveTab,
      label: 'Categories',
      icon: Grid
    },
    {
      id: 'watchlist' as ActiveTab,
      label: 'My List',
      icon: Bookmark,
      badge: watchlistCount
    },
    {
      id: 'code' as ActiveTab,
      label: 'Android Code',
      icon: Code2
    }
  ];

  return (
    <nav
      aria-label="Android Bottom Navigation"
      className="sticky bottom-0 left-0 right-0 z-40 bg-[#0c0e16]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 select-none"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center py-1 px-1 transition-all group cursor-pointer"
            >
              <div
                className={`p-1.5 rounded-2xl transition-all duration-200 relative ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 scale-105'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />

                {/* Watchlist Counter Badge */}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-amber-500 text-black text-[9px] font-extrabold rounded-full min-w-[16px] text-center shadow-md">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] tracking-tight mt-0.5 whitespace-nowrap transition-colors ${
                  isActive ? 'font-bold text-amber-400' : 'font-medium text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
