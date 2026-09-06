import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Heart, Quote } from 'lucide-react';
import type { MediaItem, Folder, ReactionCounts } from '../types';

interface FeedCardProps {
  item: MediaItem;
  folders: Folder[];
  onClick: () => void;
  onReaction: (id: string, emoji: keyof ReactionCounts) => void;
  onToggleFavorite: (id: string) => void;
}

export const FeedCard: React.FC<FeedCardProps> = ({
  item, folders, onClick, onToggleFavorite
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const folder = folders.find(f => f.id === item.folderId);
  const date = new Date(item.timestamp).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });

  // Cleanup on unmount / item change
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setIsReady(false);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [item.id]);

  // Animated progress via rAF (avoids setState storm on timeupdate)
  const tickProgress = useCallback(() => {
    if (!audioRef.current) return;
    const { currentTime, duration } = audioRef.current;
    if (duration > 0) {
      setProgress((currentTime / duration) * 100);
    }
    animFrameRef.current = requestAnimationFrame(tickProgress);
  }, []);

  const handlePlayPause = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
        animFrameRef.current = requestAnimationFrame(tickProgress);
      } catch (err) {
        console.warn('Audio play error:', err);
        setIsPlaying(false);
      }
    }
  };

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(item.id);
  };

  const handleEnded = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <article
      className="card card-interactive card-in"
      onClick={onClick}
      style={{ overflow: 'hidden', userSelect: 'none' }}
    >
      {/* ── PHOTO ── */}
      {item.type === 'photo' && item.dataUrl && (
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/10',
          overflow: 'hidden',
          background: 'var(--surface-2)',
        }}>
          <img
            src={item.dataUrl}
            alt={item.title}
            loading="lazy"
            draggable={false}
            style={{
              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              transition: 'transform 0.4s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          />
          {/* AI category badge */}
          {item.detectedCategory && (
            <div style={{
              position: 'absolute', bottom: 10, left: 10,
              background: 'rgba(255,255,255,0.90)',
              borderRadius: 99, padding: '3px 10px',
              fontSize: 11, fontWeight: 600, color: 'var(--text-2)',
              backdropFilter: 'blur(6px)', border: '1px solid rgba(0,0,0,0.06)',
            }}>
              {item.detectedCategory}
            </div>
          )}
        </div>
      )}

      {/* ── AUDIO ── */}
      {item.type === 'audio' && (
        <div
          style={{
            padding: '18px 18px 14px',
            background: 'var(--surface-2)',
            borderBottom: '1px solid var(--border)',
          }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Play button */}
            <button
              onClick={handlePlayPause}
              disabled={item.dataUrl ? false : true}
              style={{
                width: 42, height: 42, borderRadius: '50%',
                background: isPlaying ? 'var(--text)' : 'var(--gold)',
                color: '#fff',
                border: 'none', cursor: item.dataUrl ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.15s ease',
                opacity: item.dataUrl ? 1 : 0.4,
              }}
            >
              {isPlaying ? (
                // Pause icon
                <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                  <rect x="3" y="2" width="4" height="12" rx="1"/>
                  <rect x="9" y="2" width="4" height="12" rx="1"/>
                </svg>
              ) : (
                // Play icon
                <svg width="16" height="16" viewBox="0 0 16 16" fill="white" style={{ marginLeft: 2 }}>
                  <polygon points="3,2 13,8 3,14"/>
                </svg>
              )}
            </button>

            {/* Waveform bars */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, height: 32 }}>
              {[3,6,4,8,6,9,5,8,4,7,3,9,6,4,8,5,7,4,6,3].map((h, i) => (
                <div
                  key={i}
                  className="waveform-bar"
                  style={{
                    flex: 1,
                    height: `${h * 3}px`,
                    background: isPlaying
                      ? (i / 20 * 100 <= progress ? 'var(--gold)' : 'var(--border-dark)')
                      : 'var(--border)',
                    borderRadius: 99,
                    minHeight: 3,
                    transition: 'background 0.12s ease',
                  }}
                />
              ))}
            </div>

            <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
              {item.audioDuration ? `${item.audioDuration}s` : '—'}
            </span>
          </div>

          {/* Progress bar */}
          {item.dataUrl && (
            <div style={{ marginTop: 10, width: '100%', height: 2, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                width: `${progress}%`, height: '100%',
                background: 'var(--gold)', borderRadius: 99,
              }} />
            </div>
          )}

          {/* Hidden audio element */}
          {item.dataUrl && (
            <audio
              ref={audioRef}
              src={item.dataUrl}
              preload="auto"
              onCanPlay={() => setIsReady(true)}
              onEnded={handleEnded}
              onPause={() => {
                if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
                setIsPlaying(false);
              }}
            />
          )}

          {/* "No audio" notice for sample items */}
          {!item.dataUrl && (
            <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '8px 0 0', fontStyle: 'italic' }}>
              Messaggio vocale campione — nessun file audio
            </p>
          )}
        </div>
      )}

      {/* ── TEXT / DEDICA ── */}
      {item.type === 'text' && (
        <div style={{
          padding: '22px 20px 18px',
          background: '#FDFAF5',
          borderBottom: '1px solid var(--border)',
          position: 'relative', minHeight: 110,
        }}>
          <Quote size={24} color="var(--gold-light)" style={{ position: 'absolute', top: 14, right: 16 }} />
          <p className="font-handwriting" style={{
            fontSize: 18, color: 'var(--text)', lineHeight: 1.55, margin: 0,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 4, WebkitBoxOrient: 'vertical',
          }}>
            {item.caption || item.title}
          </p>
        </div>
      )}

      {/* ── CARD FOOTER ── */}
      <div style={{ padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{
            fontSize: 13, fontWeight: 600, color: 'var(--text)',
            margin: 0, lineHeight: 1.3,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {item.title}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '2px 0 0', fontWeight: 500 }}>
            {item.author} · {date}
          </p>
        </div>

        <button
          onClick={handleFav}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '4px', borderRadius: 6, flexShrink: 0,
            color: item.isFavorite ? '#e5534b' : 'var(--border-dark)',
            transition: 'color 0.15s ease',
            display: 'flex', alignItems: 'center',
          }}
        >
          <Heart size={14} fill={item.isFavorite ? '#e5534b' : 'none'} />
        </button>
      </div>
    </article>
  );
};
