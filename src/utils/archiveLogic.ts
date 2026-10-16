/**
 * Pure helper functions for Internet Archive movie parsing and URL construction.
 * Pure logic decoupled from React/DOM for deterministic testing.
 */

export interface ArchiveSearchDoc {
  identifier: string;
  title?: string;
  description?: string;
  year?: number | string;
  creator?: string | string[];
  mediatype?: string;
  downloads?: number;
  publicdate?: string;
  genre?: string;
}

export interface ArchiveFile {
  name: string;
  source?: string;
  format?: string;
  size?: string | number;
  length?: string | number;
  title?: string;
  height?: string | number;
  width?: string | number;
}

export interface PlayableStream {
  url: string;
  format: string;
  name: string;
  sizeBytes?: number;
  isPreferred: boolean;
}

/**
 * Builds the Internet Archive Advanced Search URL with encoded parameters.
 */
export function buildAdvancedSearchUrl(params: {
  query: string;
  rows?: number;
  page?: number;
  sort?: string;
}): string {
  const { query, rows = 20, page = 1, sort = 'downloads desc' } = params;
  const baseUrl = 'https://archive.org/advancedsearch.php';
  
  const searchParams = new URLSearchParams();
  searchParams.set('q', query);
  searchParams.append('fl[]', 'identifier');
  searchParams.append('fl[]', 'title');
  searchParams.append('fl[]', 'description');
  searchParams.append('fl[]', 'year');
  searchParams.append('fl[]', 'creator');
  searchParams.append('fl[]', 'downloads');
  searchParams.append('fl[]', 'mediatype');
  searchParams.append('fl[]', 'publicdate');
  searchParams.set('sort[]', sort);
  searchParams.set('rows', rows.toString());
  searchParams.set('page', page.toString());
  searchParams.set('output', 'json');
  
  return `${baseUrl}?${searchParams.toString()}`;
}

/**
 * Extracts and prioritizes playable video files from Internet Archive metadata.
 * Prefers h.264 / 512Kb MPEG4 / MP4 files that are fast to buffer and universal.
 */
export function extractPlayableStreams(identifier: string, files: ArchiveFile[] = []): PlayableStream[] {
  if (!identifier || !Array.isArray(files)) return [];

  const validVideoFiles = files.filter(file => {
    if (!file.name) return false;
    const lowerName = file.name.toLowerCase();
    const lowerFormat = (file.format || '').toLowerCase();
    
    // Ignore thumbs, metadata xml, torrents, previews
    if (lowerName.includes('.thumbs') || lowerName.endsWith('.xml') || lowerName.endsWith('.torrent') || lowerName.endsWith('.sqlite')) {
      return false;
    }

    return (
      lowerName.endsWith('.mp4') ||
      lowerName.endsWith('.ogv') ||
      lowerName.endsWith('.webm') ||
      lowerFormat.includes('h.264') ||
      lowerFormat.includes('mpeg4') ||
      lowerFormat.includes('512kb') ||
      lowerFormat.includes('ogg video') ||
      lowerFormat.includes('webm')
    );
  });

  return validVideoFiles.map(file => {
    const lowerFormat = (file.format || '').toLowerCase();
    const lowerName = file.name.toLowerCase();
    
    // Determine preference: h.264 MP4 is best for web/mobile playback
    const isPreferred = lowerFormat.includes('h.264') || 
      (lowerName.endsWith('.mp4') && !lowerName.includes('512kb') && !lowerName.includes('256kb'));

    const sizeBytes = typeof file.size === 'string' ? parseInt(file.size, 10) : file.size;

    return {
      name: file.name,
      format: file.format || (lowerName.endsWith('.mp4') ? 'MPEG4' : 'Video'),
      url: `https://archive.org/download/${identifier}/${encodeURIComponent(file.name)}`,
      sizeBytes: isNaN(sizeBytes as number) ? undefined : (sizeBytes as number),
      isPreferred
    };
  }).sort((a, b) => {
    // Sort preferred formats first, then by size (if available)
    if (a.isPreferred && !b.isPreferred) return -1;
    if (!a.isPreferred && b.isPreferred) return 1;
    return (b.sizeBytes || 0) - (a.sizeBytes || 0);
  });
}

/**
 * Strips HTML tags and raw URLs from vintage Internet Archive descriptions.
 */
export function sanitizeDescription(raw?: any): string {
  if (!raw) return 'No synopsis available for this public domain film from Internet Archive.';

  let text = '';
  if (Array.isArray(raw)) {
    text = raw.filter(Boolean).map(String).join(' ');
  } else if (typeof raw === 'string') {
    text = raw;
  } else {
    text = String(raw);
  }

  // Remove HTML tags
  let clean = text.replace(/<[^>]*>?/gm, ' ');
  // Unescape common HTML entities
  clean = clean
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
    
  // Trim excessive whitespace
  clean = clean.replace(/\s+/g, ' ').trim();
  return clean || 'No synopsis available for this public domain film from Internet Archive.';
}

/**
 * Normalizes movie title by removing archiving filenames and timestamps.
 */
export function cleanMovieTitle(title?: string, identifier?: string): string {
  if (title && title.trim().length > 0) {
    let cleaned = title.trim();
    // Remove trailing "( Charles Chaplin-1915 )" format artifacts if redundant
    cleaned = cleaned.replace(/\s*\(\s*19\d\d\s*\)$/, '');
    return cleaned;
  }
  if (identifier) {
    // Convert camelCase or snake_case identifier to human readable
    return identifier
      .replace(/[_-]+/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .trim();
  }
  return 'Untitled Archive Film';
}

/**
 * Formats download count into readable K / M strings.
 */
export function formatDownloadCount(downloads?: number): string {
  if (!downloads || downloads <= 0) return '0 views';
  if (downloads >= 1_000_000) {
    return `${(downloads / 1_000_000).toFixed(1)}M views`;
  }
  if (downloads >= 1_000) {
    return `${(downloads / 1_000).toFixed(1)}K views`;
  }
  return `${downloads} views`;
}

/**
 * Formats file size in bytes into human readable MB or GB.
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return 'Unknown size';
  const megabytes = bytes / (1024 * 1024);
  if (megabytes >= 1024) {
    return `${(megabytes / 1024).toFixed(2)} GB`;
  }
  return `${megabytes.toFixed(1)} MB`;
}

/**
 * Generates direct primary thumbnail URL for an Internet Archive item.
 */
export function getArchiveThumbnailUrl(identifier: string): string {
  return `https://archive.org/services/img/${identifier}`;
}

/**
 * Generates official Internet Archive embed player URL.
 */
export function getArchiveEmbedUrl(identifier: string): string {
  return `https://archive.org/embed/${identifier}`;
}
