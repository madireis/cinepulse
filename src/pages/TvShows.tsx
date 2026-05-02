import React, { useState, useEffect, useCallback } from 'react';
import { tmdbService } from '../services/tmdb';
import { Link } from 'react-router-dom';
import { Star, Tv, Play } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';

interface TvCardProps {
  show: any;
}

const TvCard: React.FC<TvCardProps> = ({ show }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <Link to={`/tv/${show.id}`}>
      <motion.div
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative group cursor-pointer overflow-hidden rounded-xl bg-card-bg aspect-[2/3]"
      >
        <img
          src={tmdbService.getImageUrl(show.poster_path, 'w500')}
          alt={show.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <h3 className="font-semibold text-sm line-clamp-1">{show.name}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-medium">{show.vote_average?.toFixed(1)}</span>
          </div>
        </div>
        {hovered && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="p-4 rounded-full bg-brand-primary text-white shadow-2xl scale-100 transition-transform duration-300">
              <Play className="w-6 h-6 fill-white" />
            </div>
          </div>
        )}
      </motion.div>
    </Link>
  );
}

function TvSkeleton() {
  return <div className="animate-pulse rounded-xl bg-gray-800 aspect-[2/3]" />;
}

export default function TvShows() {
  const [shows, setShows] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [minRating, setMinRating] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const { ref, inView } = useInView();

  const fetchShows = useCallback(async (pageNum: number, isNew = false) => {
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

      const data = await tmdbService.discoverTv(params);
      if (isNew) {
        setShows(data.results);
      } else {
        setShows((prev) => [...prev, ...data.results]);
      }
      setHasMore(data.page < data.total_pages);
    } catch (error) {
      console.error('Error fetching TV shows:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedGenre, sortBy, minRating]);

  useEffect(() => {
    async function getGenres() {
      const genreList = await tmdbService.getTvGenres();
      setGenres(genreList);
    }
    getGenres();
  }, []);

  useEffect(() => {
    setPage(1);
    fetchShows(1, true);
  }, [selectedGenre, sortBy, minRating, fetchShows]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      const next = page + 1;
      setPage(next);
      fetchShows(next);
    }
  }, [inView, hasMore, loading, page, fetchShows]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Tv className="w-7 h-7 text-brand-primary" />
          <h1 className="text-3xl font-display font-bold tracking-tight">TV Shows</h1>
        </div>

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
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer"
          >
            <option value="popularity.desc">Popularity</option>
            <option value="vote_average.desc">Rating</option>
            <option value="first_air_date.desc">Latest</option>
          </select>
        </div>
      </div>

      {/* Genre Pills */}
      <div className="flex overflow-x-auto no-scrollbar space-x-2 py-2">
        <button
          onClick={() => setSelectedGenre('')}
          className={cn(
            'px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
            selectedGenre === '' ? 'bg-brand-primary text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
          )}
        >
          All
        </button>
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => setSelectedGenre(genre.id.toString())}
            className={cn(
              'px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              selectedGenre === genre.id.toString()
                ? 'bg-brand-primary text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            )}
          >
            {genre.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {shows.map((show) => (
          <TvCard key={show.id} show={show} />
        ))}
        {loading && Array.from({ length: 10 }).map((_, i) => <TvSkeleton key={i} />)}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={ref} className="h-20 flex items-center justify-center">
        {loading && <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-primary" />}
      </div>
    </div>
  );
}
