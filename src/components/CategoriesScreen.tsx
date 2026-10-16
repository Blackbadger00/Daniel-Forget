import React, { useState, useEffect } from 'react';
import {
  Film,
  ShieldAlert,
  Ghost,
  Sparkles,
  Smile,
  BookOpen,
  Clapperboard,
  ArrowLeft,
  Loader2,
  Filter
} from 'lucide-react';
import { Movie, CategoryInfo } from '../types/movie';
import { CURATED_CATEGORIES, searchArchiveMovies } from '../services/archiveApi';
import { MovieCard } from './MovieCard';

interface CategoriesScreenProps {
  watchlistIds: Set<string>;
  onSelectMovie: (movie: Movie) => void;
  onPlayMovie: (movie: Movie) => void;
  onToggleWatchlist: (movie: Movie) => void;
  selectedCategoryId?: string;
  isMobileFrame?: boolean;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Clapperboard: <Clapperboard className="w-6 h-6 text-amber-400" />,
  ShieldAlert: <ShieldAlert className="w-6 h-6 text-amber-400" />,
  Ghost: <Ghost className="w-6 h-6 text-amber-400" />,
  Sparkles: <Sparkles className="w-6 h-6 text-amber-400" />,
  Smile: <Smile className="w-6 h-6 text-amber-400" />,
  Film: <Film className="w-6 h-6 text-amber-400" />,
  BookOpen: <BookOpen className="w-6 h-6 text-amber-400" />
};

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({
  watchlistIds,
  onSelectMovie,
  onPlayMovie,
  onToggleWatchlist,
  selectedCategoryId,
  isMobileFrame = false
}) => {
  const [activeCatId, setActiveCatId] = useState<string | null>(selectedCategoryId || null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalFound, setTotalFound] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const activeCategory = CURATED_CATEGORIES.find((c) => c.id === activeCatId);

  useEffect(() => {
    if (!activeCatId) {
      setMovies([]);
      return;
    }

    let active = true;
    setLoading(true);
    setPage(1);

    searchArchiveMovies({
      category: activeCatId,
      page: 1,
      rows: 24,
      sort: 'downloads desc'
    })
      .then((res) => {
        if (active) {
          setMovies(res.movies);
          setTotalFound(res.total);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching category movies:', err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [activeCatId]);

  const loadMore = async () => {
    if (!activeCatId || loadingMore || loading) return;
    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const res = await searchArchiveMovies({
        category: activeCatId,
        page: nextPage,
        rows: 24,
        sort: 'downloads desc'
      });

      setMovies((prev) => [...prev, ...res.movies]);
      setPage(nextPage);
    } catch (e) {
      console.error('Failed to load more category movies:', e);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
      {/* Category Selected View Header */}
      {activeCategory ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Back to all categories"
              onClick={() => setActiveCatId(null)}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                {CATEGORY_ICONS[activeCategory.iconName]}
                {activeCategory.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {activeCategory.subtitle}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-300 bg-slate-900/60 border border-slate-800 p-3 rounded-xl max-w-2xl leading-relaxed">
            {activeCategory.description}
          </p>

          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
            <span>
              Preserved titles: <strong className="text-slate-100">{totalFound}</strong>
            </span>
            <span className="text-amber-400">Public Domain Archives</span>
          </div>

          {/* Category Movies Grid */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <p className="text-sm">Fetching {activeCategory.title} films...</p>
            </div>
          ) : (
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

              {movies.length < totalFound && (
                <div className="flex justify-center pb-8">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-semibold text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                        Loading more...
                      </>
                    ) : (
                      'Load More Films'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Categories Hub: Grid of Curated Collections */
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Curated Collections
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Explore thousands of preserved films categorized by era, style, and cinematic genre.
            </p>
          </div>

          <div className={
            isMobileFrame
              ? 'grid grid-cols-1 gap-3.5'
              : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
          }>
            {CURATED_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setActiveCatId(cat.id)}
                className="group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 shadow-md hover:shadow-amber-500/5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-800/80 w-fit group-hover:bg-amber-500/20 transition-colors">
                    {CATEGORY_ICONS[cat.iconName]}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {cat.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-amber-400 font-semibold">
                  <span>Browse archive</span>
                  <span className="transform transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
