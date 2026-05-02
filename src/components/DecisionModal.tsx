import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Clock, Compass, Film, Tv, Play } from 'lucide-react';
import { tmdbService, Movie, TvShow } from '../services/tmdb';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

interface DecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Mood = 'chill' | 'thrill' | 'escape' | 'learn';
type Time = 'short' | 'medium' | 'long' | 'series';

const MOODS = [
  { id: 'chill', label: 'Chill & Relax', icon: Compass, genres: '35,10751' }, // Comedy, Family
  { id: 'thrill', label: 'Edge of My Seat', icon: Sparkles, genres: '28,53,27' }, // Action, Thriller, Horror
  { id: 'escape', label: 'Epic Escape', icon: Film, genres: '878,14,12' }, // Sci-Fi, Fantasy, Adventure
  { id: 'learn', label: 'Learn Something', icon: Tv, genres: '99,36' }, // Documentary, History
] as const;

const TIMES = [
  { id: 'short', label: 'Under 90 mins', icon: Clock, type: 'movie', runtime: { lte: 90 } },
  { id: 'medium', label: '90 - 120 mins', icon: Clock, type: 'movie', runtime: { gte: 90, lte: 120 } },
  { id: 'long', label: 'Over 2 hours', icon: Clock, type: 'movie', runtime: { gte: 120 } },
  { id: 'series', label: 'Start a Series', icon: Tv, type: 'tv', runtime: {} },
] as const;

export default function DecisionModal({ isOpen, onClose }: DecisionModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [selectedTime, setSelectedTime] = useState<Time | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Array<Movie | TvShow>>([]);
  const navigate = useNavigate();

  const handleNext = async () => {
    if (step === 1 && selectedMood) setStep(2);
    if (step === 2 && selectedTime) {
      setStep(3);
      await fetchRecommendations();
    }
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const moodConfig = MOODS.find((m) => m.id === selectedMood);
      const timeConfig = TIMES.find((t) => t.id === selectedTime);
      
      if (!moodConfig || !timeConfig) return;

      const baseParams: any = {
        with_genres: moodConfig.genres,
        sort_by: 'popularity.desc',
        'vote_average.gte': 6.0,
        'vote_count.gte': 100,
      };

      let fetchedResults = [];
      if (timeConfig.type === 'movie') {
        const rt = timeConfig.runtime as any;
        if (rt.lte) baseParams['with_runtime.lte'] = rt.lte;
        if (rt.gte) baseParams['with_runtime.gte'] = rt.gte;
        const res = await tmdbService.discoverMovies(baseParams);
        fetchedResults = res.results.slice(0, 3);
      } else {
        const res = await tmdbService.discoverTv(baseParams);
        fetchedResults = res.results.slice(0, 3);
      }

      // Add media_type tag so UI knows where to route
      setResults(fetchedResults.map((item: any) => ({ ...item, media_type: timeConfig.type })));
      setStep(4);
    } catch (error) {
      console.error('Failed to fetch decision recommendations:', error);
      onClose(); // Fallback on error
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setSelectedMood(null);
    setSelectedTime(null);
    setResults([]);
  };

  const closeAndReset = () => {
    onClose();
    setTimeout(reset, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-brand-bg/80 backdrop-blur-sm"
        onClick={closeAndReset}
      />
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-2xl bg-gray-900 border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
      >
        <button
          onClick={closeAndReset}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-display font-bold text-white">What's the vibe?</h2>
                <p className="text-gray-400">Let us pick the perfect genre for your mood.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {MOODS.map((mood) => {
                  const Icon = mood.icon;
                  const isSelected = selectedMood === mood.id;
                  return (
                    <button
                      key={mood.id}
                      onClick={() => setSelectedMood(mood.id)}
                      className={cn(
                        "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300",
                        isSelected 
                          ? "border-brand-primary bg-brand-primary/10" 
                          : "border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10"
                      )}
                    >
                      <Icon className={cn("w-8 h-8 mb-3", isSelected ? "text-brand-primary" : "text-gray-400")} />
                      <span className={cn("font-bold text-lg", isSelected ? "text-white" : "text-gray-300")}>{mood.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <button
                  disabled={!selectedMood}
                  onClick={handleNext}
                  className="px-8 py-3 bg-brand-primary text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
                >
                  Next Step
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-display font-bold text-white">How much time?</h2>
                <p className="text-gray-400">We'll find something that fits your schedule.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {TIMES.map((time) => {
                  const Icon = time.icon;
                  const isSelected = selectedTime === time.id;
                  return (
                    <button
                      key={time.id}
                      onClick={() => setSelectedTime(time.id)}
                      className={cn(
                        "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300",
                        isSelected 
                          ? "border-brand-primary bg-brand-primary/10" 
                          : "border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10"
                      )}
                    >
                      <Icon className={cn("w-8 h-8 mb-3", isSelected ? "text-brand-primary" : "text-gray-400")} />
                      <span className={cn("font-bold text-lg", isSelected ? "text-white" : "text-gray-300")}>{time.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-8 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-colors"
                >
                  Back
                </button>
                <button
                  disabled={!selectedTime}
                  onClick={handleNext}
                  className="px-8 py-3 bg-brand-primary text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Discover
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-20 flex flex-col items-center justify-center space-y-6"
            >
              <div className="w-16 h-16 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
              <h2 className="text-2xl font-display font-bold text-white animate-pulse">Finding the perfect match...</h2>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2 mb-8">
                <h2 className="text-3xl font-display font-bold text-white">Your Perfect Match</h2>
                <p className="text-gray-400">Based on your mood and available time.</p>
              </div>

              <div className="space-y-4">
                {results.map((result: any, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-pointer"
                    onClick={() => {
                      closeAndReset();
                      navigate(`/${result.media_type}/${result.id}`);
                    }}
                  >
                    <img 
                      src={tmdbService.getImageUrl(result.poster_path, 'w300')} 
                      alt={result.title || result.name} 
                      className="w-16 h-24 object-cover rounded-lg shadow-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-brand-primary transition-colors">
                        {result.title || result.name}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-2 mt-1">{result.overview}</p>
                    </div>
                    <div className="px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 text-brand-primary fill-brand-primary" />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="pt-4 flex justify-center">
                <button
                  onClick={reset}
                  className="text-gray-400 hover:text-white font-medium transition-colors"
                >
                  Start Over
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
