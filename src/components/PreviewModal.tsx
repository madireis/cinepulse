import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerUrl: string | null;
  title: string;
}

export default function PreviewModal({ isOpen, onClose, trailerUrl, title }: PreviewModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10"
          >
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {trailerUrl ? (
              <iframe
                src={`${trailerUrl}?autoplay=1`}
                title={`${title} Trailer`}
                className="w-full h-full border-none"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                <p className="text-xl font-medium">No trailer available for this movie</p>
              </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
              <h3 className="text-2xl font-display font-bold text-white">{title}</h3>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
