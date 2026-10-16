import React, { useState } from 'react';
import { Film, Bookmark, Play } from 'lucide-react';
import { Movie } from '../types/movie';
import { formatDownloadCount } from '../utils/archiveLogic';

interface MovieCardProps {
  movie: Movie;
  isSaved?: boolean;
  layout?: 'row' | 'grid';
  onSelect: (movie: Movie) => void;
  onPlay: (movie: Movie) => void;
  onToggleWatchlist?: (movie: Movie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  isSaved = false,
  layout = 'row',
  onSelect,
  onPlay,
  onToggleWatchlist
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const containerClass = layout === 'grid'
    ? 'group relative w-full cursor-pointer select-none transition-all duration-200 hover:-translate-y-1'
    : 'group relative flex-shrink-0 w-36 sm:w-44 md:w-48 cursor-pointer select-none transition-all duration-200 hover:-translate-y-1';

  return (
    <div
      className={containerClass}
      onClick={() => onSelect(movie)}
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-slate-900 border border-slate-800 shadow-md transition-shadow group-hover:shadow-amber-500/10 group-hover:border-slate-700">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80 animate-pulse">
            <Film className="w-8 h-8 text-slate-600" />
          </div>
        )}

        {imageError ? (
          // Elegant Zero-Broken-Image Fallback
          <div className="absolute inset-0 flex flex-col items-center justify-between p-3 bg-gradient-to-b from-slate-800 to-slate-950 text-center">
            <span className="text-[10px] uppercase tracking-wider text-amber-500 font-semibold mt-1">
              {movie.category || 'Cinema'}
            </span>
            <div className="my-auto flex flex-col items-center">
              <Film className="w-8 h-8 text-slate-500 mb-2 opacity-60" />
              <p className="text-xs font-semibold text-slate-200 line-clamp-3 leading-snug px-1">
                {movie.title}
              </p>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {movie.year || 'Archive'}
            </span>
          </div>
        ) : (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Hover / Tap Quick Actions Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5">
          <div className="flex justify-end">
            {onToggleWatchlist && (
              <button
                type="button"
                aria-label={isSaved ? `Remove ${movie.title} from watchlist` : `Add ${movie.title} to watchlist`}
                className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                  isSaved
                    ? 'bg-amber-500 text-black'
                    : 'bg-black/60 text-white hover:bg-amber-500 hover:text-black'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWatchlist(movie);
                }}
              >
                <Bookmark className="w-3.5 h-3.5 fill-current" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-center">
            <button
              type="button"
              aria-label={`Watch ${movie.title}`}
              className="p-3 rounded-full bg-amber-500 text-black shadow-lg shadow-amber-500/30 transform transition-transform active:scale-95 hover:scale-110"
              onClick={(e) => {
                e.stopPropagation();
                onPlay(movie);
              }}
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </button>
          </div>

          <div className="text-[11px] text-slate-300 font-mono flex items-center justify-between">
            <span>{movie.year || 'Public Domain'}</span>
            <span>{formatDownloadCount(movie.downloads)}</span>
          </div>
        </div>
      </div>

      {/* Title & Metadata below poster */}
      <div className="mt-2 space-y-0.5">
        <h3 className="text-sm font-semibold text-slate-200 line-clamp-1 group-hover:text-amber-400 transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center text-xs text-slate-400 gap-1.5 font-normal">
          <span>{movie.year || 'Archive'}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate max-w-[90px]">{movie.creator || 'Classic Cinema'}</span>
        </div>
      </div>
    </div>
  );
};
