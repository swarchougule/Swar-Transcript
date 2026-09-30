import React from 'react';
import { Link2, Cpu, FileCheck2 } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    title: 'Paste Your Video',
    description: 'Paste any supported YouTube video URL into the generator input above.',
    icon: Link2,
  },
  {
    number: '02',
    title: 'Generate Transcript',
    description: 'SwarTranscript AI processes the video and converts spoken audio into clean, structured text.',
    icon: Cpu,
  },
  {
    number: '03',
    title: 'Read & Export',
    description: 'Read, search, copy, or export your transcript into your preferred text or subtitle format.',
    icon: FileCheck2,
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 animate-slide-up">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
            <span>Simple Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1B1E19] tracking-tight">
            How It Works
          </h2>
          <p className="text-base text-[#595F52] mt-3">
            Transform any YouTube video into readable text in three straightforward steps.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative bg-white rounded-3xl border border-[#E8E1D5] p-8 shadow-sm hover:shadow-xl hover:border-zinc-400 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Step badge & icon */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3.5xl font-black text-zinc-300 font-mono tracking-tighter group-hover:text-zinc-900 transition-colors">
                      {step.number}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-[#F7F2EB] border border-[#E8E1D5] flex items-center justify-center text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-300 shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-xl font-extrabold text-[#1B1E19] mb-3 tracking-tight">
                    {step.title}
                  </h3>

                  <p className="text-sm text-[#595F52] leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Bottom decorative cue */}
                <div className="mt-8 pt-4 border-t border-[#EFE9DE] flex items-center text-xs font-bold text-zinc-800">
                  <span>Step {step.number} of 03</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

