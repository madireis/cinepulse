import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import { MovieCard, MovieSkeleton } from './MovieCard';
import { Movie } from '../services/tmdb';

interface HorizontalSliderProps {
  title: string;
  movies: Movie[];
  loading?: boolean;
}

export default function HorizontalSlider({ title, movies, loading }: HorizontalSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-display font-semibold tracking-tight text-white">{title}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex space-x-4 overflow-x-auto no-scrollbar scroll-smooth px-2 pb-4"
      >
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="min-w-[140px] w-[140px] md:min-w-[180px] md:w-[180px]">
                <MovieSkeleton />
              </div>
            ))
          : movies.map((movie) => (
              <div key={movie.id} className="min-w-[140px] w-[140px] md:min-w-[180px] md:w-[180px]">
                <MovieCard movie={movie} />
              </div>
            ))}
      </div>
    </div>
  );
}
