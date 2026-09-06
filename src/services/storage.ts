import Dexie, { type Table } from 'dexie';
import type { Folder, MediaItem, ReactionCounts } from '../types';

export class AndreaDatabase extends Dexie {
  items!: Table<MediaItem, string>;
  folders!: Table<Folder, string>;

  constructor() {
    super('AndreasFilesDB_v2');
    this.version(1).stores({
      items: 'id, type, folderId, author, timestamp',
      folders: 'id, name, createdAt'
    });
  }
}

export const db = new AndreaDatabase();

export const DEFAULT_FOLDERS: Folder[] = [
  { id: 'mare',      name: 'Mare & Spiaggia',      icon: '🏖️', description: 'Vacanze estive, tuffi e serate sulla spiaggia', color: '#0ea5e9', bgGradient: 'from-cyan-500/20 to-blue-600/20', isDefault: true, createdAt: 1 },
  { id: 'montagna',  name: 'Montagna & Trekking',   icon: '🏔️', description: 'Vette, sci e rifugi', color: '#10b981', bgGradient: 'from-emerald-500/20 to-teal-700/20', isDefault: true, createdAt: 2 },
  { id: 'feste',     name: 'Feste & Serate',        icon: '🍾', description: 'Serate leggendarie e brindisi', color: '#f59e0b', bgGradient: 'from-amber-500/20 to-orange-600/20', isDefault: true, createdAt: 3 },
  { id: 'scuola',    name: 'Scuola & Cazzeggio',    icon: '📚', description: 'Anni tra i banchi e risate', color: '#8b5cf6', bgGradient: 'from-purple-500/20 to-indigo-600/20', isDefault: true, createdAt: 4 },
  { id: 'sport',     name: 'Sport & Calcetto',      icon: '⚽', description: 'Tornei e gol storici', color: '#ef4444', bgGradient: 'from-rose-500/20 to-red-600/20', isDefault: true, createdAt: 5 },
  { id: 'infanzia',  name: 'Ricordi di Infanzia',   icon: '👶', description: 'I primi anni assieme', color: '#ec4899', bgGradient: 'from-pink-500/20 to-rose-400/20', isDefault: true, createdAt: 6 },
  { id: 'generale',  name: 'Momenti & Dediche',     icon: '✨', description: 'Pensieri liberi e foto spontanee', color: '#eab308', bgGradient: 'from-yellow-500/20 to-amber-600/20', isDefault: true, createdAt: 7 }
];

const SAMPLE_MEMORIES: MediaItem[] = [
  {
    id: 'sample-1', type: 'photo', title: 'Tramonto a Gallipoli',
    caption: 'Estate indimenticabile prima dei 18 anni!',
    author: 'Marco & Matteo', folderId: 'mare', tags: ['mare', 'estate', 'tramonto'],
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 45,
    dataUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=75',
    reactions: { '❤️': 18, '🔥': 14, '😂': 6, '🥂': 10, '🎉': 12 }, isFavorite: true, detectedCategory: 'Mare & Spiaggia'
  },
  {
    id: 'sample-2', type: 'audio', title: 'Auguri da Londra!',
    caption: 'Non potevo mancare agli auguri anche da qui.',
    author: 'Giulia', folderId: 'generale', tags: ['auguri', 'vocale'],
    timestamp: Date.now() - 1000 * 60 * 60 * 12,
    audioDuration: 28, audioTranscript: 'Andre! Augurissimi di buon diciottesimo! Finalmente maggiorenne! Ricordati che adesso le responsabilità aumentano ma le serate rimangono le stesse! Ti voglio un mondo di bene!',
    reactions: { '❤️': 24, '🔥': 9, '😂': 4, '🥂': 16, '🎉': 19 }, isFavorite: true, detectedCategory: 'Momenti & Dediche'
  },
  {
    id: 'sample-3', type: 'photo', title: 'In cima alle Dolomiti',
    caption: 'Tre ore di salita per scoprire che avevi dimenticato i panini in rifugio.',
    author: 'Lorenzo', folderId: 'montagna', tags: ['montagna', 'trekking'],
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 120,
    dataUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=75',
    reactions: { '❤️': 11, '🔥': 7, '😂': 22, '🥂': 5, '🎉': 9 }, detectedCategory: 'Montagna & Trekking'
  },
  {
    id: 'sample-4', type: 'text', title: 'Lettera aperta per i tuoi 18 anni',
    caption: 'Caro Andrea, sembra ieri che ci scambiavamo le figurine alle medie. Ne abbiamo passate di tutti i colori: gite scolastiche, le prime uscite serali e notti intere a parlare di futuro. Sono fiero dell\'amico che sei diventato. Buon 18°!',
    author: 'Sara', folderId: 'scuola', tags: ['dedica', 'amicizia'],
    timestamp: Date.now() - 1000 * 60 * 60 * 4,
    reactions: { '❤️': 35, '🔥': 12, '😂': 2, '🥂': 18, '🎉': 25 }, isFavorite: true, detectedCategory: 'Scuola & Cazzeggio'
  },
  {
    id: 'sample-5', type: 'photo', title: 'La doppietta storica al torneo',
    caption: "L'unica volta nella vita in cui hai tirato all'incrocio dei pali!",
    author: 'Federico', folderId: 'sport', tags: ['calcio', 'vittoria'],
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 200,
    dataUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=75',
    reactions: { '❤️': 15, '🔥': 28, '😂': 10, '🥂': 8, '🎉': 14 }, detectedCategory: 'Sport & Calcetto'
  },
  {
    id: 'sample-6', type: 'photo', title: 'Capodanno indimenticabile',
    caption: 'Prima che Andrea si addormentasse sul divano a mezzanotte e mezza.',
    author: 'Chiara & Gruppo', folderId: 'feste', tags: ['festa', 'capodanno'],
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 250,
    dataUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=75',
    reactions: { '❤️': 19, '🔥': 15, '😂': 31, '🥂': 21, '🎉': 17 }, detectedCategory: 'Feste & Serate'
  },
  {
    id: 'sample-7', type: 'text', title: 'Un brindisi al futuro 🥂',
    caption: 'Diciotto anni sono il momento esatto in cui il mondo inizia a guardrti in modo diverso. Prenditi cura di chi sei, continua a essere quel casino di persona che ci fa ridere ogni giorno. Salute!',
    author: 'Luca', folderId: 'generale', tags: ['auguri', 'dedica'],
    timestamp: Date.now() - 1000 * 60 * 60 * 8,
    reactions: { '❤️': 22, '🔥': 8, '😂': 5, '🥂': 30, '🎉': 18 }, detectedCategory: 'Momenti & Dediche'
  }
];

