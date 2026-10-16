import React from 'react';
import { Film, Search, Bookmark, Code2 } from 'lucide-react';
import { ActiveTab } from '../types/movie';

interface TopHeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  watchlistCount: number;
  isMobileFrame?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  onTabChange,
  watchlistCount,
  isMobileFrame = false
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#090a10]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 md:px-8 py-3.5 flex items-center justify-between gap-8">
      {/* Zone 1: Single text element Brand Wordmark */}
      <a
        href="#home"
        onClick={(e) => {
          e.preventDefault();
          onTabChange('home');
        }}
        className="flex items-center gap-2 text-lg sm:text-xl font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 group cursor-pointer"
      >
        <span className="p-1.5 rounded-lg bg-amber-500 text-black group-hover:scale-105 transition-transform">
          <Film className="w-4 h-4 fill-current" />
        </span>
        <span>
          Cine<span className="text-amber-500">Archive</span>
        </span>
      </a>

      {/* Zone 2: Clean single-line text navigation links */}
      {!isMobileFrame && (
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            type="button"
            onClick={() => onTabChange('home')}
            className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'home' ? 'text-amber-400 font-bold' : ''
            }`}
          >
            Discover
          </button>
          <button
            type="button"
            onClick={() => onTabChange('categories')}
            className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'categories' ? 'text-amber-400 font-bold' : ''
            }`}
          >
            Curated Genres
          </button>
          <button
            type="button"
            onClick={() => onTabChange('search')}
            className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'search' ? 'text-amber-400 font-bold' : ''
            }`}
          >
            Search Catalog
          </button>
          <button
            type="button"
            onClick={() => onTabChange('watchlist')}
            className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'watchlist' ? 'text-amber-400 font-bold' : ''
            }`}
          >
            <span>My List</span>
            {watchlistCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-black text-[10px] font-bold rounded-full">
                {watchlistCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => onTabChange('code')}
            className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1 ${
              activeTab === 'code' ? 'text-amber-400 font-bold' : ''
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-amber-500" />
            <span>Android Code</span>
          </button>
        </nav>
      )}

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={() => onTabChange('search')}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Search Movies</span>
        </button>
      </div>
    </header>
  );
};
