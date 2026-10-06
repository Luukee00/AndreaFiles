const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize database tables
async function initializeDatabase() {
  try {
    // Create folders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS folders (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        icon VARCHAR(255),
        description TEXT,
        color VARCHAR(255),
        bgGradient TEXT,
        isDefault BOOLEAN DEFAULT false,
        createdAt BIGINT
      )
    `);

    // Create items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS items (
        id VARCHAR(255) PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        caption TEXT,
        author VARCHAR(255) NOT NULL,
        folderId VARCHAR(255),
        tags TEXT[], -- PostgreSQL array type
        timestamp BIGINT,
        dataUrl TEXT,
        thumbnailUrl TEXT,
        audioDuration INTEGER,
        audioTranscript TEXT,
        isTranscribing BOOLEAN DEFAULT false,
        reactions JSONB DEFAULT '{"❤️": 0, "🔥": 0, "😂": 0, "🥂": 0, "🎉": 1}',
        isFavorite BOOLEAN DEFAULT false,
        detectedCategory VARCHAR(255),
        aiSuggestedFolder VARCHAR(255)
      )
    `);

    // Insert default folders if they don't exist
    const defaultFolders = [
      { id: 'mare', name: 'Mare & Spiaggia', icon: '🏖️', description: 'Vacanze estive, tuffi e serate sulla spiaggia', color: '#0ea5e9', bgGradient: 'from-cyan-500/20 to-blue-600/20', isDefault: true, createdAt: 1 },
      { id: 'montagna', name: 'Montagna & Trekking', icon: '🏔️', description: 'Vette, sci e rifugi', color: '#10b981', bgGradient: 'from-emerald-500/20 to-teal-700/20', isDefault: true, createdAt: 2 },
      { id: 'feste', name: 'Feste & Serate', icon: '🍾', description: 'Serate leggendarie e brindisi', color: '#f59e0b', bgGradient: 'from-amber-500/20 to-orange-600/20', isDefault: true, createdAt: 3 },
      { id: 'scuola', name: 'Scuola & Cazzeggio', icon: '📚', description: 'Anni tra i banchi e risate', color: '#8b5cf6', bgGradient: 'from-purple-500/20 to-indigo-600/20', isDefault: true, createdAt: 4 },
      { id: 'sport', name: 'Sport & Calcetto', icon: '⚽', description: 'Tornei e gol storici', color: '#ef4444', bgGradient: 'from-rose-500/20 to-red-600/20', isDefault: true, createdAt: 5 },
      { id: 'infanzia', name: 'Ricordi di Infanzia', icon: '👶', description: 'I primi anni assieme', color: '#ec4899', bgGradient: 'from-pink-500/20 to-rose-400/20', isDefault: true, createdAt: 6 },
      { id: 'generale', name: 'Momenti & Dediche', icon: '✨', description: 'Pensieri liberi e foto spontanee', color: '#eab308', bgGradient: 'from-yellow-500/20 to-amber-600/20', isDefault: true, createdAt: 7 }
    ];

    for (const folder of defaultFolders) {
      const existing = await pool.query('SELECT id FROM folders WHERE id = $1', [folder.id]);
      if (existing.rows.length === 0) {
        await pool.query(
          'INSERT INTO folders (id, name, icon, description, color, bgGradient, isDefault, createdAt) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [folder.id, folder.name, folder.icon, folder.description, folder.color, folder.bgGradient, folder.isDefault, folder.createdAt]
        );
      }
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// API Routes

// Folders
app.get('/api/folders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM folders ORDER BY createdAt');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
});

app.post('/api/folders', async (req, res) => {
  try {
    const { id, name, icon, description, color, bgGradient, isDefault } = req.body;
    const createdAt = Date.now();

    const result = await pool.query(
      'INSERT INTO folders (id, name, icon, description, color, bgGradient, isDefault, createdAt) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [id, name, icon, description, color, bgGradient, isDefault, createdAt]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding folder:', error);
    res.status(500).json({ error: 'Failed to add folder' });
  }
});

app.delete('/api/folders/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // First, update items in this folder to use 'generale' folder
    await pool.query('UPDATE items SET folderId = $1 WHERE folderId = $2', ['generale', id]);

    // Then delete the folder
    await pool.query('DELETE FROM folders WHERE id = $1', [id]);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

// Items
app.get('/api/items', async (req, res) {
  try {
    const result = await pool.query('SELECT * FROM items ORDER BY timestamp DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.post('/api/items', async (req, res) => {
  try {
    const {
      id,
      type,
      title,
      caption,
      author,
      folderId,
      tags,
      timestamp,
      dataUrl,
      thumbnailUrl,
      audioDuration,
      audioTranscript,
      isTranscribing,
      reactions,
      isFavorite,
      detectedCategory,
      aiSuggestedFolder
    } = req.body;

    const itemId = id || `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const itemTimestamp = timestamp || Date.now();
    const itemReactions = reactions || { '❤️': 0, '🔥': 0, '😂': 0, '🥂': 0, '🎉': 1 };

    const result = await pool.query(
      `INSERT INTO items (
        id, type, title, caption, author, folderId, tags, timestamp,
        dataUrl, thumbnailUrl, audioDuration, audioTranscript, isTranscribing,
        reactions, isFavorite, detectedCategory, aiSuggestedFolder
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      ) RETURNING *`,
      [
        itemId,
        type,
        title,
        caption || null,
        author,
        folderId || 'generale',
        tags || [],
        itemTimestamp,
        dataUrl || null,
        thumbnailUrl || null,
        audioDuration || null,
        audioTranscript || null,
        isTranscribing || false,
        JSON.stringify(itemReactions),
        isFavorite || false,
        detectedCategory || null,
        aiSuggestedFolder || null
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ error: 'Failed to add item' });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM items WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

app.post('/api/items/:id/reactions/:emoji', async (req, res) => {
  try {
    const { id, emoji } = req.params;

    // Get current item
    const result = await pool.query('SELECT reactions FROM items WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const reactions = result.rows[0].reactions;
    reactions[emoji] = (reactions[emoji] || 0) + 1;

    // Update item
    await pool.query(
      'UPDATE items SET reactions = $1 WHERE id = $2',
      [JSON.stringify(reactions), id]
    );

    // Get updated item
    const updatedResult = await pool.query('SELECT * FROM items WHERE id = $1', [id]);
    res.json(updatedResult.rows[0]);
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});

app.post('/api/items/:id/favorite', async (req, res) => {
  try {
    const { id } = req.params;

    // Get current item
    const result = await pool.query('SELECT isFavorite FROM items WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const isFavorite = !result.rows[0].isFavorite;

    // Update item
    await pool.query(
      'UPDATE items SET isFavorite = $1 WHERE id = $2',
      [isFavorite, id]
    );

    // Get updated item
    const updatedResult = await pool.query('SELECT * FROM items WHERE id = $1', [id]);
    res.json(updatedResult.rows[0]);
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  initializeDatabase();
});

module.exports = app;