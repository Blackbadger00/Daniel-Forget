import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '../types/movie';
import { MovieCard } from './MovieCard';

interface MovieRowProps {
  title: string;
  subtitle?: string;
  movies: Movie[];
  watchlistIds: Set<string>;
  onSelectMovie: (movie: Movie) => void;
  onPlayMovie: (movie: Movie) => void;
  onToggleWatchlist: (movie: Movie) => void;
  onSeeAll?: () => void;
}

export const MovieRow: React.FC<MovieRowProps> = ({
  title,
  subtitle,
  movies,
  watchlistIds,
  onSelectMovie,
  onPlayMovie,
  onToggleWatchlist,
  onSeeAll
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.75;
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <section className="relative my-6 px-4 md:px-6">
      {/* Row Header */}
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        {onSeeAll && (
          <button
            type="button"
            onClick={onSeeAll}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer py-1 px-2 rounded hover:bg-slate-800/60"
          >
            Explore all
          </button>
        )}
      </div>

      {/* Horizontal Carousel */}
      <div className="group relative">
        {/* Left Arrow Button */}
        <button
          type="button"
          aria-label={`Scroll ${title} left`}
          onClick={() => scroll('left')}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-9 h-9 rounded-full bg-slate-900/90 text-white border border-slate-700/80 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-amber-500 hover:text-black cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={rowRef}
          className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1 -mx-1 px-1"
        >
          {movies.map((movie) => (
            <MovieCard
              key={movie.identifier}
              movie={movie}
              isSaved={watchlistIds.has(movie.identifier)}
              onSelect={onSelectMovie}
              onPlay={onPlayMovie}
              onToggleWatchlist={onToggleWatchlist}
            />
          ))}
        </div>

        {/* Right Arrow Button */}
        <button
          type="button"
          aria-label={`Scroll ${title} right`}
          onClick={() => scroll('right')}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-9 h-9 rounded-full bg-slate-900/90 text-white border border-slate-700/80 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-amber-500 hover:text-black cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};
