import React from 'react';
import { X, Sparkles } from 'lucide-react';
import type { MediaItem } from '../types';

interface Category {
  id: string;
  label: string;
  emoji: string;
  count: number;
}

interface CategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: MediaItem[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

function buildCategories(items: MediaItem[]): Category[] {
  const map = new Map<string, number>();
  for (const item of items) {
    if (item.detectedCategory) {
      map.set(item.detectedCategory, (map.get(item.detectedCategory) || 0) + 1);
    }
  }
  return Array.from(map.entries())
    .map(([label, count]) => ({
      id: label,
      label,
      emoji: getCategoryEmoji(label),
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

function getCategoryEmoji(label: string): string {
  const l = label.toLowerCase();
  if (l.includes('mare') || l.includes('spiaggia') || l.includes('beach')) return '🏖️';
  if (l.includes('montagna') || l.includes('trekking') || l.includes('mountain')) return '🏔️';
  if (l.includes('fest') || l.includes('serata') || l.includes('party')) return '🍾';
  if (l.includes('scuola') || l.includes('studio') || l.includes('school')) return '📚';
  if (l.includes('sport') || l.includes('calcio') || l.includes('palestra')) return '⚽';
  if (l.includes('infanzia') || l.includes('bambino') || l.includes('baby')) return '👶';
  if (l.includes('viaggio') || l.includes('travel')) return '✈️';
  if (l.includes('momenti') || l.includes('dediche')) return '✨';
  return '📌';
}

export const CategoryDrawer: React.FC<CategoryDrawerProps> = ({
  isOpen, onClose, items, selectedCategory, onSelectCategory
}) => {
  const photoCount = items.filter(i => i.type === 'photo').length;
  const audioCount = items.filter(i => i.type === 'audio').length;
  const textCount  = items.filter(i => i.type === 'text').length;
  // Derive AI categories dynamically from items — auto-updates when new items are added
  const aiCategories = buildCategories(items);

  const select = (cat: string) => {
    onSelectCategory(cat);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="drawer-backdrop" onClick={onClose} />

      {/* Drawer */}
      <div className="drawer">
        {/* Header */}
        <div style={{
          padding: '18px 18px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1,
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Categorie
          </h2>
          <button className="btn-icon" onClick={onClose} aria-label="Chiudi">
            <X size={18} color="var(--text-2)" />
          </button>
        </div>

        <div style={{ padding: '12px 10px 24px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* All */}
          <DrawerItem
            emoji="✦"
            label="Tutti i ricordi"
            count={items.length}
            active={selectedCategory === 'all'}
            onClick={() => select('all')}
          />

          {/* Separator */}
          <div style={{ height: 1, background: 'var(--border)', margin: '8px 6px' }} />

          {/* By type */}
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'var(--text-3)', padding: '2px 8px 4px' }}>
            Tipo
          </p>
          <DrawerItem emoji="🖼️" label="Foto"    count={photoCount} active={selectedCategory === 'photo'} onClick={() => select('photo')} />
          <DrawerItem emoji="🎙️" label="Audio"   count={audioCount} active={selectedCategory === 'audio'} onClick={() => select('audio')} />
          <DrawerItem emoji="💌" label="Dediche" count={textCount}  active={selectedCategory === 'text'}  onClick={() => select('text')}  />

          {/* AI Categories — auto-populated */}
          {aiCategories.length > 0 && (
            <>
              <div style={{ height: 1, background: 'var(--border)', margin: '8px 6px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '2px 8px 4px' }}>
                <Sparkles size={10} color="var(--gold)" />
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'var(--text-3)', margin: 0 }}>
                  Categorie AI
                </p>
              </div>
              {aiCategories.map(cat => (
                <DrawerItem
                  key={cat.id}
                  emoji={cat.emoji}
                  label={cat.label}
                  count={cat.count}
                  active={selectedCategory === cat.id}
                  onClick={() => select(cat.id)}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
};

interface DrawerItemProps {
  emoji: string;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

const DrawerItem: React.FC<DrawerItemProps> = ({ emoji, label, count, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 10px',
      borderRadius: 8,
      border: 'none',
      background: active ? 'var(--gold-light)' : 'transparent',
      color: active ? 'var(--gold-dark)' : 'var(--text)',
      fontWeight: active ? 700 : 500,
      fontSize: 13,
      cursor: 'pointer',
      width: '100%',
      textAlign: 'left',
      transition: 'background 0.14s ease, color 0.14s ease',
    }}
    onMouseEnter={e => {
      if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-2)';
    }}
    onMouseLeave={e => {
      if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
    }}
  >
    <span style={{ fontSize: 15, width: 22, textAlign: 'center', flexShrink: 0 }}>{emoji}</span>
    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
    <span style={{
      fontSize: 11, fontWeight: 700,
      color: active ? 'var(--gold-dark)' : 'var(--text-3)',
      background: active ? 'rgba(184,147,90,0.15)' : 'var(--surface-2)',
      padding: '1px 7px', borderRadius: 99, flexShrink: 0,
    }}>
      {count}
    </span>
  </button>
);
