export type MediaType = 'photo' | 'audio' | 'text';

export interface ReactionCounts {
  '❤️': number;
  '🔥': number;
  '😂': number;
  '🥂': number;
  '🎉': number;
}

export interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  caption?: string;
  author: string;
  folderId: string;
  tags: string[];
  timestamp: number;
  dataUrl?: string; // Base64 or Object URL
  thumbnailUrl?: string;
  audioDuration?: number; // In seconds
  audioTranscript?: string; // Speech-to-text transcript
  isTranscribing?: boolean;
  reactions: ReactionCounts;
  isFavorite?: boolean;
  detectedCategory?: string;
  aiSuggestedFolder?: string;
}

export interface Folder {
  id: string;
  name: string;
  icon: string; // Emoji or Lucide icon name
  description?: string;
  color: string;
  bgGradient: string;
  isDefault?: boolean;
  createdAt: number;
}

export type SortOption = 'newest' | 'oldest' | 'most_reacted' | 'title';

export interface FilterState {
  folderId: string; // 'all' or specific folder ID
  mediaType: 'all' | MediaType;
  searchQuery: string;
  sortBy: SortOption;
}
