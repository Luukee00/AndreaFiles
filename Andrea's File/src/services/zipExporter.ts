import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { MediaItem, Folder } from '../types';

export async function exportAllMemoriesZip(items: MediaItem[], folders: Folder[]): Promise<void> {
  const zip = new JSZip();
  const folderMap = new Map(folders.map((f) => [f.id, f.name]));

  // Root index / info file
  let summaryText = `# I 18 ANNI DI ANDREA - ARCHIVIO DEI RICORDI 🎉\n\n`;
  summaryText += `Generato il: ${new Date().toLocaleDateString('it-IT')} alle ${new Date().toLocaleTimeString('it-IT')}\n`;
  summaryText += `Totale ricordi raccolti: ${items.length}\n\n`;
  summaryText += `--------------------------------------------------\n\n`;

  for (const item of items) {
    const folderName = folderMap.get(item.folderId) || 'Generale';
    const folderDir = zip.folder(folderName.replace(/[/\\?%*:|"<>]/g, '_'));

    const dateStr = new Date(item.timestamp).toLocaleDateString('it-IT');

    if (item.type === 'photo' && item.dataUrl) {
      // Photo
      const cleanTitle = (item.title || 'Foto').replace(/[/\\?%*:|"<>]/g, '_');
      const filename = `${cleanTitle}_${item.id.slice(0, 6)}.jpg`;

      // Save metadata text
      const meta = `Titolo: ${item.title}\nAutore: ${item.author}\nData: ${dateStr}\nDescrizione: ${item.caption || 'Nessuna'}\nTag: ${item.tags.join(', ')}\nReazioni: ${JSON.stringify(item.reactions)}\n`;
      folderDir?.file(`${cleanTitle}_info.txt`, meta);

      if (item.dataUrl.startsWith('data:image')) {
        const base64Data = item.dataUrl.split(',')[1];
        folderDir?.file(filename, base64Data, { base64: true });
      } else {
        // Fetch remote URL if sample
        try {
          const res = await fetch(item.dataUrl);
          const blob = await res.blob();
          folderDir?.file(filename, blob);
        } catch (e) {
          console.warn('Could not fetch sample image for zip:', item.dataUrl);
        }
      }
    } else if (item.type === 'audio') {
      // Audio
      const cleanTitle = (item.title || 'Messaggio_Vocale').replace(/[/\\?%*:|"<>]/g, '_');
      const audioInfo = `=== MESSAGGIO VOCALE ===\nTitolo: ${item.title}\nDa: ${item.author}\nData: ${dateStr}\nDurata: ${item.audioDuration || 0}s\n\nTRASCRIZIONE AUDIO:\n"${item.audioTranscript || 'Nessuna trascrizione'}"\n\nNote: ${item.caption || ''}\n`;
      folderDir?.file(`${cleanTitle}_trascrizione.txt`, audioInfo);

      if (item.dataUrl && item.dataUrl.startsWith('data:audio')) {
        const base64Data = item.dataUrl.split(',')[1];
        folderDir?.file(`${cleanTitle}.webm`, base64Data, { base64: true });
      }
    } else if (item.type === 'text') {
      // Text dedica
      const cleanTitle = (item.title || 'Dedica').replace(/[/\\?%*:|"<>]/g, '_');
      const textContent = `=== DEDICA PER I 18 ANNI DI ANDREA ===\nTitolo: ${item.title}\nAutore: ${item.author}\nData: ${dateStr}\n\nMessaggio:\n${item.caption || ''}\n\nTag: ${item.tags.join(', ')}\n`;
      folderDir?.file(`${cleanTitle}.txt`, textContent);
    }

    summaryText += `[${item.type.toUpperCase()}] ${item.title} (di ${item.author}) - Cartella: ${folderName}\n`;
    if (item.audioTranscript) {
      summaryText += `   Trascrizione: "${item.audioTranscript.slice(0, 80)}..."\n`;
    }
    summaryText += `\n`;
  }

  zip.file('INDICE_RICORDI.txt', summaryText);

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `Andreas_Files_18th_Birthday_${Date.now()}.zip`);
}
