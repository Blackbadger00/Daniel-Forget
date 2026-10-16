import React from 'react';
import { Play, Plus, Check, Info } from 'lucide-react';
import { Movie } from '../types/movie';
import { formatDownloadCount } from '../utils/archiveLogic';

interface HeroBannerProps {
  movie: Movie;
  isSaved: boolean;
  onPlay: (movie: Movie) => void;
  onSelect: (movie: Movie) => void;
  onToggleWatchlist: (movie: Movie) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  movie,
  isSaved,
  onPlay,
  onSelect,
  onToggleWatchlist
}) => {
  return (
    <div className="relative w-full h-[380px] sm:h-[440px] md:h-[480px] lg:h-[520px] overflow-hidden bg-slate-950">
      {/* Background Poster Artwork with Cinematic Gradient Scrim */}
      <div className="absolute inset-0">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter blur-xs brightness-45 scale-105"
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-[#08090d]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090d] via-[#08090d]/80 to-transparent max-w-3xl" />
      </div>

      {/* Content Overlay */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col justify-end pb-8 sm:pb-12 z-10">
        <div className="max-w-2xl space-y-3">
          {/* Metadata Bar */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
            <span className="text-amber-400 font-bold uppercase tracking-wider">
              Featured Archive Film
            </span>
            <span aria-hidden="true">·</span>
            <span>{movie.year || 'Classic Era'}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-400">{formatDownloadCount(movie.downloads)}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-medium">Public Domain</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight text-balance drop-shadow-md">
            {movie.title}
          </h1>

          {/* Creator / Director */}
          {movie.creator && (
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Directed by <span className="text-slate-100 font-semibold">{movie.creator}</span>
            </p>
          )}

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl text-balance">
            {movie.description}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onPlay(movie)}
              className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all transform active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
              Watch Movie
            </button>

            <button
              type="button"
              onClick={() => onToggleWatchlist(movie)}
              className={`px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isSaved
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900/70 border-slate-700 text-slate-200 hover:bg-slate-800'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  In Watchlist
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  My List
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onSelect(movie)}
              className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Info className="w-4 h-4" />
              Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
