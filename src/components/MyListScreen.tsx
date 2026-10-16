import React, { useState } from 'react';
import { Bookmark, Play, Trash2, Film, Download, Upload, Compass } from 'lucide-react';
import { WatchlistItem, Movie } from '../types/movie';
import { saveWatchlist } from '../utils/storage';

interface MyListScreenProps {
  watchlist: WatchlistItem[];
  onSelectMovie: (movie: Movie) => void;
  onPlayMovie: (movie: Movie) => void;
  onRemoveMovie: (identifier: string) => void;
  onExploreMovies: () => void;
  onImportWatchlist: (items: WatchlistItem[]) => void;
  isMobileFrame?: boolean;
}

export const MyListScreen: React.FC<MyListScreenProps> = ({
  watchlist,
  onSelectMovie,
  onPlayMovie,
  onRemoveMovie,
  onExploreMovies,
  onImportWatchlist,
  isMobileFrame = false
}) => {
  const [exportNotice, setExportNotice] = useState(false);

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(watchlist, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cinearchive_watchlist_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 2500);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportWatchlist(parsed);
          saveWatchlist(parsed);
        }
      } catch (err) {
        alert('Invalid watchlist backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
      {/* Screen Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-amber-500 fill-current" />
            My Watchlist
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Locally saved public domain cinema ({watchlist.length} {watchlist.length === 1 ? 'film' : 'films'})
          </p>
        </div>

        {/* Backup / Export / Import Controls */}
        {watchlist.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              {exportNotice ? 'Exported!' : 'Export JSON'}
            </button>

            <label className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {/* Watchlist Grid */}
      {watchlist.length > 0 ? (
        <div className={
          isMobileFrame
            ? 'grid grid-cols-2 gap-3'
            : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5'
        }>
          {watchlist.map((item) => {
            const movieObj: Movie = {
              identifier: item.identifier,
              title: item.title,
              description: 'Saved to your personal watchlist.',
              year: item.year,
              creator: item.creator,
              downloads: item.downloads,
              posterUrl: item.posterUrl
            };

            return (
              <div
                key={item.identifier}
                className="group relative flex flex-col cursor-pointer select-none"
                onClick={() => onSelectMovie(movieObj)}
              >
                {/* Poster */}
                <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md group-hover:border-slate-700 transition-all">
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />

                  {/* Quick Action Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        aria-label={`Remove ${item.title} from watchlist`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveMovie(item.identifier);
                        }}
                        className="p-1.5 rounded-full bg-red-600/80 hover:bg-red-600 text-white transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex justify-center">
                      <button
                        type="button"
                        aria-label={`Play ${item.title}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayMovie(movieObj);
                        }}
                        className="p-3 rounded-full bg-amber-500 text-black shadow-lg shadow-amber-500/30 transform transition-transform active:scale-95 hover:scale-110 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </button>
                    </div>

                    <span className="text-[10px] text-slate-300 font-mono text-center">
                      Saved {new Date(item.addedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Title & Metadata */}
                <div className="mt-2 space-y-0.5">
                  <h3 className="text-sm font-semibold text-slate-200 line-clamp-1 group-hover:text-amber-400 transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center text-xs text-slate-400 gap-1.5">
                    <span>{item.year || 'Public Domain'}</span>
                    {item.creator && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="truncate max-w-[100px]">{item.creator}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty Watchlist State */
        <div className="py-20 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
            <Film className="w-8 h-8 text-slate-500" />
          </div>
          <h2 className="text-xl font-bold text-white">Your Watchlist is Empty</h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Save iconic silent films, classic noir, creature features, and vintage cartoons to your device storage for instant access anytime.
          </p>
          <button
            type="button"
            onClick={onExploreMovies}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs sm:text-sm flex items-center gap-2 mx-auto cursor-pointer shadow-lg shadow-amber-500/20"
          >
            <Compass className="w-4 h-4" />
            Discover Classic Films
          </button>
        </div>
      )}
    </div>
  );
};
