export interface Movie {
  identifier: string;
  title: string;
  description: string;
  year?: number | string;
  creator?: string;
  downloads?: number;
  mediatype?: string;
  publicdate?: string;
  posterUrl: string;
  category?: string;
}

export interface ArchiveMetadataFile {
  name: string;
  source?: string;
  format?: string;
  size?: string | number;
  length?: string | number;
  title?: string;
  height?: string | number;
  width?: string | number;
}

export interface MovieMetadata {
  identifier: string;
  title: string;
  description: string;
  year?: string | number;
  creator?: string;
  licenseurl?: string;
  runtime?: string;
  addeddate?: string;
  server?: string;
  dir?: string;
  files: ArchiveMetadataFile[];
  playableStreams: {
    url: string;
    format: string;
    name: string;
    sizeBytes?: number;
    isPreferred: boolean;
  }[];
}

export interface WatchlistItem {
  identifier: string;
  title: string;
  year?: number | string;
  creator?: string;
  posterUrl: string;
  addedAt: number;
  downloads?: number;
}

export interface CategoryInfo {
  id: string;
  title: string;
  subtitle: string;
  query: string;
  iconName: string;
  description: string;
}

export type ActiveTab = 'home' | 'search' | 'categories' | 'watchlist' | 'code';
