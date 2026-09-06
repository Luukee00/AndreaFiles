import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Mic, Heart, Upload, Sparkles, Wand2, Square, Play, Pause, RefreshCw, CheckCircle2, FileAudio, AlertCircle } from 'lucide-react';
import type { Folder, MediaItem, MediaType } from '../types';
import { classifyImage, type ClassificationResult } from '../services/aiClassifier';
import { startAudioRecording, transcribeAudioFile } from '../services/speechRecognition';
import { blobToDataUrl } from '../services/storage';

interface UploadModalProps {
  isOpen: boolean;
  initialTab?: MediaType;
  folders: Folder[];
  currentFolderId: string;
  onClose: () => void;
  onSaveItem: (item: Omit<MediaItem, 'id' | 'reactions' | 'timestamp'>) => Promise<void>;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen, initialTab = 'photo', folders, currentFolderId, onClose, onSaveItem
}) => {
  const [activeTab, setActiveTab] = useState<MediaType>(initialTab);

  // Common
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState(currentFolderId !== 'all' ? currentFolderId : 'generale');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Photo
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [aiResult, setAiResult] = useState<ClassificationResult | null>(null);

  // Audio
  const [audioSource, setAudioSource] = useState<'record' | 'file'>('record');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioDataUrl, setAudioDataUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioTranscript, setAudioTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const activeRecorderRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => { setActiveTab(initialTab); }, [initialTab]);
  useEffect(() => {
    if (currentFolderId !== 'all') setSelectedFolderId(currentFolderId);
  }, [currentFolderId]);

  if (!isOpen) return null;

  const handlePhotoSelect = (file: File) => {
    if (!title) setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setPhotoDataUrl(dataUrl);
      setIsAnalyzingImage(true);
      try {
        const result = await classifyImage(dataUrl, file.name, caption);
        setAiResult(result);
        const matched = folders.find(f => f.id === result.suggestedFolderId);
        if (matched) setSelectedFolderId(matched.id);
      } finally {
        setIsAnalyzingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStartRecording = async () => {
    setMicError(null);
    setIsRecording(true);
    setRecordingSeconds(0);
    setAudioTranscript('');

    timerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);

    try {
      const recorder = await startAudioRecording((text) => setAudioTranscript(text));
      activeRecorderRef.current = recorder;
    } catch (err: any) {
      clearInterval(timerRef.current);
      setIsRecording(false);
      const code = err?.message || '';
      let msg: string;
      if (code === 'PERMISSION_DENIED') {
        msg = 'Permesso microfono negato. Fai clic sull\'icona del lucchetto 🔒 nella barra del browser → abilita il microfono → ricarica la pagina.';
      } else if (code === 'NO_MICROPHONE') {
        msg = 'Nessun microfono trovato. Collega un microfono o usa gli auricolari e riprova.';
      } else if (code === 'MIC_IN_USE') {
        msg = 'Il microfono è in uso da un\'altra applicazione. Chiudila e riprova.';
      } else {
        msg = `Errore microfono: ${code || 'sconosciuto'}. Se il sito non è su HTTPS o localhost, il browser blocca l\'accesso al microfono.`;
      }
      setMicError(msg);
    }
  };

  const handleStopRecording = async () => {
    if (!activeRecorderRef.current) return;
    clearInterval(timerRef.current);
    setIsRecording(false);

    try {
      const { blob, duration, transcript } = await activeRecorderRef.current.stop();
      // ★ Convert to base64 so it survives page reload
      const dataUrl = await blobToDataUrl(blob);
      setAudioDataUrl(dataUrl);
      setAudioDuration(duration);
      if (transcript) setAudioTranscript(transcript);
      if (!title) setTitle(`Messaggio vocale (${duration}s)`);
    } catch (err) {
      console.error('Stop recording error:', err);
    }
  };

  const handleAudioFileSelect = async (file: File) => {
    if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
    // ★ Convert to base64 immediately
    const dataUrl = await blobToDataUrl(file);
    setAudioDataUrl(dataUrl);

    setIsTranscribing(true);
    try {
      const transcript = await transcribeAudioFile(file);
      setAudioTranscript(transcript);
    } finally {
      setIsTranscribing(false);
    }
  };

  const resetForm = () => {
    setTitle(''); setAuthor(''); setCaption('');
    setPhotoDataUrl(null); setAiResult(null);
    setAudioDataUrl(null); setAudioTranscript('');
    setRecordingSeconds(0); setMicError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;
    setIsSubmitting(true);
    try {
      const tags = ['18anni', 'andrea', ...(aiResult?.tags || [])];
      await onSaveItem({
        type: activeTab,
        title: title.trim(),
        caption: caption.trim() || undefined,
        author: author.trim(),
        folderId: selectedFolderId || 'generale',
        tags,
        dataUrl: (activeTab === 'photo' ? photoDataUrl : activeTab === 'audio' ? audioDataUrl : undefined) || undefined,
        audioDuration: activeTab === 'audio' ? audioDuration : undefined,
        audioTranscript: activeTab === 'audio' ? audioTranscript : undefined,
        detectedCategory: aiResult?.folderName || undefined
      });
      resetForm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs: { key: MediaType; label: string; emoji: string }[] = [
    { key: 'photo', label: 'Foto', emoji: '📷' },
    { key: 'audio', label: 'Vocale', emoji: '🎙️' },
    { key: 'text',  label: 'Dedica', emoji: '💌' }
  ];

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ width: '100%', maxWidth: 520 }}>
        {/* Header */}
        <div style={{
          padding: '18px 20px 14px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1
        }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
              Aggiungi un ricordo
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '2px 0 0' }}>
              per i 18 anni di Andrea 🎂
            </p>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: 4, padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface-2)'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '8px 4px',
                borderRadius: 8, border: 'none',
                background: activeTab === tab.key ? 'var(--surface)' : 'transparent',
                boxShadow: activeTab === tab.key ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                fontSize: 13, fontWeight: 700,
                color: activeTab === tab.key ? 'var(--text)' : 'var(--text-3)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ fontSize: 18 }}>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ── PHOTO TAB ── */}
            {activeTab === 'photo' && (
              <div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoSelect(f); }} />

                {!photoDataUrl ? (
                  <div
                    className="dropzone"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handlePhotoSelect(f); }}
                  >
                    <Upload size={28} color="var(--text-3)" style={{ marginBottom: 10 }} />
                    <p style={{ fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Trascina la foto qui</p>
                    <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>
                      oppure <span style={{ color: 'var(--gold)', textDecoration: 'underline', cursor: 'pointer' }}>sfoglia i file</span>
                    </p>
                  </div>
                ) : (
                  <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
                    <img src={photoDataUrl} alt="Preview" style={{ width: '100%', maxHeight: 260, objectFit: 'contain', display: 'block', background: '#f0ece5' }} />
                    <button
                      type="button"
                      onClick={() => { setPhotoDataUrl(null); setAiResult(null); }}
                      style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 6, background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    ><X size={14} /></button>

                    {/* AI badge */}
                    <div style={{ padding: '10px 14px', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Wand2 size={14} color="var(--gold)" style={{ flexShrink: 0 }} />
                      {isAnalyzingImage ? (
                        <span style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <RefreshCw size={12} className="animate-spin" /> Analisi AI in corso...
                        </span>
                      ) : aiResult ? (
                        <span style={{ fontSize: 12, color: 'var(--text-2)' }}>
                          <strong style={{ color: 'var(--gold-dark)' }}>AI:</strong> {aiResult.folderName} · {Math.round(aiResult.confidence * 100)}% match · {aiResult.explanation}
                        </span>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── AUDIO TAB ── */}
            {activeTab === 'audio' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Toggle record vs file */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {(['record', 'file'] as const).map(src => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => { setAudioSource(src); setAudioDataUrl(null); setAudioTranscript(''); setMicError(null); }}
                      style={{
                        padding: '9px 8px', borderRadius: 8, border: '1px solid var(--border)',
                        background: audioSource === src ? 'var(--text)' : 'var(--surface)',
                        color: audioSource === src ? '#fff' : 'var(--text-2)',
                        fontWeight: 600, fontSize: 13, cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {src === 'record' ? '🎙️ Registra' : '📁 Carica file'}
                    </button>
                  ))}
                </div>

                {/* Mic error banner */}
                {micError && (
                  <div style={{
                    padding: '12px 14px', borderRadius: 10,
                    background: '#fef2f2', border: '1px solid #fca5a5',
                    display: 'flex', gap: 8, alignItems: 'flex-start'
                  }}>
                    <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: '#991b1b', margin: 0, lineHeight: 1.5 }}>{micError}</p>
                  </div>
                )}

                {/* RECORD */}
                {audioSource === 'record' && (
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
                    padding: '24px 20px', borderRadius: 12, background: 'var(--surface-2)',
                    border: '1px solid var(--border)', textAlign: 'center'
                  }}>
                    {!audioDataUrl ? (
                      <>
                        <button
                          type="button"
                          onClick={isRecording ? handleStopRecording : handleStartRecording}
                          className={isRecording ? 'recording-pulse' : ''}
                          style={{
                            width: 72, height: 72, borderRadius: '50%',
                            background: isRecording ? '#ef4444' : 'var(--gold)',
                            color: '#fff', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'transform 0.15s ease', boxShadow: isRecording
                              ? '0 4px 20px rgba(239,68,68,0.3)'
                              : '0 4px 20px rgba(184,147,90,0.3)'
                          }}
                        >
                          {isRecording ? <Square size={24} fill="white" /> : <Mic size={28} />}
                        </button>
                        <div>
                          <p style={{ fontWeight: 700, margin: '0 0 4px', fontSize: 14, color: 'var(--text)' }}>
                            {isRecording ? `Registrazione in corso — ${recordingSeconds}s` : 'Clicca per registrare'}
                          </p>
                          <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>
                            {isRecording
                              ? 'Parla liberamente — la trascrizione è attiva in tempo reale'
                              : 'Fai gli auguri ad Andrea o racconta un ricordo'}
                          </p>
                        </div>
                        {audioTranscript && isRecording && (
                          <div style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)' }}>
                            <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0, fontStyle: 'italic', textAlign: 'left' }}>
                              "{audioTranscript}"
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--gold-light)' }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (!audioPreviewRef.current) return;
                              if (isPlayingPreview) { audioPreviewRef.current.pause(); setIsPlayingPreview(false); }
                              else { audioPreviewRef.current.play(); setIsPlayingPreview(true); }
                            }}
                            style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gold)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                          >
                            {isPlayingPreview ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" style={{ marginLeft: 2 }} />}
                          </button>
                          <div style={{ textAlign: 'left', flex: 1 }}>
                            <p style={{ fontSize: 12, fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                              Audio registrato ({audioDuration}s)
                            </p>
                            <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <CheckCircle2 size={11} color="green" /> Pronto
                            </p>
                          </div>
                          <button type="button" onClick={() => { setAudioDataUrl(null); setAudioTranscript(''); }} style={{ fontSize: 12, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                            Riregistra
                          </button>
                        </div>
                        <audio ref={audioPreviewRef} src={audioDataUrl!} onEnded={() => setIsPlayingPreview(false)} />
                      </div>
                    )}
                  </div>
                )}

                {/* FILE UPLOAD */}
                {audioSource === 'file' && (
                  <div>
                    <input ref={audioFileInputRef} type="file" accept="audio/*" style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleAudioFileSelect(f); }} />
                    {!audioDataUrl ? (
                      <div className="dropzone" onClick={() => audioFileInputRef.current?.click()}>
                        <FileAudio size={28} color="var(--text-3)" style={{ marginBottom: 10 }} />
                        <p style={{ fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Seleziona file audio</p>
                        <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>.mp3, .wav, .m4a, .ogg</p>
                      </div>
                    ) : (
                      <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileAudio size={20} color="var(--gold)" />
                        <p style={{ fontSize: 13, fontWeight: 600, margin: 0, flex: 1, color: 'var(--text)' }}>File caricato ✓</p>
                        {isTranscribing && <span style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}><RefreshCw size={12} className="animate-spin" /> Trascrizione...</span>}
                        <button type="button" onClick={() => { setAudioDataUrl(null); setAudioTranscript(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}><X size={14} /></button>
                      </div>
                    )}
                  </div>
                )}

                {/* Transcript editable */}
                <div>
                  <label className="label">
                    Trascrizione automatica
                    {isTranscribing && <span style={{ fontWeight: 400, color: 'var(--text-3)', marginLeft: 6 }}>— trascrizione in corso...</span>}
                  </label>
                  <textarea
                    className="input textarea"
                    rows={3}
                    placeholder="La trascrizione dell'audio apparirà qui. Puoi modificarla..."
                    value={audioTranscript}
                    onChange={e => setAudioTranscript(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* ── TEXT TAB ── */}
            {activeTab === 'text' && (
              <div>
                <label className="label">La tua dedica *</label>
                <textarea
                  className="input textarea font-handwriting"
                  required={activeTab === 'text'}
                  rows={5}
                  placeholder="Caro Andrea, per i tuoi 18 anni volevo dirti..."
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  style={{ fontSize: 18, lineHeight: 1.5 }}
                />
              </div>
            )}

            {/* COMMON FIELDS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="label">Titolo *</label>
                <input className="input" type="text" required placeholder="Es. Estate a Gallipoli" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="label">Il tuo nome *</label>
                <input className="input" type="text" required placeholder="Es. Marco" value={author} onChange={e => setAuthor(e.target.value)} />
              </div>
            </div>

            {activeTab !== 'text' && (
              <div>
                <label className="label">Descrizione (opzionale)</label>
                <input className="input" type="text" placeholder="Aggiungi una nota o un aneddoto..." value={caption} onChange={e => setCaption(e.target.value)} />
              </div>
            )}

            <div>
              <label className="label">Cartella</label>
              <select className="input select" value={selectedFolderId} onChange={e => setSelectedFolderId(e.target.value)}>
                {folders.map(f => <option key={f.id} value={f.id}>{f.icon} {f.name}</option>)}
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || (activeTab === 'photo' && !photoDataUrl) || (activeTab === 'audio' && !audioDataUrl)}
              className="btn btn-gold"
              style={{ width: '100%', padding: '13px 20px', fontSize: 14, borderRadius: 10 }}
            >
              {isSubmitting
                ? <><RefreshCw size={16} className="animate-spin" /> Salvataggio...</>
                : <><Sparkles size={16} /> Pubblica Ricordo</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
