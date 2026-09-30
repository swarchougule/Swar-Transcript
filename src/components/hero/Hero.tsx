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
      {/* Subtle ambient gradient aura with slow floating animation */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-50 animate-pulse-glow">
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[36rem] h-[20rem] bg-zinc-400/20 rounded-full blur-3xl animate-float-slow" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center animate-slide-up">
        {/* Subtle dark pill badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-zinc-300/80 shadow-xs mb-6 hover:border-zinc-400 transition-all duration-300">
          <span className="flex h-2 w-2 rounded-full bg-zinc-900 animate-pulse" />
          <span className="text-xs font-bold text-zinc-700 tracking-wide uppercase">
            AI-Powered YouTube Video to Text
          </span>
          <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-900 text-white font-bold">
            Fast & Clean
          </span>
        </div>

        {/* Main headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1B1E19] tracking-tight leading-[1.12] mb-6">
          Turn YouTube Videos into Text.{' '}
          <span className="text-zinc-900 inline-block relative">
            Instantly.
            <svg
              className="absolute -bottom-1.5 left-0 w-full h-2.5 text-zinc-900/40"
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

        {/* Responsive CTA Buttons with Dark Design & Animations */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button
            type="button"
            onClick={onScrollToGenerator}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-bold text-white bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] rounded-2xl shadow-lg shadow-zinc-950/20 hover:shadow-xl transition-all duration-300 border border-zinc-800 group cursor-pointer"
          >
            <span>Generate Transcript</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </button>

          <button
            type="button"
            onClick={onScrollToHowItWorks}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 text-base font-semibold text-zinc-800 bg-white hover:bg-zinc-50 active:scale-[0.98] rounded-2xl border border-zinc-300 hover:border-zinc-400 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
          >
            <Play className="w-4 h-4 text-zinc-900 fill-zinc-900/20" />
            <span>See How It Works</span>
          </button>
        </div>

        {/* Visual transformation concept banner: Video -> Transcript */}
        <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 py-3.5 px-6 rounded-2xl bg-white/80 border border-zinc-300/80 shadow-xs text-xs sm:text-sm text-[#595F52] hover:border-zinc-400 transition-colors">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-zinc-900" />
            <span className="font-bold text-[#1B1E19]">Lightning Fast</span>
          </div>
          <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-zinc-400" />
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-zinc-900" />
            <span className="font-bold text-[#1B1E19]">Timestamped & Formatted</span>
          </div>
          <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-zinc-400" />
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-zinc-900" />
            <span className="font-bold text-[#1B1E19]">High Accuracy</span>
          </div>
        </div>
      </div>
    </section>
  );
};

