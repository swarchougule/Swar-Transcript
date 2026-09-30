import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Search,
  Copy,
  Check,
  Download,
  Clock,
  Type,
  Hash,
  ArrowRight,
  AlertCircle,
  Loader2,
  FileText,
  ClipboardPaste,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import type { TranscriptData } from '../../types/transcript';
import { generateTranscript } from '../../services/transcriptService';
import { useAuth } from '../../hooks/useAuth';

interface DesktopTranscriptViewProps {
  transcript: TranscriptData | null;
  onTranscriptLoaded: (transcript: TranscriptData) => void;
  onOpenAiToolkit: () => void;
  onOpenAuth: () => void;
  isDark: boolean;
}

export const DesktopTranscriptView: React.FC<DesktopTranscriptViewProps> = ({
  transcript,
  onTranscriptLoaded,
  onOpenAiToolkit,
  onOpenAuth,
  isDark,
}) => {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [copied, setCopied] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Quick sample videos for effortless testing
  const sampleVideos = [
    {
      title: 'Steve Jobs 2005 Stanford Speech',
      url: 'https://www.youtube.com/watch?v=UF8uR6Z6KLc',
    },
    {
      title: 'Jensen Huang Computex Keynote',
      url: 'https://www.youtube.com/watch?v=B1b3r2W3Qk8',
    },
  ];

  // Native Save File Dialog via Electron IPC (or browser blob fallback)
  const handleSaveTxt = useCallback(async (ext: 'txt' | 'md' = 'txt') => {
    if (!transcript) return;

    const safeTitle = (transcript.video.title || 'transcript')
      .slice(0, 35)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    const defaultName = `swartranscript-${safeTitle}.${ext}`;

    let content = '';
    if (ext === 'txt') {
      content = `Title: ${transcript.video.title}\nChannel: ${transcript.video.channel}\nDuration: ${transcript.video.duration}\n\n========================================\nTRANSCRIPT\n========================================\n\n${transcript.fullText}`;
    } else {
      content = `# ${transcript.video.title}\n\n**Channel:** ${transcript.video.channel}  \n**Duration:** ${transcript.video.duration}  \n**Words:** ${transcript.video.wordCount}  \n\n---\n\n` +
        transcript.segments
          .map((s) => `### [${s.timestamp}] ${s.speaker || 'Speaker'}\n${s.text}\n`)
          .join('\n');
    }

    if (window.electronAPI?.saveFile) {
      const res = await window.electronAPI.saveFile({
        defaultName,
        content,
        ext,
      });

      if (res.success && res.filePath) {
        const basename = res.filePath.split(/[\\/]/).pop();
        setSaveSuccessNotice(`Saved as ${basename}`);
        setTimeout(() => setSaveSuccessNotice(null), 4000);
      } else if (res.error) {
        setError(`Failed to save file: ${res.error}`);
      }
    } else {
      // Browser fallback
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = defaultName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      setSaveSuccessNotice(`Downloaded ${defaultName}`);
      setTimeout(() => setSaveSuccessNotice(null), 4000);
    }
  }, [transcript]);

  // Global keyboard shortcuts: Ctrl+F to search, Ctrl+V to paste, Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+F or Cmd+F -> focus search input if transcript is loaded
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f' && transcript) {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
      // Ctrl+S or Cmd+S -> save transcript
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && transcript) {
        e.preventDefault();
        handleSaveTxt();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [transcript, handleSaveTxt]);

  // Clean URL validator
  const isValidYouTubeUrl = (testUrl: string) => {
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]{11}(.*)?$/i;
    return youtubeRegex.test(testUrl.trim());
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        setError(null);
        inputRef.current?.focus();
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
    }
  };

  const handleGenerate = async (targetUrl?: string) => {
    const videoUrl = (targetUrl || url).trim();

    if (!user) {
      onOpenAuth();
      return;
    }

    if (!videoUrl) {
      setError('Please paste or enter a YouTube video URL.');
      return;
    }

    if (!isValidYouTubeUrl(videoUrl)) {
      setError('Please enter a valid YouTube video URL (e.g., https://www.youtube.com/watch?v=...).');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSaveSuccessNotice(null);

    try {
      const res = await generateTranscript(videoUrl);

      if (res.success && res.transcript) {
        onTranscriptLoaded(res.transcript);
        setSearchQuery('');
      } else {
        setError(res.error || 'Failed to extract transcript. Please check the video link.');
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred while communicating with the transcription service.');
    } finally {
      setIsLoading(false);
    }
  };

  // Copy full transcript text
  const handleCopy = async () => {
    if (!transcript) return;
    try {
      if (window.electronAPI?.copyToClipboard) {
        await window.electronAPI.copyToClipboard(transcript.fullText);
      } else {
        await navigator.clipboard.writeText(transcript.fullText);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };


  // Normalized segments and search filtering
  const filteredSegments = useMemo(() => {
    if (!transcript) return [];
    if (!searchQuery.trim()) return transcript.segments || [];

    const q = searchQuery.toLowerCase();
    return (transcript.segments || []).filter(
      (s) =>
        s.text.toLowerCase().includes(q) ||
        (s.speaker && s.speaker.toLowerCase().includes(q)) ||
        s.timestamp.includes(q)
    );
  }, [transcript, searchQuery]);

  const matchCount = useMemo(() => {
    if (!transcript || !searchQuery.trim()) return 0;
    const q = searchQuery.toLowerCase();
    let count = 0;
    (transcript.segments || []).forEach((s) => {
      const occurrences = (s.text.toLowerCase().match(new RegExp(q, 'g')) || []).length;
      count += occurrences;
    });
    return count;
  }, [transcript, searchQuery]);

  const highlightMatch = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <mark
          key={i}
          className="bg-[#8B9A6E]/30 dark:bg-[#8B9A6E]/50 text-[#1B1E19] dark:text-white px-0.5 rounded font-medium"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden max-w-6xl w-full mx-auto p-4 sm:p-6 gap-5">
      {/* 1. TRANSCRIPT GENERATION INPUT BAR (CORE WORKSPACE HEADER) */}
      <div
        className={`rounded-2xl p-5 sm:p-6 border transition-all ${
          isDark
            ? 'bg-[#181D17] border-[#293225] shadow-lg'
            : 'bg-white border-[#E8E1D5] shadow-warm-md'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#1B1E19] dark:text-[#E9EFE0]">
              Generate Transcript
            </h2>
            <p className="text-xs text-[#595F52] dark:text-[#9AA392]">
              Paste any YouTube video link to extract spoken audio subtitles instantly.
            </p>
          </div>

          {/* Quick Samples */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#767D6E] dark:text-[#889380] text-[11px] font-medium hidden sm:inline">
              Try a sample:
            </span>
            {sampleVideos.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setUrl(sample.url);
                  handleGenerate(sample.url);
                }}
                disabled={isLoading}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg border bg-[#FAF7F2] dark:bg-[#20271E] border-[#E8E1D5] dark:border-[#2D3629] text-[#282C24] dark:text-[#D8DFD0] hover:border-[#8B9A6E] transition-colors disabled:opacity-50"
              >
                {sample.title.split(' ')[0]} {sample.title.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate();
          }}
          className="flex flex-col sm:flex-row items-stretch gap-2.5"
        >
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
              disabled={isLoading}
              placeholder="Paste YouTube video URL (e.g. https://www.youtube.com/watch?v=...)"
              className={`w-full pl-4 pr-20 py-3 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#8B9A6E] transition-all ${
                isDark
                  ? 'bg-[#131612] border-[#293225] text-white placeholder:text-[#5E6857]'
                  : 'bg-[#FDFBF7] border-[#E8E1D5] text-[#1B1E19] placeholder:text-[#989F90]'
              }`}
            />

            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {url ? (
                <button
                  type="button"
                  onClick={() => setUrl('')}
                  disabled={isLoading}
                  className="p-1.5 rounded-lg text-[#767D6E] hover:text-[#1B1E19] dark:hover:text-white"
                  title="Clear"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-[#FAF7F2] dark:bg-[#20271E] border border-[#E8E1D5] dark:border-[#2D3629] text-[#5D6B44] dark:text-[#A6B595] hover:bg-[#EAE3D6] transition-colors"
                  title="Paste from Clipboard"
                >
                  <ClipboardPaste className="w-3 h-3" />
                  <span>Paste</span>
                </button>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm text-white bg-[#8B9A6E] hover:bg-[#758458] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-warm-sm transition-all shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Extracting...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Transcript</span>
              </>
            )}
          </button>
        </form>

        {/* Error Alert */}
        {error && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-300 flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-900 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Save Notice */}
        {saveSuccessNotice && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessNotice}</span>
          </div>
        )}
      </div>

      {/* 2. MAIN TRANSCRIPT CONTENT AREA */}
      <div className="flex-1 flex flex-col min-h-0">
        {isLoading ? (
          /* Loading State */
          <div
            className={`flex-1 rounded-2xl border p-10 flex flex-col items-center justify-center text-center ${
              isDark ? 'bg-[#181D17] border-[#293225]' : 'bg-white border-[#E8E1D5]'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#8B9A6E]/15 border border-[#8B9A6E]/30 flex items-center justify-center text-[#8B9A6E] mb-4">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <h3 className="text-base font-bold text-[#1B1E19] dark:text-white mb-1.5">
              Extracting YouTube Transcript...
            </h3>
            <p className="text-xs text-[#595F52] dark:text-[#9AA392] max-w-sm mx-auto leading-relaxed mb-4">
              Connecting securely to the backend transcription service to parse video speech and subtitles.
            </p>
            <span className="text-[11px] font-semibold text-[#8B9A6E] bg-[#8B9A6E]/10 px-3 py-1 rounded-full">
              Processing audio stream • Typically takes 10–25s
            </span>
          </div>
        ) : !transcript ? (
          /* Empty State */
          <div
            className={`flex-1 rounded-2xl border p-10 flex flex-col items-center justify-center text-center ${
              isDark ? 'bg-[#181D17] border-[#293225]' : 'bg-white border-[#E8E1D5]'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#FAF7F2] dark:bg-[#20271E] border border-[#E8E1D5] dark:border-[#2D3629] flex items-center justify-center text-[#8B9A6E] mb-4 shadow-warm-sm">
              <FileText className="w-7 h-7 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold text-[#1B1E19] dark:text-white mb-1">
              Your transcript will appear here
            </h3>
            <p className="text-xs text-[#595F52] dark:text-[#9AA392] max-w-md mx-auto leading-relaxed mb-5">
              Enter any YouTube video link above and click <span className="font-semibold text-[#8B9A6E]">Generate Transcript</span>. Once extracted, you can search, copy, download as TXT, or run the AI Toolkit.
            </p>
            <div className="inline-flex items-center gap-4 text-[11px] text-[#767D6E] dark:text-[#889380]">
              <span>💡 <kbd className="font-mono bg-[#EFE9DE] dark:bg-[#262E23] px-1.5 py-0.5 rounded">Ctrl+V</kbd> Paste URL</span>
              <span>•</span>
              <span><kbd className="font-mono bg-[#EFE9DE] dark:bg-[#262E23] px-1.5 py-0.5 rounded">Enter</kbd> Transcribe</span>
            </div>
          </div>
        ) : (
          /* Populated Transcript Viewer */
          <div
            className={`flex-1 flex flex-col rounded-2xl border overflow-hidden shadow-warm-md ${
              isDark ? 'bg-[#181D17] border-[#293225]' : 'bg-white border-[#E8E1D5]'
            }`}
          >
            {/* Top Details & Action Toolbar */}
            <div
              className={`p-4 sm:p-5 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isDark ? 'bg-[#141813] border-[#252C22]' : 'bg-[#FAF7F2] border-[#EAE3D6]'
              }`}
            >
              {/* Video metadata */}
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-[#8B9A6E]/15 text-[#5D6B44] dark:text-[#A6B595]">
                    Transcript Active
                  </span>
                  <span className="text-xs text-[#767D6E] dark:text-[#889380]">
                    {transcript.video.channel} • {transcript.video.publishedDate}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#1B1E19] dark:text-white tracking-tight line-clamp-1">
                  {transcript.video.title}
                </h3>

                {/* Stat pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-[#1E251B] border border-[#E8E1D5] dark:border-[#2D3629] text-[#282C24] dark:text-[#D8DFD0]">
                    <Clock className="w-3 h-3 text-[#8B9A6E]" />
                    <span>{transcript.video.duration}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-[#1E251B] border border-[#E8E1D5] dark:border-[#2D3629] text-[#282C24] dark:text-[#D8DFD0]">
                    <Type className="w-3 h-3 text-[#8B9A6E]" />
                    <span>{transcript.video.wordCount.toLocaleString()} words</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-[#1E251B] border border-[#E8E1D5] dark:border-[#2D3629] text-[#282C24] dark:text-[#D8DFD0]">
                    <Hash className="w-3 h-3 text-[#8B9A6E]" />
                    <span>{transcript.video.characterCount.toLocaleString()} chars</span>
                  </span>
                </div>
              </div>

              {/* Action buttons: Copy, Native TXT Save, Open AI Toolkit */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* Copy Button */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border bg-white dark:bg-[#20271E] border-[#E8E1D5] dark:border-[#2E372A] text-[#1B1E19] dark:text-[#E9EFE0] hover:bg-[#FAF7F2] dark:hover:bg-[#283225] transition-all shadow-xs"
                  title="Copy full transcript to clipboard (Ctrl+C)"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#8B9A6E]" />
                      <span className="text-[#5D6B44] dark:text-[#A6B595]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#767D6E]" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                {/* Native Save TXT */}
                <button
                  type="button"
                  onClick={() => handleSaveTxt('txt')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border bg-white dark:bg-[#20271E] border-[#E8E1D5] dark:border-[#2E372A] text-[#1B1E19] dark:text-[#E9EFE0] hover:bg-[#FAF7F2] dark:hover:bg-[#283225] transition-all shadow-xs"
                  title="Save transcript as .txt via Windows Save Dialog (Ctrl+S)"
                >
                  <Download className="w-3.5 h-3.5 text-[#767D6E]" />
                  <span>Save TXT</span>
                </button>

                {/* Open in AI Toolkit */}
                <button
                  type="button"
                  onClick={onOpenAiToolkit}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-white bg-[#8B9A6E] hover:bg-[#758458] active:scale-[0.98] transition-all shadow-warm-sm"
                  title="Analyze this transcript with the AI Toolkit"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Toolkit</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </div>
            </div>

            {/* In-Transcript Search & Controls Bar */}
            <div
              className={`px-4 py-2.5 border-b flex items-center justify-between gap-3 text-xs ${
                isDark ? 'bg-[#161B15] border-[#252C22]' : 'bg-white border-[#EAE3D6]'
              }`}
            >
              {/* Search input */}
              <div className="relative w-full max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#767D6E]" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search transcript (Ctrl+F)..."
                  className={`w-full pl-8 pr-8 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#8B9A6E] ${
                    isDark
                      ? 'bg-[#121611] border-[#293225] text-white placeholder:text-[#5E6857]'
                      : 'bg-[#FDFBF7] border-[#E8E1D5] text-[#1B1E19] placeholder:text-[#989F90]'
                  }`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#767D6E] hover:text-[#1B1E19]"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Match indicator & Timestamps toggle */}
              <div className="flex items-center gap-3">
                {searchQuery && (
                  <span className="text-[11px] font-medium text-[#5D6B44] dark:text-[#A6B595] bg-[#8B9A6E]/10 px-2 py-0.5 rounded-md">
                    {matchCount} {matchCount === 1 ? 'match' : 'matches'}
                  </span>
                )}

                <label className="inline-flex items-center gap-1.5 cursor-pointer select-none text-[11px] text-[#595F52] dark:text-[#9AA392]">
                  <input
                    type="checkbox"
                    checked={showTimestamps}
                    onChange={(e) => setShowTimestamps(e.target.checked)}
                    className="rounded border-[#E8E1D5] text-[#8B9A6E] focus:ring-[#8B9A6E] w-3.5 h-3.5 accent-[#8B9A6E]"
                  />
                  <span>Timestamps</span>
                </label>
              </div>
            </div>

            {/* Scrollable Segment Viewer */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 divide-y divide-[#EFE9DE] dark:divide-[#252C22] select-text">
              {filteredSegments.length === 0 ? (
                <div className="text-center py-12 text-xs text-[#767D6E] dark:text-[#889380]">
                  No matching transcript phrases found for "{searchQuery}".
                </div>
              ) : (
                filteredSegments.map((segment) => (
                  <div
                    key={segment.id}
                    className="pt-3.5 first:pt-0 group hover:bg-[#FAF7F2]/60 dark:hover:bg-[#20271E]/60 p-2.5 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {showTimestamps && (
                        <span className="inline-flex items-center text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#F7F2EB] dark:bg-[#20271E] text-[#5D6B44] dark:text-[#A6B595] border border-[#E8E1D5] dark:border-[#2D3629]">
                          {segment.timestamp}
                        </span>
                      )}
                      {segment.speaker && (
                        <span className="text-xs font-semibold text-[#282C24] dark:text-[#D8DFD0]">
                          {segment.speaker}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-[#282C24] dark:text-[#D8DFD0] leading-relaxed font-normal break-words">
                      {highlightMatch(segment.text, searchQuery)}
                    </p>
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
