import React, { useEffect, useState } from 'react';
import {
  X,
  Play,
  Bookmark,
  Share2,
  ExternalLink,
  Film,
  HardDrive,
  Calendar,
  User,
  Eye,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Movie, MovieMetadata } from '../types/movie';
import { getArchiveMovieMetadata } from '../services/archiveApi';
import { formatDownloadCount, formatFileSize } from '../utils/archiveLogic';

interface MovieDetailsModalProps {
  movie: Movie;
  isSaved: boolean;
  onClose: () => void;
  onPlay: (movie: Movie, selectedStreamUrl?: string) => void;
  onToggleWatchlist: (movie: Movie) => void;
}

export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({
  movie,
  isSaved,
  onClose,
  onPlay,
  onToggleWatchlist
}) => {
  const [metadata, setMetadata] = useState<MovieMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getArchiveMovieMetadata(movie.identifier)
      .then((data) => {
        if (active) {
          setMetadata(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load item metadata:', err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [movie.identifier]);

  const handleShare = () => {
    const url = `https://archive.org/details/${movie.identifier}`;
    navigator.clipboard?.writeText(url);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const streams = metadata?.playableStreams || [];
  const primaryStream = streams[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="movie-details-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl md:rounded-3xl shadow-2xl text-slate-100 flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Floating Controls */}
        <div className="sticky top-0 right-0 z-30 flex items-center justify-between p-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-500">
              Internet Archive Film Details
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-mono text-slate-400">ID: {movie.identifier}</span>
          </div>

          <button
            type="button"
            aria-label="Close movie details"
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
          {/* Main Hero Split */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left: Poster */}
            <div className="md:col-span-4 w-44 sm:w-56 md:w-full mx-auto">
              <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder box
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              {/* Quick Actions below poster on mobile */}
              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => onPlay(movie, primaryStream?.url)}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-transform active:scale-98 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Watch Movie Now
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleWatchlist(movie)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      isSaved
                        ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                        : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                    {isSaved ? 'In Watchlist' : 'Add to List'}
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedShare ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        Share
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Detailed Metadata */}
            <div className="md:col-span-8 space-y-4">
              <div>
                <h1 id="movie-details-title" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {movie.title}
                </h1>

                {/* Key metadata chips/unboxed items */}
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-400">
                  {movie.year && (
                    <span className="flex items-center gap-1 text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {movie.year}
                    </span>
                  )}
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    {formatDownloadCount(movie.downloads)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400 font-medium">Public Domain / Open Access</span>
                </div>
              </div>

              {/* Creator / Cast */}
              {(movie.creator || metadata?.creator) && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                  <User className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>
                    Director / Creator:{' '}
                    <strong className="text-white font-semibold">
                      {metadata?.creator || movie.creator}
                    </strong>
                  </span>
                </div>
              )}

              {/* Synopsis */}
              <div className="space-y-1.5">
                <h2 className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  Synopsis & Archive Notes
                </h2>
                <div className="text-sm text-slate-300 leading-relaxed max-h-48 overflow-y-auto pr-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                  {metadata?.description || movie.description}
                </div>
              </div>

              {/* Video Streams & Formats Inspection */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-amber-400" />
                    Available Stream Files ({streams.length})
                  </h2>

                  {loading && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
                      Querying metadata...
                    </span>
                  )}
                </div>

                {streams.length > 0 ? (
                  <div className="space-y-2">
                    {streams.slice(0, 4).map((stream, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs hover:border-slate-600 transition-colors"
                      >
                        <div className="flex items-center gap-2 overflow-hidden pr-2">
                          <HardDrive className="w-4 h-4 text-slate-400 shrink-0" />
                          <div className="truncate">
                            <p className="font-semibold text-slate-200 truncate">{stream.name}</p>
                            <p className="text-[11px] text-slate-400">
                              Format: {stream.format} {stream.sizeBytes ? `· ${formatFileSize(stream.sizeBytes)}` : ''}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onPlay(movie, stream.url)}
                          className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-amber-500 hover:text-black font-semibold text-xs flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          Play
                        </button>
                      </div>
                    ))}
                  </div>
                ) : !loading ? (
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-200 font-medium">Standard Archive Player Enabled</p>
                      <p className="text-[11px] text-slate-400">
                        This item will stream using the official Internet Archive embedded player module.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Source Verification Link */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Verified Internet Archive Public Item</span>
                <a
                  href={`https://archive.org/details/${movie.identifier}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-amber-400 hover:underline"
                >
                  View on Archive.org
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
