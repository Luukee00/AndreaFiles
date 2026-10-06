import type { Folder, MediaItem, ReactionCounts } from '../types';

// Backend API base URL - should be configured via environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export class ApiStorageService {
  /**
   * Get all folders from backend
   */
  static async getAllFolders(): Promise<Folder[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/folders`);
      if (!response.ok) {
        throw new Error(`Failed to fetch folders: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching folders:', error);
      throw error;
    }
  }

  /**
   * Add a new folder
   */
  static async addFolder(folder: Omit<Folder, 'createdAt'>): Promise<Folder> {
    try {
      const response = await fetch(`${API_BASE_URL}/folders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(folder),
      });

      if (!response.ok) {
        throw new Error(`Failed to add folder: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding folder:', error);
      throw error;
    }
  }

  /**
   * Delete a folder
   */
  static async deleteFolder(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/folders/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete folder: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  }

  /**
   * Get all media items from backend
   */
  static async getAllItems(): Promise<MediaItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/items`);
      if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  }

  /**
   * Add a new media item
   */
  static async addItem(
    item: Omit<MediaItem, 'reactions' | 'timestamp'> & {
      reactions?: Partial<ReactionCounts>;
      timestamp?: number
    }
  ): Promise<MediaItem> {
    try {
      const response = await fetch(`${API_BASE_URL}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...item,
          timestamp: item.timestamp ?? Date.now(),
          reactions: {
            '❤️': item.reactions?.['❤️'] ?? 0,
            '🔥': item.reactions?.['🔥'] ?? 0,
            '😂': item.reactions?.['😂'] ?? 0,
            '🥂': item.reactions?.['🥂'] ?? 0,
            '🎉': item.reactions?.['🎉'] ?? 1
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add item: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    }
  }

  /**
   * Delete a media item
   */
  static async deleteItem(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/items/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete item: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  }

  /**
   * Add a reaction to an item
   */
  static async addReaction(id: string, emoji: keyof ReactionCounts): Promise<MediaItem | undefined> {
    try {
      const response = await fetch(`${API_BASE_URL}/items/${id}/reactions/${emoji}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to add reaction: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  }

  /**
   * Toggle favorite status of an item
   */
  static async toggleFavorite(id: string): Promise<MediaItem | undefined> {
    try {
      const response = await fetch(`${API_BASE_URL}/items/${id}/favorite`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle favorite: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }
}

// Export a compatibility layer that mimics the original storage interface
export const apiStorage = {
  getAllFolders: ApiStorageService.getAllFolders,
  addFolder: ApiStorageService.addFolder,
  deleteFolder: ApiStorageService.deleteFolder,
  getAllItems: ApiStorageService.getAllItems,
  addItem: ApiStorageService.addItem,
  deleteItem: ApiStorageService.deleteItem,
  addReaction: ApiStorageService.addReaction,
  toggleFavorite: ApiStorageService.toggleFavorite,
};

// Helper function to convert Blob to base64 (keeping existing functionality)
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}