/* ────────────── HELPERS ────────────── */

/** Convert a Blob to a base64 data URL (survives page reload) */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/* ────────────── INIT ────────────── */

let initPromise: Promise<void> | null = null;

function initializeDatabase(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const folderCount = await db.folders.count();
      if (folderCount === 0) {
        await db.folders.bulkPut(DEFAULT_FOLDERS);
      }
      const itemCount = await db.items.count();
      if (itemCount === 0) {
        await db.items.bulkPut(SAMPLE_MEMORIES);
      }
    })();
  }
  return initPromise;
}

/* ────────────── PUBLIC API ────────────── */

export async function getAllFolders(): Promise<Folder[]> {
  await initializeDatabase();
  return db.folders.toArray();
}

export async function addFolder(folder: Omit<Folder, 'createdAt'>): Promise<Folder> {
  const f: Folder = { ...folder, createdAt: Date.now() };
  await db.folders.put(f);
  return f;
}

export async function deleteFolder(id: string): Promise<void> {
  await db.folders.delete(id);
  const items = await db.items.where('folderId').equals(id).toArray();
  for (const item of items) {
    await db.items.update(item.id, { folderId: 'generale' });
  }
}

export async function getAllItems(): Promise<MediaItem[]> {
  await initializeDatabase();
  return db.items.toArray();
}

export async function addItem(
  item: Omit<MediaItem, 'reactions' | 'timestamp'> & { reactions?: Partial<ReactionCounts>; timestamp?: number }
): Promise<MediaItem> {
  const newItem: MediaItem = {
    ...item,
    timestamp: item.timestamp ?? Date.now(),
    reactions: {
      '❤️': item.reactions?.['❤️'] ?? 0,
      '🔥': item.reactions?.['🔥'] ?? 0,
      '😂': item.reactions?.['😂'] ?? 0,
      '🥂': item.reactions?.['🥂'] ?? 0,
      '🎉': item.reactions?.['🎉'] ?? 1
    }
  };
  await db.items.put(newItem);
  return newItem;
}

export async function deleteItem(id: string): Promise<void> {
  await db.items.delete(id);
}

export async function addReaction(id: string, emoji: keyof ReactionCounts): Promise<MediaItem | undefined> {
  const item = await db.items.get(id);
  if (item) {
    item.reactions[emoji] = (item.reactions[emoji] || 0) + 1;
    await db.items.put(item);
    return item;
  }
  return undefined;
}

export async function toggleFavorite(id: string): Promise<MediaItem | undefined> {
  const item = await db.items.get(id);
  if (item) {
    item.isFavorite = !item.isFavorite;
    await db.items.put(item);
    return item;
  }
  return undefined;
}
