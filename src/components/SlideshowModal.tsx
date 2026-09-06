import React, { useState, useEffect } from 'react';
import { 
  X, Play, Pause, ChevronLeft, ChevronRight, 
  Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { MediaItem, Folder } from '../types';

interface SlideshowModalProps {
  isOpen: boolean;
  items: MediaItem[];
  folders: Folder[];
  onClose: () => void;
}

export const SlideshowModal: React.FC<SlideshowModalProps> = ({
  isOpen,
  items,
  folders,
  onClose
}) => {
  const photoItems = items.filter((i) => i.type === 'photo' && i.dataUrl);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [slideInterval, setSlideInterval] = useState(5); // seconds
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen || !isPlaying || photoItems.length <= 1) return;

    setProgress(0);
    const intervalTime = slideInterval * 1000;
    const stepTime = 100;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += stepTime;
      setProgress((elapsed / intervalTime) * 100);

      if (elapsed >= intervalTime) {
        elapsed = 0;
        setCurrentIndex((prev) => (prev + 1) % photoItems.length);
        
        // Periodic celebratory confetti during slideshow
        if (Math.random() > 0.6) {
          confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
        }
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isOpen, isPlaying, currentIndex, slideInterval, photoItems.length]);

  if (!isOpen || photoItems.length === 0) return null;

  const currentItem = photoItems[currentIndex];
  const currentFolder = folders.find((f) => f.id === currentItem.folderId);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photoItems.length - 1));
    setProgress(0);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photoItems.length);
    setProgress(0);
  };

  const triggerPartyConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 120,
      origin: { y: 0.5 },
      colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#3b82f6', '#fbbf24']
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black text-white overflow-hidden animate-in fade-in duration-300">
      {/* Ambient background blur */}
      <div
        className="absolute inset-0 opacity-25 blur-3xl scale-125 transition-all duration-1000 bg-cover bg-center"
        style={{ backgroundImage: `url(${currentItem.dataUrl})` }}
      />

      {/* Top Header Bar */}
      <div className="relative z-20 w-full p-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black text-sm">
            18
          </div>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span>Andrea's Files • Cinema Mode</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Festa dei 18 Anni
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Foto {currentIndex + 1} di {photoItems.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={triggerPartyConfetti}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-pink-500/20 hover:scale-105 transition-transform"
          >
            <Sparkles className="w-4 h-4" />
            <span>Coriandoli 🎉</span>
          </button>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Slide Presentation */}
      <div className="relative z-10 flex-1 w-full max-w-6xl p-4 sm:p-8 flex items-center justify-center">
        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-6 p-4 rounded-2xl bg-black/60 hover:bg-white/20 text-white border border-white/10 transition-all hover:scale-110"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-6 p-4 rounded-2xl bg-black/60 hover:bg-white/20 text-white border border-white/10 transition-all hover:scale-110"
        >
          <ChevronRight className="w-8 h-8" />
        </button>

        {/* Slide Card */}
        <div className="relative max-w-4xl max-h-[68vh] w-full flex flex-col items-center justify-center">
          <img
            key={currentItem.id}
            src={currentItem.dataUrl}
            alt={currentItem.title}
            className="max-h-[60vh] max-w-full object-contain rounded-3xl shadow-2xl ring-2 ring-white/10 transition-all duration-700 animate-in zoom-in-95"
          />

          {/* Slide Caption Overlay */}
          <div className="mt-4 text-center max-w-xl">
            <h3 className="text-2xl font-black text-white mb-1 drop-shadow-md">
              {currentItem.title}
            </h3>
            {currentItem.caption && (
              <p className="text-sm text-slate-200 leading-relaxed drop-shadow-md">
                "{currentItem.caption}"
              </p>
            )}
            <p className="text-xs text-amber-400 font-semibold mt-1">
              {currentFolder?.icon} {currentFolder?.name} • Ricordo di <strong>{currentItem.author}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Controls & Progress Bar */}
      <div className="relative z-20 w-full p-6 bg-gradient-to-t from-black/90 to-transparent flex flex-col items-center gap-3">
        {/* Progress line */}
        <div className="w-full max-w-md bg-white/10 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-400 to-pink-500 h-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSlideInterval((prev) => (prev === 3 ? 5 : prev === 5 ? 8 : 3))}
            className="px-3 py-1 rounded-xl bg-white/10 text-xs font-semibold text-slate-300 hover:text-white"
          >
            ⏱️ {slideInterval}s
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-amber-500/20"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-0.5 fill-current" />}
          </button>
        </div>
      </div>
    </div>
  );
};
