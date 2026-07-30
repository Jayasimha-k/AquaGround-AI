// =============================================================================
// AIAssistant — Floating AI Assistant widget (Bottom Right)
// =============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Copy, RefreshCcw, Trash2, Check, ArrowRight } from 'lucide-react';
import { aiServiceClient, type ChatHistoryItem } from '@/services/aiService';
import { MOCK_DISTRICTS, MOCK_RECOMMENDATIONS } from '@/constants/mockData';
import { useApp } from '@/contexts/AppContext';

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
  const [localOpen, setLocalOpen] = useState(false);
  const isOpen = state.aiAssistantOpen || localOpen;

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [response, loading]);

  const handleClose = () => {
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
        answer: 'Failed to communicate with the AquaGround AI Assistant backend. Please verify that the python FastAPI server is running on http://localhost:8000.',
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
          width: '350px', height: '500px', background: '#FFFFFF',
          border: '1px solid #E8EDF3', borderRadius: '16px',
          boxShadow: '0 12px 40px rgba(15,23,42,0.18)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            background: '#FAFBFC', borderBottom: '1px solid #F1F5F9',
            padding: '14px 16px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: 30, height: 30, borderRadius: '8px',
                background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={15} color="#2563EB" />
              </div>
              <div>
                <h3 style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.2 }}>
                  AquaGround AI Assistant
                </h3>
                <span style={{ fontSize: '9.5px', color: '#94A3B8', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '2px', display: 'block' }}>
                  Gemini Hydrological LLM
                </span>
              </div>
            </div>
            <button
              onClick={handleClose}
              style={{
                padding: '6px', borderRadius: '8px', border: 'none',
                background: '#F8FAFC', cursor: 'pointer', color: '#94A3B8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F1F5F9')}
              onMouseLeave={e => (e.currentTarget.style.background = '#F8FAFC')}
            >
              <X size={15} />
            </button>
          </div>

          {/* Assistant Conversation Area */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
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
                  <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    AquaGround AI
                  </span>
                  <div style={{
                    background: '#F8FAFC', border: '1px solid #EEF2F7',
                    color: '#334155', fontSize: '12.5px', borderRadius: '12px',
                    padding: '14px', lineHeight: 1.6, whiteSpace: 'pre-line', fontWeight: 500,
                  }}>
                    {response.answer}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', color: '#94A3B8', padding: '0 4px' }}>
                    <span>{response.timestamp}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                  Suggested Hydrogeological Inquiries
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

          {/* Assistant Query Input bar */}
          <div style={{ padding: '12px 14px', borderTop: '1px solid #F1F5F9', background: '#FFFFFF', flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAsk(query, 'chat')}
                placeholder="Ask AquaGround AI Assistant..."
                disabled={loading}
                style={{
                  width: '100%', background: '#F8FAFC', border: '1px solid #E8EDF3',
                  borderRadius: '10px', paddingLeft: '14px', paddingRight: '36px',
                  paddingTop: '9px', paddingBottom: '9px', fontSize: '12.5px',
                  color: '#1E293B', outline: 'none', fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
              <button
                onClick={() => handleAsk(query, 'chat')}
                disabled={loading || !query.trim()}
                style={{
                  position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer',
                  opacity: loading || !query.trim() ? 0.3 : 1, display: 'flex',
                }}
              >
                <Send size={15} />
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
