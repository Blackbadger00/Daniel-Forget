import { Movie, MovieMetadata, CategoryInfo } from '../types/movie';
import {
  buildAdvancedSearchUrl,
  extractPlayableStreams,
  sanitizeDescription,
  cleanMovieTitle,
  getArchiveThumbnailUrl
} from '../utils/archiveLogic';

// In-memory cache to ensure snappy UI and prevent redundant network queries
const searchCache = new Map<string, { movies: Movie[]; total: number; timestamp: number }>();
const metadataCache = new Map<string, { metadata: MovieMetadata; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes

export const CURATED_CATEGORIES: CategoryInfo[] = [
  {
    id: 'classics',
    title: 'Classic Feature Films',
    subtitle: 'Golden Age Hollywood & Essential Cinema',
    query: 'mediatype:movies AND collection:feature_films',
    iconName: 'Clapperboard',
    description: 'Iconic full-length cinematic productions, major studio releases, and timeless vintage storytelling preserved for humanity.'
  },
  {
    id: 'film-noir',
    title: 'Film Noir & Detective',
    subtitle: 'Shadows, cynicism, and hardboiled mysteries',
    query: 'mediatype:movies AND (collection:Film_Noir OR subject:"film noir" OR subject:"mystery")',
    iconName: 'ShieldAlert',
    description: 'High-contrast black & white atmospheric thrillers, private eyes, fatalistic plots, and neo-noir suspense.'
  },
  {
    id: 'scifi-horror',
    title: 'Sci-Fi, Monsters & Horror',
    subtitle: 'Outer space mysteries & spine-chilling creature features',
    query: 'mediatype:movies AND (collection:SciFi_Horror OR subject:"sci-fi" OR subject:"horror")',
    iconName: 'Ghost',
    description: 'Vintage extraterrestrials, haunted houses, mad scientists, and 1950s atomic age wonder.'
  },
  {
    id: 'animation',
    title: 'Classic Animation & Cartoons',
    subtitle: 'Hand-drawn Golden Era gems',
    query: 'mediatype:movies AND (collection:animationandcartoons OR collection:classic_cartoons OR subject:"animation")',
    iconName: 'Sparkles',
    description: 'Legendary hand-drawn animation including Max Fleischer, Popeye, Betty Boop, early Superman, and indie milestones.'
  },
  {
    id: 'comedy',
    title: 'Comedy & Slapstick',
    subtitle: 'Chaplin, Keaton & comedic brilliance',
    query: 'mediatype:movies AND (collection:comedy_films OR subject:"comedy" OR subject:"slapstick")',
    iconName: 'Smile',
    description: 'Timeless physical comedy, sharp fast-talking screwball farces, and silent slapstick genius.'
  },
  {
    id: 'silent',
    title: 'Silent Cinema Masterpieces',
    subtitle: 'Pioneering visual poetry 1900–1929',
    query: 'mediatype:movies AND (collection:silent_films OR (year:[1900 TO 1929] AND mediatype:movies))',
    iconName: 'Film',
    description: 'The revolutionary birth of cinema language featuring pioneering visual effects, live orchestrations, and silent drama.'
  },
  {
    id: 'documentary',
    title: 'Documentary & Historical Archives',
    subtitle: 'Real history, cultural artifacts & mid-century newsreels',
    query: 'mediatype:movies AND (collection:documentary_film OR collection:prelinger OR subject:"documentary")',
    iconName: 'BookOpen',
    description: 'Mid-century educational films, historical newsreels, industrial marvels, and authentic cultural time capsules.'
  }
];

// Pre-seeded high quality benchmark archive movies in case of connectivity disruptions
export const FALLBACK_FEATURED_MOVIES: Movie[] = [
  {
    identifier: 'TheFastandtheFuriousJohnIreland1954goofyrip',
    title: 'The Fast and the Furious',
    description: 'A wrongly imprisoned man breaks out of jail to clear his name. Pursued by police, he takes a young sports car racer hostage and enters a cross-border race to Mexico.',
    year: 1954,
    creator: 'Roger Corman, Edward Sampson',
    downloads: 1476964,
    mediatype: 'movies',
    posterUrl: 'https://archive.org/services/img/TheFastandtheFuriousJohnIreland1954goofyrip',
    category: 'classics'
  },
  {
    identifier: 'night_of_the_living_dead',
    title: 'Night of the Living Dead',
    description: 'George A. Romero’s legendary horror masterpiece where a group of desperate survivors barricades themselves in a rural farmhouse against relentless flesh-eating ghouls.',
    year: 1968,
    creator: 'George A. Romero',
    downloads: 3890120,
    mediatype: 'movies',
    posterUrl: 'https://archive.org/services/img/night_of_the_living_dead',
    category: 'scifi-horror'
  },
  {
    identifier: 'house_on_haunted_hill',
    title: 'House on Haunted Hill',
    description: 'Eccentric millionaire Frederick Loren (Vincent Price) offers $10,000 to five guests if they can survive locked overnight in his haunted mansion.',
    year: 1959,
    creator: 'William Castle',
    downloads: 2450000,
    mediatype: 'movies',
    posterUrl: 'https://archive.org/services/img/house_on_haunted_hill',
    category: 'scifi-horror'
  },
  {
    identifier: 'Suddenly',
    title: 'Suddenly',
    description: 'Frank Sinatra stars as a cold-blooded assassin who takes over a tranquil small-town household overlooking a train station where the US President is scheduled to arrive.',
    year: 1954,
    creator: 'Lewis Allen',
    downloads: 1120000,
    mediatype: 'movies',
    posterUrl: 'https://archive.org/services/img/Suddenly',
    category: 'film-noir'
  },
  {
    identifier: 'TheStranger_1946',
    title: 'The Stranger',
    description: 'Orson Welles directs and stars as a Nazi war criminal living incognito as a respectable schoolmaster in a sleepy Connecticut town, pursued by a relentless war crimes investigator.',
    year: 1946,
    creator: 'Orson Welles',
    downloads: 1350000,
    mediatype: 'movies',
    posterUrl: 'https://archive.org/services/img/TheStranger_1946',
    category: 'film-noir'
  },
  {
    identifier: 'charlie_chaplin_film_fest',
    title: 'Charlie Chaplin Film Festival',
    description: 'Four of Chaplin’s timeless Mutual Masterpieces: The Adventurer, The Cure, Easy Street, and The Immigrant, featuring his iconic Tramp persona.',
    year: 1938,
    creator: 'Charles Chaplin',
    downloads: 1508688,
    mediatype: 'movies',
    posterUrl: 'https://archive.org/services/img/charlie_chaplin_film_fest',
    category: 'comedy'
  }
];

/**
 * Searches the Internet Archive Advanced Search endpoint with pagination and sorting.
 */
export async function searchArchiveMovies(options: {
  query?: string;
  category?: string;
  sort?: string;
  page?: number;
  rows?: number;
}): Promise<{ movies: Movie[]; total: number }> {
  const {
    query = '',
    category,
    sort = 'downloads desc',
    page = 1,
    rows = 24
  } = options;

  // Build the effective archive.org search query
  let effectiveQuery = 'mediatype:movies';

  if (category) {
    const cat = CURATED_CATEGORIES.find(c => c.id === category);
    if (cat) {
      effectiveQuery = cat.query;
    }
  }

  if (query.trim().length > 0) {
    const escapedQuery = query.replace(/[()]/g, ' ').trim();
    if (category) {
      effectiveQuery = `(${effectiveQuery}) AND (title:(${escapedQuery}) OR description:(${escapedQuery}) OR creator:(${escapedQuery}))`;
    } else {
      effectiveQuery = `mediatype:movies AND (title:(${escapedQuery}) OR description:(${escapedQuery}) OR creator:(${escapedQuery}) OR subject:(${escapedQuery}))`;
    }
  }

  const cacheKey = `${effectiveQuery}|${sort}|${page}|${rows}`;
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { movies: cached.movies, total: cached.total };
  }

  const params = new URLSearchParams({
    q: effectiveQuery,
    rows: rows.toString(),
    page: page.toString(),
    sort
  });

  const proxyUrl = `/api/archive/search?${params.toString()}`;
  const directUrl = buildAdvancedSearchUrl({
    query: effectiveQuery,
    rows,
    page,
    sort
  });

  try {
    // Try server proxy first to avoid any CORS restrictions
    let response = await fetch(proxyUrl, {
      headers: { 'Accept': 'application/json' }
    }).catch(() => null);

    // Fall back to direct URL if proxy fails (e.g. static export)
    if (!response || !response.ok) {
      response = await fetch(directUrl, {
        headers: { 'Accept': 'application/json' }
      });
    }

    if (!response || !response.ok) {
      throw new Error(`HTTP ${response?.status}: Failed to fetch from Internet Archive`);
    }

    const data = await response.json();
    const docs = data.response?.docs || [];
    const total = data.response?.numFound || 0;

    const movies: Movie[] = docs
      .filter((doc: any) => doc.identifier)
      .map((doc: any) => {
        let creatorStr = '';
        if (Array.isArray(doc.creator)) {
          creatorStr = doc.creator.filter(Boolean).join(', ');
        } else if (typeof doc.creator === 'string') {
          creatorStr = doc.creator;
        }

        return {
          identifier: doc.identifier,
          title: cleanMovieTitle(doc.title, doc.identifier),
          description: sanitizeDescription(doc.description),
          year: doc.year,
          creator: creatorStr,
          downloads: doc.downloads || 0,
          mediatype: doc.mediatype || 'movies',
          publicdate: doc.publicdate,
          posterUrl: getArchiveThumbnailUrl(doc.identifier),
          category: category || 'classics'
        };
      });

    searchCache.set(cacheKey, { movies, total, timestamp: Date.now() });
    return { movies, total };
  } catch (error) {
    console.warn('Internet Archive search fetch error, returning fallback cache if available:', error);
    
    // Provide filtered fallback movies if real fetch fails
    const filtered = FALLBACK_FEATURED_MOVIES.filter(m => {
      if (category && m.category !== category) return false;
      if (query && !m.title.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });

    return {
      movies: filtered.length > 0 ? filtered : FALLBACK_FEATURED_MOVIES,
      total: FALLBACK_FEATURED_MOVIES.length
    };
  }
}

/**
 * Fetches item-level metadata from https://archive.org/metadata/{identifier}
 * to parse playable video stream links, sizes, and license details.
 */
export async function getArchiveMovieMetadata(identifier: string): Promise<MovieMetadata> {
  const cached = metadataCache.get(identifier);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.metadata;
  }

  const proxyUrl = `/api/archive/metadata/${encodeURIComponent(identifier)}`;
  const directUrl = `https://archive.org/metadata/${identifier}`;

  try {
    let response = await fetch(proxyUrl, {
      headers: { 'Accept': 'application/json' }
    }).catch(() => null);

    if (!response || !response.ok) {
      response = await fetch(directUrl, {
        headers: { 'Accept': 'application/json' }
      });
    }

    if (!response || !response.ok) {
      throw new Error(`HTTP ${response?.status}: Failed to fetch item metadata for ${identifier}`);
    }

    const data = await response.json();
    const meta = data.metadata || {};
    const files = data.files || [];

    const playableStreams = extractPlayableStreams(identifier, files);

    let creatorStr = '';
    if (Array.isArray(meta.creator)) {
      creatorStr = meta.creator.join(', ');
    } else if (typeof meta.creator === 'string') {
      creatorStr = meta.creator;
    }

    const result: MovieMetadata = {
      identifier,
      title: cleanMovieTitle(meta.title, identifier),
      description: sanitizeDescription(meta.description),
      year: meta.year || meta.date,
      creator: creatorStr,
      licenseurl: meta.licenseurl,
      runtime: meta.runtime,
      addeddate: meta.addeddate,
      server: data.server,
      dir: data.dir,
      files,
      playableStreams
    };

    metadataCache.set(identifier, { metadata: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    console.warn(`Error fetching metadata for ${identifier}:`, error);

    // Construct a sensible fallback with Archive Embed player
    const fallback: MovieMetadata = {
      identifier,
      title: cleanMovieTitle(undefined, identifier),
      description: 'Streamable public domain cinema item from the Internet Archive collection.',
      files: [],
      playableStreams: [
        {
          name: `${identifier}.mp4`,
          format: 'h.264',
          url: `https://archive.org/download/${identifier}/${identifier}.mp4`,
          isPreferred: true
        }
      ]
    };

    return fallback;
  }
}
