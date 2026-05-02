import React from 'react';
import { History as HistoryIcon, Trash2 } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { MovieCard } from '../components/MovieCard';

export default function History() {
  const { history, clearHistory } = useWatchlist();

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4 text-center">
        <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center">
          <HistoryIcon className="w-10 h-10 text-brand-primary" />
        </div>
        <h1 className="text-3xl font-display font-bold">No Watch History</h1>
        <p className="text-gray-400 max-w-md font-light">
          Movies you watch will appear here so you can easily find them again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold tracking-tight">Watch History</h1>
        <button
          onClick={clearHistory}
          className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-brand-primary rounded-xl transition-all border border-white/10"
        >
          <Trash2 className="w-4 h-4" />
          <span className="font-semibold text-sm">Clear History</span>
        </button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {history.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}
