import React, { useState, useRef } from 'react';
import { 
  Play, Pause, Heart, Sparkles, Wand2, 
  Volume2, Quote, Trash2, Maximize2 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { MediaItem, Folder, ReactionCounts } from '../types';

interface MediaCardProps {
  item: MediaItem;
  folders: Folder[];
  onOpenPhoto: (item: MediaItem) => void;
  onOpenAudio: (item: MediaItem) => void;
  onReaction: (id: string, emoji: keyof ReactionCounts) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteItem: (id: string) => void;
}

const REACTION_EMOJIS: (keyof ReactionCounts)[] = ['❤️', '🔥', '😂', '🥂', '🎉'];

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  folders,
  onOpenPhoto,
  onOpenAudio,
  onReaction,
  onToggleFavorite,
  onDeleteItem
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentFolder = folders.find((f) => f.id === item.folderId);
  const formattedDate = new Date(item.timestamp).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short'
  });

  const handleAudioPlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (!audioRef.current) return;
    const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setAudioProgress(isNaN(progress) ? 0 : progress);
  };

  const handleReactionClick = (emoji: keyof ReactionCounts, e: React.MouseEvent) => {
    e.stopPropagation();
    onReaction(item.id, emoji);
    confetti({
      particleCount: 15,
      spread: 40,
      origin: {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      }
    });
  };

  return (
    <div className="group relative flex flex-col rounded-3xl border border-white/10 bg-[#0d1222]/90 hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/10 overflow-hidden">
      {/* CARD HEADER / BADGES */}
      <div className="p-4 pb-2 flex items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Folder Tag */}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-slate-300">
            <span>{currentFolder?.icon || '📁'}</span>
            <span>{currentFolder?.name || 'Generale'}</span>
          </span>

          {/* AI detected category badge for photos */}
          {item.detectedCategory && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-300">
              <Wand2 className="w-3 h-3" /> AI Match
            </span>
          )}
        </div>

        {/* Favorite Heart & Delete Menu */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleFavorite(item.id)}
            className={`p-1.5 rounded-xl transition-all ${
              item.isFavorite
                ? 'text-pink-500 bg-pink-500/10 scale-110'
                : 'text-slate-400 hover:text-pink-400 hover:bg-white/5'
            }`}
            title="Aggiungi ai preferiti"
          >
            <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={() => {
              if (confirm('Sei sicuro di voler eliminare questo ricordo?')) {
                onDeleteItem(item.id);
              }
            }}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-white/5 transition-opacity"
            title="Elimina ricordo"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* CARD BODY ACCORDING TO MEDIA TYPE */}
      {/* 1. PHOTO TYPE */}
      {item.type === 'photo' && item.dataUrl && (
        <div
          onClick={() => onOpenPhoto(item)}
          className="relative cursor-pointer overflow-hidden aspect-[4/3] bg-black/40 mx-4 my-2 rounded-2xl group/img"
        >
          <img
            src={item.dataUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end justify-between p-3 text-white">
            <span className="text-xs font-semibold flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5" /> Ingrandisci
            </span>
          </div>
        </div>
      )}

      {/* 2. AUDIO TYPE */}
      {item.type === 'audio' && (
        <div className="p-4 pt-2">
          {/* Audio Player Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900/80 to-slate-950 border border-amber-500/20 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handleAudioPlayToggle}
                className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                {isPlayingAudio ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-0.5 fill-current" />}
              </button>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5" /> Vocale
                  </span>
                  <span>{item.audioDuration ? `${item.audioDuration}s` : 'Audio'}</span>
                </div>

                {/* Animated Waveform Simulation */}
                <div className="flex items-center gap-1 h-6 py-1">
                  {[40, 70, 30, 90, 60, 100, 45, 80, 50, 95, 30, 85, 60, 40].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        height: isPlayingAudio ? `${Math.max(15, (h * Math.sin(Date.now() / 200 + i)) % 100)}%` : `${h * 0.4}%`
                      }}
                      className={`flex-1 rounded-full transition-all duration-150 ${
                        isPlayingAudio ? 'bg-amber-400' : 'bg-amber-500/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Audio Progress Bar */}
            <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-100"
                style={{ width: `${audioProgress}%` }}
              />
            </div>

            {item.dataUrl && (
              <audio
                ref={audioRef}
                src={item.dataUrl}
                onTimeUpdate={handleAudioTimeUpdate}
                onEnded={() => {
                  setIsPlayingAudio(false);
                  setAudioProgress(0);
                }}
                className="hidden"
              />
            )}

            {/* Speech to text transcript preview */}
            {item.audioTranscript && (
              <div
                onClick={() => onOpenAudio(item)}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-white/5 text-xs text-slate-300 cursor-pointer hover:bg-slate-850 hover:border-amber-500/30 transition-all"
              >
                <p className="font-semibold text-amber-300 text-[11px] mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Trascrizione automatica:
                </p>
                <p className="italic line-clamp-2 text-slate-300">"{item.audioTranscript}"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. TEXT DEDICA TYPE */}
      {item.type === 'text' && (
        <div className="p-5 pt-2">
          <div className="relative p-5 rounded-2xl bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-slate-900 border border-pink-500/20 shadow-inner">
            <Quote className="w-8 h-8 text-pink-400/20 absolute top-3 right-3" />
            <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed mb-4 whitespace-pre-line font-['Caveat',cursive] text-lg">
              "{item.caption || item.title}"
            </p>
            <p className="text-xs text-pink-300 font-bold text-right">— {item.author}</p>
          </div>
        </div>
      )}

      {/* CARD CONTENT / TITLE & CAPTION */}
      <div className="p-4 pt-1 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-base font-bold text-white mb-1 line-clamp-1">{item.title}</h4>
          {item.type !== 'text' && item.caption && (
            <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
              {item.caption}
            </p>
          )}
        </div>

        {/* AUTHOR & DATE */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Da: <strong>{item.author}</strong></span>
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* REACTION BAR */}
      <div className="p-3 bg-black/30 border-t border-white/5 flex items-center justify-around gap-1">
        {REACTION_EMOJIS.map((emoji) => {
          const count = item.reactions[emoji] || 0;
          return (
            <button
              key={emoji}
              onClick={(e) => handleReactionClick(emoji, e)}
              className="flex items-center gap-1 px-2 py-1 rounded-xl bg-white/5 hover:bg-white/10 hover:scale-110 active:scale-95 transition-all text-xs text-slate-300 hover:text-white"
            >
              <span>{emoji}</span>
              {count > 0 && <span className="font-bold text-[11px] text-amber-300">{count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
