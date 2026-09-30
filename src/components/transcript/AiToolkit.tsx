import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  CheckCircle2,
  Bookmark,
  BookOpen,
  MessageSquare,
  Copy,
  Check,
  RotateCcw,
  Send,
  Loader2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import type { TranscriptData } from '../../types/transcript';
import { processAiAction, type AiAction } from '../../services/aiService';
import { sanitizePlainText } from '../../utils/sanitizeText';

interface AiToolkitProps {
  transcript: TranscriptData;
}

interface QaItem {
  id: string;
  question: string;
  answer: string;
  timestamp: string;
}

export const AiToolkit: React.FC<AiToolkitProps> = ({ transcript }) => {
  const [activeTab, setActiveTab] = useState<AiAction>('summary');

  // In-memory cache for generated AI outputs: { summary: string, takeaways: string, ... }
  const [cache, setCache] = useState<Partial<Record<AiAction, string>>>({});
  const [loadingAction, setLoadingAction] = useState<AiAction | null>(null);
  const [errorMap, setErrorMap] = useState<Partial<Record<AiAction, string>>>({});
  const [copiedAction, setCopiedAction] = useState<string | null>(null);

  // Ask AI state
  const [question, setQuestion] = useState('');
  const [qaHistory, setQaHistory] = useState<QaItem[]>([]);
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);

  const handleGenerate = async (action: AiAction) => {
    if (loadingAction) return;

    setLoadingAction(action);
    setErrorMap((prev) => ({ ...prev, [action]: undefined }));

    try {
      const res = await processAiAction(
        action,
        transcript.fullText,
        transcript.video.title
      );

      if (res.success && res.result) {
        const cleanOutput = sanitizePlainText(res.result);
        setCache((prev) => ({ ...prev, [action]: cleanOutput }));
      } else {
        setErrorMap((prev) => ({
          ...prev,
          [action]: res.error || 'Failed to generate AI response. Please try again.',
        }));
      }
    } catch (err: any) {
      setErrorMap((prev) => ({
        ...prev,
        [action]: err?.message || 'An unexpected error occurred.',
      }));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(sanitizePlainText(text));
      setCopiedAction(id);
      setTimeout(() => setCopiedAction(null), 2000);
    } catch (err) {
      console.warn('Failed to copy text:', err);
    }
  };

  const handleAskSubmit = async (e?: React.FormEvent, customQuestion?: string) => {
    if (e) e.preventDefault();
    const query = (customQuestion || question).trim();
    if (!query || asking) return;

    setAsking(true);
    setAskError(null);

    try {
      const res = await processAiAction(
        'ask',
        transcript.fullText,
        transcript.video.title,
        query
      );

      if (res.success && res.result) {
        const newItem: QaItem = {
          id: `qa-${Date.now()}`,
          question: query,
          answer: sanitizePlainText(res.result),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setQaHistory((prev) => [newItem, ...prev]);
        setQuestion('');
      } else {
        setAskError(res.error || 'Failed to answer question. Please try again.');
      }
    } catch (err: any) {
      setAskError(err?.message || 'An unexpected error occurred while processing your question.');
    } finally {
      setAsking(false);
    }
  };

  const tabs: Array<{ id: AiAction; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'summary', label: 'AI Summary', icon: FileText },
    { id: 'takeaways', label: 'Key Takeaways', icon: CheckCircle2 },
    { id: 'chapters', label: 'Chapters', icon: Bookmark },
    { id: 'notes', label: 'AI Notes', icon: BookOpen },
    { id: 'ask', label: 'Ask AI', icon: MessageSquare },
  ];

  return (
    <div className="mt-8 pt-8 border-t border-[#E8E1D5]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h4 className="text-base font-extrabold text-[#1B1E19] tracking-tight">
              Groq AI Toolkit
            </h4>
            <p className="text-xs text-[#595F52]">
              Extract executive summaries, key takeaways, chapters, or ask questions
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 text-white text-[11px] font-bold self-start sm:self-auto shadow-xs border border-zinc-800">
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span>Powered by Groq LPUs (Llama 3.3)</span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2.5 scrollbar-none border-b border-[#EFE9DE]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isCached = !!cache[tab.id] || (tab.id === 'ask' && qaHistory.length > 0);

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-zinc-900 text-white shadow-md shadow-zinc-950/20 border border-zinc-800'
                  : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-200/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {isCached && !isActive && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="mt-5">
        {activeTab !== 'ask' ? (
          <div>
            {/* 1. If currently loading */}
            {loadingAction === activeTab ? (
              <div className="rounded-2xl bg-[#FAF7F2] border border-[#E8E1D5] p-8 sm:p-12 text-center animate-in fade-in duration-200">
                <Loader2 className="w-8 h-8 text-zinc-900 animate-spin mx-auto mb-3" />
                <h5 className="text-sm font-extrabold text-[#1B1E19] mb-1">
                  Groq is analyzing the transcript...
                </h5>
                <p className="text-xs text-[#595F52] max-w-sm mx-auto leading-relaxed">
                  Generating {tabs.find((t) => t.id === activeTab)?.label.toLowerCase()} at ultra-high speed powered by Groq LPUs.
                </p>
              </div>
            ) : errorMap[activeTab] ? (
              /* 2. Error state */
              <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-xs text-red-800 animate-in fade-in duration-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <div className="font-bold text-red-900">
                      AI Generation Notice
                    </div>
                    <p className="leading-relaxed">{errorMap[activeTab]}</p>
                    {(errorMap[activeTab]?.includes('GROQ_API_KEY') || errorMap[activeTab]?.toLowerCase().includes('groq')) && (
                      <div className="p-3 bg-white/80 rounded-xl border border-red-200 text-[11px] text-[#282C24] space-y-1">
                        <div>
                          💡 <strong>Setup Step:</strong> Please add your <code className="bg-red-100 px-1 py-0.5 rounded font-mono">GROQ_API_KEY</code> secret in Supabase under <strong>Edge Functions → Secrets</strong>.
                        </div>
                        <p className="text-[11px] text-[#595F52]">
                          You can get an instant free API key from <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-zinc-900 underline font-bold">Groq Console</a>.
                        </p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleGenerate(activeTab)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Try Again</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : cache[activeTab] ? (
              /* 3. Generated Content */
              <div className="rounded-2xl bg-[#FAF7F2] border border-[#E8E1D5] p-6 sm:p-7 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8E1D5]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#1B1E19] uppercase tracking-wider">
                      {tabs.find((t) => t.id === activeTab)?.label}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-white font-bold">
                      Groq Verified
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(cache[activeTab]!, activeTab)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#1B1E19] bg-white border border-zinc-300 hover:bg-zinc-100 rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      {copiedAction === activeTab ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-zinc-700" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGenerate(activeTab)}
                      className="p-2 text-zinc-700 hover:text-black hover:bg-white rounded-xl transition-colors cursor-pointer"
                      title="Regenerate with Groq"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-[#282C24] text-sm sm:text-[15px] leading-relaxed whitespace-pre-line font-normal tracking-normal select-text">
                  {sanitizePlainText(cache[activeTab] || '')}
                </div>
              </div>
            ) : (
              /* 4. Not yet generated (Clean CTA state with fixed overflow & responsive dark button) */
              <div className="rounded-2xl bg-[#FAF7F2]/80 border border-dashed border-zinc-300 p-8 sm:p-10 text-center animate-slide-up">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white mx-auto mb-4 shadow-md">
                  <Sparkles className="w-6 h-6 text-amber-300" />
                </div>
                <h5 className="text-base font-extrabold text-[#1B1E19] mb-1.5">
                  Generate {tabs.find((t) => t.id === activeTab)?.label}
                </h5>
                <p className="text-xs sm:text-sm text-[#595F52] max-w-md mx-auto mb-6 leading-relaxed">
                  {activeTab === 'summary' &&
                    'Produce an executive, easy-to-read summary capturing the core narrative and takeaways.'}
                  {activeTab === 'takeaways' &&
                    'Extract the 5 most actionable and critical insights from this video transcript.'}
                  {activeTab === 'chapters' &&
                    'Synthesize chronological chapters and timestamps for easy navigation.'}
                  {activeTab === 'notes' &&
                    'Create structured study and reference notes with concepts and bullet points.'}
                </p>

                {/* Primary Action Button properly formatted & centered without overflow */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleGenerate(activeTab)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] rounded-2xl shadow-md shadow-zinc-950/20 border border-zinc-800 transition-all duration-200 cursor-pointer whitespace-nowrap"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>Generate with Groq</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* 5. ASK AI INTERFACE */
          <div className="space-y-4">
            {/* Question Input Form */}
            <form onSubmit={handleAskSubmit} className="relative">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={asking}
                  placeholder="Ask any question about this video (e.g. What were the key conclusions?)..."
                  className="w-full pl-4 pr-14 py-3.5 text-xs sm:text-sm bg-white text-[#1B1E19] placeholder:text-[#989F90] border border-[#E8E1D5] rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent shadow-xs disabled:opacity-60 transition-all font-medium"
                />
                <button
                  type="submit"
                  disabled={asking || !question.trim()}
                  className="absolute right-2 p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md border border-zinc-800 transition-all cursor-pointer"
                  aria-label="Send question"
                >
                  {asking ? (
                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </form>

            {/* Quick Starter Question Chips */}
            {qaHistory.length === 0 && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#595F52] pt-1">
                <span className="flex items-center gap-1 text-zinc-700 font-bold">
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-900" />
                  <span>Suggestions:</span>
                </span>
                {[
                  'What is the core argument of this video?',
                  'Summarize the speaker’s recommendations',
                  'What tools or methods were mentioned?',
                ].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => handleAskSubmit(undefined, sug)}
                    disabled={asking}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-900 hover:text-white border border-zinc-300 text-zinc-800 font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-60"
                  >
                    "{sug}"
                  </button>
                ))}
              </div>
            )}

            {/* Ask Error Message */}
            {askError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex flex-col gap-2">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{askError}</span>
                </div>
                {(askError.includes('GROQ_API_KEY') || askError.toLowerCase().includes('groq')) && (
                  <div className="p-2.5 bg-white/80 rounded-lg border border-red-200 text-[11px] text-[#282C24]">
                    💡 <strong>Setup Step:</strong> Please verify your <code className="bg-red-100 px-1 py-0.5 rounded font-mono">GROQ_API_KEY</code> secret in Supabase under <strong>Edge Functions → Secrets</strong>.
                  </div>
                )}
              </div>
            )}

            {/* QA Conversation List */}
            {qaHistory.length > 0 && (
              <div className="space-y-3.5 pt-2">
                {qaHistory.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-[#FAF7F2] border border-[#E8E1D5] p-5 shadow-xs animate-in fade-in duration-200"
                  >
                    {/* User Question */}
                    <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#E8E1D5]">
                      <div className="flex items-center gap-2 font-bold text-xs text-[#1B1E19]">
                        <span className="w-5 h-5 rounded-md bg-zinc-900 text-white flex items-center justify-center font-bold text-[10px]">
                          Q
                        </span>
                        <span>{item.question}</span>
                      </div>
                      <span className="text-[10px] text-[#767D6E] font-mono">
                        {item.timestamp}
                      </span>
                    </div>

                    {/* Groq Answer */}
                    <div className="text-xs sm:text-sm text-[#282C24] leading-relaxed whitespace-pre-line pl-7 font-normal">
                      {sanitizePlainText(item.answer)}
                    </div>

                    {/* Copy Answer Action */}
                    <div className="mt-3 pt-2 border-t border-[#EFE9DE] flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleCopy(item.answer, item.id)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#595F52] hover:text-[#1B1E19] transition-colors cursor-pointer"
                      >
                        {copiedAction === item.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Answer Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-zinc-700" />
                            <span>Copy Answer</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

