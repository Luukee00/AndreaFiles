// Speech Recognition & Audio Tools (100% Free & Browser-native)

// Extended window type for webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export interface LiveVoiceRecorder {
  start: () => Promise<void>;
  stop: () => Promise<{ audioBlob: Blob; duration: number; transcript: string; audioUrl: string }>;
  isRecording: boolean;
  getTranscript: () => string;
}

/**
 * Checks if browser supports SpeechRecognition
 */
export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

/**
 * Creates a live speech-to-text listener
 */
export function createSpeechRecognizer(
  onTranscriptChange: (text: string, isFinal: boolean) => void,
  onError?: (err: any) => void
) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.warn('Speech Recognition not supported in this browser.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'it-IT';
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  let currentTranscript = '';

  recognition.onresult = (event: any) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        currentTranscript += result[0].transcript + ' ';
        onTranscriptChange(currentTranscript.trim(), true);
      } else {
        interim += result[0].transcript;
        onTranscriptChange((currentTranscript + ' ' + interim).trim(), false);
      }
    }
  };

  recognition.onerror = (event: any) => {
    // 'no-speech' and 'audio-capture' are non-fatal; ignore them silently
    if (event.error === 'no-speech' || event.error === 'audio-capture') return;
    console.warn('Speech recognition error:', event.error);
    if (onError) onError(event);
  };

  return {
    start: () => {
      currentTranscript = '';
      try {
        recognition.start();
      } catch (e) {
        console.warn('Recognition already started or error:', e);
      }
    },
    stop: () => {
      try {
        recognition.stop();
      } catch (e) {
        console.warn('Error stopping recognition:', e);
      }
      return currentTranscript.trim();
    },
    getFinalTranscript: () => currentTranscript.trim()
  };
}

/**
 * Records audio from the microphone with optional live transcription.
 * NOTE: does NOT call getUserMedia twice — permission is requested once here.
 */
export async function startAudioRecording(
  onTranscriptUpdate?: (text: string) => void
): Promise<{
  stop: () => Promise<{ blob: Blob; url: string; duration: number; transcript: string }>;
  mediaRecorder: MediaRecorder;
}> {
  // Single getUserMedia call — no pre-flight needed
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err: any) {
    // Re-throw with a clear, localised message
    if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
      throw new Error('PERMISSION_DENIED');
    } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
      throw new Error('NO_MICROPHONE');
    } else if (err?.name === 'NotReadableError' || err?.name === 'TrackStartError') {
      throw new Error('MIC_IN_USE');
    } else {
      throw new Error(`MIC_ERROR:${err?.message || err?.name || 'unknown'}`);
    }
  }

  // Pick a supported MIME type
  const mimeType = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4',
  ].find(t => MediaRecorder.isTypeSupported(t)) || '';

  const mediaRecorder = mimeType
    ? new MediaRecorder(stream, { mimeType })
    : new MediaRecorder(stream);

  const audioChunks: Blob[] = [];
  const startTime = Date.now();
  let transcript = '';

  // Start speech recognition alongside recording
  const speech = createSpeechRecognizer((text) => {
    transcript = text;
    if (onTranscriptUpdate) onTranscriptUpdate(text);
  });

  if (speech) {
    speech.start();
  }

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      audioChunks.push(event.data);
    }
  };

  // Request data every 250ms to avoid empty chunk on short recordings
  mediaRecorder.start(250);

  return {
    mediaRecorder,
    stop: () => {
      return new Promise((resolve) => {
        mediaRecorder.onstop = () => {
          const duration = Math.max(1, Math.round((Date.now() - startTime) / 1000));
          const finalMime = mediaRecorder.mimeType || 'audio/webm';
          const blob = new Blob(audioChunks, { type: finalMime });
          const url = URL.createObjectURL(blob);

          if (speech) {
            const finalT = speech.stop();
            if (finalT) transcript = finalT;
          }

          // Release microphone
          stream.getTracks().forEach(track => track.stop());

          if (!transcript.trim()) {
            transcript = 'Messaggio vocale registrato 🎙️';
          }

          resolve({ blob, url, duration, transcript: transcript.trim() });
        };

        mediaRecorder.stop();
      });
    }
  };
}

/**
 * Transcribes an uploaded audio file.
 * Since browsers can't pipe a File through SpeechRecognition directly,
 * we return a sensible placeholder and let the user edit it manually.
 */
export async function transcribeAudioFile(file: File): Promise<string> {
  const name = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  return `Messaggio audio: "${name}"`;
}
