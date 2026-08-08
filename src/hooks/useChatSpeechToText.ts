import { useState, useRef, useCallback, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const LANG_MAP: Record<string, string> = {
  en: 'en-US',
  hi: 'hi-IN',
  bn: 'bn-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  ta: 'ta-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
};

export function useChatSpeechToText(onTextChange: (text: string) => void) {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const activeRef = useRef<boolean>(false);
  const callbackRef = useRef(onTextChange);
  const hasErrorRef = useRef<boolean>(false);

  useEffect(() => {
    callbackRef.current = onTextChange;
  }, [onTextChange]);

  const stopListening = useCallback(() => {
    activeRef.current = false;
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
  }, []);

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage('Speech Recognition API is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    stopListening();
    hasErrorRef.current = false;

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = LANG_MAP[language] || 'en-US';

      rec.onstart = () => {
        activeRef.current = true;
        setIsListening(true);
        setErrorMessage(null);
      };

      rec.onresult = (event: any) => {
        let accumulatedText = '';
        for (let i = 0; i < event.results.length; i++) {
          accumulatedText += event.results[i][0].transcript;
        }

        if (accumulatedText.trim() && callbackRef.current) {
          callbackRef.current(accumulatedText);
        }
      };

      rec.onerror = (event: any) => {
        console.warn('Speech-to-Text notice:', event.error);
        hasErrorRef.current = true;
        activeRef.current = false;
        setIsListening(false);

        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone permission denied by browser settings. Please allow microphone access.');
        } else if (event.error === 'network') {
          setErrorMessage('Google Speech Web API network service is blocked by browser shield/firewall.');
        } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setErrorMessage(`Speech recognition notice (${event.error}). Please type your query or use voice prompt chips below.`);
        }
      };

      rec.onend = () => {
        if (activeRef.current && !hasErrorRef.current) {
          try {
            rec.start();
          } catch {
            activeRef.current = false;
            setIsListening(false);
          }
        } else {
          activeRef.current = false;
          setIsListening(false);
        }
      };

      recognitionRef.current = rec;
      rec.start();
      activeRef.current = true;
      setIsListening(true);
    } catch (e: any) {
      console.error('Speech recognition exception:', e);
      activeRef.current = false;
      setIsListening(false);
      setErrorMessage('Failed to access browser microphone speech recognition service.');
    }
  }, [language, stopListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    errorMessage,
    startListening,
    stopListening,
    toggleListening,
  };
}
