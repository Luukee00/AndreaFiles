import React from 'react';
import { 
  Search, Image as ImageIcon, Music, Heart, 
  SlidersHorizontal, Plus 
} from 'lucide-react';
import type { MediaItem, Folder, MediaType, SortOption, ReactionCounts } from '../types';
import { MediaCard } from './MediaCard';

interface MediaGridProps {
  items: MediaItem[];
  folders: Folder[];
  currentFolderId: string;
  searchQuery: string;
  selectedMediaType: 'all' | MediaType;
  sortBy: SortOption;
  onSearchChange: (query: string) => void;
  onMediaTypeChange: (type: 'all' | MediaType) => void;
  onSortChange: (sort: SortOption) => void;
  onOpenPhoto: (item: MediaItem) => void;
  onOpenAudio: (item: MediaItem) => void;
  onReaction: (id: string, emoji: keyof ReactionCounts) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onOpenUpload: () => void;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  items,
  folders,
  currentFolderId,
  searchQuery,
  selectedMediaType,
  sortBy,
  onSearchChange,
  onMediaTypeChange,
  onSortChange,
  onOpenPhoto,
  onOpenAudio,
  onReaction,
  onToggleFavorite,
  onDeleteItem,
  onOpenUpload
}) => {
  const currentFolder = folders.find((f) => f.id === currentFolderId);

  // Filter items
  const filteredItems = items
    .filter((item) => {
      // Folder filter
      if (currentFolderId !== 'all' && item.folderId !== currentFolderId) {
        return false;
      }
      // Type filter
      if (selectedMediaType !== 'all' && item.type !== selectedMediaType) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesAuthor = item.author.toLowerCase().includes(query);
        const matchesCaption = item.caption?.toLowerCase().includes(query) || false;
        const matchesTranscript = item.audioTranscript?.toLowerCase().includes(query) || false;
        const matchesTags = item.tags.some((t) => t.toLowerCase().includes(query));
        return matchesTitle || matchesAuthor || matchesCaption || matchesTranscript || matchesTags;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return b.timestamp - a.timestamp;
      if (sortBy === 'oldest') return a.timestamp - b.timestamp;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'most_reacted') {
        const totalA = Object.values(a.reactions).reduce((acc, c) => acc + c, 0);
        const totalB = Object.values(b.reactions).reduce((acc, c) => acc + c, 0);
        return totalB - totalA;
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-[#0d1222]/80 border border-white/10 backdrop-blur-xl">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cerca per titolo, autore, parola chiave..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Media Type Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-semibold overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => onMediaTypeChange('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedMediaType === 'all'
                ? 'bg-amber-500 text-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tutti ({items.length})
          </button>
          <button
            onClick={() => onMediaTypeChange('photo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              selectedMediaType === 'photo'
                ? 'bg-sky-500 text-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Foto</span>
          </button>
          <button
            onClick={() => onMediaTypeChange('audio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              selectedMediaType === 'audio'
                ? 'bg-amber-500 text-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Vocali</span>
          </button>
          <button
            onClick={() => onMediaTypeChange('text')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              selectedMediaType === 'text'
                ? 'bg-pink-500 text-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Dediche</span>
          </button>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="px-3 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
          >
            <option value="newest">Più recenti</option>
            <option value="most_reacted">Più amati ❤️</option>
            <option value="oldest">Più vecchi</option>
            <option value="title">Alfabetico (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Active Folder Header info if in a specific folder */}
      {currentFolderId !== 'all' && currentFolder && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-transparent border border-amber-500/20">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentFolder.icon}</span>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{currentFolder.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400 text-black font-extrabold">
                  {filteredItems.length} ricordi
                </span>
              </h3>
              {currentFolder.description && (
                <p className="text-xs text-slate-400">{currentFolder.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ITEMS GRID */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              folders={folders}
              onOpenPhoto={onOpenPhoto}
              onOpenAudio={onOpenAudio}
              onReaction={onReaction}
              onToggleFavorite={onToggleFavorite}
              onDeleteItem={onDeleteItem}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-white/15 bg-slate-900/30">
          <div className="w-16 h-16 rounded-2xl bg-white/5 text-amber-400 flex items-center justify-center mb-4 text-2xl">
            ✨
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Nessun ricordo trovato</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-6">
            {searchQuery
              ? `Nessun risultato per "${searchQuery}". Prova un termine diverso!`
              : 'Non ci sono ancora file in questa cartella. Sii il primo a caricare una foto o un vocale!'}
          </p>
          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Aggiungi il primo ricordo</span>
          </button>
        </div>
      )}
    </div>
  );
};
