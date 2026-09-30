import React, { useState } from 'react';
import { Sparkles, X, CheckCircle2, AlertCircle, Link2 } from 'lucide-react';
import { isValidYouTubeUrl } from '../../lib/utils';

interface TranscriptGeneratorProps {
  url: string;
  setUrl: (url: string) => void;
  onGenerateClick: () => void;
  isLoading?: boolean;
  statusMessage?: string | null;
  statusType?: 'info' | 'error' | 'success';
  onDismissStatusMessage?: () => void;
}

const SAMPLE_VIDEOS = [
  {
    label: 'Stanford AI Lecture',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    label: 'Lex Fridman Podcast',
    url: 'https://www.youtube.com/watch?v=kYJzX3NlC4c',
  },
  {
    label: 'Veritasium Science',
    url: 'https://www.youtube.com/watch?v=b005iA816rk',
  },
];

export const TranscriptGenerator: React.FC<TranscriptGeneratorProps> = ({
  url,
  setUrl,
  onGenerateClick,
  isLoading = false,
  statusMessage,
  statusType = 'info',
  onDismissStatusMessage,
}) => {
  const [touched, setTouched] = useState(false);
  const isValid = isValidYouTubeUrl(url);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    // As per specification: clicking Generate Transcript opens the authentication modal
    onGenerateClick();
  };

  const handleClear = () => {
    setUrl('');
    setTouched(false);
  };

  const handleSelectSample = (sampleUrl: string) => {
    setUrl(sampleUrl);
    setTouched(true);
  };

  return (
    <section id="generator-section" className="relative scroll-mt-28 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Main Card Container */}
        <div className="relative rounded-3xl bg-white border border-[#E8E1D5] shadow-lg p-6 sm:p-10 transition-all duration-300 hover:border-zinc-400/80">
          {/* Subtle Top Accent Stripe */}
          <div className="absolute top-0 inset-x-8 h-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent rounded-t-full" />

          {/* Form Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <label
                htmlFor="youtube-url-input"
                className="block text-sm sm:text-base font-extrabold text-[#1B1E19]"
              >
                YouTube Video URL
              </label>
              <p className="text-xs sm:text-sm text-[#595F52] mt-0.5">
                Paste any standard YouTube video, podcast, lecture, or short link.
              </p>
            </div>

            {/* Live URL status indicator */}
            {url && (
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-zinc-100 border border-zinc-300">
                {isValid ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-zinc-900">Valid YouTube Link</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-amber-700">Please enter a valid link</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Form & Input Bar */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative flex flex-col md:flex-row items-stretch gap-3">
              {/* Input wrapper */}
              <div className="relative flex-1 group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-red-600 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>

                <input
                  id="youtube-url-input"
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (!touched) setTouched(true);
                  }}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full pl-12 pr-10 py-4 text-sm sm:text-base bg-[#FDFBF7] text-[#1B1E19] placeholder:text-[#989F90] border border-[#E8E1D5] rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent focus:bg-white transition-all duration-200"
                  aria-label="YouTube Video URL"
                />

                {url && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#767D6E] hover:text-[#1B1E19] transition-colors"
                    aria-label="Clear input"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Primary Dark Action Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-bold text-white bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] rounded-2xl shadow-lg shadow-zinc-950/20 hover:shadow-xl border border-zinc-800 disabled:opacity-75 disabled:cursor-not-allowed transition-all duration-200 shrink-0 cursor-pointer whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Transcript</span>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Status Message for authenticated action or guidance */}
          {statusMessage && (
            <div
              className={`mt-4 p-4 rounded-2xl border flex items-start justify-between gap-3 text-xs sm:text-sm animate-in fade-in duration-200 ${
                statusType === 'error'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : statusType === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-zinc-900/10 border-zinc-800/20 text-zinc-900'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {statusType === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                ) : statusType === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Sparkles className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed font-semibold">{statusMessage}</span>
              </div>
              {onDismissStatusMessage && (
                <button
                  type="button"
                  onClick={onDismissStatusMessage}
                  className={`p-1 rounded-lg transition-colors shrink-0 ${
                    statusType === 'error'
                      ? 'text-red-500 hover:text-red-700'
                      : 'text-zinc-700 hover:text-black'
                  }`}
                  aria-label="Dismiss message"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Sample Link Helpers */}
          <div className="mt-5 pt-5 border-t border-[#EFE9DE] flex flex-wrap items-center justify-between gap-3 text-xs text-[#595F52]">
            <div className="flex items-center gap-1.5 font-semibold text-zinc-700">
              <Link2 className="w-3.5 h-3.5 text-zinc-900" />
              <span>Or try a sample link:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {SAMPLE_VIDEOS.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => handleSelectSample(sample.url)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-900 hover:text-white border border-zinc-300 text-zinc-800 font-semibold transition-all shadow-xs cursor-pointer"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

