import React, { useMemo } from 'react';
import { useWatchlist } from '../context/WatchlistContext';
import { motion } from 'motion/react';
import { BarChart3, Clock, Film, Tv, Trophy, Sparkles } from 'lucide-react';
import { tmdbService, Movie, TvShow } from '../services/tmdb';
import { Link } from 'react-router-dom';

export default function Stats() {
  const { history } = useWatchlist();

  // Aggregate stats
  const stats = useMemo(() => {
    let movieCount = 0;
    let tvCount = 0;
    let totalMinutes = 0;
    const genreCounts: Record<number, number> = {};

    history.forEach((item) => {
      // Determine if TV or Movie based on presence of first_air_date or title
      const isTv = 'first_air_date' in item || !('title' in item);
      if (isTv) tvCount++;
      else movieCount++;

      // Approximate runtime if exact isn't available
      // Movies avg ~110m, TV avg ~45m per episode watched
      const runtime = (item as any).runtime || (isTv ? 45 : 110);
      totalMinutes += runtime;

      // Count genres
      if (item.genre_ids) {
        item.genre_ids.forEach((gId) => {
          genreCounts[gId] = (genreCounts[gId] || 0) + 1;
        });
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // Find top genre IDs
    const topGenreIds = Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([id]) => parseInt(id));

    return {
      movieCount,
      tvCount,
      hours,
      minutes,
      totalWatched: history.length,
      topGenreIds,
    };
  }, [history]);

  // We need a small dictionary to map genre IDs back to names for UI
  // Usually this is fetched, but we can hardcode the main ones for speed in stats
  const GENRE_MAP: Record<number, string> = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
    99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
    27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
    10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
    10759: 'Action & Adventure', 10762: 'Kids', 10765: 'Sci-Fi & Fantasy'
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-6 text-center">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <BarChart3 className="w-12 h-12 text-brand-primary/50" />
        </div>
        <h2 className="text-4xl font-display font-bold">No Data Yet</h2>
        <p className="text-gray-400 text-lg max-w-md">
          Start watching movies and TV shows to build your personalized viewing analytics!
        </p>
        <Link to="/browse" className="px-8 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-red-700 transition-colors">
          Explore Content
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <div>
        <h1 className="text-5xl font-display font-bold tracking-tight mb-2 text-white">Your Analytics</h1>
        <p className="text-gray-400 text-lg">A breakdown of your viewing habits and history.</p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-primary/10 rounded-full blur-2xl group-hover:bg-brand-primary/20 transition-colors" />
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Clock className="w-6 h-6 text-brand-primary" />
            </div>
            <h3 className="text-gray-400 font-semibold uppercase tracking-wider text-sm">Time Watched</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-display font-bold text-white">{stats.hours}</span>
            <span className="text-gray-400 font-medium">h</span>
            <span className="text-4xl font-display font-bold text-white ml-2">{stats.minutes}</span>
            <span className="text-gray-400 font-medium">m</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Film className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-gray-400 font-semibold uppercase tracking-wider text-sm">Movies</h3>
          </div>
          <p className="text-4xl font-display font-bold text-white">{stats.movieCount}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors" />
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Tv className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-gray-400 font-semibold uppercase tracking-wider text-sm">TV Shows</h3>
          </div>
          <p className="text-4xl font-display font-bold text-white">{stats.tvCount}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl group-hover:bg-yellow-500/20 transition-colors" />
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="text-gray-400 font-semibold uppercase tracking-wider text-sm">Total Titles</h3>
          </div>
          <p className="text-4xl font-display font-bold text-white">{stats.totalWatched}</p>
        </motion.div>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Top Genres */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-2xl font-display font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-primary" /> Top Genres
          </h2>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
            {stats.topGenreIds.length > 0 ? (
              stats.topGenreIds.map((id, index) => (
                <div key={id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-display font-bold text-gray-500">#{index + 1}</span>
                    <span className="text-lg font-bold text-white">{GENRE_MAP[id] || 'Unknown Genre'}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">Not enough data to determine favorite genres.</p>
            )}
          </div>
        </div>

        {/* Recent Watch History */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-display font-bold flex items-center gap-2">
            <Clock className="w-6 h-6 text-brand-primary" /> Recently Watched
          </h2>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="space-y-4">
              {history.slice(0, 10).map((item, index) => {
                const isTv = 'first_air_date' in item || !('title' in item);
                const title = isTv ? (item as unknown as TvShow).name : (item as Movie).title;
                const link = isTv ? `/tv/${item.id}` : `/movie/${item.id}`;
                
                return (
                  <Link key={`${item.id}-${index}`} to={link}>
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/10 border border-transparent hover:border-white/10 transition-colors group"
                    >
                      <img 
                        src={tmdbService.getImageUrl(item.poster_path, 'w300')} 
                        alt={title}
                        className="w-12 h-16 object-cover rounded-lg shadow-md"
                      />
                      <div className="flex-1">
                        <h4 className="text-white font-bold group-hover:text-brand-primary transition-colors">{title}</h4>
                        <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                          {isTv ? <Tv className="w-3 h-3" /> : <Film className="w-3 h-3" />}
                          {isTv ? 'TV Series' : 'Movie'}
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
            {history.length > 10 && (
              <div className="mt-6 text-center">
                <Link to="/history" className="text-brand-primary hover:text-red-400 font-medium transition-colors">
                  View Full History →
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
