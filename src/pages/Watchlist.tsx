import React from 'react';
import { Bookmark } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { MovieCard } from '../components/MovieCard';

export default function Watchlist() {
  const { watchlist } = useWatchlist();

  if (watchlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4 text-center">
        <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center">
          <Bookmark className="w-10 h-10 text-brand-primary" />
        </div>
        <h1 className="text-3xl font-display font-bold">Your Watchlist is empty</h1>
        <p className="text-gray-400 max-w-md font-light">
          Movies you add to your watchlist will appear here. Sign in to sync your list across devices.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <h1 className="text-3xl font-display font-bold tracking-tight">Your Watchlist</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {watchlist.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}
