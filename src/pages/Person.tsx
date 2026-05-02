import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tmdbService } from '../services/tmdb';
import { motion } from 'motion/react';
import { Calendar, Film, Tv, Star, ArrowLeft, User } from 'lucide-react';
import { cn } from '../lib/utils';

type CreditTab = 'all' | 'movie' | 'tv';

export default function Person() {
  const { id } = useParams<{ id: string }>();
  const [person, setPerson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<CreditTab>('all');
  const [showFullBio, setShowFullBio] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    window.scrollTo(0, 0);
    tmdbService
      .getPersonDetails(parseInt(id))
      .then((data) => {
        setPerson(data);
        document.title = `${data.name} | CinePulse`;
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-primary" />
      </div>
    );

  if (!person)
    return (
      <div className="text-center py-20 text-gray-400 text-2xl">Person not found</div>
    );

  // Deduplicate credits by id + media_type
  const allCredits: any[] = [];
  const seen = new Set<string>();
  const raw = [
    ...(person.combined_credits?.cast || []),
  ].sort((a, b) => {
    const dateA = a.release_date || a.first_air_date || '';
    const dateB = b.release_date || b.first_air_date || '';
    return dateB.localeCompare(dateA);
  });

  for (const credit of raw) {
    const key = `${credit.id}-${credit.media_type}`;
    if (!seen.has(key)) {
      seen.add(key);
      allCredits.push(credit);
    }
  }

  const displayed =
    tab === 'all'
      ? allCredits
      : allCredits.filter((c) => c.media_type === tab);

  const movieCount = allCredits.filter((c) => c.media_type === 'movie').length;
  const tvCount = allCredits.filter((c) => c.media_type === 'tv').length;

  const age = person.birthday
    ? Math.floor(
        (new Date().getTime() - new Date(person.birthday).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  return (
    <div className="pb-24 space-y-10">
      {/* Back button */}
      <Link
        to={-1 as any}
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      {/* Hero */}
      <div className="flex flex-col sm:flex-row gap-8 items-start">
        {/* Photo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="shrink-0"
        >
          {person.profile_path ? (
            <img
              src={tmdbService.getImageUrl(person.profile_path, 'w500')}
              alt={person.name}
              className="w-48 h-48 sm:w-60 sm:h-60 rounded-3xl object-cover shadow-2xl border border-white/10"
            />
          ) : (
            <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10">
              <User className="w-20 h-20 text-gray-600" />
            </div>
          )}
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 space-y-4"
        >
          <div>
            <p className="text-brand-primary text-xs font-bold uppercase tracking-widest mb-2">
              {person.known_for_department || 'Actor'}
            </p>
            <h1 className="text-4xl sm:text-5xl font-display font-bold leading-tight">
              {person.name}
            </h1>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            {age && (
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {age} years old
              </span>
            )}
            {person.place_of_birth && (
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 max-w-xs truncate">
                📍 {person.place_of_birth}
              </span>
            )}
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
              <Film className="w-3.5 h-3.5 text-brand-primary" />
              {movieCount} Movies
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
              <Tv className="w-3.5 h-3.5 text-blue-400" />
              {tvCount} TV Shows
            </span>
          </div>

          {/* Bio */}
          {person.biography && (
            <div>
              <p
                className={cn(
                  'text-gray-400 leading-relaxed text-base',
                  !showFullBio && 'line-clamp-4'
                )}
              >
                {person.biography}
              </p>
              {person.biography.length > 400 && (
                <button
                  onClick={() => setShowFullBio(!showFullBio)}
                  className="text-brand-primary text-sm mt-2 hover:underline"
                >
                  {showFullBio ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Credits section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-2xl font-display font-bold">Filmography</h2>
          {/* Tabs */}
          <div className="flex gap-2">
            {(
              [
                { key: 'all', label: `All (${allCredits.length})` },
                { key: 'movie', label: `Movies (${movieCount})`, icon: Film },
                { key: 'tv', label: `TV (${tvCount})`, icon: Tv },
              ] as { key: CreditTab; label: string; icon?: any }[]
            ).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all',
                  tab === t.key
                    ? 'bg-brand-primary text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                )}
              >
                {t.icon && <t.icon className="w-3.5 h-3.5" />}
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {displayed.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No credits found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {displayed.map((credit: any, idx: number) => {
              const title = credit.title || credit.name || 'Untitled';
              const date = credit.release_date || credit.first_air_date;
              const year = date ? new Date(date).getFullYear() : null;
              const href =
                credit.media_type === 'movie'
                  ? `/movie/${credit.id}`
                  : `/tv/${credit.id}`;

              return (
                <motion.div
                  key={`${credit.id}-${credit.media_type}-${idx}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.02, 0.4) }}
                >
                  <Link to={href} className="group block">
                    <div className="aspect-[2/3] rounded-xl overflow-hidden bg-white/5 relative mb-2 border border-white/5 group-hover:border-brand-primary/40 transition-colors">
                      <img
                        src={tmdbService.getImageUrl(credit.poster_path, 'w500')}
                        alt={title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Media type badge */}
                      <div className="absolute top-2 left-2">
                        <span
                          className={cn(
                            'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase',
                            credit.media_type === 'movie'
                              ? 'bg-brand-primary/90 text-white'
                              : 'bg-blue-500/90 text-white'
                          )}
                        >
                          {credit.media_type === 'movie' ? 'Movie' : 'TV'}
                        </span>
                      </div>
                      {/* Rating */}
                      {credit.vote_average > 0 && (
                        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-[10px] text-white font-bold">
                            {credit.vote_average.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-white line-clamp-2 group-hover:text-brand-primary transition-colors leading-tight">
                      {title}
                    </p>
                    {credit.character && (
                      <p className="text-xs text-gray-500 line-clamp-1 italic mt-0.5">
                        {credit.character}
                      </p>
                    )}
                    {year && <p className="text-xs text-gray-600 mt-0.5">{year}</p>}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
