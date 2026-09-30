import React from 'react';
import {
  Zap,
  AlignLeft,
  MousePointerClick,
  DownloadCloud,
  Sparkles,
  Smartphone,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'Fast Transcription',
    description: 'Turn videos into readable text quickly without tedious waiting periods.',
  },
  {
    icon: AlignLeft,
    title: 'Clean Formatting',
    description: 'Get transcripts presented in an easy-to-read format with structured paragraphs and timestamps.',
  },
  {
    icon: MousePointerClick,
    title: 'Simple Workflow',
    description: 'Paste a link and generate your transcript with a single, frictionless click.',
  },
  {
    icon: DownloadCloud,
    title: 'Easy Export',
    description: 'Copy to clipboard or download your transcript in plain text, markdown, or subtitle formats.',
  },
  {
    icon: Sparkles,
    title: 'AI Powered',
    description: 'Built for fast and convenient video-to-text workflows driven by state-of-the-art models.',
  },
  {
    icon: Smartphone,
    title: 'Responsive Design',
    description: 'Use SwarTranscript AI comfortably across desktop monitors, laptops, tablets, and mobile devices.',
  },
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-16 sm:py-24 bg-[#F2EBE1]/40 border-y border-[#E8E1D5] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 animate-slide-up">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
            <span>Core Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1B1E19] tracking-tight">
            Designed for Speed, Accuracy, and Simplicity
          </h2>
          <p className="text-base text-[#595F52] mt-3">
            Everything you need to turn YouTube audio into actionable text without distractions.
          </p>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative bg-white rounded-3xl border border-[#E8E1D5] p-7 sm:p-8 shadow-sm hover:shadow-xl hover:border-zinc-400 hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#F7F2EB] border border-[#E8E1D5] flex items-center justify-center text-zinc-900 mb-6 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-300 shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="text-lg font-extrabold text-[#1B1E19] mb-2.5 tracking-tight">
                  {feature.title}
                </h3>

                <p className="text-sm text-[#595F52] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

