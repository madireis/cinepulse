import React, { useState, useEffect } from 'react';
import { tmdbService } from '../services/tmdb';
import { MovieCard, MovieSkeleton } from '../components/MovieCard';
import { Search as SearchIcon, X, Clock, Trash2, ChevronRight, Tv, Film, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  media_type: 'movie' | 'tv' | 'person';
  profile_path?: string;
  known_for_department?: string;
  known_for?: any[];
}

const TvResultCard: React.FC<{ show: SearchResult }> = ({ show }) => (
  <Link to={`/tv/${show.id}`}>
    <motion.div
      whileHover={{ scale: 1.04 }}
      className="relative group cursor-pointer overflow-hidden rounded-xl bg-card-bg aspect-[2/3]"
    >
      <img
        src={tmdbService.getImageUrl(show.poster_path, 'w500')}
        alt={show.name}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <div className="flex items-center gap-1 mb-1">
          <Tv className="w-3 h-3 text-brand-primary" />
          <span className="text-xs text-brand-primary font-bold uppercase">TV</span>
        </div>
        <h3 className="font-semibold text-sm line-clamp-1">{show.name}</h3>
        <div className="flex items-center space-x-2 mt-1">
          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-medium">{show.vote_average?.toFixed(1)}</span>
        </div>
      </div>
    </motion.div>
  </Link>
);

