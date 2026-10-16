import React, { useState, useEffect } from 'react';
import { Search, X, Loader2, Sparkles, Filter, AlertCircle } from 'lucide-react';
import { Movie } from '../types/movie';
import { searchArchiveMovies, CURATED_CATEGORIES } from '../services/archiveApi';
import { MovieCard } from './MovieCard';
import { getRecentSearches, saveRecentSearch } from '../utils/storage';

interface SearchScreenProps {
  watchlistIds: Set<string>;
  onSelectMovie: (movie: Movie) => void;
  onPlayMovie: (movie: Movie) => void;
  onToggleWatchlist: (movie: Movie) => void;
  initialQuery?: string;
  initialCategory?: string;
  isMobileFrame?: boolean;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  watchlistIds,
  onSelectMovie,
  onPlayMovie,
  onToggleWatchlist,
  initialQuery = '',
  initialCategory = '',
  isMobileFrame = false
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [sortOption, setSortOption] = useState<'downloads desc' | 'year desc' | 'title asc'>('downloads desc');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [totalFound, setTotalFound] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Trigger search on query / category / sort change
  useEffect(() => {
    let active = true;
    setLoading(true);
    setPage(1);

    const timer = setTimeout(() => {
      searchArchiveMovies({
        query,
        category: activeCategory || undefined,
        sort: sortOption,
        page: 1,
        rows: 24
      })
        .then((res) => {
          if (active) {
            setMovies(res.movies);
            setTotalFound(res.total);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error('Search error:', err);
          if (active) setLoading(false);
        });
    }, query ? 350 : 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, activeCategory, sortOption]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const updated = saveRecentSearch(query.trim());
      setRecentSearches(updated);
    }
  };

  const handleQuickChipClick = (term: string) => {
    setQuery(term);
    const updated = saveRecentSearch(term);
    setRecentSearches(updated);
  };

  const loadMore = async () => {
    if (loadingMore || loading) return;
    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const res = await searchArchiveMovies({
        query,
        category: activeCategory || undefined,
        sort: sortOption,
        page: nextPage,
        rows: 24
      });

      setMovies((prev) => [...prev, ...res.movies]);
      setPage(nextPage);
    } catch (e) {
      console.error('Failed to load more results:', e);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
      {/* Search Header Form */}
      <form onSubmit={handleSearchSubmit} className="space-y-4">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search thousands of public domain movies, actors, directors..."
            className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm md:text-base shadow-inner transition-colors"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search text"
              onClick={() => setQuery('')}
              className="absolute right-4 p-1 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filters and Sorting bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => setActiveCategory('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                activeCategory === ''
                  ? 'bg-amber-500 text-black font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Genres
            </button>
            {CURATED_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id === activeCategory ? '' : cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-amber-500 text-black font-semibold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="downloads desc">Most Popular (Downloads)</option>
              <option value="year desc">Release Year (Newest)</option>
              <option value="title asc">Title (A to Z)</option>
            </select>
          </div>
        </div>

        {/* Quick Search Suggestions */}
        {!query && recentSearches.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-slate-400 overflow-x-auto no-scrollbar pt-1">
            <span className="shrink-0 flex items-center gap-1 text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Popular:
            </span>
            {recentSearches.map((term, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuickChipClick(term)}
                className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
        <span>
          {loading ? (
            'Searching Internet Archive catalog...'
          ) : (
            <>
              Found <strong className="text-slate-100 font-semibold">{totalFound}</strong> movies on Internet Archive
              {query && (
                <>
                  {' '}for "<span className="text-amber-400">{query}</span>"
                </>
              )}
            </>
          )}
        </span>
      </div>

      {/* Main Movie Results Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-sm">Querying archive.org advanced search...</p>
        </div>
      ) : movies.length > 0 ? (
        <div className="space-y-8">
          <div className={
            isMobileFrame
              ? 'grid grid-cols-2 gap-3'
              : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5'
          }>
            {movies.map((movie) => (
              <div key={movie.identifier} className="w-full">
                <MovieCard
                  movie={movie}
                  layout="grid"
                  isSaved={watchlistIds.has(movie.identifier)}
                  onSelect={onSelectMovie}
                  onPlay={onPlayMovie}
                  onToggleWatchlist={onToggleWatchlist}
                />
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {movies.length < totalFound && (
            <div className="flex justify-center pt-4 pb-8">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-semibold text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                    Fetching next page...
                  </>
                ) : (
                  'Load More Movies'
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 text-center max-w-md mx-auto space-y-4">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Movies Found</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            We couldn't find any public domain films matching your query. Try broad terms like "Horror", "Chaplin", "Western", or browse our curated categories.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setActiveCategory('');
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 text-black font-semibold text-xs cursor-pointer hover:bg-amber-400"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
