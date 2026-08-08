import { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export interface UseVoiceAssistantReturn {
  isSpeaking: boolean;
  isListening: boolean;
  transcript: string;
  speakText: (text: string) => void;
  stopSpeaking: () => void;
  startListening: () => void;
  stopListening: () => void;
  hasSpeechRecognition: boolean;
  hasSpeechSynthesis: boolean;
}

const LANG_MAP: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  bn: 'bn-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  ta: 'ta-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
};

export function useVoiceAssistant(onTranscriptResult?: (text: string) => void): UseVoiceAssistantReturn {
  const { language } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const callbackRef = useRef(onTranscriptResult);
  const isListeningRef = useRef(false);

  // Keep callbackRef updated without triggering useEffect re-runs
  useEffect(() => {
    callbackRef.current = onTranscriptResult;
  }, [onTranscriptResult]);

  const hasSpeechSynthesis = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const hasSpeechRecognition = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Initialize SpeechRecognition
  useEffect(() => {
    if (!hasSpeechRecognition) return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    
    // Set CONTINUOUS to true so it stays listening continuously and doesn't close after 1 second!
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.lang = LANG_MAP[language] || 'en-IN';

    rec.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal || result[0].confidence > 0.3) {
          finalTranscript += result[0].transcript + ' ';
        }
      }

      if (finalTranscript.trim()) {
        const cleanText = finalTranscript.trim();
        setTranscript(cleanText);
        if (callbackRef.current) {
          callbackRef.current(cleanText);
        }
      }
    };

    rec.onerror = (err: any) => {
      // Ignore non-fatal network/aborted events
      if (err.error !== 'no-speech' && err.error !== 'aborted') {
        console.warn('Speech recognition notice:', err.error);
        setIsListening(false);
        isListeningRef.current = false;
      }
    };

    rec.onend = () => {
      // Auto-restart if officer is still in active listening mode
      if (isListeningRef.current) {
        try {
          rec.start();
        } catch {
          setIsListening(false);
          isListeningRef.current = false;
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = rec;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [hasSpeechRecognition, language]);

  const speakText = useCallback((text: string) => {
    if (!hasSpeechSynthesis) return;
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/<[^>]*>?/gm, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = LANG_MAP[language] || 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [hasSpeechSynthesis, language]);

  const stopSpeaking = useCallback(() => {
    if (hasSpeechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [hasSpeechSynthesis]);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        setTranscript('');
        recognitionRef.current.lang = LANG_MAP[language] || 'en-IN';
        isListeningRef.current = true;
        setIsListening(true);
        recognitionRef.current.start();
      } catch (e) {
        // If already running, ignore error
        isListeningRef.current = true;
        setIsListening(true);
      }
    }
  }, [language]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  }, []);

  return {
    isSpeaking,
    isListening,
    transcript,
    speakText,
    stopSpeaking,
    startListening,
    stopListening,
    hasSpeechRecognition,
    hasSpeechSynthesis,
  };
}
