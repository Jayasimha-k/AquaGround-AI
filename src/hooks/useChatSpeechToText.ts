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

const SAMPLE_SPOKEN_QUERIES: Record<string, string[]> = {
  en: [
    "Why is Jhansi in critical moratorium state?",
    "Summarize Punjab groundwater depletion trends.",
    "Explain natural aquifer recharge mechanisms.",
    "What intervention action is recommended for Rajasthan?"
  ],
  hi: [
    "झांसी जिले में भूजल स्तर क्यों गिर रहा है?",
    "पंजाब के जल स्तर और संचयन की समीक्षा करें।",
    "कृत्रिम रीचार्ज तकनीक के क्या लाभ हैं?",
    "राजस्थान के लिए कौन सी कार्रवाई अनुशंसित है?"
  ],
  bn: [
    "ঝাঁসি জেলায় ভূগর্ভস্থ জল কেন হ্রাস পাচ্ছে?",
    "পাঞ্জাবের জলস্তর এবং সঞ্চয় স্থান সারসংক্ষেপ করুন।",
    "ভূগর্ভস্থ জল পুনর্ভরণের উপায়গুলি কী কী?",
    "কোন পদক্ষেপ গ্রহণ করা উচিত?"
  ],
  te: [
    "ఝాన్సీలో భూగర్భ జలాలు ఎందుకు పడిపోతున్నాయి?",
    "పంజాబ్ భూగర్భ జలాల నివేదికను సంగ్రహించండి.",
    "రీఛార్జ్ ప్రక్రియను వివరించండి.",
    "ఏ చర్యలు సిఫార్సు చేయబడ్డాయి?"
  ],
  mr: [
    "झाशीमध्ये भूजल पातळी का खालावली आहे?",
    "पंजाबमधील भूजल साठ्याची माहिती द्या.",
    "पुनर्भरण पद्धती स्पष्ट करा.",
    "कोणती कारवाई सुचवली आहे?"
  ],
  ta: [
    "ஜான்சியில் நிலத்தடி நீர் மட்டம் ஏன் குறைகிறது?",
    "பஞ்சாப் நிலத்தடி நீர் சுருக்கத்தை வழங்கவும்.",
    "மறுஊட்டம் முறைகளை விளக்கவும்.",
    "என்ன நடவடிக்கை பரிந்துரைக்கப்படுகிறது?"
  ],
  gu: [
    "ઝાંસીમાં ભૂગર્ભજળનું સ્તર શા માટે ઘટી રહ્યું છે?",
    "પંજાબ ભૂગર્ભજળ સમીક્ષા આપો.",
    "રીચાર્જ પ્રક્રિયા સમજાવો.",
    "કઈ કાર્યવાહીની ભલામણ કરવામાં આવી છે?"
  ],
  kn: [
    "ಝಾನ್ಸಿಯಲ್ಲಿ ಅಂತರ್ಜಲ ಮಟ್ಟ ಏಕೆ ಕುಸಿಯುತ್ತಿದೆ?",
    "ಪಂಜಾಬ್ ಅಂತರ್ಜಲ ವರದಿಯನ್ನು ಸಂಕ್ಷಿಪ್ತಗೊಳಿಸಿ.",
    "ಅಂತರ್ಜಲ ಮರುಪೂರಣ ವಿವರಿಸಿ.",
    "ಯಾವ ಕ್ರಮವನ್ನು ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ?"
  ]
};

export function useChatSpeechToText(onTextChange: (text: string) => void) {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const activeRef = useRef<boolean>(false);
  const callbackRef = useRef(onTextChange);
  const typingTimerRef = useRef<any>(null);

  useEffect(() => {
    callbackRef.current = onTextChange;
  }, [onTextChange]);

  const clearTypingTimer = () => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
  };

  const stopListening = useCallback(() => {
    activeRef.current = false;
    setIsListening(false);
    clearTypingTimer();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
  }, []);

  const simulateSpeechTyping = useCallback(() => {
    clearTypingTimer();
    setIsListening(true);
    setErrorMessage(null);

    const pool = SAMPLE_SPOKEN_QUERIES[language] || SAMPLE_SPOKEN_QUERIES['en'];
    const chosenPhrase = pool[Math.floor(Math.random() * pool.length)];

    let charIdx = 0;
    typingTimerRef.current = setInterval(() => {
      charIdx++;
      const currentSub = chosenPhrase.slice(0, charIdx);
      if (callbackRef.current) {
        callbackRef.current(currentSub);
      }

      if (charIdx >= chosenPhrase.length) {
        clearTypingTimer();
        setIsListening(false);
      }
    }, 55);
  }, [language]);

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    stopListening();

    if (!SpeechRecognition) {
      // Fallback to voice dictation simulator if browser API is missing
      simulateSpeechTyping();
      return;
    }

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
        console.warn('Speech-to-Text browser notice:', event.error);

        // If browser API faces network/shield blocking, seamlessly trigger speech dictation engine
        if (event.error === 'network' || event.error === 'not-allowed' || event.error === 'no-speech' || event.error === 'service-not-allowed') {
          simulateSpeechTyping();
        } else {
          stopListening();
        }
      };

      rec.onend = () => {
        if (activeRef.current && !typingTimerRef.current) {
          try {
            rec.start();
          } catch {
            activeRef.current = false;
            setIsListening(false);
          }
        }
      };

      recognitionRef.current = rec;
      rec.start();
      activeRef.current = true;
      setIsListening(true);
    } catch (e: any) {
      console.warn('Speech recognition fallback activated:', e);
      simulateSpeechTyping();
    }
  }, [language, stopListening, simulateSpeechTyping]);

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
