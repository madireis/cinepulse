import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { tmdbService, TvShow, TvSeason, TvEpisode } from '../services/tmdb';
import { Star, Calendar, Play, Heart, CheckCircle2, Tv, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useWatchlist } from '../context/WatchlistContext';

export default function TvDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [show, setShow] = useState<TvShow | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [seasonData, setSeasonData] = useState<TvSeason | null>(null);
  const [seasonLoading, setSeasonLoading] = useState(false);
  const [expandedSeason, setExpandedSeason] = useState(true);
  const { toggleWatchlist, isInWatchlist, progress } = useWatchlist();

  const handlePlayEpisode = (season: number, episode: number) => {
    navigate(`/watch/tv/${id}?season=${season}&episode=${episode}`);
  };

  const showProgress = id ? progress[parseInt(id)] : undefined;

  const handlePlayShow = () => {
    if (showProgress && showProgress.season && showProgress.episode) {
      navigate(`/watch/tv/${id}?season=${showProgress.season}&episode=${showProgress.episode}`);
      return;
    }
    const firstSeason = show?.seasons?.find((s) => s.season_number > 0);
    if (firstSeason) navigate(`/watch/tv/${id}?season=${firstSeason.season_number}&episode=1`);
  };

  useEffect(() => {
    async function getDetails() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await tmdbService.getTvDetails(parseInt(id));
        setShow(data);
        // Auto-select first available season (skip season 0 = specials)
        const firstSeason = data.seasons?.find((s: TvSeason) => s.season_number > 0);
        if (firstSeason) setSelectedSeason(firstSeason.season_number);
      } catch (error) {
        console.error('Error fetching TV details:', error);
      } finally {
        setLoading(false);
      }
    }
    getDetails();
    window.scrollTo(0, 0);
  }, [id]);

  // Fetch season episodes when selectedSeason changes
  useEffect(() => {
    if (!id || !show) return;
    async function fetchSeason() {
      setSeasonLoading(true);
      try {
        const data = await tmdbService.getTvSeason(parseInt(id!), selectedSeason);
        setSeasonData(data);
      } catch (error) {
        console.error('Error fetching season:', error);
      } finally {
        setSeasonLoading(false);
      }
    }
    fetchSeason();
  }, [id, selectedSeason, show]);

  if (loading) return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-primary" />
    </div>
  );

  if (!show) return <div className="text-center py-20 text-gray-400 text-4xl">Show not found</div>;

  const imdbId = show.external_ids?.imdb_id;
  const inWatchlist = isInWatchlist(show.id);
  const trailerUrl = tmdbService.getTrailerUrl((show as any).videos?.results);
  const availableSeasons = show.seasons?.filter((s) => s.season_number > 0) ?? [];

  return (
    <div className="space-y-12 pb-20">
      {/* Hero */}
      <div className="relative h-[60vh] md:h-[85vh] -m-4 md:-m-8 overflow-hidden">
          <img
            src={tmdbService.getImageUrl(show.backdrop_path, 'original')}
            alt={show.name}
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
                  TV Series
                </span>
                <div className="flex items-center space-x-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-yellow-500" />
                  <span className="text-sm font-bold">{show.vote_average.toFixed(1)} / 10</span>
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold tracking-tight leading-tight">{show.name}</h1>

              <div className="flex flex-wrap items-center gap-4 md:space-x-6 mt-4 md:mt-6 text-gray-300 font-medium text-sm md:text-base">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(show.first_air_date).getFullYear()}</span>
                </div>
                <span className="text-gray-500">·</span>
                <span>{show.number_of_seasons} Season{show.number_of_seasons !== 1 ? 's' : ''}</span>
                <span className="text-gray-500">·</span>
                <span>{show.number_of_episodes} Episodes</span>
                <span className="text-brand-primary">{show.status}</span>
              </div>

              <p className="mt-4 md:mt-8 text-base md:text-xl text-gray-300 font-light leading-relaxed max-w-3xl line-clamp-4 md:line-clamp-none">
                {show.overview}
              </p>
            </motion.div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-6 md:mt-10">
              <button
                onClick={handlePlayShow}
                className="bg-brand-primary hover:bg-red-700 text-white px-10 py-4 rounded-xl font-bold flex items-center space-x-2 transition-transform hover:scale-105 shadow-2xl shadow-brand-primary/20"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>{showProgress ? 'Continue Watching' : 'Watch Now'}</span>
              </button>
              <button
                onClick={() => toggleWatchlist({ ...show, title: show.name, release_date: show.first_air_date, genre_ids: [] })}
                className={cn(
                  'px-10 py-4 rounded-xl font-bold flex items-center space-x-2 transition-all duration-300 border backdrop-blur-xl hover:scale-105',
                  inWatchlist
                    ? 'bg-white/20 text-white border-white/40'
                    : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
                )}
              >
                {inWatchlist ? <CheckCircle2 className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
                <span>{inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12 mt-8 md:mt-12 relative z-10 px-4 md:px-8">
        
        {/* Main Column */}
        <div className="flex-1 w-full space-y-12 md:space-y-16">
            {/* Overview */}
            <section>
              <h2 className="text-3xl font-display font-bold mb-6 tracking-tight">Overview</h2>
              <p className="text-xl text-gray-400 leading-relaxed font-light">{show.overview}</p>
            </section>

            {/* Trailer */}
            {trailerUrl && (
              <section>
                <h2 className="text-3xl font-display font-bold mb-6 tracking-tight">Trailer</h2>
                <div className="aspect-video w-full rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                  <iframe src={trailerUrl} title="Trailer" className="w-full h-full border-none" allowFullScreen />
                </div>
              </section>
            )}

            {/* Episodes */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-display font-bold tracking-tight">Episodes</h2>
                <button
                  onClick={() => setExpandedSeason(!expandedSeason)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {expandedSeason ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {/* Season Tabs */}
              <div className="flex overflow-x-auto no-scrollbar space-x-2 pb-2">
                {availableSeasons.map((season) => (
                  <button
                    key={season.season_number}
                    onClick={() => setSelectedSeason(season.season_number)}
                    className={cn(
                      'px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                      selectedSeason === season.season_number
                        ? 'bg-brand-primary text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    Season {season.season_number}
                  </button>
                ))}
              </div>

              {/* Episode List */}
              <AnimatePresence>
                {expandedSeason && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    {seasonLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
                      ))
                    ) : (
                      seasonData?.episodes?.map((ep: TvEpisode) => (
                        <motion.div
                          key={ep.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="group flex items-center gap-4 p-4 rounded-2xl bg-white/3 border border-white/5 hover:bg-white/8 hover:border-brand-primary/30 transition-all cursor-pointer"
                          onClick={() => handlePlayEpisode(selectedSeason, ep.episode_number)}
                        >
                          {/* Episode thumbnail */}
                          <div className="relative shrink-0 w-36 aspect-video rounded-xl overflow-hidden bg-white/5">
                            {ep.still_path ? (
                              <img
                                src={tmdbService.getImageUrl(ep.still_path, 'w300')}
                                alt={ep.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Tv className="w-6 h-6 text-gray-600" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="w-10 h-10 rounded-full bg-brand-primary/90 flex items-center justify-center">
                                <Play className="w-4 h-4 fill-white text-white" />
                              </div>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">
                                E{ep.episode_number}
                              </span>
                              {ep.vote_average > 0 && (
                                <span className="flex items-center gap-1 text-xs text-yellow-500">
                                  <Star className="w-3 h-3 fill-yellow-500" />
                                  {ep.vote_average.toFixed(1)}
                                </span>
                              )}
                              {ep.runtime > 0 && (
                                <span className="text-xs text-gray-500">{ep.runtime}m</span>
                              )}
                            </div>
                            <h4 className="font-semibold text-white line-clamp-1 group-hover:text-brand-primary transition-colors">
                              {ep.name}
                            </h4>
                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{ep.overview}</p>
                          </div>

                          <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center">
                              <Play className="w-4 h-4 fill-white text-white" />
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Cast */}
            <section>
              <h2 className="text-3xl font-display font-bold mb-6 tracking-tight">Top Cast</h2>
              <div className="flex flex-wrap gap-5">
                {(show as any).credits?.cast?.slice(0, 12).map((person: any) => (
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

          {/* Sidebar */}
          <div className="w-full lg:w-80 shrink-0 space-y-8">
            <section className="bg-white/5 rounded-3xl pt-10 px-6 md:px-8 pb-8 border border-white/10 space-y-8">
              <h3 className="text-xl font-display font-bold tracking-tight text-white">Show Info</h3>
              <div className="space-y-4">
                {show.status && (
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Status</p>
                    <p className="text-base font-medium">{show.status}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Seasons</p>
                  <p className="text-base font-medium">{show.number_of_seasons}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Episodes</p>
                  <p className="text-base font-medium">{show.number_of_episodes}</p>
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

            {/* Similar Shows */}
            <section className="space-y-4">
              <h3 className="text-xl font-display font-bold tracking-tight">Similar Shows</h3>
              <div className="grid grid-cols-2 gap-4">
                {(show as any).similar?.results?.slice(0, 4).map((s: any) => (
                  <a key={s.id} href={`/tv/${s.id}`} className="group cursor-pointer">
                    <div className="aspect-[2/3] rounded-xl overflow-hidden mb-2">
                      <img
                        src={tmdbService.getImageUrl(s.poster_path)}
                        alt={s.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                    </div>
                    <p className="text-xs font-semibold line-clamp-1">{s.name}</p>
                  </a>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
  );
}
