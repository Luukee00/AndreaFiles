export interface ClassificationResult {
  suggestedFolderId: string;
  folderName: string;
  confidence: number;
  tags: string[];
  explanation: string;
}

// Category definition rules
interface CategoryRule {
  folderId: string;
  folderName: string;
  keywords: string[];
  colorCheck?: (hsl: { h: number; s: number; l: number }, rgb: { r: number; g: number; b: number }) => number;
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    folderId: 'mare',
    folderName: 'Mare & Spiaggia 🏖️',
    keywords: ['mare', 'sea', 'beach', 'spiaggia', 'costa', 'estate', 'summer', 'sole', 'ombrellone', 'sabbia', 'acqua', 'barca', 'puglia', 'sardegna', 'sicilia', 'grecia', 'onde'],
    colorCheck: (hsl, rgb) => {
      // Blue hue (180-240) + sandy yellow (35-55) + bright luminance
      let score = 0;
      if (hsl.h >= 180 && hsl.h <= 245 && hsl.s > 25) score += 0.6;
      if (hsl.h >= 35 && hsl.h <= 55 && hsl.s > 30 && hsl.l > 40) score += 0.4;
      if (rgb.b > rgb.r + 20 && rgb.b > rgb.g) score += 0.3;
      return Math.min(1, score);
    }
  },
  {
    folderId: 'montagna',
    folderName: 'Montagna & Trekking 🏔️',
    keywords: ['montagna', 'mountain', 'trekking', 'alpi', 'dolomiti', 'neve', 'snow', 'sci', 'bosco', 'sentiero', 'vetta', 'rifugio', 'natura', 'escursione', 'baita'],
    colorCheck: (hsl, _rgb) => {
      // Green hues (75-165) or high lightness snowy shades
      let score = 0;
      if (hsl.h >= 75 && hsl.h <= 165 && hsl.s > 20) score += 0.6;
      if (hsl.l > 85 && hsl.s < 20) score += 0.5; // Snow
      if (hsl.h >= 20 && hsl.h <= 45 && hsl.l < 40) score += 0.3; // Rocky earth
      return Math.min(1, score);
    }
  },
  {
    folderId: 'feste',
    folderName: 'Feste & 18esimi 🍾',
    keywords: ['festa', 'party', '18', 'compleanno', 'birthday', 'torta', 'disco', 'discoteca', 'serata', 'cocktail', 'brindisi', 'locale', 'musica', 'ballo', 'notte', 'festeggiamenti'],
    colorCheck: (hsl, rgb) => {
      // Dark overall scene with warm highlights or high saturation lights
      let score = 0;
      if (hsl.l < 35) score += 0.4;
      if ((hsl.h < 30 || hsl.h > 300) && hsl.s > 50) score += 0.5; // Warm / neon party lighting
      if (rgb.r > 150 && rgb.b > 100 && rgb.g < 100) score += 0.3;
      return Math.min(1, score);
    }
  },
  {
    folderId: 'scuola',
    folderName: 'Scuola & Cazzeggio 📚',
    keywords: ['scuola', 'school', 'classe', 'liceo', 'banco', 'intervallo', 'prof', 'gita', 'compiti', 'interrogazione', 'aula', 'studio', 'maturita'],
    colorCheck: (hsl, _rgb) => {
      let score = 0;
      if (hsl.l > 60 && hsl.s < 30) score += 0.3; // Classroom ambient lighting
      return score;
    }
  },
  {
    folderId: 'sport',
    folderName: 'Sport & Partite ⚽',
    keywords: ['sport', 'calcio', 'partita', 'campo', 'palestra', 'gym', 'basket', 'corsa', 'tennis', 'stadio', 'allenamento', 'vittoria', 'torneo'],
    colorCheck: (hsl, _rgb) => {
      let score = 0;
      if (hsl.h >= 80 && hsl.h <= 140 && hsl.s > 40) score += 0.5; // Grass / football pitch
      return score;
    }
  },
  {
    folderId: 'infanzia',
    folderName: 'Ricordi di Infanzia 👶',
    keywords: ['bambino', 'piccolo', 'infanzia', 'baby', 'asilo', 'elementari', 'primi anni', 'vintage', 'vecchia', 'anni fa', 'remember'],
    colorCheck: (hsl, _rgb) => {
      let score = 0;
      // Sepia / warm vintage tint
      if (hsl.h >= 25 && hsl.h <= 50 && hsl.s < 45 && hsl.l > 40) score += 0.4;
      return score;
    }
  }
];

