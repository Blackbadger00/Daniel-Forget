/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  WifiOff,
  RefreshCw,
  Film,
  Sparkles,
  Clapperboard,
  Loader2,
  Tv
} from 'lucide-react';
import { Movie, ActiveTab, WatchlistItem } from './types/movie';
import {
  searchArchiveMovies,
  FALLBACK_FEATURED_MOVIES,
  CURATED_CATEGORIES
} from './services/archiveApi';
import {
  getWatchlist,
  toggleWatchlistMovie,
  getStoredViewMode,
  setStoredViewMode
} from './utils/storage';
import { AndroidFrame } from './components/AndroidFrame';
import { TopHeader } from './components/TopHeader';
import { BottomNavBar } from './components/BottomNavBar';
import { HeroBanner } from './components/HeroBanner';
import { MovieRow } from './components/MovieRow';
import { MovieDetailsModal } from './components/MovieDetailsModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { SearchScreen } from './components/SearchScreen';
import { CategoriesScreen } from './components/CategoriesScreen';
import { MyListScreen } from './components/MyListScreen';
import { AndroidCodeViewer } from './components/AndroidCodeViewer';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [viewMode, setViewMode] = useState<'mobile' | 'expanded'>('mobile');
  const [isOnline, setIsOnline] = useState(true);

  // Watchlist state
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  // Modals & Navigation
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [playingMovie, setPlayingMovie] = useState<{ movie: Movie; streamUrl?: string } | null>(null);
  const [categoryDrilldown, setCategoryDrilldown] = useState<string | undefined>(undefined);
  const [homeQuickSearch, setHomeQuickSearch] = useState('');

  // Nav history stack for Android Back Button
  const [navHistory, setNavHistory] = useState<ActiveTab[]>(['home']);

  // Collections state
  const [featuredMovie, setFeaturedMovie] = useState<Movie>(FALLBACK_FEATURED_MOVIES[0]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [classicMovies, setClassicMovies] = useState<Movie[]>([]);
  const [filmNoirMovies, setFilmNoirMovies] = useState<Movie[]>([]);
  const [scifiMovies, setScifiMovies] = useState<Movie[]>([]);
  const [animationMovies, setAnimationMovies] = useState<Movie[]>([]);
  const [comedyMovies, setComedyMovies] = useState<Movie[]>([]);
  const [homeLoading, setHomeLoading] = useState(true);

  // Initialize viewMode and watchlist
  useEffect(() => {
    setViewMode(getStoredViewMode());
    setWatchlist(getWatchlist());

    const updateOnline = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);

    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
    };
  }, []);

  const handleToggleViewMode = (mode: 'mobile' | 'expanded') => {
    setViewMode(mode);
    setStoredViewMode(mode);
  };

  // Watchlist IDs set for fast O(1) checks
  const watchlistIds = useMemo(() => {
    return new Set(watchlist.map((item) => item.identifier));
  }, [watchlist]);

  const handleToggleWatchlist = useCallback((movie: Movie) => {
    const { items } = toggleWatchlistMovie(movie);
    setWatchlist(items);
  }, []);

  // Fetch initial home content from real Internet Archive API
  const loadHomeContent = useCallback(async () => {
    setHomeLoading(true);
    try {
      const [
        trendingRes,
        classicsRes,
        noirRes,
        scifiRes,
        animRes,
        comedyRes
      ] = await Promise.allSettled([
        searchArchiveMovies({ query: '', category: 'classics', sort: 'downloads desc', rows: 12 }),
        searchArchiveMovies({ query: '', category: 'silent', sort: 'downloads desc', rows: 12 }),
        searchArchiveMovies({ query: '', category: 'film-noir', sort: 'downloads desc', rows: 12 }),
        searchArchiveMovies({ query: '', category: 'scifi-horror', sort: 'downloads desc', rows: 12 }),
        searchArchiveMovies({ query: '', category: 'animation', sort: 'downloads desc', rows: 12 }),
        searchArchiveMovies({ query: '', category: 'comedy', sort: 'downloads desc', rows: 12 })
      ]);

      const trending = trendingRes.status === 'fulfilled' ? trendingRes.value.movies : FALLBACK_FEATURED_MOVIES;
      const classics = classicsRes.status === 'fulfilled' ? classicsRes.value.movies : [];
      const noir = noirRes.status === 'fulfilled' ? noirRes.value.movies : [];
      const scifi = scifiRes.status === 'fulfilled' ? scifiRes.value.movies : [];
      const anim = animRes.status === 'fulfilled' ? animRes.value.movies : [];
      const comedy = comedyRes.status === 'fulfilled' ? comedyRes.value.movies : [];

      setTrendingMovies(trending);
      setClassicMovies(classics);
      setFilmNoirMovies(noir);
      setScifiMovies(scifi);
      setAnimationMovies(anim);
      setComedyMovies(comedy);

      // Set featured film to an iconic archive movie
      if (trending.length > 0) {
        // Pick one with a good title
        const topFeatured = trending.find(m => m.identifier.includes('Fast') || m.identifier.includes('Suddenly') || (m.downloads || 0) > 1000000) || trending[0];
        setFeaturedMovie(topFeatured);
      }
    } catch (e) {
      console.error('Failed to load home categories from archive.org:', e);
      setTrendingMovies(FALLBACK_FEATURED_MOVIES);
    } finally {
      setHomeLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHomeContent();
  }, [loadHomeContent]);

  // Tab navigation with history tracking
  const navigateToTab = (tab: ActiveTab) => {
    if (tab !== activeTab) {
      setNavHistory((prev) => [...prev, tab]);
      setActiveTab(tab);
    }
  };

  // Android System Back Button handler
  const handleSystemBack = () => {
    if (playingMovie) {
      setPlayingMovie(null);
      return;
    }
    if (selectedMovie) {
      setSelectedMovie(null);
      return;
    }
    if (navHistory.length > 1) {
      const newStack = [...navHistory];
      newStack.pop(); // pop current
      const previous = newStack[newStack.length - 1];
      setNavHistory(newStack);
      setActiveTab(previous);
    }
  };

  const canGoBack = Boolean(playingMovie || selectedMovie || navHistory.length > 1);

  const handlePlayMovie = (movie: Movie, streamUrl?: string) => {
    setPlayingMovie({ movie, streamUrl });
  };

  const handleCategorySeeAll = (catId: string) => {
    setCategoryDrilldown(catId);
    navigateToTab('categories');
  };

  const handleHomeSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (homeQuickSearch.trim()) {
      navigateToTab('search');
    }
  };

  return (
    <AndroidFrame
      viewMode={viewMode}
      onToggleViewMode={handleToggleViewMode}
      onSystemBack={handleSystemBack}
      canGoBack={canGoBack}
    >
      <div className="min-h-full flex flex-col bg-[#08090d] text-slate-100">
        {/* Offline Banner if Network Disconnected */}
        {!isOnline && (
          <div className="bg-amber-500/20 border-b border-amber-500/40 text-amber-300 px-4 py-2 text-xs flex items-center justify-between z-50">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4" />
              <span>You are currently offline. Showing cached public domain films.</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOnline(navigator.onLine)}
              className="px-2 py-1 bg-amber-500 text-black font-semibold rounded text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        )}

        {/* Top Header */}
        <TopHeader
          activeTab={activeTab}
          onTabChange={navigateToTab}
          watchlistCount={watchlist.length}
          isMobileFrame={viewMode === 'mobile'}
        />

        {/* Main Content Area */}
        <main className="flex-1 pb-16">
          {/* TAB 1: HOME */}
          {activeTab === 'home' && (
            <div className="space-y-6">
              {/* Featured Hero Banner */}
              <HeroBanner
                movie={featuredMovie}
                isSaved={watchlistIds.has(featuredMovie.identifier)}
                onPlay={handlePlayMovie}
                onSelect={(m) => setSelectedMovie(m)}
                onToggleWatchlist={handleToggleWatchlist}
              />

              {/* In-Home Quick Search Box */}
              <div className="px-4 sm:px-6 md:px-8 max-w-2xl mx-auto -mt-6 sm:-mt-8 relative z-20">
                <form
                  onSubmit={handleHomeSearchSubmit}
                  className="flex items-center bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-xl px-4 py-3 gap-3 focus-within:border-amber-500 transition-colors"
                >
                  <Search className="w-5 h-5 text-amber-500 shrink-0" />
                  <input
                    type="text"
                    value={homeQuickSearch}
                    onChange={(e) => setHomeQuickSearch(e.target.value)}
                    placeholder="Search titles, Charlie Chaplin, Film Noir, Horror..."
                    className="w-full bg-transparent text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shrink-0 cursor-pointer transition-colors"
                  >
                    Search
                  </button>
                </form>
              </div>

              {/* Quick Genre Links Strip */}
              <div className="px-4 sm:px-6 md:px-8 overflow-x-auto no-scrollbar pt-2">
                <div className="flex items-center gap-2">
                  {CURATED_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySeeAll(cat.id)}
                      className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                    >
                      {cat.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Loading State or Carousels */}
              {homeLoading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                  <p className="text-sm font-medium">Fetching public domain cinema from Internet Archive...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Row 1: Trending & Most Downloaded */}
                  <MovieRow
                    title="Trending in Archive Cinema"
                    subtitle="Most downloaded public domain feature films"
                    movies={trendingMovies}
                    watchlistIds={watchlistIds}
                    onSelectMovie={(m) => setSelectedMovie(m)}
                    onPlayMovie={handlePlayMovie}
                    onToggleWatchlist={handleToggleWatchlist}
                    onSeeAll={() => handleCategorySeeAll('classics')}
                  />

                  {/* Row 2: Film Noir */}
                  <MovieRow
                    title="Film Noir & Detective Mystery"
                    subtitle="Crime, shadows, and fatalistic tension"
                    movies={filmNoirMovies}
                    watchlistIds={watchlistIds}
                    onSelectMovie={(m) => setSelectedMovie(m)}
                    onPlayMovie={handlePlayMovie}
                    onToggleWatchlist={handleToggleWatchlist}
                    onSeeAll={() => handleCategorySeeAll('film-noir')}
                  />

                  {/* Row 3: Sci-Fi & Creature Horror */}
                  <MovieRow
                    title="Sci-Fi & Classic Horror"
                    subtitle="Atomic age monsters, haunted mansions, and space invasion"
                    movies={scifiMovies}
                    watchlistIds={watchlistIds}
                    onSelectMovie={(m) => setSelectedMovie(m)}
                    onPlayMovie={handlePlayMovie}
                    onToggleWatchlist={handleToggleWatchlist}
                    onSeeAll={() => handleCategorySeeAll('scifi-horror')}
                  />

                  {/* Row 4: Golden Age Animation */}
                  <MovieRow
                    title="Golden Age Animation & Cartoons"
                    subtitle="Fleischer Studios, Popeye, Betty Boop and vintage animation"
                    movies={animationMovies}
                    watchlistIds={watchlistIds}
                    onSelectMovie={(m) => setSelectedMovie(m)}
                    onPlayMovie={handlePlayMovie}
                    onToggleWatchlist={handleToggleWatchlist}
                    onSeeAll={() => handleCategorySeeAll('animation')}
                  />

                  {/* Row 5: Comedy & Slapstick */}
                  <MovieRow
                    title="Comedy & Slapstick Genius"
                    subtitle="Charlie Chaplin, Buster Keaton and timeless screwball farces"
                    movies={comedyMovies}
                    watchlistIds={watchlistIds}
                    onSelectMovie={(m) => setSelectedMovie(m)}
                    onPlayMovie={handlePlayMovie}
                    onToggleWatchlist={handleToggleWatchlist}
                    onSeeAll={() => handleCategorySeeAll('comedy')}
                  />

                  {/* Row 6: Silent Era Masterpieces */}
                  <MovieRow
                    title="Silent Era Pioneers (1900–1929)"
                    subtitle="The foundational masterworks of silent cinematography"
                    movies={classicMovies}
                    watchlistIds={watchlistIds}
                    onSelectMovie={(m) => setSelectedMovie(m)}
                    onPlayMovie={handlePlayMovie}
                    onToggleWatchlist={handleToggleWatchlist}
                    onSeeAll={() => handleCategorySeeAll('silent')}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SEARCH */}
          {activeTab === 'search' && (
            <SearchScreen
              watchlistIds={watchlistIds}
              onSelectMovie={(m) => setSelectedMovie(m)}
              onPlayMovie={handlePlayMovie}
              onToggleWatchlist={handleToggleWatchlist}
              initialQuery={homeQuickSearch}
              isMobileFrame={viewMode === 'mobile'}
            />
          )}

          {/* TAB 3: CATEGORIES */}
          {activeTab === 'categories' && (
            <CategoriesScreen
              watchlistIds={watchlistIds}
              onSelectMovie={(m) => setSelectedMovie(m)}
              onPlayMovie={handlePlayMovie}
              onToggleWatchlist={handleToggleWatchlist}
              selectedCategoryId={categoryDrilldown}
              isMobileFrame={viewMode === 'mobile'}
            />
          )}

          {/* TAB 4: MY LIST / WATCHLIST */}
          {activeTab === 'watchlist' && (
            <MyListScreen
              watchlist={watchlist}
              onSelectMovie={(m) => setSelectedMovie(m)}
              onPlayMovie={handlePlayMovie}
              onRemoveMovie={(id) => {
                const updated = watchlist.filter((item) => item.identifier !== id);
                setWatchlist(updated);
                localStorage.setItem('cinearchive_watchlist_v1', JSON.stringify(updated));
              }}
              onExploreMovies={() => navigateToTab('home')}
              onImportWatchlist={(imported) => setWatchlist(imported)}
              isMobileFrame={viewMode === 'mobile'}
            />
          )}

          {/* TAB 5: ANDROID STUDIO KOTLIN CODEBASE */}
          {activeTab === 'code' && <AndroidCodeViewer isMobileFrame={viewMode === 'mobile'} />}
        </main>

        {/* Movie Details Modal Screen */}
        {selectedMovie && (
          <MovieDetailsModal
            movie={selectedMovie}
            isSaved={watchlistIds.has(selectedMovie.identifier)}
            onClose={() => setSelectedMovie(null)}
            onPlay={handlePlayMovie}
            onToggleWatchlist={handleToggleWatchlist}
          />
        )}

        {/* Video Player Modal Screen */}
        {playingMovie && (
          <VideoPlayerModal
            movie={playingMovie.movie}
            streamUrl={playingMovie.streamUrl}
            onClose={() => setPlayingMovie(null)}
          />
        )}

        {/* Android Material 3 Bottom Navigation Bar */}
        <BottomNavBar
          activeTab={activeTab}
          onTabChange={navigateToTab}
          watchlistCount={watchlist.length}
        />
      </div>
    </AndroidFrame>
  );
}
