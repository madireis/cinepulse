import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tmdbService, Movie } from '../services/tmdb';
import { Star, Clock, Calendar, Play, Heart, CheckCircle2 } from 'lucide-react';
import { cn, formatCurrency, formatRuntime } from '../lib/utils';
import { motion } from 'motion/react';
import { useWatchlist } from '../context/WatchlistContext';

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toggleWatchlist, isInWatchlist, addToHistory } = useWatchlist();

  useEffect(() => {
    async function getDetails() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await tmdbService.getMovieDetails(parseInt(id));
        setMovie(data);
        addToHistory(data);
      } catch (error) {
        console.error('Error fetching movie details:', error);
      } finally {
        setLoading(false);
      }
    }
    getDetails();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-primary" />
    </div>
  );

  if (!movie) return <div className="text-center py-20 text-gray-400 text-6xl">Movie not found</div>;

  const trailerUrl = tmdbService.getTrailerUrl(movie.videos?.results);
  const inWatchlist = isInWatchlist(movie.id);
  const imdbId = movie.imdb_id || movie.external_ids?.imdb_id;

  return (
    <>
      <div className="space-y-12 pb-20">
        {/* Hero Section */}
        <div className="relative h-[60vh] md:h-[85vh] -m-4 md:-m-8 overflow-hidden">
          <img
            src={tmdbService.getImageUrl(movie.backdrop_path, 'original')}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-bg/80 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-16 z-10 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 md:space-y-6"
            >
              <div className="flex items-center space-x-3">
                <span className="bg-brand-primary text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-brand-primary/20">
                  Movie
                </span>
                <div className="flex items-center space-x-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-yellow-500" />
                  <span className="text-sm font-bold">{movie.vote_average.toFixed(1)} / 10</span>
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold tracking-tight leading-tight">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 md:space-x-6 mt-4 md:mt-6 text-gray-300 font-medium text-sm md:text-base">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(movie.release_date).getFullYear()}</span>
                </div>
                <p className="text-brand-primary">{movie.genres?.map((g: any) => g.name).join(', ')}</p>
              </div>

              <p className="mt-4 md:mt-8 text-base md:text-xl text-gray-300 font-light leading-relaxed max-w-3xl line-clamp-4 md:line-clamp-none">
                {movie.overview}
              </p>
            </motion.div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-6 md:mt-10">
              <Link
                to={`/watch/movie/${id}`}
                className="bg-brand-primary hover:bg-red-700 text-white px-10 py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-transform hover:scale-105 shadow-2xl shadow-brand-primary/20"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>Watch Now</span>
              </Link>
              <button
                onClick={() => toggleWatchlist(movie)}
                className={cn(
                  "px-10 py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all duration-300 border backdrop-blur-xl hover:scale-105",
                  inWatchlist
                    ? "bg-white/20 text-white border-white/40"
                    : "bg-white/10 text-white border-white/10 hover:bg-white/20"
                )}
              >
                {inWatchlist ? <CheckCircle2 className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
                <span>{inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12 mt-8 md:mt-12 relative z-10 px-4 md:px-8">
          <div className="flex-1 space-y-12 md:space-y-16 w-full">
            <section>
              <h2 className="text-3xl font-display font-bold mb-6 tracking-tight">Overview</h2>
              <p className="text-xl text-gray-400 leading-relaxed font-light">
                {movie.overview}
              </p>
            </section>

            {trailerUrl && (
              <section>
                <h2 className="text-3xl font-display font-bold mb-6 tracking-tight">Trailer</h2>
                <div className="aspect-video w-full rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                  <iframe
                    src={trailerUrl}
                    title="Movie Trailer"
                    className="w-full h-full border-none"
                    allowFullScreen
                  />
                </div>
              </section>
            )}

            <section>
              <h2 className="text-3xl font-display font-bold mb-6 tracking-tight">Top Cast</h2>
              <div className="flex flex-wrap gap-5">
                {movie.credits?.cast?.slice(0, 12).map((person: any) => (
                  <Link key={person.id} to={`/person/${person.id}`} className="text-center group w-28">
                    <div className="w-28 h-28 rounded-full overflow-hidden mb-3 border-2 border-white/5 group-hover:border-brand-primary transition-colors mx-auto">
                      <img
                        src={tmdbService.getImageUrl(person.profile_path, 'w500')}
                        alt={person.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                    </div>
                    <p className="font-semibold text-sm group-hover:text-brand-primary transition-colors leading-tight">{person.name}</p>
                    <p className="text-xs text-gray-500 line-clamp-1 italic mt-0.5">{person.character}</p>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <div className="w-full lg:w-80 shrink-0 space-y-8">
            <section className="bg-white/5 rounded-3xl pt-10 px-6 md:px-8 pb-8 border border-white/10 space-y-8">
              <h3 className="text-xl font-display font-bold tracking-tight text-white">Production Info</h3>
              <div className="space-y-4">
                <div>
                   <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Budget</p>
                  <p className="text-base font-medium">{formatCurrency(movie.budget)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Revenue</p>
                  <p className="text-base font-medium">{formatCurrency(movie.revenue)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Languages</p>
                  <p className="text-base font-medium">{movie.spoken_languages?.map((l: any) => l.name).join(', ')}</p>
                </div>
                {imdbId && (
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">IMDB</p>
                    <a
                      href={`https://www.imdb.com/title/${imdbId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-primary hover:underline text-xs font-mono break-all"
                    >
                      {imdbId}
                    </a>
                  </div>
                )}
              </div>
            </section>

            {/* Similar Movies */}
            <section className="space-y-4">
              <h3 className="text-xl font-display font-bold tracking-tight px-2">Similar Movies</h3>
              <div className="grid grid-cols-2 gap-4">
                {movie.similar?.results?.slice(0, 4).map((m: Movie) => (
                  <a key={m.id} href={`/movie/${m.id}`} className="group cursor-pointer">
                    <div className="aspect-[2/3] rounded-xl overflow-hidden mb-2">
                      <img
                        src={tmdbService.getImageUrl(m.poster_path)}
                        alt={m.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                    </div>
                    <p className="text-xs font-semibold line-clamp-1">{m.title}</p>
                  </a>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

    </>
  );
}
