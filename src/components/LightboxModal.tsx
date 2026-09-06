import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Heart, Wand2 } from 'lucide-react';
import type { MediaItem, Folder } from '../types';

interface LightboxModalProps {
  item: MediaItem | null;
  allItems: MediaItem[];
  folders: Folder[];
  onClose: () => void;
  onNavigate: (item: MediaItem) => void;
  onToggleFavorite: (id: string) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  item,
  allItems,
  folders,
  onClose,
  onNavigate,
  onToggleFavorite
}) => {
  const photoItems = allItems.filter((i) => i.type === 'photo');
  const currentIndex = photoItems.findIndex((i) => i.id === item?.id);

  const prevItem = currentIndex > 0 ? photoItems[currentIndex - 1] : photoItems[photoItems.length - 1];
  const nextItem = currentIndex < photoItems.length - 1 ? photoItems[currentIndex + 1] : photoItems[0];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && prevItem) onNavigate(prevItem);
      if (e.key === 'ArrowRight' && nextItem) onNavigate(nextItem);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, prevItem, nextItem, onClose, onNavigate]);

  if (!item || item.type !== 'photo' || !item.dataUrl) return null;

  const currentFolder = folders.find((f) => f.id === item.folderId);
  const formattedDate = new Date(item.timestamp).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Top action bar */}
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/10">
            {currentFolder?.icon} {currentFolder?.name || 'Foto'}
          </span>
          {item.detectedCategory && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Wand2 className="w-3.5 h-3.5" /> {item.detectedCategory}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleFavorite(item.id)}
            className={`p-2.5 rounded-xl border border-white/10 transition-all ${
              item.isFavorite
                ? 'text-pink-500 bg-pink-500/20 border-pink-500/40'
                : 'text-slate-300 bg-white/5 hover:bg-white/10'
            }`}
            title="Preferito"
          >
            <Heart className={`w-5 h-5 ${item.isFavorite ? 'fill-current' : ''}`} />
          </button>

          <a
            href={item.dataUrl}
            download={`${item.title || 'Foto_Andrea'}.jpg`}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all"
            title="Scarica Foto"
          >
            <Download className="w-5 h-5" />
          </a>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation Arrows */}
      {photoItems.length > 1 && (
        <>
          <button
            onClick={() => onNavigate(prevItem)}
            className="absolute left-4 z-20 p-3 rounded-2xl bg-black/50 hover:bg-white/20 text-white border border-white/10 transition-all hover:scale-110"
            title="Foto precedente"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => onNavigate(nextItem)}
            className="absolute right-4 z-20 p-3 rounded-2xl bg-black/50 hover:bg-white/20 text-white border border-white/10 transition-all hover:scale-110"
            title="Foto successiva"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Main Image */}
      <div className="relative max-w-5xl max-h-[75vh] w-full p-4 flex items-center justify-center">
        <img
          src={item.dataUrl}
          alt={item.title}
          className="max-h-[70vh] max-w-full object-contain rounded-2xl shadow-2xl ring-1 ring-white/10"
        />
      </div>

      {/* Bottom Info Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-center max-w-2xl mx-auto">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-1">{item.title}</h3>
        {item.caption && <p className="text-xs sm:text-sm text-slate-300 mb-2 leading-relaxed">{item.caption}</p>}
        <p className="text-xs text-amber-400 font-semibold">
          Caricato da <strong className="text-white">{item.author}</strong> • {formattedDate}
        </p>
      </div>
    </div>
  );
};