const PersonCard: React.FC<{ person: SearchResult }> = ({ person }) => {
  const knownFor = person.known_for?.slice(0, 2).map((k: any) => k.title || k.name).filter(Boolean).join(', ');
  return (
    <Link to={`/person/${person.id}`}>
      <motion.div
        whileHover={{ scale: 1.04 }}
        className="group cursor-pointer"
      >
        <div className="aspect-[2/3] rounded-xl overflow-hidden bg-white/5 relative border border-white/5 group-hover:border-brand-primary/40 transition-colors">
          {person.profile_path ? (
            <img
              src={tmdbService.getImageUrl(person.profile_path, 'w500')}
              alt={person.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-12 h-12 text-gray-600" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
            <span className="text-[10px] text-brand-primary font-bold uppercase tracking-widest mb-1">Actor</span>
            <p className="text-xs text-gray-300 line-clamp-2 italic">{knownFor}</p>
          </div>
        </div>
        <p className="mt-2 text-sm font-semibold text-white group-hover:text-brand-primary transition-colors leading-tight">{person.name}</p>
        {person.known_for_department && (
          <p className="text-xs text-gray-500 mt-0.5">{person.known_for_department}</p>
        )}
      </motion.div>
    </Link>
  );
};

type ActiveTab = 'all' | 'movies' | 'tv' | 'people';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [history, setHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cinepulse_search_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const addToHistory = (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length <= 2) return;
    const cleanQuery = searchQuery.trim();
    setHistory((prev) => {
      const filtered = prev.filter((h) => h.toLowerCase() !== cleanQuery.toLowerCase());
      const newHistory = [cleanQuery, ...filtered].slice(0, 8);
      localStorage.setItem('cinepulse_search_history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const removeFromHistory = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory((prev) => {
      const newHistory = prev.filter((_, i) => i !== idx);
      localStorage.setItem('cinepulse_search_history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('cinepulse_search_history');
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 2) {
        setLoading(true);
        try {
          const data = await tmdbService.searchMulti(query);
          // Include people in results
          const filtered = (data.results || []).filter(
            (r: SearchResult) => r.media_type === 'movie' || r.media_type === 'tv' || r.media_type === 'person'
          );
          setResults(filtered);
          if (filtered.length > 0) addToHistory(query);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const movieResults = results.filter((r) => r.media_type === 'movie');
  const tvResults = results.filter((r) => r.media_type === 'tv');
  const peopleResults = results.filter((r) => r.media_type === 'person');

  const filtered =
    activeTab === 'all' ? results.filter((r) => r.media_type !== 'person') :
    activeTab === 'movies' ? movieResults :
    activeTab === 'tv' ? tvResults :
    peopleResults;

  const tabs: { key: ActiveTab; label: string; icon: any; count: number }[] = [
    { key: 'all', label: 'All', icon: null, count: results.filter(r => r.media_type !== 'person').length },
    { key: 'movies', label: 'Movies', icon: Film, count: movieResults.length },
    { key: 'tv', label: 'TV Shows', icon: Tv, count: tvResults.length },
    { key: 'people', label: 'People', icon: User, count: peopleResults.length },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto z-20">
        <div className="relative group">
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500 group-focus-within:text-brand-primary transition-colors" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, TV shows, actors..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 md:py-6 pl-12 md:pl-16 pr-10 md:pr-12 text-lg md:text-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 placeholder:text-gray-600 transition-all font-light"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>

        {/* History */}
        <AnimatePresence>
          {query.length <= 2 && history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4 p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Recent</span>
                </div>
                <button
                  onClick={clearHistory}
                  className="text-xs font-semibold text-gray-500 hover:text-brand-primary flex items-center space-x-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {history.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(h)}
                    className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl group transition-all text-left"
                  >
                    <span className="text-gray-300 font-medium text-sm">{h}</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                      <X
                        className="w-4 h-4 text-gray-500 hover:text-brand-primary"
                        onClick={(e) => removeFromHistory(i, e)}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tabs */}
      {results.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {tabs.filter(t => t.count > 0 || t.key === 'all').map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-5 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 transition-all',
                activeTab === tab.key
                  ? 'bg-brand-primary text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              )}
            >
              {tab.icon && <tab.icon className="w-4 h-4" />}
              {tab.label} {tab.count > 0 && <span className="opacity-70">({tab.count})</span>}
            </button>
          ))}
        </div>
      )}

      {/* People Section (when People tab active) */}
      {activeTab === 'people' && !loading && peopleResults.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {peopleResults.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      )}

      {/* People preview strip when 'all' tab is active */}
      {activeTab === 'all' && !loading && peopleResults.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <User className="w-4 h-4" /> People
            </h3>
            {peopleResults.length > 4 && (
              <button
                onClick={() => setActiveTab('people')}
                className="text-xs text-brand-primary hover:underline"
              >
                See all ({peopleResults.length})
              </button>
            )}
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {peopleResults.slice(0, 8).map((person) => (
              <Link
                key={person.id}
                to={`/person/${person.id}`}
                className="shrink-0 w-24 text-center group"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden bg-white/5 border-2 border-white/5 group-hover:border-brand-primary transition-colors mx-auto mb-2">
                  {person.profile_path ? (
                    <img
                      src={tmdbService.getImageUrl(person.profile_path, 'w500')}
                      alt={person.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-600" />
                    </div>
                  )}
                </div>
                <p className="text-xs font-semibold text-white group-hover:text-brand-primary transition-colors leading-tight">{person.name}</p>
                <p className="text-[10px] text-gray-500">{person.known_for_department}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Results Grid (movies + tv) */}
      {activeTab !== 'people' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {loading
            ? Array.from({ length: 10 }).map((_, i) => <MovieSkeleton key={i} />)
            : filtered.map((item) =>
                item.media_type === 'movie' ? (
                  <MovieCard
                    key={item.id}
                    movie={{
                      ...item,
                      title: item.title || item.name || '',
                      release_date: item.release_date || '',
                      adult: false,
                    }}
                  />
                ) : (
                  <TvResultCard key={item.id} show={item} />
                )
              )}
        </div>
      )}

      {/* Empty State */}
      {!loading && query.length > 2 && filtered.length === 0 && (
        <div className="text-center py-20 space-y-4">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
            <SearchIcon className="w-10 h-10 text-gray-600" />
          </div>
          <p className="text-gray-400 text-xl font-light">No results for "{query}"</p>
        </div>
      )}

      {/* Prompt */}
      {query.length <= 2 && (
        <div className="text-center py-20 opacity-15 select-none">
          <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight px-4">DISCOVER SOMETHING NEW</h2>
        </div>
      )}
    </div>
  );
}
