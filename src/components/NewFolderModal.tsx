import React, { useState } from 'react';
import { X, FolderPlus, Sparkles } from 'lucide-react';
import type { Folder } from '../types';

interface NewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (folder: Omit<Folder, 'createdAt'>) => void;
}

const EMOJI_OPTIONS = ['🏖️', '🏔️', '🍾', '📚', '⚽', '👶', '✨', '🚗', '🍕', '🎮', '⛺', '✈️', '🎸', '🐶', '🎉', '🏖️', '🍻', '🎓'];
const COLOR_OPTIONS = [
  { name: 'Sky', hex: '#0ea5e9', gradient: 'from-cyan-500/20 to-blue-600/20' },
  { name: 'Emerald', hex: '#10b981', gradient: 'from-emerald-500/20 to-teal-700/20' },
  { name: 'Amber', hex: '#f59e0b', gradient: 'from-amber-500/20 to-orange-600/20' },
  { name: 'Purple', hex: '#8b5cf6', gradient: 'from-purple-500/20 to-indigo-600/20' },
  { name: 'Rose', hex: '#f43f5e', gradient: 'from-rose-500/20 to-pink-600/20' },
  { name: 'Violet', hex: '#7c3aed', gradient: 'from-violet-500/20 to-fuchsia-600/20' }
];

export const NewFolderModal: React.FC<NewFolderModalProps> = ({
  isOpen,
  onClose,
  onCreateFolder
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📁');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString().slice(-4);
    
    onCreateFolder({
      id,
      name: name.trim(),
      icon: selectedEmoji,
      description: description.trim() || undefined,
      color: selectedColor.hex,
      bgGradient: selectedColor.gradient,
      isDefault: false
    });

    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0d1222] p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <FolderPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Nuova Cartella / Album</h3>
            <p className="text-xs text-slate-400">Crea una nuova categoria per organizzare i file</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Folder Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Nome Cartella *
            </label>
            <input
              type="text"
              required
              placeholder="Es. Vacanze in Spagna, Gita 5ª Superiore..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Emoji Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Icona Emoji
            </label>
            <div className="flex flex-wrap gap-2 p-2 rounded-xl bg-slate-900/50 border border-white/10 max-h-32 overflow-y-auto">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                    selectedEmoji === emoji
                      ? 'bg-amber-500/30 border border-amber-500 scale-110'
                      : 'hover:bg-white/10'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Colore Tema
            </label>
            <div className="flex items-center gap-3">
              {COLOR_OPTIONS.map((color) => (
                <button
                  type="button"
                  key={color.name}
                  onClick={() => setSelectedColor(color)}
                  style={{ backgroundColor: color.hex }}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    selectedColor.name === color.name
                      ? 'ring-4 ring-white/30 scale-110 shadow-lg'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Optional Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Descrizione (opzionale)
            </label>
            <input
              type="text"
              placeholder="Breve nota su questa cartella..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Crea Cartella</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
