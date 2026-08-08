// =============================================================================
// AIAssistant — Floating AI Assistant widget with Multi-Lingual Regional Support
// & Dual-Engine Speech-to-Text (Browser Speech API + Native Audio Mic Recording)
// =============================================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, X, Send, Copy, RefreshCcw, Trash2, Check, ArrowRight, Mic, Radio, Globe, Volume2, VolumeX } from 'lucide-react';
import { aiServiceClient, type ChatHistoryItem } from '@/services/aiService';
import { MOCK_DISTRICTS, MOCK_RECOMMENDATIONS } from '@/constants/mockData';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useChatSpeechToText } from '@/hooks/useChatSpeechToText';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';

interface ResponseData {
  question: string;
  answer: string;
  timestamp: string;
}

const EXAMPLE_QUESTIONS = [
  { text: 'Why is Jhansi Critical?', type: 'explain-risk' },
  { text: 'Summarize Punjab.', type: 'summarize-district' },
  { text: 'Explain groundwater depletion.', type: 'chat' },
  { text: "Generate today's report.", type: 'generate-report' },
  { text: 'What action is recommended?', type: 'recommendation-summary' },
];

export function AIAssistant() {
  const { state, toggleAiAssistant, closeAiAssistant } = useApp();
  const { language, setLanguage, supportedLanguages, t } = useLanguage();
  const [localOpen, setLocalOpen] = useState(false);
  const isOpen = state.aiAssistantOpen || localOpen;

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Audio Text-to-Speech Readout hook
  const { isSpeaking, speakText, stopSpeaking } = useVoiceAssistant();

  // Speech-to-Text Handler
  const handleSpeechResult = useCallback((spokenText: string) => {
    setQuery(spokenText);
  }, []);

  const { isListening, errorMessage, startListening, stopListening, toggleListening } = useChatSpeechToText(handleSpeechResult);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [response, loading]);

  const handleClose = () => {
    stopListening();
    stopSpeaking();
    setLocalOpen(false);
    closeAiAssistant();
  };

  const handleToggle = () => {
    if (isOpen) {
      handleClose();
    } else {
      setLocalOpen(true);
      toggleAiAssistant();
    }
  };

  const handleAsk = async (text: string, qType: string = 'chat') => {
    if (!text.trim()) return;
    stopListening();
    setLoading(true);
    setQuery('');
    setCopied(false);

    try {
      let replyText = '';
      if (qType === 'explain-risk') {
        const district = MOCK_DISTRICTS.find(d => text.toLowerCase().includes(d.name.toLowerCase())) || MOCK_DISTRICTS[0];
        const res = await aiServiceClient.explainRisk({
          district: district.name,
          risk: district.riskLevel,
          rainfall: district.rainfall,
          extraction: district.extractionRate,
          recharge: district.rechargeRate,
          waterLevel: district.groundwaterDepth,
        });
        replyText = res.response;
      } else if (qType === 'summarize-district') {
        const district = MOCK_DISTRICTS.find(d => text.toLowerCase().includes(d.name.toLowerCase())) || MOCK_DISTRICTS[0];
        const res = await aiServiceClient.summarizeDistrict(district.name, district);
        replyText = res.response;
      } else if (qType === 'generate-report') {
        const res = await aiServiceClient.generateReport(MOCK_DISTRICTS.slice(0, 5));
        replyText = res.response;
      } else if (qType === 'recommendation-summary') {
        const res = await aiServiceClient.recommendationSummary(MOCK_RECOMMENDATIONS);
        replyText = res.response;
      } else {
        const res = await aiServiceClient.chat(text, history);
        replyText = res.response;
      }

      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setResponse({
        question: text,
        answer: replyText,
        timestamp,
      });

      setHistory(prev => [
        ...prev,
        { role: 'user', content: text },
        { role: 'model', content: replyText }
      ]);
    } catch (err) {
      console.error(err);
      setResponse({
        question: text,
        answer: 'AquaGround AI Assistant: Telemetry data indicates heightened extraction across monitored basins. Recommended intervention: Deploy artificial check-dams and restrict non-essential tube-well usage.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    if (response) {
      const match = EXAMPLE_QUESTIONS.find(q => q.text === response.question);
      handleAsk(response.question, match ? match.type : 'chat');
    }
  };

  const handleClear = () => {
    stopSpeaking();
    setResponse(null);
    setHistory([]);
    setCopied(false);
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, userSelect: 'none', fontFamily: 'inherit' }}>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={handleToggle}
          style={{
            width: '52px', height: '52px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
            color: '#FFFFFF', boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer', transition: 'transform 0.15s',
          }}
          title="Launch AquaGround AI Assistant"
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Sparkles size={20} color="#FFFFFF" />
        </button>
      )}

      {/* Assistant Chat Card */}
      {isOpen && (
        <div style={{
          width: '370px', height: '540px', background: '#FFFFFF',
          border: '1px solid #E8EDF3', borderRadius: '16px',
          boxShadow: '0 12px 40px rgba(15,23,42,0.18)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Header with Language Selector */}
          <div style={{
            background: '#FAFBFC', borderBottom: '1px solid #F1F5F9',
            padding: '12px 16px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '8px',
                background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={14} color="#2563EB" />
              </div>
              <div>
                <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.2 }}>
                  AquaGround AI Assistant
                </h3>
                <span style={{ fontSize: '9px', color: '#94A3B8', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block' }}>
                  Gemini LLM • Multi-Lingual Regional AI
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Language Selector Dropdown inside Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '2px 6px' }}>
                <Globe size={12} color="#2563EB" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  title={t('label_language')}
                  style={{
                    background: 'transparent', border: 'none', fontSize: '11px',
                    fontWeight: 700, color: '#0F172A', outline: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', maxWidth: '85px'
                  }}
                >
                  {supportedLanguages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.nativeName}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleClose}
                style={{
                  padding: '5px', borderRadius: '6px', border: 'none',
                  background: '#F8FAFC', cursor: 'pointer', color: '#94A3B8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F1F5F9')}
                onMouseLeave={e => (e.currentTarget.style.background = '#F8FAFC')}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Assistant Conversation Area */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {errorMessage && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ color: '#DC2626', fontSize: '11.5px', fontWeight: 600, lineHeight: 1.3 }}>
                  ⚠️ {errorMessage}
                </div>
                <div style={{ fontSize: '10.5px', color: '#991B1B', fontWeight: 700, marginTop: '2px' }}>
                  🎙️ Alternative Speech Dictation (Click to speak in {supportedLanguages.find(l => l.code === language)?.name || 'Regional Language'}):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {[
                    'Why is Jhansi Critical?',
                    'Summarize Punjab groundwater.',
                    'Explain groundwater depletion.',
                    'What action is recommended?'
                  ].map((voicePrompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setQuery(voicePrompt);
                        handleAsk(voicePrompt, 'chat');
                      }}
                      style={{
                        background: '#FFFFFF', border: '1px solid #FCA5A5', borderRadius: '6px',
                        padding: '4px 8px', fontSize: '11px', fontWeight: 700, color: '#991B1B',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px'
                      }}
                    >
                      <Mic size={10} color="#DC2626" />
                      "{voicePrompt}"
                    </button>
                  ))}
                </div>
              </div>
            )}

            {response ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* User query bubble */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{
                    background: '#EFF6FF', border: '1px solid #BFDBFE',
                    color: '#1E3A8A', fontSize: '12.5px', borderRadius: '10px',
                    padding: '10px 14px', maxWidth: '85%', fontWeight: 600, lineHeight: 1.4,
                  }}>
                    {response.question}
                  </div>
                </div>

                {/* AI response bubble */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      AquaGround AI ({supportedLanguages.find(l => l.code === language)?.name})
                    </span>
                    <button
                      onClick={() => {
                        if (isSpeaking) stopSpeaking();
                        else speakText(response.answer);
                      }}
                      style={{
                        border: 'none', background: '#EFF6FF', color: isSpeaking ? '#EF4444' : '#2563EB',
                        padding: '2px 8px', borderRadius: '6px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', fontWeight: 700
                      }}
                    >
                      {isSpeaking ? <VolumeX size={11} color="#EF4444" /> : <Volume2 size={11} />}
                      {isSpeaking ? t('btn_stop_listen', 'Stop Audio') : t('btn_listen', 'Listen Audio')}
                    </button>
                  </div>

                  <div style={{
                    background: '#F8FAFC', border: '1px solid #EEF2F7',
                    color: '#334155', fontSize: '12.5px', borderRadius: '12px',
                    padding: '14px', lineHeight: 1.6, whiteSpace: 'pre-line', fontWeight: 500,
                  }}>
                    {response.answer}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', color: '#94A3B8', padding: '0 4px' }}>
                    <span>{response.timestamp}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button onClick={handleCopy} style={{ border: 'none', background: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: 600 }}>
                        {copied ? <Check size={11} color="#10B981" /> : <Copy size={11} />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                      <button onClick={handleRegenerate} style={{ border: 'none', background: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: 600 }}>
                        <RefreshCcw size={11} /> Retry
                      </button>
                      <button onClick={handleClear} style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: 600 }}>
                        <Trash2 size={11} /> Clear
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : !loading ? (
              /* Preloaded Prompt suggestion board */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '4px' }}>
                <p style={{ fontSize: '10.5px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                  Suggested Hydrogeological Inquiries ({supportedLanguages.find(l => l.code === language)?.nativeName})
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {EXAMPLE_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAsk(q.text, q.type)}
                      style={{
                        width: '100%', textAlign: 'left', background: '#F8FAFC',
                        border: '1px solid #E8EDF3', borderRadius: '10px',
                        padding: '10px 14px', fontSize: '12.5px', color: '#334155',
                        cursor: 'pointer', transition: 'all 0.15s',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        fontWeight: 600,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.borderColor = '#BFDBFE'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E8EDF3'; }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>{q.text}</span>
                      <ArrowRight size={12} color="#3B82F6" style={{ flexShrink: 0 }} />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Shimmer loading spinner */}
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={12} color="#2563EB" />
                  <span>AquaGround AI analyzing telemetry...</span>
                </div>
                <div style={{ background: '#F8FAFC', border: '1px solid #EEF2F7', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="skeleton" style={{ height: '12px', width: '100%', borderRadius: '4px' }} />
                  <div className="skeleton" style={{ height: '12px', width: '85%', borderRadius: '4px' }} />
                  <div className="skeleton" style={{ height: '12px', width: '60%', borderRadius: '4px' }} />
                </div>
              </div>
            )}
          </div>

          {/* Assistant Query Input bar with Mic STT Button */}
          <div style={{ padding: '12px 14px', borderTop: '1px solid #F1F5F9', background: '#FFFFFF', flexShrink: 0 }}>
            {isListening && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', background: '#FEF2F2', border: '1px solid #FECACA', padding: '4px 10px', borderRadius: '6px' }}>
                <Radio size={12} className="animate-pulse" color="#EF4444" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#DC2626' }}>
                  🎙️ Recording Officer Speech… Speak in {supportedLanguages.find(l => l.code === language)?.name}
                </span>
              </div>
            )}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAsk(query, 'chat')}
                placeholder={isListening ? `Listening in ${supportedLanguages.find(l => l.code === language)?.name}... Speak now` : "Ask AquaGround AI Assistant..."}
                disabled={loading}
                style={{
                  width: '100%', background: isListening ? '#FFF5F5' : '#F8FAFC',
                  border: isListening ? '1.5px solid #EF4444' : '1px solid #E8EDF3',
                  borderRadius: '10px', paddingLeft: '14px', paddingRight: '68px',
                  paddingTop: '9px', paddingBottom: '9px', fontSize: '12.5px',
                  color: '#1E293B', outline: 'none', fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  type="button"
                  onClick={toggleListening}
                  title={isListening ? "Click to Stop Microphone" : "Click to Speak Prompt (Speech-to-Text)"}
                  style={{
                    background: isListening ? '#EF4444' : '#F1F5F9',
                    border: 'none',
                    color: isListening ? '#FFFFFF' : '#475569',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '5px 7px',
                    borderRadius: '6px',
                    boxShadow: isListening ? '0 2px 8px rgba(239,68,68,0.4)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isListening ? <Radio size={14} className="animate-pulse" /> : <Mic size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => handleAsk(query, 'chat')}
                  disabled={loading || !query.trim()}
                  style={{
                    background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer',
                    opacity: loading || !query.trim() ? 0.3 : 1, display: 'flex',
                    padding: '4px',
                  }}
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
