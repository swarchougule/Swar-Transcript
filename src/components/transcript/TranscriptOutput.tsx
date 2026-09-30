import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Copy,
  Check,
  Download,
  Search,
  Clock,
  Type,
  Hash,
  ChevronDown,
  Sparkles,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import type { TranscriptData } from '../../types/transcript';
import { sampleTranscriptData } from './mockTranscriptData';
import { AiToolkit } from './AiToolkit';

interface TranscriptOutputProps {
  initialShowMock?: boolean;
  realTranscript?: TranscriptData | null;
  isLoading?: boolean;
}

export const TranscriptOutput: React.FC<TranscriptOutputProps> = ({
  initialShowMock = false, // Always default to Empty State in the preview as requested
  realTranscript = null,
  isLoading = false,
}) => {
  const [showMock, setShowMock] = useState(initialShowMock);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);

  // If a real transcript is provided, make sure we display it
  useEffect(() => {
    if (realTranscript) {
      setShowMock(true);
      setSearchQuery('');
    }
  }, [realTranscript]);

  const activeTranscript: TranscriptData = realTranscript || sampleTranscriptData;
  const isReal = !!realTranscript;

  // Normalize segments: remove subtitle line-breaks and chunk large text into full-width readable paragraphs
  const normalizedSegments = useMemo(() => {
    const rawSegments = activeTranscript.segments || [];
    if (rawSegments.length === 0 && activeTranscript.fullText) {
      return [
        {
          id: 'seg-1',
          timestamp: '00:00',
          seconds: 0,
          speaker: activeTranscript.video.channel || 'Speaker',
          text: activeTranscript.fullText,
        },
      ];
    }

    const processed: typeof rawSegments = [];

    rawSegments.forEach((seg) => {
      // Clean up artificial line breaks within subtitle lines
      const cleanSegText = seg.text
        .replace(/\r\n/g, '\n')
        .replace(/([^\n])\n([^\n])/g, '$1 $2')
        .replace(/\s{2,}/g, ' ')
        .trim();

      const words = cleanSegText.split(/\s+/).filter(Boolean);

      // If segment is very long (> 85 words), divide into natural paragraphs
      if (words.length > 85) {
        const CHUNK_SIZE = 70;
        for (let i = 0; i < words.length; i += CHUNK_SIZE) {
          const chunk = words.slice(i, i + CHUNK_SIZE).join(' ');
          const totalSecs = Math.round((seg.seconds || 0) + (i / words.length) * 60);
          const mins = Math.floor(totalSecs / 60);
          const secs = totalSecs % 60;
          const ts = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

          processed.push({
            id: `${seg.id}-p${Math.floor(i / CHUNK_SIZE) + 1}`,
            timestamp: i === 0 ? seg.timestamp || ts : ts,
            seconds: totalSecs,
            speaker: seg.speaker || activeTranscript.video.channel || 'Speaker',
            text: chunk,
          });
        }
      } else {
        processed.push({
          ...seg,
          text: cleanSegText,
        });
      }
    });

    return processed;
  }, [activeTranscript]);

  // Filter segments based on in-transcript search query
  const filteredSegments = useMemo(() => {
    if (!searchQuery.trim()) return normalizedSegments;
    const query = searchQuery.toLowerCase();
    return normalizedSegments.filter(
      (s) =>
        s.text.toLowerCase().includes(query) ||
        (s.speaker && s.speaker.toLowerCase().includes(query)) ||
        s.timestamp.includes(query)
    );
  }, [searchQuery, normalizedSegments]);

  const matchCount = useMemo(() => {
    if (!searchQuery.trim()) return 0;
    const query = searchQuery.toLowerCase();
    let count = 0;
    activeTranscript.segments.forEach((s) => {
      const occurrences = (s.text.toLowerCase().match(new RegExp(query, 'g')) || []).length;
      count += occurrences;
    });
    return count;
  }, [searchQuery, activeTranscript.segments]);

  // Frontend copy handler
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeTranscript.fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  // Frontend download handler
  const handleDownload = (format: 'txt' | 'md' | 'srt') => {
    setDownloadMenuOpen(false);
    let content = '';
    const safeTitle = (activeTranscript.video.title || 'transcript')
      .slice(0, 25)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    const filename = `swar-${safeTitle}.${format}`;

    if (format === 'txt') {
      content = `${activeTranscript.video.title}\nChannel: ${activeTranscript.video.channel}\nDuration: ${activeTranscript.video.duration}\n\n${activeTranscript.fullText}`;
    } else if (format === 'md') {
      content = `# ${activeTranscript.video.title}\n\n**Channel**: ${activeTranscript.video.channel}  \n**Duration**: ${activeTranscript.video.duration}  \n**Word Count**: ${activeTranscript.video.wordCount}  \n\n---\n\n` +
        activeTranscript.segments
          .map((s) => `### [${s.timestamp}] ${s.speaker || 'Speaker'}\n${s.text}\n`)
          .join('\n');
    } else if (format === 'srt') {
      content = activeTranscript.segments
        .map(
          (s, idx) =>
            `${idx + 1}\n00:${s.timestamp},000 --> 00:${s.timestamp},999\n${
              s.speaker ? s.speaker + ': ' : ''
            }${s.text}\n`
        )
        .join('\n');
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  // Helper to highlight matching text in search
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <mark key={i} className="bg-zinc-900 text-white px-1 rounded font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <section id="transcript-output" className="py-6 sm:py-10 scroll-mt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Toggle Bar / Mode Indicator */}
        <div className="flex items-center justify-between mb-4 px-1 text-xs text-[#595F52]">
          <div className="flex items-center gap-2">
            <span className="font-extrabold uppercase tracking-wider text-zinc-700">
              Output State:
            </span>
            {isLoading ? (
              <span className="inline-flex items-center gap-1.5 font-bold text-zinc-900">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing with Apify...</span>
              </span>
            ) : isReal ? (
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Live Apify Transcript</span>
              </span>
            ) : (
              <span className="font-bold text-zinc-900">
                {showMock ? 'Sample Preview Transcript' : 'Empty State'}
              </span>
            )}
          </div>

          {!isLoading && !isReal && (
            <button
              type="button"
              onClick={() => setShowMock(!showMock)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border border-zinc-300 hover:bg-zinc-100 font-bold text-xs text-zinc-900 transition-all shadow-xs shrink-0 whitespace-nowrap active:scale-[0.98] cursor-pointer"
            >
              {showMock ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-zinc-700 shrink-0" />
                  <span>Show Empty State</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
                  <span>Show Sample Transcript</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* 1. LOADING STATE */}
        {isLoading ? (
          <div className="rounded-3xl bg-white border border-[#E8E1D5] p-12 sm:p-16 text-center shadow-lg animate-in fade-in duration-300">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white mb-5 shadow-md">
              <Loader2 className="w-8 h-8 animate-spin text-amber-300" />
            </div>

            <h3 className="text-xl font-extrabold text-[#1B1E19] mb-2 tracking-tight">
              Extracting Transcript...
            </h3>

            <p className="text-sm text-[#595F52] max-w-md mx-auto leading-relaxed mb-4">
              Connecting to Apify Actor <code className="bg-[#FAF7F2] px-1.5 py-0.5 rounded border border-[#E8E1D5] text-[#1B1E19] font-mono text-xs">streamers/youtube-scraper</code> to process video audio and extract subtitles.
            </p>

            <div className="inline-flex items-center gap-2 text-xs font-bold text-zinc-900 bg-zinc-100 px-3.5 py-1.5 rounded-full border border-zinc-300">
              <span className="w-2 h-2 rounded-full bg-zinc-900 animate-pulse" />
              <span>This usually takes 15–30 seconds</span>
            </div>
          </div>
        ) : !showMock && !isReal ? (
          /* 2. ALWAYS DEFAULTED EMPTY STATE */
          <div className="rounded-3xl bg-white border border-[#E8E1D5] p-10 sm:p-14 text-center shadow-md transition-all animate-slide-up">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white mb-5 shadow-md group hover:scale-105 transition-transform duration-300">
              <FileText className="w-8 h-8 stroke-[1.75] text-amber-300" />
            </div>

            <h3 className="text-xl font-extrabold text-[#1B1E19] mb-2 tracking-tight">
              Your transcript will appear here
            </h3>

            <p className="text-sm text-[#595F52] max-w-md mx-auto leading-relaxed mb-6">
              Paste a YouTube video link above to generate your transcript, or test with a sample video preview below.
            </p>

            <button
              type="button"
              onClick={() => setShowMock(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] rounded-xl shadow-md border border-zinc-800 transition-all shrink-0 whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Preview Sample Transcript</span>
            </button>
          </div>
        ) : (
          /* 3. TRANSCRIPT CARD (REAL OR MOCK) */
          <div className="rounded-3xl bg-white border border-[#E8E1D5] shadow-xl overflow-hidden transition-all animate-in fade-in duration-300">
            {/* Header: Video Details & Key Stats */}
            <div className="p-6 sm:p-8 bg-[#FAF7F2] border-b border-[#E8E1D5]">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-md bg-zinc-900 text-white text-[11px] font-bold uppercase tracking-wider shadow-xs">
                    <span>{isReal ? 'Live Generated Transcript' : 'Sample Transcript Preview'}</span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-extrabold text-[#1B1E19] tracking-tight leading-snug">
                    {activeTranscript.video.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[#595F52]">
                    <span className="font-bold text-[#282C24]">
                      {activeTranscript.video.channel}
                    </span>
                    <span>•</span>
                    <span>{activeTranscript.video.publishedDate}</span>
                  </div>
                </div>

                {/* Primary Dark Action Buttons (Copy & Download) */}
                <div className="flex items-center gap-2.5 shrink-0 self-start">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-900 bg-white border border-zinc-300 hover:bg-zinc-100 hover:border-zinc-400 active:scale-[0.98] rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-zinc-700" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] rounded-xl shadow-md shadow-zinc-950/20 border border-zinc-800 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <Download className="w-4 h-4 text-amber-300" />
                      <span>Download</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                    </button>

                    {/* Download Format Dropdown Menu */}
                    {downloadMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-zinc-300 shadow-xl py-2 z-20 animate-in fade-in zoom-in-95 duration-150">
                        <button
                          type="button"
                          onClick={() => handleDownload('txt')}
                          className="w-full text-left px-4 py-2.5 text-xs font-bold text-[#1B1E19] hover:bg-zinc-100 flex items-center justify-between cursor-pointer"
                        >
                          <span>Plain Text (.txt)</span>
                          <span className="text-[10px] text-[#767D6E] uppercase font-semibold">Clean</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownload('md')}
                          className="w-full text-left px-4 py-2.5 text-xs font-bold text-[#1B1E19] hover:bg-zinc-100 flex items-center justify-between cursor-pointer"
                        >
                          <span>Markdown (.md)</span>
                          <span className="text-[10px] text-[#767D6E] uppercase font-semibold">Structured</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownload('srt')}
                          className="w-full text-left px-4 py-2.5 text-xs font-bold text-[#1B1E19] hover:bg-zinc-100 flex items-center justify-between cursor-pointer"
                        >
                          <span>Subtitles (.srt)</span>
                          <span className="text-[10px] text-[#767D6E] uppercase font-semibold">Timed</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stat Badges: Duration, Word count, Character count */}
              <div className="mt-5 pt-4 border-t border-[#EFE9DE] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 border border-[#E8E1D5]">
                  <Clock className="w-4 h-4 text-zinc-900" />
                  <div>
                    <div className="text-[10px] text-[#767D6E] uppercase font-bold">
                      Duration
                    </div>
                    <div className="font-extrabold text-[#1B1E19]">
                      {activeTranscript.video.duration}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 border border-[#E8E1D5]">
                  <Type className="w-4 h-4 text-zinc-900" />
                  <div>
                    <div className="text-[10px] text-[#767D6E] uppercase font-bold">
                      Word Count
                    </div>
                    <div className="font-extrabold text-[#1B1E19]">
                      {activeTranscript.video.wordCount.toLocaleString()} words
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 border border-[#E8E1D5]">
                  <Hash className="w-4 h-4 text-zinc-900" />
                  <div>
                    <div className="text-[10px] text-[#767D6E] uppercase font-bold">
                      Characters
                    </div>
                    <div className="font-extrabold text-[#1B1E19]">
                      {activeTranscript.video.characterCount.toLocaleString()} chars
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 border border-[#E8E1D5]">
                  <Sparkles className="w-4 h-4 text-zinc-900" />
                  <div>
                    <div className="text-[10px] text-[#767D6E] uppercase font-bold">
                      Source
                    </div>
                    <div className="font-extrabold text-zinc-900">
                      {isReal ? 'Apify Scraper' : 'Sample Data'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* In-Transcript Search Bar & Controls */}
            <div className="px-6 py-3.5 bg-white border-b border-[#E8E1D5] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#767D6E]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search within transcript..."
                  className="w-full pl-9 pr-8 py-2 text-xs bg-[#FDFBF7] text-[#1B1E19] placeholder:text-[#989F90] border border-[#E8E1D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#767D6E] hover:text-[#1B1E19]"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-4 text-xs text-[#595F52]">
                {searchQuery && (
                  <span className="font-bold text-white bg-zinc-900 px-2.5 py-1 rounded-md">
                    {matchCount} {matchCount === 1 ? 'match' : 'matches'} found
                  </span>
                )}

                <label className="inline-flex items-center gap-2 cursor-pointer select-none font-semibold">
                  <input
                    type="checkbox"
                    checked={showTimestamps}
                    onChange={(e) => setShowTimestamps(e.target.checked)}
                    className="rounded border-[#E8E1D5] text-zinc-900 focus:ring-zinc-900 w-3.5 h-3.5 accent-zinc-900 cursor-pointer"
                  />
                  <span className="text-[#282C24]">Show Timestamps</span>
                </label>
              </div>
            </div>

            {/* Scrollable Transcript Area */}
            <div className="p-6 sm:p-8 max-h-[480px] overflow-y-auto space-y-6 divide-y divide-[#EFE9DE]">
              {filteredSegments.length === 0 ? (
                <div className="text-center py-12 text-sm text-[#767D6E]">
                  No matching transcript phrases found for "{searchQuery}".
                </div>
              ) : (
                filteredSegments.map((segment) => (
                  <div
                    key={segment.id}
                    className="pt-5 first:pt-0 group hover:bg-[#FAF7F2]/80 p-3 rounded-2xl transition-colors"
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      {showTimestamps && (
                        <span className="inline-flex items-center text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-zinc-900 text-white shadow-xs">
                          {segment.timestamp}
                        </span>
                      )}
                      {segment.speaker && (
                        <span className="text-xs font-extrabold text-[#282C24]">
                          {segment.speaker}
                        </span>
                      )}
                    </div>
                    <p className="text-sm sm:text-base text-[#282C24] leading-relaxed font-normal w-full break-words whitespace-normal text-left">
                      {highlightText(segment.text, searchQuery)}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Groq AI Toolkit */}
            <div className="px-6 pb-8 sm:px-8 bg-white">
              <AiToolkit transcript={activeTranscript} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

