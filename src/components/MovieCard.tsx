import React, { useState } from 'react';
import { Movie, tmdbService } from '../services/tmdb';
import { cn } from '../lib/utils';
import { Star, Plus, Check, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';
import PreviewModal from './PreviewModal';

interface MovieCardProps {
  movie: Movie;
  variant?: 'portrait' | 'landscape';
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, variant = 'portrait' }) => {
  const { toggleWatchlist, isInWatchlist } = useWatchlist();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const inWatchlist = isInWatchlist(movie.id);

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist(movie);
  };

  const handlePreviewClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const details = await tmdbService.getMovieDetails(movie.id);
      const url = tmdbService.getTrailerUrl(details.videos?.results);
      setTrailerUrl(url);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error('Error fetching trailer:', error);
      setIsPreviewOpen(true);
    }
  };

  return (
    <>
      <div className="relative group">
        <Link to={`/movie/${movie.id}`}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "relative cursor-pointer overflow-hidden rounded-xl bg-card-bg",
              variant === 'portrait' ? "aspect-[2/3]" : "aspect-video"
            )}
          >
            <img
              src={tmdbService.getImageUrl(variant === 'portrait' ? movie.poster_path : movie.backdrop_path, 'w500')}
              alt={movie.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <h3 className="font-semibold text-sm line-clamp-1">{movie.title}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-medium">{movie.vote_average.toFixed(1)}</span>
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
               <button 
                onClick={handlePreviewClick}
                className="p-4 rounded-full bg-brand-primary text-white shadow-2xl scale-0 group-hover:scale-100 transition-transform duration-300 pointer-events-auto hover:scale-110 active:scale-90"
               >
                 <Play className="w-6 h-6 fill-white" />
               </button>
            </div>
          </motion.div>
        </Link>
        
        <button
          onClick={handleWatchlistClick}
          className={cn(
            "absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100 z-10",
            inWatchlist 
              ? "bg-brand-primary text-white scale-110" 
              : "bg-black/50 text-white hover:bg-white/20 hover:scale-110"
          )}
          title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
        >
          {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      <PreviewModal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        trailerUrl={trailerUrl} 
        title={movie.title} 
      />
    </>
  );
}

export const MovieSkeleton: React.FC<{ variant?: 'portrait' | 'landscape' }> = ({ variant = 'portrait' }) => {
  return (
    <div className={cn(
      "animate-pulse rounded-xl bg-gray-800",
      variant === 'portrait' ? "aspect-[2/3]" : "aspect-video"
    )} />
  );
}
