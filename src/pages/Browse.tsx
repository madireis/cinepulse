import React, { useState, useEffect, useCallback } from 'react';
import { Movie, Genre, tmdbService } from '../services/tmdb';
import { MovieCard, MovieSkeleton } from '../components/MovieCard';
import { LayoutGrid, List as ListIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useInView } from 'react-intersection-observer';

export default function Browse() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [minRating, setMinRating] = useState<number>(0);
  const [runtimeRange, setRuntimeRange] = useState<string>('any');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const { ref, inView } = useInView();

  const fetchMovies = useCallback(async (pageNum: number, isNew = false) => {
    setLoading(true);
    try {
      const params: any = {
        with_genres: selectedGenre,
        sort_by: sortBy,
        page: pageNum,
      };

      if (minRating > 0) {
        params['vote_average.gte'] = minRating;
        params['vote_count.gte'] = 50;
      }

      if (runtimeRange === 'short') params['with_runtime.lte'] = 90;
      else if (runtimeRange === 'med') {
        params['with_runtime.gte'] = 90;
        params['with_runtime.lte'] = 120;
      }
      else if (runtimeRange === 'long') params['with_runtime.gte'] = 120;

      const data = await tmdbService.discoverMovies(params);
      
      if (isNew) {
        setMovies(data.results);
      } else {
        setMovies(prev => [...prev, ...data.results]);
      }
      setHasMore(data.page < data.total_pages);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedGenre, sortBy, minRating, runtimeRange]);

  useEffect(() => {
    async function getGenres() {
      const genreList = await tmdbService.getGenres();
      setGenres(genreList);
    }
    getGenres();
  }, []);

  useEffect(() => {
    setPage(1);
    fetchMovies(1, true);
  }, [selectedGenre, sortBy, minRating, runtimeRange, fetchMovies]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMovies(nextPage);
    }
  }, [inView, hasMore, loading, page, fetchMovies]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-display font-bold tracking-tight">Browse</h1>
        
        <div className="flex items-center space-x-4">
          {/* View Toggle */}
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-md transition-all",
                viewMode === 'grid' ? "bg-brand-primary text-white" : "text-gray-400 hover:text-white"
              )}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-md transition-all",
                viewMode === 'list' ? "bg-brand-primary text-white" : "text-gray-400 hover:text-white"
              )}
            >
              <ListIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer"
            >
              <option value={0}>Any Rating</option>
              <option value={8}>8.0+ Rating</option>
              <option value={7}>7.0+ Rating</option>
              <option value={6}>6.0+ Rating</option>
            </select>

            <select
              value={runtimeRange}
              onChange={(e) => setRuntimeRange(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer"
            >
              <option value="any">Any Runtime</option>
              <option value="short">Under 90 mins</option>
              <option value="med">90 - 120 mins</option>
              <option value="long">Over 120 mins</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer"
            >
              <option value="popularity.desc">Popularity</option>
              <option value="vote_average.desc">Rating</option>
              <option value="primary_release_date.desc">Latest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Genre Pills */}
      <div className="flex overflow-x-auto no-scrollbar space-x-2 py-2">
        <button
          onClick={() => setSelectedGenre('')}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
            selectedGenre === '' ? "bg-brand-primary text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
          )}
        >
          All
        </button>
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => setSelectedGenre(genre.id.toString())}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
              selectedGenre === genre.id.toString() ? "bg-brand-primary text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
            )}
          >
            {genre.name}
          </button>
        ))}
      </div>

      {/* Grid Content */}
      <div className={cn(
        "grid gap-6",
        viewMode === 'grid' 
          ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" 
          : "grid-cols-1"
      )}>
        {movies.map((movie) => (
          <MovieCard 
            key={movie.id} 
            movie={movie} 
            variant={viewMode === 'grid' ? 'portrait' : 'landscape'} 
          />
        ))}

        {loading && Array.from({ length: 10 }).map((_, i) => (
          <MovieSkeleton key={i} variant={viewMode === 'grid' ? 'portrait' : 'landscape'} />
        ))}
      </div>

      {/* Infinite Scroll Trigger */}
      <div ref={ref} className="h-20 flex items-center justify-center">
        {loading && <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-primary" />}
      </div>
    </div>
  );
}
