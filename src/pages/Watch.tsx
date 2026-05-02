import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { tmdbService } from '../services/tmdb';
import {
  ArrowLeft, Star, Clock, Calendar, Play, Heart, CheckCircle2,
  Tv, ChevronDown, ChevronUp, SkipForward, SkipBack, Maximize2, Minimize2, List
} from 'lucide-react';
import { cn, formatRuntime } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useWatchlist } from '../context/WatchlistContext';

export default function Watch() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const season = parseInt(searchParams.get('season') || '1');
  const episode = parseInt(searchParams.get('episode') || '1');

  const [media, setMedia] = useState<any>(null);
  const [seasonData, setSeasonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEpisodes, setShowEpisodes] = useState(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInPlayerEpisodes, setShowInPlayerEpisodes] = useState(false);

  const { toggleWatchlist, isInWatchlist, updateProgress, addToHistory } = useWatchlist();

  // ─── Track playback progress ──────────────────────────────────────────────
  useEffect(() => {
    if (media && type) {
      updateProgress({
        id: media.id,
        type: type as 'movie' | 'tv',
        season: type === 'tv' ? season : undefined,
        episode: type === 'tv' ? episode : undefined,
        timestamp: Date.now()
      });
      addToHistory({
        ...media,
        title: media.title || media.name,
        release_date: media.release_date || media.first_air_date,
        genre_ids: media.genres?.map((g: any) => g.id) || []
      });
    }
  }, [media, type, season, episode, updateProgress, addToHistory]);

  // ─── Fetch media data ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setIframeLoaded(false);

    const fetch = type === 'tv'
      ? tmdbService.getTvDetails(parseInt(id))
      : tmdbService.getMovieDetails(parseInt(id));

    fetch.then((data) => {
      setMedia(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id, type]);

  // Fetch season data for TV
  useEffect(() => {
    if (type !== 'tv' || !id || !media) return;
    tmdbService.getTvSeason(parseInt(id), season).then(setSeasonData).catch(() => {});
  }, [id, type, season, media]);

  // ─── Build embed URL ──────────────────────────────────────────────────────
  const getEmbedUrl = () => {
    const base = 'https://vidsrc-embed.ru/embed';
    const imdbId = media?.imdb_id || media?.external_ids?.imdb_id;
    const tmdbId = media?.id;

    if (type === 'movie') {
      if (imdbId) return `${base}/movie?imdb=${imdbId}&autoplay=1`;
      return `${base}/movie?tmdb=${tmdbId}&autoplay=1`;
    }
    if (type === 'tv') {
      if (imdbId) return `${base}/tv?imdb=${imdbId}&season=${season}&episode=${episode}&autoplay=1&autonext=1`;
      return `${base}/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}&autoplay=1&autonext=1`;
    }
    return null;
  };

  const embedUrl = getEmbedUrl();
  const title = media?.title || media?.name || '';
  const inWatchlist = media ? isInWatchlist(media.id) : false;

  // ─── Episode navigation helpers ───────────────────────────────────────────
  const totalEpisodes = seasonData?.episodes?.length ?? 0;
  const canNextEp = episode < totalEpisodes;
  const canPrevEp = episode > 1;

  const goToEpisode = (s: number, e: number) => {
    setSearchParams({ season: String(s), episode: String(e) });
    setIframeLoaded(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const availableSeasons = media?.seasons?.filter((s: any) => s.season_number > 0) ?? [];

  // ─── Native fullscreen helper ─────────────────────────────────────────────
  const toggleFullscreen = () => {
    const el = playerContainerRef.current;
    if (!el) return;
    
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) el.requestFullscreen();
      else if ((el as any).webkitRequestFullscreen) (el as any).webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // Close in-player picker if exiting fullscreen, or leave it up to user
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (loading) return (
    <div className="fixed inset-0 bg-brand-bg flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full border-4 border-white/10 border-t-brand-primary animate-spin" />
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#070809]">
      {/* ── TOP BAR ─────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-4 bg-black/60 backdrop-blur-md border-b border-white/5 sticky top-0 z-30">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
        >
          <div className="w-9 h-9 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium hidden sm:block">Back</span>
        </button>

        <div className="flex-1 px-6 min-w-0">
          <h1 className="text-white font-display font-bold text-lg truncate">{title}</h1>
          {type === 'tv' && (
            <p className="text-gray-500 text-xs">Season {season} · Episode {episode}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Fullscreen shortcut */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg transition-all"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:block">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>

          {/* Watchlist */}
          {media && (
            <button
              onClick={() => toggleWatchlist({ ...media, title, release_date: media.release_date || media.first_air_date || '', genre_ids: [] })}
              className={cn(
                'flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-all',
                inWatchlist
                  ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30'
                  : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
              )}
            >
              {inWatchlist ? <CheckCircle2 className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
              <span className="hidden sm:block">{inWatchlist ? 'Saved' : 'Watchlist'}</span>
            </button>
          )}
        </div>
      </header>

      {/* ── PLAYER ──────────────────────────────────────────────────────────── */}
      <div 
        ref={playerContainerRef}
        className={cn(
          "w-full bg-black relative flex flex-col group",
          isFullscreen ? "h-screen" : ""
        )} 
        style={!isFullscreen ? { aspectRatio: '16/9', maxHeight: 'calc(100vh - 64px)' } : {}}
      >
        {/* Loading overlay */}
        {!iframeLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10 gap-6">
            {/* Backdrop art */}
            {media?.backdrop_path && (
              <img
                src={tmdbService.getImageUrl(media.backdrop_path, 'original')}
                className="absolute inset-0 w-full h-full object-cover opacity-15"
                alt=""
              />
            )}
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-brand-primary animate-spin" />
              <p className="text-gray-300 font-medium">Connecting to stream...</p>
              {type === 'tv' && (
                <p className="text-gray-500 text-sm">S{season} E{episode}</p>
              )}
            </div>
          </div>
        )}

        {embedUrl && (
          <div className="flex-1 w-full relative">
            <iframe
              ref={iframeRef}
              key={embedUrl}
              src={embedUrl}
              title={`Watch ${title}`}
              className="w-full h-full border-none absolute inset-0"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture; xr-spatial-tracking"
              allowFullScreen
              onLoad={() => setIframeLoaded(true)}
              referrerPolicy="origin"
            />
          </div>
        )}

        {/* Custom Overlays (only visible when hovering container or episode picker is open) */}
        <div className={cn(
          "absolute top-0 left-0 right-0 p-4 flex justify-end gap-3 pointer-events-none transition-opacity duration-300 z-30",
          (showInPlayerEpisodes || isFullscreen) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}>
          {type === 'tv' && (
            <button
              onClick={() => setShowInPlayerEpisodes(!showInPlayerEpisodes)}
              className="bg-black/60 hover:bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 pointer-events-auto border border-white/10 transition-colors"
            >
              <List className="w-4 h-4" />
              Episodes
            </button>
          )}
          <button
            onClick={toggleFullscreen}
            className="bg-black/60 hover:bg-black/80 backdrop-blur-md text-white p-2 rounded-lg pointer-events-auto border border-white/10 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>

        {/* In-Player Episode Picker Overlay */}
        <AnimatePresence>
          {showInPlayerEpisodes && type === 'tv' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-16 right-4 w-[calc(100vw-2rem)] sm:w-80 max-h-[calc(100%-5rem)] bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden flex flex-col z-40 pointer-events-auto shadow-2xl"
            >
              <div className="p-4 border-b border-white/10 bg-black/50">
                <select
                  value={season}
                  onChange={(e) => goToEpisode(parseInt(e.target.value), 1)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer"
                >
                  {availableSeasons.map((s: any) => (
                    <option key={s.season_number} value={s.season_number} className="bg-gray-900">
                      Season {s.season_number}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
                {seasonData?.episodes?.map((ep: any) => {
                  const isActive = ep.episode_number === episode;
                  return (
                    <button
                      key={ep.id}
                      onClick={() => {
                        goToEpisode(season, ep.episode_number);
                        setShowInPlayerEpisodes(false);
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 text-left transition-all rounded-lg hover:bg-white/10',
                        isActive && 'bg-brand-primary/20 text-brand-primary'
                      )}
                    >
                      <div className="shrink-0 w-8 text-center">
                        <span className="text-xs font-bold">{ep.episode_number}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-medium line-clamp-1', isActive ? 'text-white' : 'text-gray-300')}>
                          {ep.name}
                        </p>
                      </div>
                      {isActive && <Play className="w-3 h-3 fill-current shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── EPISODE NAV BAR (TV only) ────────────────────────────────────────── */}
      {type === 'tv' && media && (
        <div className="bg-black/80 border-b border-white/5 px-6 py-3 flex items-center justify-between gap-4 sticky top-[65px] z-20 backdrop-blur-md">
          {/* Prev episode */}
          <button
            onClick={() => canPrevEp && goToEpisode(season, episode - 1)}
            disabled={!canPrevEp}
            className={cn(
              'flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-all',
              canPrevEp
                ? 'bg-white/5 hover:bg-white/10 text-white'
                : 'opacity-30 cursor-not-allowed text-gray-600'
            )}
          >
            <SkipBack className="w-4 h-4" /> Prev
          </button>

          {/* Season / episode selector */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            <select
              value={season}
              onChange={(e) => goToEpisode(parseInt(e.target.value), 1)}
              className="bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer"
            >
              {availableSeasons.map((s: any) => (
                <option key={s.season_number} value={s.season_number} className="bg-gray-900">
                  Season {s.season_number}
                </option>
              ))}
            </select>
            <span className="text-gray-400 text-sm font-medium shrink-0">
              Episode <span className="text-white font-bold">{episode}</span>
              {totalEpisodes > 0 && <span className="text-gray-600"> / {totalEpisodes}</span>}
            </span>
          </div>

          {/* Next episode */}
          <button
            onClick={() => canNextEp && goToEpisode(season, episode + 1)}
            disabled={!canNextEp}
            className={cn(
              'flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-all',
              canNextEp
                ? 'bg-brand-primary hover:bg-red-700 text-white font-medium shadow-lg shadow-brand-primary/20'
                : 'opacity-30 cursor-not-allowed text-gray-600 bg-white/5'
            )}
          >
            Next <SkipForward className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── CONTENT BELOW PLAYER ─────────────────────────────────────────────── */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-6 md:py-8 grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Left: Media Info */}
        <div className="xl:col-span-2 space-y-8">
          {/* Title + meta */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-start gap-4">
              {media?.poster_path && (
                <img
                  src={tmdbService.getImageUrl(media.poster_path, 'w500')}
                  alt={title}
                  className="w-16 md:w-20 rounded-xl shadow-xl shrink-0 hidden sm:block"
                />
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl md:text-3xl font-display font-bold text-white leading-tight">{title}</h2>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-400">
                  {media?.vote_average > 0 && (
                    <span className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-yellow-400" />
                      <span className="font-bold text-white">{media.vote_average.toFixed(1)}</span>
                      <span className="text-gray-500">/10</span>
                    </span>
                  )}
                  {media?.runtime > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatRuntime(media.runtime)}
                    </span>
                  )}
                  {(media?.release_date || media?.first_air_date) && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(media.release_date || media.first_air_date).getFullYear()}
                    </span>
                  )}
                  {media?.genres?.length > 0 && (
                    <span className="text-brand-primary">
                      {media.genres.slice(0, 3).map((g: any) => g.name).join(' · ')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {media?.overview && (
              <p className="text-gray-400 leading-relaxed text-base">{media.overview}</p>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                to={`/${type}/${id}`}
                className="flex items-center gap-2 text-sm bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-all"
              >
                <Play className="w-4 h-4" />
                View Details
              </Link>
            </div>
          </motion.div>

          {/* Cast */}
          {media?.credits?.cast?.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-lg font-display font-bold text-white">Cast</h3>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {media.credits.cast.slice(0, 8).map((person: any) => (
                  <div key={person.id} className="shrink-0 text-center w-20">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-white/5 mb-2 border-2 border-white/5">
                      <img
                        src={tmdbService.getImageUrl(person.profile_path, 'w500')}
                        alt={person.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs font-medium text-white line-clamp-1">{person.name}</p>
                    <p className="text-xs text-gray-600 line-clamp-1 italic">{person.character}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right: Episode list (TV) or Similar (movie) */}
        <div className="space-y-6">
          {type === 'tv' && seasonData?.episodes ? (
            <section className="bg-white/3 rounded-2xl border border-white/5 overflow-hidden">
              <button
                onClick={() => setShowEpisodes(!showEpisodes)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-brand-primary" />
                  <span className="font-bold text-white text-sm">Season {season} Episodes</span>
                  <span className="text-xs text-gray-500 bg-white/10 px-2 py-0.5 rounded-full">{seasonData.episodes.length}</span>
                </div>
                {showEpisodes ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>

              <AnimatePresence>
                {showEpisodes && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="max-h-[60vh] overflow-y-auto divide-y divide-white/5">
                      {seasonData.episodes.map((ep: any) => {
                        const isActive = ep.episode_number === episode;
                        return (
                          <button
                            key={ep.id}
                            onClick={() => goToEpisode(season, ep.episode_number)}
                            className={cn(
                              'w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-white/5',
                              isActive && 'bg-brand-primary/10 border-l-2 border-brand-primary'
                            )}
                          >
                            {/* Thumbnail */}
                            <div className="shrink-0 w-20 aspect-video rounded-lg overflow-hidden bg-white/5 relative">
                              {ep.still_path ? (
                                <img
                                  src={tmdbService.getImageUrl(ep.still_path, 'w300')}
                                  alt={ep.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Tv className="w-4 h-4 text-gray-600" />
                                </div>
                              )}
                              {isActive && (
                                <div className="absolute inset-0 bg-brand-primary/30 flex items-center justify-center">
                                  <div className="w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center">
                                    <Play className="w-2.5 h-2.5 fill-white text-white" />
                                  </div>
                                </div>
                              )}
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className={cn('text-xs font-bold uppercase tracking-wide mb-0.5', isActive ? 'text-brand-primary' : 'text-gray-500')}>
                                E{ep.episode_number}
                              </p>
                              <p className={cn('text-sm font-medium line-clamp-1', isActive ? 'text-white' : 'text-gray-300')}>
                                {ep.name}
                              </p>
                              {ep.runtime > 0 && (
                                <p className="text-xs text-gray-600 mt-0.5">{ep.runtime}m</p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          ) : (
            /* Similar movies for non-TV */
            media?.similar?.results?.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-lg font-display font-bold text-white">More Like This</h3>
                <div className="grid grid-cols-2 gap-3">
                  {media.similar.results.slice(0, 6).map((m: any) => (
                    <Link
                      key={m.id}
                      to={`/watch/movie/${m.id}`}
                      className="group"
                    >
                      <div className="aspect-[2/3] rounded-xl overflow-hidden bg-white/5 mb-2">
                        <img
                          src={tmdbService.getImageUrl(m.poster_path, 'w500')}
                          alt={m.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <p className="text-xs font-semibold text-gray-300 group-hover:text-white line-clamp-1 transition-colors">
                        {m.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )
          )}
        </div>
      </div>
    </div>
  );
}
