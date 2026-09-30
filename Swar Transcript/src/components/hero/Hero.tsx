import React from 'react';
import { ArrowRight, Play, FileText, ShieldCheck, Zap } from 'lucide-react';

interface HeroProps {
  onScrollToGenerator: () => void;
  onScrollToHowItWorks: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onScrollToGenerator,
  onScrollToHowItWorks,
}) => {
  return (
    <section className="relative pt-12 pb-14 md:pt-18 md:pb-20 overflow-hidden">
      {/* Subtle ambient gradient aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-60">
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[34rem] h-[18rem] bg-[#8B9A6E]/12 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Subtle pill badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#E8E1D5] shadow-warm-sm mb-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <span className="flex h-2 w-2 rounded-full bg-[#8B9A6E] animate-pulse" />
          <span className="text-xs font-semibold text-[#595F52] tracking-wide uppercase">
            AI-Powered YouTube Video to Text
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-[#8B9A6E]/15 text-[#5D6B44] font-medium">
            Fast & Clean
          </span>
        </div>

        {/* Main headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1B1E19] tracking-tight leading-[1.12] mb-6">
          Turn YouTube Videos into Text.{' '}
          <span className="text-[#8B9A6E] inline-block relative">
            Instantly.
            <svg
              className="absolute -bottom-1.5 left-0 w-full h-2 text-[#8B9A6E]/35"
              viewBox="0 0 100 12"
              preserveAspectRatio="none"
            >
              <path
                d="M0,8 Q50,0 100,8"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h1>

        {/* Supporting description */}
        <p className="text-lg sm:text-xl text-[#595F52] max-w-2xl mx-auto font-normal leading-relaxed mb-8 sm:mb-10 text-balance">
          Paste a YouTube video link and transform it into clean, readable text
          in seconds.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-12">
          <button
            onClick={onScrollToGenerator}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-base font-semibold text-white bg-[#8B9A6E] hover:bg-[#758458] active:scale-[0.98] rounded-2xl shadow-warm-md hover:shadow-warm-lg transition-all duration-200 group"
          >
            <span>Generate Transcript</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={onScrollToHowItWorks}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-medium text-[#282C24] bg-white/80 hover:bg-white border border-[#E8E1D5] hover:border-[#D8CFBF] rounded-2xl shadow-warm-sm hover:shadow-warm-md transition-all duration-200"
          >
            <Play className="w-4 h-4 text-[#8B9A6E] fill-[#8B9A6E]/20" />
            <span>See How It Works</span>
          </button>
        </div>

        {/* Visual transformation concept banner: Video -> Transcript */}
        <div className="inline-flex items-center justify-center gap-3 sm:gap-6 py-3 px-5 sm:px-7 rounded-2xl bg-white/70 border border-[#E8E1D5]/80 shadow-warm-sm text-xs sm:text-sm text-[#595F52]">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#8B9A6E]" />
            <span className="font-medium text-[#1B1E19]">Lightning Fast</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-[#D8CFBF]" />
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#8B9A6E]" />
            <span className="font-medium text-[#1B1E19]">Timestamped & Formatted</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-[#D8CFBF]" />
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#8B9A6E]" />
            <span className="font-medium text-[#1B1E19]">High Accuracy</span>
          </div>
        </div>
      </div>
    </section>
  );
};
