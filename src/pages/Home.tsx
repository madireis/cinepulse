import { useState, useEffect, useMemo } from 'react';
import { Movie, TvShow, tmdbService } from '../services/tmdb';
import HorizontalSlider from '../components/HorizontalSlider';
import { Play, Info, Tv, Sparkles, Zap, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { useWatchlist } from '../context/WatchlistContext';
import { Link, useNavigate } from 'react-router-dom';
import DecisionModal from '../components/DecisionModal';

interface TvSlideItem extends TvShow {
  // adapter shim so HorizontalSlider can render TV shows
  title: string;
  release_date: string;
  genre_ids: number[];
}

export default function Home() {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [trendingTv, setTrendingTv] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { watchlist, history, progress } = useWatchlist();
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleQuickPick = async () => {
    try {
      const randomPage = Math.floor(Math.random() * 5) + 1;
      const res = await tmdbService.getPopular(randomPage);
      if (res.results?.length > 0) {
        const randomMovie = res.results[Math.floor(Math.random() * res.results.length)];
        navigate(`/movie/${randomMovie.id}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [trendingRes, popularRes, topRatedRes, trendingTvRes] = await Promise.all([
          tmdbService.getTrending(),
          tmdbService.getPopular(),
          tmdbService.getTopRated(),
          tmdbService.getTrendingTv(),
        ]);
        setTrending(trendingRes.results || []);
        setPopular(popularRes.results || []);
        setTopRated(topRatedRes.results || []);
        // Map TV show fields to match Movie interface for HorizontalSlider
        setTrendingTv(
          (trendingTvRes.results || []).map((tv: any) => ({
            ...tv,
            title: tv.name,
            release_date: tv.first_air_date,
            genre_ids: tv.genre_ids ?? [],
            _isTV: true,
          }))
        );
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [watchlist.length, history.length]);

  const heroMovie = useMemo(() => trending[0], [trending]);

  const continueWatchingItems = useMemo(() => {
    const items = history.filter(h => progress[h.id]);
    // Sort by timestamp descending
    return items.sort((a, b) => progress[b.id].timestamp - progress[a.id].timestamp).slice(0, 10);
  }, [history, progress]);

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      {!loading && heroMovie && (
        <section className="relative h-[80vh] -mx-8 -mt-8 overflow-hidden">
          <img
            src={tmdbService.getImageUrl(heroMovie.backdrop_path, 'original')}
            alt={heroMovie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-bg via-brand-bg/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-bg/80 via-brand-bg/50 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl space-y-4 md:space-y-6"
            >
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-brand-primary/20 text-brand-primary text-xs md:text-sm font-bold tracking-wider rounded-md border border-brand-primary/30 backdrop-blur-sm">
                  NEW TRENDING
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold tracking-tight leading-tight text-white drop-shadow-2xl">
                {heroMovie.title}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-200 font-light leading-relaxed max-w-xl drop-shadow-lg line-clamp-3 md:line-clamp-none">
                {heroMovie.overview}
              </p>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                <Link
                  to={`/watch/movie/${heroMovie.id}`}
                  className="bg-brand-primary hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all hover:scale-105 shadow-2xl shadow-brand-primary/20"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>Watch Now</span>
                </Link>
                <Link
                  to={`/movie/${heroMovie.id}`}
                  className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all hover:scale-105 backdrop-blur-md border border-white/10"
                >
                  <Info className="w-5 h-5" />
                  <span>More Info</span>
                </Link>
                <button
                  onClick={handleQuickPick}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center space-x-3 transition-all hover:scale-105 border border-white/10 group"
                >
                  <Zap className="w-5 h-5 text-brand-primary group-hover:animate-pulse" />
                  <span>Quick Pick</span>
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <DecisionModal isOpen={isDecisionModalOpen} onClose={() => setIsDecisionModalOpen(false)} />

      {/* Content Rows */}
      <div className="space-y-16">
        {continueWatchingItems.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-primary" />
                <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight">Continue Watching</h2>
              </div>
            </div>
            <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-4">
              {continueWatchingItems.map((item: any) => {
                const prog = progress[item.id];
                const link = prog.type === 'tv' 
                  ? `/watch/tv/${item.id}?season=${prog.season}&episode=${prog.episode}`
                  : `/watch/movie/${item.id}`;
                return (
                  <Link key={item.id} to={link} className="shrink-0 w-48 md:w-64 group relative">
                    <div className="aspect-video rounded-xl overflow-hidden mb-2 bg-card-bg relative border border-white/5">
                      <img
                        src={tmdbService.getImageUrl(item.backdrop_path || item.poster_path, 'w500')}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm border border-white/10 group-hover:bg-brand-primary transition-colors shadow-xl">
                          <Play className="w-5 h-5 fill-white text-white ml-1" />
                        </div>
                      </div>
                      {prog.type === 'tv' && (
                        <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
                          <span className="text-[10px] font-bold text-white tracking-widest uppercase">
                            S{prog.season} E{prog.episode}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-semibold line-clamp-1 group-hover:text-brand-primary transition-colors">
                      {item.title}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}


        <HorizontalSlider title="Trending Movies" movies={trending} loading={loading} />

        {/* TV Shows row — clickable with TV routing */}
        {!loading && trendingTv.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tv className="w-5 h-5 text-brand-primary" />
                <h2 className="text-2xl font-display font-bold tracking-tight">Trending TV Shows</h2>
              </div>
              <Link to="/tv-shows" className="text-sm text-gray-500 hover:text-brand-primary transition-colors font-medium">
                See All →
              </Link>
            </div>
            <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-4">
              {trendingTv.slice(0, 12).map((tv: any) => (
                <Link key={tv.id} to={`/tv/${tv.id}`} className="shrink-0 w-40 group">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden mb-2 bg-card-bg">
                    <img
                      src={tmdbService.getImageUrl(tv.poster_path, 'w500')}
                      alt={tv.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <p className="text-xs font-semibold line-clamp-1 group-hover:text-brand-primary transition-colors">
                    {tv.name}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="py-12 bg-white/5 -mx-8 px-8 rounded-[4rem] border-y border-white/5">
          <HorizontalSlider title="Critics' Choice" movies={topRated} loading={loading} />
        </section>

        <HorizontalSlider title="Most Popular" movies={popular} loading={loading} />
      </div>
    </div>
  );
}
