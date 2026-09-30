import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  CheckCircle2,
  ListTodo,
  Bookmark,
  PenTool,
  Languages,
  MessageSquare,
  Copy,
  Check,
  RotateCcw,
  Download,
  Send,
  Loader2,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
} from 'lucide-react';
import type { TranscriptData } from '../../types/transcript';
import { processAiAction, type AiAction } from '../../services/aiService';
import { sanitizePlainText } from '../../utils/sanitizeText';

interface DesktopAiToolkitViewProps {
  transcript: TranscriptData | null;
  onBackToTranscript: () => void;
  onOpenAuth: () => void;
  isDark: boolean;
}

interface QaItem {
  id: string;
  question: string;
  answer: string;
  timestamp: string;
}

export const DesktopAiToolkitView: React.FC<DesktopAiToolkitViewProps> = ({
  transcript,
  onBackToTranscript,
  onOpenAuth,
  isDark,
}) => {
  const [activeTab, setActiveTab] = useState<AiAction>('summary');
  const [targetLanguage, setTargetLanguage] = useState('Spanish');

  // Cache generated outputs per tool
  const [cache, setCache] = useState<Partial<Record<AiAction, string>>>({});
  const [loadingAction, setLoadingAction] = useState<AiAction | null>(null);
  const [errorMap, setErrorMap] = useState<Partial<Record<AiAction, string>>>({});
  const [copiedAction, setCopiedAction] = useState<string | null>(null);

  // Ask AI state
  const [question, setQuestion] = useState('');
  const [qaHistory, setQaHistory] = useState<QaItem[]>([]);
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);

  const availableLanguages = [
    'Spanish',
    'French',
    'German',
    'Hindi',
    'Japanese',
    'Chinese',
    'Portuguese',
    'Italian',
    'English',
  ];

  const tools: Array<{
    id: AiAction;
    label: string;
    description: string;
    icon: React.FC<{ className?: string }>;
  }> = [
    {
      id: 'summary',
      label: 'Summarize',
      description: 'Executive plain-text summary in readable paragraphs',
      icon: FileText,
    },
    {
      id: 'takeaways',
      label: 'Key Points',
      description: '5 most critical insights and conclusions',
      icon: CheckCircle2,
    },
    {
      id: 'action_items',
      label: 'Action Items',
      description: 'Practical to-dos, execution steps, and tasks',
      icon: ListTodo,
    },
    {
      id: 'chapters',
      label: 'Chapters',
      description: 'Chronological timeline with timestamps and topics',
      icon: Bookmark,
    },
    {
      id: 'rewrite',
      label: 'Rewrite',
      description: 'Engaging, publication-ready article version',
      icon: PenTool,
    },
    {
      id: 'translate',
      label: 'Translate',
      description: 'Translate core insights into another language',
      icon: Languages,
    },
    {
      id: 'ask',
      label: 'Ask AI',
      description: 'Ask any specific question about the transcript',
      icon: MessageSquare,
    },
  ];

  const handleGenerate = async (action: AiAction) => {
    if (!transcript) return;
    if (loadingAction) return;

    setLoadingAction(action);
    setErrorMap((prev) => ({ ...prev, [action]: undefined }));

    try {
      const res = await processAiAction(
        action,
        transcript.fullText,
        transcript.video.title,
        undefined,
        action === 'translate' ? targetLanguage : undefined
      );

      if (res.success && res.result) {
        const clean = sanitizePlainText(res.result);
        setCache((prev) => ({ ...prev, [action]: clean }));
      } else {
        if (res.error?.includes('sign in')) {
          onOpenAuth();
        }
        setErrorMap((prev) => ({
          ...prev,
          [action]: res.error || 'Failed to generate AI response.',
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
      const clean = sanitizePlainText(text);
      if (window.electronAPI?.copyToClipboard) {
        await window.electronAPI.copyToClipboard(clean);
      } else {
        await navigator.clipboard.writeText(clean);
      }
      setCopiedAction(id);
      setTimeout(() => setCopiedAction(null), 2000);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  const handleSaveOutput = async (text: string, toolName: string) => {
    if (!transcript) return;
    const safeTitle = (transcript.video.title || 'transcript')
      .slice(0, 25)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    const defaultName = `${toolName.toLowerCase()}-${safeTitle}.txt`;
    const content = `TOOL: ${toolName.toUpperCase()}\nVIDEO: ${transcript.video.title}\nCHANNEL: ${transcript.video.channel}\n\n========================================\n\n${text}`;

    if (window.electronAPI?.saveFile) {
      await window.electronAPI.saveFile({
        defaultName,
        content,
        ext: 'txt',
      });
    } else {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = defaultName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }
  };

  const handleAskSubmit = async (e?: React.FormEvent, customQuestion?: string) => {
    if (e) e.preventDefault();
    const query = (customQuestion || question).trim();
    if (!query || !transcript || asking) return;

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
        if (res.error?.includes('sign in')) {
          onOpenAuth();
        }
        setAskError(res.error || 'Failed to answer question. Please try again.');
      }
    } catch (err: any) {
      setAskError(err?.message || 'Error occurred while contacting AI service.');
    } finally {
      setAsking(false);
    }
  };

  if (!transcript) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-[#FAF7F2] dark:bg-[#20271E] border border-[#E8E1D5] dark:border-[#2D3629] flex items-center justify-center text-[#8B9A6E] mb-4 shadow-warm-sm">
          <Sparkles className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-[#1B1E19] dark:text-white mb-2">
          AI Toolkit Requires a Transcript
        </h3>
        <p className="text-xs text-[#595F52] dark:text-[#9AA392] leading-relaxed mb-5">
          Please generate a transcript first. The AI Toolkit will then analyze the full text to summarize, extract key points, action items, chapters, and answer questions.
        </p>
        <button
          type="button"
          onClick={onBackToTranscript}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#8B9A6E] hover:bg-[#758458] transition-all shadow-warm-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Go to Transcript Generator</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden max-w-6xl w-full mx-auto p-4 sm:p-6 gap-4">
      {/* Top Banner: Video reference & Tool Switcher */}
      <div
        className={`rounded-2xl p-4 sm:p-5 border flex flex-col gap-4 ${
          isDark
            ? 'bg-[#181D17] border-[#293225] shadow-lg'
            : 'bg-white border-[#E8E1D5] shadow-warm-sm'
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#8B9A6E]/20 text-[#5D6B44] dark:text-[#A6B595] shrink-0">
              Active Video
            </span>
            <h3 className="text-xs sm:text-sm font-bold text-[#1B1E19] dark:text-[#E9EFE0] truncate">
              {transcript.video.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onBackToTranscript}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5D6B44] dark:text-[#A6B595] hover:underline shrink-0"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>View Full Transcript</span>
          </button>
        </div>

        {/* 7 AI Tools Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {tools.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            const isCached = !!cache[t.id] || (t.id === 'ask' && qaHistory.length > 0);

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#8B9A6E] text-white shadow-warm-sm'
                    : isCached
                    ? 'bg-[#FAF7F2] dark:bg-[#22291F] text-[#1B1E19] dark:text-[#D8DFD0] border border-[#E8E1D5] dark:border-[#2E372A] hover:border-[#8B9A6E]'
                    : 'text-[#595F52] dark:text-[#9AA392] hover:text-[#1B1E19] dark:hover:text-white hover:bg-[#FAF7F2] dark:hover:bg-[#22291F]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
                {isCached && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B9A6E]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main AI Tool Workspace */}
      <div
        className={`flex-1 flex flex-col rounded-2xl border overflow-hidden shadow-warm-md ${
          isDark ? 'bg-[#181D17] border-[#293225]' : 'bg-white border-[#E8E1D5]'
        }`}
      >
        {activeTab !== 'ask' ? (
          /* Standard 1-Click AI Tools (Summarize, Key Points, Action Items, Chapters, Rewrite, Translate) */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Tool Header Bar */}
            <div
              className={`p-4 border-b flex items-center justify-between gap-4 ${
                isDark ? 'bg-[#141813] border-[#252C22]' : 'bg-[#FAF7F2] border-[#EAE3D6]'
              }`}
            >
              <div>
                <h4 className="text-sm font-bold text-[#1B1E19] dark:text-[#E9EFE0]">
                  {tools.find((t) => t.id === activeTab)?.label}
                </h4>
                <p className="text-[11px] text-[#595F52] dark:text-[#9AA392]">
                  {tools.find((t) => t.id === activeTab)?.description}
                </p>
              </div>

              {/* Translate language picker if on translate tab */}
              {activeTab === 'translate' && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#767D6E] dark:text-[#889380] text-[11px]">To:</span>
                  <select
                    value={targetLanguage}
                    onChange={(e) => {
                      setTargetLanguage(e.target.value);
                      // Clear translate cache to allow fresh translation
                      setCache((prev) => ({ ...prev, translate: undefined }));
                    }}
                    className={`px-2.5 py-1 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#8B9A6E] ${
                      isDark
                        ? 'bg-[#20271E] border-[#2E372A] text-white'
                        : 'bg-white border-[#E8E1D5] text-[#1B1E19]'
                    }`}
                  >
                    {availableLanguages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Actions if cached result exists */}
              {cache[activeTab] && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(cache[activeTab]!, activeTab)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold bg-white dark:bg-[#20271E] border-[#E8E1D5] dark:border-[#2D3629] text-[#1B1E19] dark:text-white hover:bg-[#FAF7F2] transition-colors"
                  >
                    {copiedAction === activeTab ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#8B9A6E]" />
                        <span className="text-[#5D6B44] dark:text-[#A6B595]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#767D6E]" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleSaveOutput(
                        cache[activeTab]!,
                        tools.find((t) => t.id === activeTab)?.label || 'ai-output'
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold bg-white dark:bg-[#20271E] border-[#E8E1D5] dark:border-[#2D3629] text-[#1B1E19] dark:text-white hover:bg-[#FAF7F2] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-[#767D6E]" />
                    <span>Save</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGenerate(activeTab)}
                    disabled={loadingAction === activeTab}
                    className="p-1.5 rounded-lg text-[#767D6E] hover:text-[#1B1E19] dark:hover:text-white hover:bg-white dark:hover:bg-[#20271E] transition-colors"
                    title="Regenerate"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 select-text">
              {loadingAction === activeTab ? (
                /* Loading State */
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <Loader2 className="w-7 h-7 text-[#8B9A6E] animate-spin mb-3" />
                  <h5 className="text-sm font-bold text-[#1B1E19] dark:text-white mb-1">
                    AI is analyzing transcript...
                  </h5>
                  <p className="text-xs text-[#595F52] dark:text-[#9AA392] max-w-sm mx-auto leading-relaxed">
                    Generating {tools.find((t) => t.id === activeTab)?.label.toLowerCase()} at high speed powered by Groq LPU inference.
                  </p>
                </div>
              ) : errorMap[activeTab] ? (
                /* Error State */
                <div className="rounded-xl p-5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-300 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold mb-1">AI Generation Error</div>
                      <p className="leading-relaxed">{errorMap[activeTab]}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleGenerate(activeTab)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#1E241C] border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 font-semibold text-xs"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Try Again</span>
                  </button>
                </div>
              ) : cache[activeTab] ? (
                /* Generated Plain Text Result */
                <div className="text-xs sm:text-sm text-[#282C24] dark:text-[#E0E7D8] leading-relaxed whitespace-pre-line font-normal">
                  {cache[activeTab]}
                </div>
              ) : (
                /* Empty CTA State */
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] dark:bg-[#20271E] border border-[#E8E1D5] dark:border-[#2D3629] flex items-center justify-center text-[#8B9A6E] mb-3 shadow-warm-sm">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h5 className="text-sm font-bold text-[#1B1E19] dark:text-white mb-1">
                    Ready to Generate {tools.find((t) => t.id === activeTab)?.label}
                  </h5>
                  <p className="text-xs text-[#595F52] dark:text-[#9AA392] max-w-sm mx-auto mb-5 leading-relaxed">
                    {tools.find((t) => t.id === activeTab)?.description}. Click below to process with Groq.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleGenerate(activeTab)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#8B9A6E] hover:bg-[#758458] active:scale-[0.98] transition-all shadow-warm-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run {tools.find((t) => t.id === activeTab)?.label}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ASK AI CONVERSATIONAL INTERFACE */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Input Form at Top */}
            <div
              className={`p-4 border-b space-y-3 ${
                isDark ? 'bg-[#141813] border-[#252C22]' : 'bg-[#FAF7F2] border-[#EAE3D6]'
              }`}
            >
              <form onSubmit={handleAskSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={asking}
                  placeholder="Ask anything about this video (e.g. What are the 3 main ideas discussed?)..."
                  className={`w-full pl-4 pr-12 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#8B9A6E] ${
                    isDark
                      ? 'bg-[#121611] border-[#293225] text-white placeholder:text-[#5E6857]'
                      : 'bg-white border-[#E8E1D5] text-[#1B1E19] placeholder:text-[#989F90]'
                  }`}
                />
                <button
                  type="submit"
                  disabled={asking || !question.trim()}
                  className="absolute right-1.5 p-2 rounded-lg bg-[#8B9A6E] hover:bg-[#758458] text-white disabled:opacity-40 transition-colors"
                  aria-label="Send question"
                >
                  {asking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </form>

              {/* Starter Suggestions if no history */}
              {qaHistory.length === 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[11px] text-[#767D6E] dark:text-[#889380] font-medium flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" />
                    <span>Suggestions:</span>
                  </span>
                  {[
                    'What are the 3 main ideas discussed?',
                    'Summarize the speaker’s recommendations',
                    'What practical examples were given?',
                  ].map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAskSubmit(undefined, sug)}
                      disabled={asking}
                      className="px-2 py-0.5 text-[11px] rounded-md border bg-white dark:bg-[#1E251B] border-[#E8E1D5] dark:border-[#2E372A] text-[#282C24] dark:text-[#D8DFD0] hover:border-[#8B9A6E] transition-colors"
                    >
                      "{sug}"
                    </button>
                  ))}
                </div>
              )}

              {/* Ask Error */}
              {askError && (
                <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                  <span>{askError}</span>
                </div>
              )}
            </div>

            {/* Conversation Q&A Thread */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 select-text">
              {qaHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-xs text-[#767D6E] dark:text-[#889380]">
                  <MessageSquare className="w-8 h-8 stroke-[1.5] mb-2 text-[#8B9A6E] opacity-60" />
                  <p className="font-semibold text-[#1B1E19] dark:text-white">Ask AI anything about the transcript</p>
                  <p className="text-[11px] mt-1 max-w-xs">
                    Responses are generated in real-time strictly grounded in the video's spoken transcript.
                  </p>
                </div>
              ) : (
                qaHistory.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border space-y-2.5 ${
                      isDark ? 'bg-[#151913] border-[#262E22]' : 'bg-[#FAF7F2] border-[#EAE3D6]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 border-b pb-2 border-[#E8E1D5] dark:border-[#293225]">
                      <div className="flex items-center gap-2 font-bold text-xs text-[#1B1E19] dark:text-white">
                        <span className="w-5 h-5 rounded-md bg-[#8B9A6E]/20 text-[#5D6B44] dark:text-[#A6B595] flex items-center justify-center text-[10px]">
                          Q
                        </span>
                        <span>{item.question}</span>
                      </div>
                      <span className="text-[10px] text-[#767D6E] dark:text-[#889380] font-mono">
                        {item.timestamp}
                      </span>
                    </div>

                    <div className="text-xs sm:text-sm text-[#282C24] dark:text-[#D8DFD0] leading-relaxed whitespace-pre-line pl-7">
                      {item.answer}
                    </div>

                    <div className="flex justify-end pt-1 border-t border-[#EFE9DE] dark:border-[#252C22]">
                      <button
                        type="button"
                        onClick={() => handleCopy(item.answer, item.id)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#595F52] dark:text-[#9AA392] hover:text-[#1B1E19] dark:hover:text-white transition-colors"
                      >
                        {copiedAction === item.id ? (
                          <>
                            <Check className="w-3 h-3 text-[#8B9A6E]" />
                            <span className="text-[#5D6B44] dark:text-[#A6B595]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-[#767D6E]" />
                            <span>Copy Answer</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
