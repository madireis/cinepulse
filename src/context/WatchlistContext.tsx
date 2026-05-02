import React, { createContext, useContext, useState, useEffect } from 'react';
import { Movie } from '../services/tmdb';

export interface PlaybackProgress {
  id: number;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  timestamp: number;
}

interface WatchlistContextType {
  watchlist: Movie[];
  history: Movie[];
  progress: Record<number, PlaybackProgress>;
  toggleWatchlist: (movie: Movie) => void;
  isInWatchlist: (movieId: number) => boolean;
  addToHistory: (movie: Movie) => void;
  clearHistory: () => void;
  updateProgress: (progress: PlaybackProgress) => void;
  getProgress: (id: number) => PlaybackProgress | undefined;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState<Movie[]>(() => {
    try {
      const saved = localStorage.getItem('cinepulse_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [history, setHistory] = useState<Movie[]>(() => {
    try {
      const saved = localStorage.getItem('cinepulse_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [progress, setProgress] = useState<Record<number, PlaybackProgress>>(() => {
    try {
      const saved = localStorage.getItem('cinepulse_progress');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('cinepulse_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('cinepulse_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('cinepulse_progress', JSON.stringify(progress));
  }, [progress]);

  const toggleWatchlist = (movie: Movie) => {
    setWatchlist((prev) => {
      const exists = prev.find((m) => m.id === movie.id);
      if (exists) {
        return prev.filter((m) => m.id !== movie.id);
      }
      return [movie, ...prev];
    });
  };

  const isInWatchlist = (movieId: number) => {
    return watchlist.some((m) => m.id === movieId);
  };

  const addToHistory = (movie: Movie) => {
    setHistory((prev) => {
      const filtered = prev.filter(m => m.id !== movie.id);
      return [movie, ...filtered].slice(0, 50);
    });
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const updateProgress = (newProgress: PlaybackProgress) => {
    setProgress((prev) => ({
      ...prev,
      [newProgress.id]: {
        ...newProgress,
        timestamp: Date.now()
      }
    }));
  };

  const getProgress = (id: number) => {
    return progress[id];
  };

  return (
    <WatchlistContext.Provider value={{ 
      watchlist, 
      history, 
      progress,
      toggleWatchlist, 
      isInWatchlist, 
      addToHistory, 
      clearHistory,
      updateProgress,
      getProgress
    }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}
