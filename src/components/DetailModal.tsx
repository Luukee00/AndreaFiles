import React, { useState, useRef, useEffect } from 'react';
import {
  X, Play, Pause, Download, Heart, Wand2, Sparkles,
  Copy, Check, Trash2, Volume2
} from 'lucide-react';
import type { MediaItem, Folder, ReactionCounts } from '../types';

interface DetailModalProps {
  item: MediaItem | null;
  allItems: MediaItem[];
  folders: Folder[];
  onClose: () => void;
  onNavigate?: (item: MediaItem) => void;
  onReaction: (id: string, emoji: keyof ReactionCounts) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteItem: (id: string) => void;
}

const REACTIONS: (keyof ReactionCounts)[] = ['❤️', '🔥', '😂', '🥂', '🎉'];

export const DetailModal: React.FC<DetailModalProps> = ({
  item, allItems, folders, onClose,
  onReaction, onToggleFavorite, onDeleteItem
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setProgress(0);
  }, [item?.id]);

  const [progress, setProgress] = useState(0);

  if (!item) return null;

  const folder = folders.find(f => f.id === item.folderId);
  const date = new Date(item.timestamp).toLocaleDateString('it-IT', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = t;
      setCurrentTime(t);
    }
  };

  const toggleRate = () => {
    const rates = [1, 1.25, 1.5, 2];
    const next = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };

  const copyTranscript = () => {
    if (item.audioTranscript) {
      navigator.clipboard.writeText(item.audioTranscript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleDelete = () => {
    if (confirm('Eliminare questo ricordo?')) {
      onDeleteItem(item.id);
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        className="modal-content"
        style={{ width: '100%', maxWidth: 520 }}
      >
        {/* Top bar */}
        <div style={{
          padding: '16px 20px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {folder && (
              <span style={{
                fontSize: 13, fontWeight: 600,
                color: 'var(--text-2)',
                display: 'flex', alignItems: 'center', gap: 5
              }}>
                <span>{folder.icon}</span>
                <span>{folder.name}</span>
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button className="btn-icon" onClick={handleDelete} title="Elimina" style={{ color: '#ef4444' }}>
              <Trash2 size={16} />
            </button>
            <button className="btn-icon" onClick={onClose} title="Chiudi">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── PHOTO DETAIL ── */}
        {item.type === 'photo' && item.dataUrl && (
          <div style={{ background: '#f0ece5' }}>
            <img
              src={item.dataUrl}
              alt={item.title}
              style={{ width: '100%', maxHeight: 420, objectFit: 'contain', display: 'block' }}
            />
          </div>
        )}

        {/* ── AUDIO DETAIL ── */}
        {item.type === 'audio' && (
          <div style={{
            padding: '24px 24px 20px',
            background: 'var(--surface-2)',
            borderBottom: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', gap: 16
          }}>
            {/* Cover icon */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'var(--gold-light)', border: '3px solid var(--gold)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32
              }}>
                🎙️
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Scrubber */}
              <input
                type="range"
                min={0}
                max={duration || item.audioDuration || 1}
                value={currentTime}
                onChange={handleSeek}
                style={{ accentColor: 'var(--gold)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)' }}>
                <span>{fmt(currentTime)}</span>
                <span>{fmt(duration || item.audioDuration || 0)}</span>
              </div>

              {/* Play + Rate + Download */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <button
                  onClick={toggleRate}
                  style={{
                    padding: '5px 12px', borderRadius: 99, border: '1px solid var(--border)',
                    background: 'var(--surface)', fontSize: 12, fontWeight: 700,
                    color: 'var(--text-2)', cursor: 'pointer'
                  }}
                >
                  {playbackRate}×
                </button>

                <button
                  onClick={togglePlay}
                  style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: 'var(--gold)', color: '#fff',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(184,147,90,0.35)',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  {isPlaying
                    ? <Pause size={22} fill="white" />
                    : <Play size={22} fill="white" style={{ marginLeft: 2 }} />
                  }
                </button>

                {item.dataUrl && (
                  <a
                    href={item.dataUrl}
                    download={`${item.title}.webm`}
                    style={{
                      padding: '5px 10px', borderRadius: 99, border: '1px solid var(--border)',
                      background: 'var(--surface)', color: 'var(--text-2)',
                      display: 'flex', alignItems: 'center', gap: 4,
                      fontSize: 12, textDecoration: 'none'
                    }}
                    title="Scarica audio"
                  >
                    <Download size={14} />
                  </a>
                )}
              </div>
            </div>

            {item.dataUrl && (
              <audio
                ref={audioRef}
                src={item.dataUrl}
                onTimeUpdate={() => {
                  if (!audioRef.current) return;
                  setCurrentTime(audioRef.current.currentTime);
                  const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
                  setProgress(isNaN(p) ? 0 : p);
                }}
                onLoadedMetadata={() => {
                  if (audioRef.current) setDuration(audioRef.current.duration);
                }}
                onEnded={() => { setIsPlaying(false); setCurrentTime(0); }}
              />
            )}

            {/* Transcript */}
            {item.audioTranscript && (
              <div style={{
                background: 'var(--surface)', borderRadius: 10, padding: '14px 16px',
                border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gold)' }}>
                    Trascrizione automatica
                  </span>
                  <button
                    onClick={copyTranscript}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', gap: 4, alignItems: 'center', fontSize: 12 }}
                  >
                    {copied ? <><Check size={13} color="green" /> Copiato!</> : <><Copy size={13} /> Copia</>}
                  </button>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                  "{item.audioTranscript}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── TEXT DETAIL ── */}
        {item.type === 'text' && (
          <div style={{
            padding: '32px 28px',
            background: 'linear-gradient(135deg, #FDF8F0 0%, #FAF6F0 100%)',
            borderBottom: '1px solid var(--border)'
          }}>
            <p className="font-handwriting" style={{
              fontSize: 24, lineHeight: 1.5, color: 'var(--text)',
              margin: 0, whiteSpace: 'pre-wrap'
            }}>
              {item.caption || item.title}
            </p>
          </div>
        )}

        {/* Info section */}
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 4px', color: 'var(--text)' }}>
              {item.title}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>
              Da <strong>{item.author}</strong> · {date}
            </p>
          </div>

          {/* Caption (for photo) */}
          {item.type === 'photo' && item.caption && (
            <p style={{ fontSize: 14, color: 'var(--text-2)', margin: 0, lineHeight: 1.6 }}>
              {item.caption}
            </p>
          )}

          {/* AI category */}
          {item.detectedCategory && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Wand2 size={13} color="var(--gold)" />
              <span style={{ fontSize: 12, color: 'var(--gold-dark)', fontWeight: 600 }}>
                Categoria rilevata: {item.detectedCategory}
              </span>
            </div>
          )}

          <div style={{ height: 1, background: 'var(--border)' }} />

          {/* Reactions */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', marginBottom: 8 }}>
              Reazioni
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {REACTIONS.map(emoji => {
                const count = item.reactions[emoji] || 0;
                return (
                  <button
                    key={emoji}
                    onClick={() => onReaction(item.id, emoji)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '6px 14px', borderRadius: 99,
                      border: '1px solid var(--border)',
                      background: count > 0 ? 'var(--gold-light)' : 'var(--surface)',
                      cursor: 'pointer', fontSize: 14,
                      fontWeight: 700, color: count > 0 ? 'var(--gold-dark)' : 'var(--text-2)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{emoji}</span>
                    {count > 0 && <span style={{ fontSize: 12 }}>{count}</span>}
                  </button>
                );
              })}
              <button
                onClick={() => onToggleFavorite(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 14px', borderRadius: 99,
                  border: '1px solid var(--border)',
                  background: item.isFavorite ? '#fef2f2' : 'var(--surface)',
                  cursor: 'pointer', fontSize: 14,
                  fontWeight: 700, color: item.isFavorite ? '#ef4444' : 'var(--text-2)',
                  transition: 'all 0.15s ease'
                }}
              >
                <Heart size={14} fill={item.isFavorite ? '#ef4444' : 'none'} />
                <span style={{ fontSize: 12 }}>{item.isFavorite ? 'Preferito' : 'Salva'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
