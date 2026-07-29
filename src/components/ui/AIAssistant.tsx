// =============================================================================
// AIAssistant — Floating AI Assistant widget (Bottom Right)
// =============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Copy, RefreshCcw, Trash2, Check, ArrowRight } from 'lucide-react';
import { aiServiceClient, type ChatHistoryItem } from '@/services/aiService';
import { MOCK_DISTRICTS, MOCK_RECOMMENDATIONS } from '@/constants/mockData';
import { Button } from './Button';

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
  const [isOpen, setIsOpen] = useState(false);
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
        // Standard chat
        const res = await aiServiceClient.chat(text, history);
        replyText = res.response;
      }

      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setResponse({
        question: text,
        answer: replyText,
        timestamp,
      });

      // Append to local state history
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
      // Find matching type if possible, default to chat
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
    <div className="fixed bottom-6 right-6 z-[2000] select-none font-sans">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
          title="Launch AquaGround AI Assistant"
        >
          <Sparkles size={18} />
        </button>
      )}

      {/* Assistant Chat Card */}
      {isOpen && (
        <div className="w-80 h-[460px] bg-white border border-slate-200 rounded-lg shadow-xl flex flex-col overflow-hidden animate-[fadeInUp_0.18s_ease-out]">
          
          {/* Header */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-blue-50 text-blue-700 rounded">
                <Sparkles size={13} />
              </span>
              <div>
                <h3 className="text-xs font-bold text-slate-900 leading-none">AquaGround AI Assistant</h3>
                <span className="text-[9px] text-slate-400 font-bold tracking-wide uppercase leading-none mt-1 inline-block">CGWB Support</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Assistant Conversation Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {response ? (
              <div className="space-y-3.5">
                {/* User query bubble */}
                <div className="flex justify-end">
                  <div className="bg-blue-50 border border-blue-100 text-blue-900 text-xs rounded px-3 py-2 max-w-[85%] font-medium">
                    {response.question}
                  </div>
                </div>

                {/* AI response bubble */}
                <div className="space-y-1.5">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">AquaGround AI</div>
                  <div className="bg-slate-50 border border-slate-100 text-slate-700 text-xs rounded px-3.5 py-3 leading-relaxed whitespace-pre-line">
                    {response.answer}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-0.5">
                    <span>{response.timestamp}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={handleCopy} className="hover:text-slate-700 flex items-center gap-0.5 cursor-pointer">
                        {copied ? <Check size={11} className="text-green-600" /> : <Copy size={11} />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                      <button onClick={handleRegenerate} className="hover:text-slate-700 flex items-center gap-0.5 cursor-pointer">
                        <RefreshCcw size={11} />
                        Retry
                      </button>
                      <button onClick={handleClear} className="hover:text-red-600 flex items-center gap-0.5 cursor-pointer">
                        <Trash2 size={11} />
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : !loading ? (
              /* Preloaded Prompt suggestion board */
              <div className="space-y-3 pt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Suggested Inquiries</p>
                <div className="space-y-2">
                  {EXAMPLE_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAsk(q.text, q.type)}
                      className="w-full text-left bg-slate-50 hover:bg-blue-50/50 border border-slate-150 rounded p-2.5 text-xs text-slate-700 transition-colors flex items-center justify-between group cursor-pointer font-medium"
                    >
                      <span className="truncate pr-2">{q.text}</span>
                      <ArrowRight size={11} className="text-slate-400 group-hover:translate-x-0.5 group-hover:text-blue-600 transition-all shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Shimmer loading spinner */}
            {loading && (
              <div className="space-y-2">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                  <Sparkles size={11} className="text-blue-500 animate-spin" />
                  <span>AquaGround AI analyzing telemetry...</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded p-3 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-full skeleton" />
                  <div className="h-3 bg-slate-200 rounded w-[85%] skeleton" />
                  <div className="h-3 bg-slate-200 rounded w-[60%] skeleton" />
                </div>
              </div>
            )}
          </div>

          {/* Assistant Query Input bar */}
          <div className="p-3 border-t border-slate-200 bg-white">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAsk(query, 'chat')}
                placeholder="Ask AquaGround AI Assistant..."
                disabled={loading}
                className="w-full bg-slate-50 border border-slate-200 rounded pl-3 pr-9 py-2 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-blue-500/50 disabled:opacity-50"
              />
              <button
                onClick={() => handleAsk(query, 'chat')}
                disabled={loading || !query.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 disabled:opacity-30 cursor-pointer"
              >
                <Send size={13} />
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
