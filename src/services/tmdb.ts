/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axios from 'axios';

const api = axios.create({
  baseURL: '/api/movies',
});

export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
  adult?: boolean;
  runtime?: number;
  tagline?: string;
  status?: string;
  budget?: number;
  revenue?: number;
  imdb_id?: string;
}

export interface TvShow {
  id: number;
  name: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  vote_average: number;
  first_air_date: string;
  genre_ids: number[];
  external_ids?: { imdb_id?: string };
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: TvSeason[];
  tagline?: string;
  status?: string;
  imdb_id?: string;
}

export interface TvSeason {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
  poster_path: string;
  air_date: string;
  overview: string;
  episodes?: TvEpisode[];
}

export interface TvEpisode {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string;
  air_date: string;
  vote_average: number;
  runtime: number;
}

export interface Genre {
  id: number;
  name: string;
}

export const tmdbService = {
  // ─── Movies ─────────────────────────────────────────────────────────────────
  getTrending: async (page = 1) => {
    const { data } = await api.get('/trending/movie/day', { params: { page } });
    return data;
  },

  getPopular: async (page = 1) => {
    const { data } = await api.get('/movie/popular', { params: { page } });
    return data;
  },

  getTopRated: async (page = 1) => {
    const { data } = await api.get('/movie/top_rated', { params: { page } });
    return data;
  },

  getUpcoming: async (page = 1) => {
    const { data } = await api.get('/movie/upcoming', { params: { page } });
    return data;
  },

  getMovieDetails: async (movieId: number) => {
    const { data } = await api.get(`/movie/${movieId}`, {
      params: { append_to_response: 'videos,credits,similar,recommendations,external_ids' },
    });
    return data;
  },

  searchMovies: async (query: string, page = 1) => {
    const { data } = await api.get('/search/movie', { params: { query, page } });
    return data;
  },

  searchPeople: async (query: string, page = 1) => {
    const { data } = await api.get('/search/person', { params: { query, page } });
    return data;
  },

  getPersonMovies: async (personId: number) => {
    const { data } = await api.get(`/person/${personId}/movie_credits`);
    return data;
  },

  getGenres: async () => {
    const { data } = await api.get('/genre/movie/list');
    return data.genres;
  },

  discoverMovies: async (params: any) => {
    const { data } = await api.get('/discover/movie', { params });
    return data;
  },

  // ─── TV Shows ────────────────────────────────────────────────────────────────
  getTrendingTv: async (page = 1) => {
    const { data } = await api.get('/trending/tv/day', { params: { page } });
    return data;
  },

  getPopularTv: async (page = 1) => {
    const { data } = await api.get('/tv/popular', { params: { page } });
    return data;
  },

  getTopRatedTv: async (page = 1) => {
    const { data } = await api.get('/tv/top_rated', { params: { page } });
    return data;
  },

  getTvDetails: async (tvId: number) => {
    const { data } = await api.get(`/tv/${tvId}`, {
      params: { append_to_response: 'videos,credits,similar,recommendations,external_ids' },
    });
    return data;
  },

  getTvSeason: async (tvId: number, season: number) => {
    const { data } = await api.get(`/tv/${tvId}/season/${season}`);
    return data;
  },

  searchTv: async (query: string, page = 1) => {
    const { data } = await api.get('/search/tv', { params: { query, page } });
    return data;
  },

  searchMulti: async (query: string, page = 1) => {
    const { data } = await api.get('/search/multi', { params: { query, page } });
    return data;
  },

  getTvGenres: async () => {
    const { data } = await api.get('/genre/tv/list');
    return data.genres;
  },

  discoverTv: async (params: any) => {
    const { data } = await api.get('/discover/tv', { params });
    return data;
  },

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  getImageUrl: (path: string, size: 'w300' | 'w500' | 'original' = 'w500') => {
    if (!path) return `https://placehold.co/500x750/1A1C22/666666?text=No+Image`;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  },

  getTrailerUrl: (videos: any[]) => {
    const trailer = videos?.find((v) => v.type === 'Trailer' && v.site === 'YouTube');
    return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
  },
};
