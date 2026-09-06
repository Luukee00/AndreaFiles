import { useState, useEffect, useMemo } from 'react';
import type { Folder, MediaItem, MediaType, ReactionCounts } from './types';
import { getAllFolders, getAllItems, addItem, deleteItem, addReaction, toggleFavorite } from './services/storage';
import { Navbar } from './components/Navbar';
import { CategoryDrawer } from './components/CategoryDrawer';
import { FeedCard } from './components/FeedCard';
import { DetailModal } from './components/DetailModal';
import { UploadModal } from './components/UploadModal';
import { IntroLoader } from './components/IntroLoader';

type FilterKey = 'all' | MediaType | string;

// Stable per-session shuffle using item IDs
function shuffleStable(items: MediaItem[]): MediaItem[] {
  const seed = items.reduce((acc, i) => acc + i.id.charCodeAt(0), 0);
  return [...items].sort((a, b) => {
    const ha = (a.id.charCodeAt(0) * 2654435761 + seed) >>> 0;
    const hb = (b.id.charCodeAt(0) * 2654435761 + seed) >>> 0;
    return ha - hb;
  });
}

export function App() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>('all');
  const [activeItem, setActiveItem] = useState<MediaItem | null>(null);

  const loadData = async () => {
    try {
      const [f, it] = await Promise.all([getAllFolders(), getAllItems()]);
      setFolders(f);
      setItems(it);
    } catch (err) {
      console.error('Errore nel caricamento dei dati:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  /* ── Filtered + shuffled feed ── */
  const filteredItems = useMemo(() => {
    let list = [...items];

    if (selectedFilter === 'all') {
      list = shuffleStable(list);
    } else if (selectedFilter === 'photo' || selectedFilter === 'audio' || selectedFilter === 'text') {
      list = list.filter(i => i.type === selectedFilter);
    } else {
      // AI category filter
      list = list.filter(i => i.detectedCategory === selectedFilter);
    }

    return list;
  }, [items, selectedFilter]);

  /* ── Actions ── */
  const handleSaveItem = async (data: Omit<MediaItem, 'id' | 'reactions' | 'timestamp'>) => {
    const created = await addItem({
      ...data,
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    });
    setItems(prev => [created, ...prev]);
  };

  const handleDeleteItem = async (id: string) => {
    await deleteItem(id);
    setItems(prev => prev.filter(i => i.id !== id));
    if (activeItem?.id === id) setActiveItem(null);
  };

  const handleReaction = async (id: string, emoji: keyof ReactionCounts) => {
    const updated = await addReaction(id, emoji);
    if (updated) {
      setItems(prev => prev.map(i => i.id === id ? updated : i));
      if (activeItem?.id === id) setActiveItem(updated);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    const updated = await toggleFavorite(id);
    if (updated) {
      setItems(prev => prev.map(i => i.id === id ? updated : i));
      if (activeItem?.id === id) setActiveItem(updated);
    }
  };

  const handleSelectCategory = (cat: string) => {
    setSelectedFilter(cat);
    setIsDrawerOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* TOP NAV */}
      <Navbar
        onOpenMenu={() => setIsDrawerOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
        totalCount={items.length}
      />

      {/* Active filter chip (compact, dismissable) */}
      {selectedFilter !== 'all' && (
        <div style={{ maxWidth: 680, margin: '10px auto 0', width: '100%', padding: '0 16px' }}>
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '3px 10px 3px 12px',
              borderRadius: 99, border: '1px solid var(--border)',
              background: 'var(--surface)', fontSize: 12, fontWeight: 600,
              color: 'var(--text-2)', cursor: 'default',
            }}
          >
            {selectedFilter === 'photo' ? '🖼️ Foto'
              : selectedFilter === 'audio' ? '🎙️ Audio'
              : selectedFilter === 'text'  ? '💌 Dediche'
              : selectedFilter}
            <button
              onClick={() => setSelectedFilter('all')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '0 2px', fontSize: 13, color: 'var(--text-3)',
                lineHeight: 1, display: 'flex', alignItems: 'center',
              }}
              aria-label="Rimuovi filtro"
            >
              ✕
            </button>
          </span>
        </div>
      )}

      {/* MAIN FEED */}
      <main style={{ flex: 1, maxWidth: 680, margin: '0 auto', width: '100%', padding: '14px 16px 48px' }}>
        {isLoading ? (
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            padding: '80px 0', color: 'var(--text-3)', gap: 10,
          }}>
            <div style={{
              width: 22, height: 22, border: '2px solid var(--border)',
              borderTopColor: 'var(--gold)', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            Caricamento...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 40 }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>✨</div>
            <h3 style={{ color: 'var(--text)', marginBottom: 6, fontSize: 16 }}>Nessun ricordo trovato</h3>
            <p style={{ color: 'var(--text-3)', fontSize: 13, maxWidth: 260, lineHeight: 1.5 }}>
              {selectedFilter !== 'all'
                ? 'Prova a cambiare categoria oppure aggiungi nuovi ricordi.'
                : 'Sii il primo ad aggiungere un ricordo per Andrea!'}
            </p>
            <button
              className="btn btn-gold"
              onClick={() => setIsUploadOpen(true)}
              style={{ marginTop: 20 }}
            >
              Aggiungi un ricordo
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredItems.map((item, idx) => (
              <FeedCard
                key={item.id}
                item={item}
                folders={folders}
                onClick={() => setActiveItem(item)}
                onReaction={handleReaction}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </main>

      {/* DRAWER */}
      <CategoryDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        items={items}
        selectedCategory={selectedFilter}
        onSelectCategory={handleSelectCategory}
      />

      {/* DETAIL MODAL */}
      <DetailModal
        item={activeItem}
        allItems={items}
        folders={folders}
        onClose={() => setActiveItem(null)}
        onReaction={handleReaction}
        onToggleFavorite={handleToggleFavorite}
        onDeleteItem={handleDeleteItem}
      />

      {/* UPLOAD MODAL */}
      <UploadModal
        isOpen={isUploadOpen}
        folders={folders}
        currentFolderId="generale"
        onClose={() => setIsUploadOpen(false)}
        onSaveItem={handleSaveItem}
      />

      {/* INTRO SEQUENCE LOADER */}
      {showIntro && <IntroLoader onComplete={() => setShowIntro(false)} />}
    </div>
  );
}

export default App;