/**
 * Analyzes an image canvas/element to extract dominant color statistics
 */
async function analyzeImagePixels(imageSrc: string): Promise<{ hsl: { h: number; s: number; l: number }; rgb: { r: number; g: number; b: number } }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      // Scale down for ultra fast instant analysis
      canvas.width = 64;
      canvas.height = 64;
      
      if (!ctx) {
        resolve({ hsl: { h: 0, s: 0, l: 50 }, rgb: { r: 128, g: 128, b: 128 } });
        return;
      }
      
      ctx.drawImage(img, 0, 0, 64, 64);
      const imageData = ctx.getImageData(0, 0, 64, 64).data;
      
      let totalR = 0;
      let totalG = 0;
      let totalB = 0;
      const count = imageData.length / 4;
      
      for (let i = 0; i < imageData.length; i += 4) {
        totalR += imageData[i];
        totalG += imageData[i + 1];
        totalB += imageData[i + 2];
      }
      
      const r = Math.round(totalR / count);
      const g = Math.round(totalG / count);
      const b = Math.round(totalB / count);
      
      // Convert RGB to HSL
      const rNorm = r / 255;
      const gNorm = g / 255;
      const bNorm = b / 255;
      const max = Math.max(rNorm, gNorm, bNorm);
      const min = Math.min(rNorm, gNorm, bNorm);
      let h = 0;
      let s = 0;
      const l = (max + min) / 2;
      
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
          case gNorm: h = (bNorm - rNorm) / d + 2; break;
          case bNorm: h = (rNorm - gNorm) / d + 4; break;
        }
        h *= 60;
      }
      
      resolve({
        rgb: { r, g, b },
        hsl: { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) }
      });
    };
    
    img.onerror = () => {
      resolve({ hsl: { h: 0, s: 0, l: 50 }, rgb: { r: 128, g: 128, b: 128 } });
    };
    
    img.src = imageSrc;
  });
}

/**
 * Classifies an image based on visual attributes and metadata/filename keywords
 */
export async function classifyImage(
  imageSrc: string,
  filename: string = '',
  caption: string = ''
): Promise<ClassificationResult> {
  const combinedText = `${filename} ${caption}`.toLowerCase();
  const pixelStats = await analyzeImagePixels(imageSrc);
  
  const scores: { folderId: string; folderName: string; score: number; tags: string[]; matchedWhy: string }[] = [];
  
  for (const cat of CATEGORY_RULES) {
    let score = 0;
    const matchedTags: string[] = [];
    let why = '';
    
    // Keyword match
    for (const kw of cat.keywords) {
      if (combinedText.includes(kw)) {
        score += 0.45;
        matchedTags.push(kw);
      }
    }
    
    // Visual color check
    if (cat.colorCheck) {
      const visualScore = cat.colorCheck(pixelStats.hsl, pixelStats.rgb);
      score += visualScore * 0.55;
      if (visualScore > 0.4) {
        why = `Analisi colori dominante (${cat.folderName})`;
      }
    }
    
    if (matchedTags.length > 0) {
      why = `Trovati elementi: ${matchedTags.slice(0, 3).join(', ')}`;
    }
    
    scores.push({
      folderId: cat.folderId,
      folderName: cat.folderName,
      score,
      tags: matchedTags.length > 0 ? matchedTags : [cat.folderId],
      matchedWhy: why || `Suggerito per atmosfera visiva`
    });
  }
  
  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];
  
  // Default fallback if score is too low
  if (!best || best.score < 0.25) {
    return {
      suggestedFolderId: 'generale',
      folderName: 'Ricordi & Momenti ✨',
      confidence: 0.6,
      tags: ['ricordo', '18anni', 'amici'],
      explanation: 'Classificazione generale basata sui ricordi di Andrea'
    };
  }
  
  return {
    suggestedFolderId: best.folderId,
    folderName: best.folderName,
    confidence: Math.min(0.98, Math.max(0.65, Number(best.score.toFixed(2)))),
    tags: best.tags,
    explanation: best.matchedWhy
  };
}
