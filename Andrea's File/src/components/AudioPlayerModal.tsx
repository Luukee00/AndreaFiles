import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Play, Pause, Sparkles, Copy, 
  Check, Download 
} from 'lucide-react';
import type { MediaItem, Folder } from '../types';

interface AudioPlayerModalProps {
  item: MediaItem | null;
  folder?: Folder;
  onClose: () => void;
}

export const AudioPlayerModal: React.FC<AudioPlayerModalProps> = ({
  item,
  folder,
  onClose
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasCopiedTranscript, setHasCopiedTranscript] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (item && audioRef.current) {
      setIsPlaying(true);
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [item]);

  if (!item || item.type !== 'audio') return null;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const togglePlaybackRate = () => {
    const nextRate = playbackRate === 1 ? 1.25 : playbackRate === 1.25 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const copyTranscript = () => {
    if (item.audioTranscript) {
      navigator.clipboard.writeText(item.audioTranscript);
      setHasCopiedTranscript(true);
      setTimeout(() => setHasCopiedTranscript(false), 2000);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-amber-500/30 bg-[#0d1222] p-6 sm:p-8 shadow-2xl shadow-amber-500/10">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Audio Visualizer & Cover */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 p-1 mb-4 shadow-2xl shadow-amber-500/20">
            <div className="w-full h-full bg-[#0d111e] rounded-[22px] flex items-center justify-center text-4xl">
              🎙️
            </div>
          </div>

          <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
          <p className="text-xs text-slate-400">
            Registrato da <strong className="text-amber-300">{item.author}</strong> in {folder?.name || 'Momenti'}
          </p>
        </div>

        {/* Dynamic Waveform Visualizer */}
        <div className="flex items-center justify-center gap-1.5 h-16 py-2 px-4 rounded-2xl bg-slate-900/80 border border-white/5 mb-4">
          {[30, 60, 45, 90, 75, 100, 85, 40, 65, 95, 80, 50, 70, 90, 40, 60, 85, 45, 95, 70, 30].map((h, i) => (
            <div
              key={i}
              style={{
                height: isPlaying ? `${Math.max(15, (h * Math.sin(currentTime * 4 + i)) % 100)}%` : `${h * 0.4}%`
              }}
              className={`w-1.5 rounded-full transition-all duration-150 ${
                isPlaying ? 'bg-amber-400' : 'bg-amber-500/30'
              }`}
            />
          ))}
        </div>

        {/* Playback Controls & Scrubber */}
        <div className="space-y-3 mb-6">
          <input
            type="range"
            min={0}
            max={duration || 1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />

          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration || item.audioDuration || 0)}</span>
          </div>

          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={togglePlaybackRate}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-amber-300 border border-white/10 transition-all"
            >
              {playbackRate}x
            </button>

            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 ml-0.5 fill-current" />}
            </button>

            {item.dataUrl && (
              <a
                href={item.dataUrl}
                download={`${item.title}.webm`}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all"
                title="Scarica file audio"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Speech to Text Auto Transcript Card */}
        {item.audioTranscript && (
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/20 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Trascrizione Audio Automatica
              </span>
              <button
                onClick={copyTranscript}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
              >
                {hasCopiedTranscript ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copiato!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copia testo</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic bg-black/30 p-3 rounded-xl border border-white/5">
              "{item.audioTranscript}"
            </p>
          </div>
        )}

        {item.dataUrl && (
          <audio
            ref={audioRef}
            src={item.dataUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => {
              setIsPlaying(false);
              setCurrentTime(0);
            }}
            className="hidden"
          />
        )}
      </div>
    </div>
  );
};
