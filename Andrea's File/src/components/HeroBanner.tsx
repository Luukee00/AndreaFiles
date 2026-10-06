import React from 'react';
import { Camera, Mic, Heart, Film, Sparkles, Wand2, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface HeroBannerProps {
  onOpenUpload: (tab: 'photo' | 'audio' | 'text') => void;
  onOpenSlideshow: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onOpenUpload,
  onOpenSlideshow
}) => {
  const blastConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.3 }
    });
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#12172b]/90 via-[#0d1222]/80 to-[#090b14] p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
      {/* Background ambient lighting effects */}
      <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/2 -translate-x-1/2 h-56 w-96 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
        {/* Festivity Badge */}
        <div
          onClick={blastConfetti}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-purple-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold mb-6 shadow-inner cursor-pointer hover:scale-105 transition-transform"
        >
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>18 Anni di Andrea • La Nostra Storia Insieme</span>
          <span className="text-base">🥂</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight mb-4">
          Tutti i ricordi di <span className="gold-gradient-text">Andrea</span> in un unico posto
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl font-normal leading-relaxed mb-8">
          Benvenuto su <strong>Andrea's Files</strong>! Carica le foto delle nostre avventure (il nostro assistente AI le smisterà per te), lascia un messaggio vocale registrato con trascrizione automatica o scrivi una dedica speciale.
        </p>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full mb-8">
          {/* Upload Photo Button */}
          <button
            onClick={() => onOpenUpload('photo')}
            className="group relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-white/5 hover:bg-sky-500/10 border border-white/10 hover:border-sky-500/40 transition-all duration-300 hover:-translate-y-1 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-sky-500/10">
              <Camera className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors flex items-center justify-center gap-1">
                Carica Foto <Wand2 className="w-3.5 h-3.5 text-amber-400" />
              </h4>
              <p className="text-xs text-slate-400 mt-1">Con smistamento AI automatico</p>
            </div>
          </button>

          {/* Record Voice Button */}
          <button
            onClick={() => onOpenUpload('audio')}
            className="group relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/10">
              <Mic className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                Messaggio Vocale 🎙️
              </h4>
              <p className="text-xs text-slate-400 mt-1">Trascrizione testo automatica</p>
            </div>
          </button>

          {/* Text Dedica Button */}
          <button
            onClick={() => onOpenUpload('text')}
            className="group relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-white/5 hover:bg-pink-500/10 border border-white/10 hover:border-pink-500/40 transition-all duration-300 hover:-translate-y-1 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-pink-500/10">
              <Heart className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors">
                Scrivi Dedica 💌
              </h4>
              <p className="text-xs text-slate-400 mt-1">Pensieri, ricordi e aneddoti</p>
            </div>
          </button>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800">
            <Wand2 className="w-3.5 h-3.5 text-amber-400" />
            Smart AI Folder Detection (Mare, Montagna, Feste...)
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            100% Gratuito & Salvato nel Browser
          </span>
          <button
            onClick={onOpenSlideshow}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 text-purple-300 border border-purple-800/80 hover:bg-purple-900/80 transition-colors"
          >
            <Film className="w-3.5 h-3.5" />
            Apri Cinema per la Festa
          </button>
        </div>
      </div>
    </div>
  );
};
