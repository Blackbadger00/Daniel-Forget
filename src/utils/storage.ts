import { WatchlistItem, Movie } from '../types/movie';

const WATCHLIST_STORAGE_KEY = 'cinearchive_watchlist_v1';
const RECENT_SEARCHES_KEY = 'cinearchive_recent_searches_v1';
const VIEW_MODE_KEY = 'cinearchive_view_mode_v1';

export function getWatchlist(): WatchlistItem[] {
  try {
    const raw = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load watchlist from localStorage:', e);
    return [];
  }
}

export function saveWatchlist(items: WatchlistItem[]): void {
  try {
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save watchlist to localStorage:', e);
  }
}

export function toggleWatchlistMovie(movie: Movie): { isSaved: boolean; items: WatchlistItem[] } {
  const current = getWatchlist();
  const existsIndex = current.findIndex(item => item.identifier === movie.identifier);

  let updated: WatchlistItem[];
  let isSaved = false;

  if (existsIndex >= 0) {
    // Remove from watchlist
    updated = current.filter(item => item.identifier !== movie.identifier);
    isSaved = false;
  } else {
    // Add to watchlist
    const newItem: WatchlistItem = {
      identifier: movie.identifier,
      title: movie.title,
      year: movie.year,
      creator: movie.creator,
      posterUrl: movie.posterUrl,
      addedAt: Date.now(),
      downloads: movie.downloads
    };
    updated = [newItem, ...current];
    isSaved = true;
  }

  saveWatchlist(updated);
  return { isSaved, items: updated };
}

export function isMovieInWatchlist(identifier: string): boolean {
  const current = getWatchlist();
  return current.some(item => item.identifier === identifier);
}

export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) {
      return ['Chaplin', 'Horror', 'Film Noir', '1950s', 'Popeye'];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return ['Chaplin', 'Horror', 'Film Noir', '1950s', 'Popeye'];
  }
}

export function saveRecentSearch(term: string): string[] {
  const clean = term.trim();
  if (!clean) return getRecentSearches();

  const current = getRecentSearches().filter(t => t.toLowerCase() !== clean.toLowerCase());
  const updated = [clean, ...current].slice(0, 8);

  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save recent search:', e);
  }

  return updated;
}

export function clearRecentSearches(): void {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (e) {
    console.error('Failed to clear recent searches:', e);
  }
}

export function getStoredViewMode(): 'mobile' | 'expanded' {
  try {
    const val = localStorage.getItem(VIEW_MODE_KEY);
    return val === 'expanded' ? 'expanded' : 'mobile';
  } catch {
    return 'mobile';
  }
}

export function setStoredViewMode(mode: 'mobile' | 'expanded'): void {
  try {
    localStorage.setItem(VIEW_MODE_KEY, mode);
  } catch (e) {
    console.error('Failed to save view mode:', e);
  }
}
