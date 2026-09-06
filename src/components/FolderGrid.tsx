import React from 'react';
import { FolderPlus, Folder as FolderIcon, Trash2 } from 'lucide-react';
import type { Folder, MediaItem } from '../types';

interface FolderGridProps {
  folders: Folder[];
  items: MediaItem[];
  selectedFolderId: string;
  onSelectFolder: (id: string) => void;
  onOpenNewFolderModal: () => void;
  onDeleteFolder?: (id: string) => void;
}

export const FolderGrid: React.FC<FolderGridProps> = ({
  folders,
  items,
  selectedFolderId,
  onSelectFolder,
  onOpenNewFolderModal,
  onDeleteFolder
}) => {
  const getFolderItemCount = (folderId: string) => {
    if (folderId === 'all') return items.length;
    return items.filter((item) => item.folderId === folderId).length;
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FolderIcon className="w-5 h-5 text-amber-400" />
            <span>Cartelle & Album</span>
          </h3>
          <p className="text-xs text-slate-400">Esplora i ricordi suddivisi per luoghi, eventi o temi</p>
        </div>

        <button
          onClick={onOpenNewFolderModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-500/20 text-xs font-semibold transition-all hover:scale-105"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span>Nuova Cartella</span>
        </button>
      </div>

      {/* Horizontal Scrolling Folders */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none pt-1">
        {/* All Files Folder */}
        <button
          onClick={() => onSelectFolder('all')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
            selectedFolderId === 'all'
              ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/50 shadow-lg shadow-amber-500/10'
              : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
          }`}
        >
          <span className="text-base">📁</span>
          <span>Tutti i Ricordi</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            selectedFolderId === 'all' ? 'bg-amber-400 text-black' : 'bg-white/10 text-slate-400'
          }`}>
            {getFolderItemCount('all')}
          </span>
        </button>

        {/* Dynamic Folders */}
        {folders.map((folder) => {
          const isSelected = selectedFolderId === folder.id;
          const count = getFolderItemCount(folder.id);

          return (
            <div
              key={folder.id}
              className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/50 shadow-lg shadow-amber-500/10'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
              }`}
              onClick={() => onSelectFolder(folder.id)}
            >
              <span className="text-base">{folder.icon || '📁'}</span>
              <span>{folder.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                isSelected ? 'bg-amber-400 text-black' : 'bg-white/10 text-slate-400'
              }`}>
                {count}
              </span>

              {/* Delete custom folder button */}
              {!folder.isDefault && onDeleteFolder && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Vuoi eliminare la cartella "${folder.name}"? (I file verranno spostati in 'Momenti & Dediche')`)) {
                      onDeleteFolder(folder.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity ml-1"
                  title="Elimina cartella"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
