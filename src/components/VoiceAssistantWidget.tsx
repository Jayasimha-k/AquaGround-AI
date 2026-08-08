import React from 'react';
import { Mic, MicOff, Volume2, VolumeX, Radio } from 'lucide-react';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { useLanguage } from '@/contexts/LanguageContext';

interface VoiceAssistantWidgetProps {
  onSpeakTranscript?: (text: string) => void;
  activeExplanationText?: string;
}

export const VoiceAssistantWidget: React.FC<VoiceAssistantWidgetProps> = ({
  onSpeakTranscript,
  activeExplanationText,
}) => {
  const { t, languageOption } = useLanguage();
  const {
    isSpeaking,
    isListening,
    transcript,
    speakText,
    stopSpeaking,
    startListening,
    stopListening,
    hasSpeechRecognition,
  } = useVoiceAssistant(onSpeakTranscript);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleListenClick = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else if (activeExplanationText) {
      speakText(activeExplanationText);
    } else {
      speakText(t('app_title') + '. ' + t('cgwb_tagline') + '. Welcome Officer.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '88px',
      zIndex: 9998,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: '#0F172A',
      border: '1px solid #334155',
      borderRadius: '99px',
      padding: '6px 14px 6px 8px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.35)',
      backdropFilter: 'blur(8px)',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* Mic STT Button */}
      <button
        type="button"
        onClick={handleMicClick}
        title={isListening ? t('label_speech_listening') : t('btn_voice_input')}
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          border: 'none',
          background: isListening ? '#EF4444' : 'linear-gradient(135deg, #2563EB, #1D4ED8)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: isListening ? '0 0 12px rgba(239,68,68,0.8)' : '0 4px 10px rgba(37,99,235,0.4)',
          transition: 'all 0.2s ease',
        }}
      >
        {isListening ? <Radio size={18} className="animate-pulse" /> : <Mic size={18} />}
      </button>

      {/* TTS Playback Button */}
      <button
        type="button"
        onClick={handleListenClick}
        title={isSpeaking ? t('btn_stop_listen') : t('btn_listen')}
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          border: '1px solid #475569',
          background: isSpeaking ? '#3B82F6' : '#1E293B',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>

      {/* Status & Language Badge */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#F8FAFC', lineHeight: 1.1 }}>
          {isListening ? t('label_speech_listening') : isSpeaking ? '🔊 Audio Playback' : 'Voice Assistant'}
        </span>
        <span style={{ fontSize: '9.5px', color: '#94A3B8', fontWeight: 600 }}>
          {languageOption.nativeName} ({languageOption.code.toUpperCase()})
        </span>
      </div>
    </div>
  );
};
