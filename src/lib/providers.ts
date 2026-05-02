// Stream provider configuration
// Add or remove providers here — the Watch page will automatically pick them up.

export interface StreamProvider {
  id: string;
  name: string;
  /** URL builder — return null if provider doesn't support this type */
  getUrl: (params: {
    type: 'movie' | 'tv';
    tmdbId: number;
    imdbId?: string;
    season?: number;
    episode?: number;
  }) => string | null;
}

export const STREAM_PROVIDERS: StreamProvider[] = [
  {
    id: 'vidsrc',
    name: 'VidSrc',
    getUrl: ({ type, tmdbId, imdbId, season, episode }) => {
      const base = 'https://vidsrc.to/embed';
      if (type === 'movie') return `${base}/movie/${imdbId || tmdbId}`;
      if (type === 'tv' && season != null && episode != null)
        return `${base}/tv/${imdbId || tmdbId}/${season}/${episode}`;
      return null;
    },
  },
  {
    id: 'vidsrc2',
    name: 'VidSrc 2',
    getUrl: ({ type, tmdbId, imdbId, season, episode }) => {
      const base = 'https://vidsrc.me/embed';
      if (type === 'movie') return `${base}/movie?tmdb=${tmdbId}`;
      if (type === 'tv' && season != null && episode != null)
        return `${base}/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
      return null;
    },
  },
  {
    id: 'superembed',
    name: 'SuperEmbed',
    getUrl: ({ type, tmdbId, season, episode }) => {
      if (type === 'movie')
        return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;
      if (type === 'tv' && season != null && episode != null)
        return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`;
      return null;
    },
  },
  {
    id: '2embed',
    name: '2Embed',
    getUrl: ({ type, tmdbId, season, episode }) => {
      if (type === 'movie')
        return `https://www.2embed.cc/embed/${tmdbId}`;
      if (type === 'tv' && season != null && episode != null)
        return `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`;
      return null;
    },
  },
  {
    id: 'vidsrc_embed',
    name: 'VidSrc Pro',
    getUrl: ({ type, tmdbId, imdbId, season, episode }) => {
      const base = 'https://vidsrc-embed.ru/embed';
      if (type === 'movie') {
        if (imdbId) return `${base}/movie?imdb=${imdbId}&autoplay=1`;
        return `${base}/movie?tmdb=${tmdbId}&autoplay=1`;
      }
      if (type === 'tv' && season != null && episode != null) {
        if (imdbId) return `${base}/tv?imdb=${imdbId}&season=${season}&episode=${episode}&autoplay=1`;
        return `${base}/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}&autoplay=1`;
      }
      return null;
    },
  },
];

export const DEFAULT_PROVIDER_ID = 'vidsrc';

export function getStoredProviderId(): string {
  return localStorage.getItem('cinepulse_provider') ?? DEFAULT_PROVIDER_ID;
}

export function setStoredProviderId(id: string): void {
  localStorage.setItem('cinepulse_provider', id);
}
