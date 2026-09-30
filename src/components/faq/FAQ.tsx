import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'What is SwarTranscript AI?',
    answer:
      'SwarTranscript AI is a dedicated SaaS application designed to transform YouTube video audio into clean, structured, and readable text with timestamps and speaker clarity.',
  },
  {
    question: 'What videos can I transcribe?',
    answer:
      'You can transcribe any public or unlisted YouTube video that contains clear spoken audio, including podcasts, interviews, lectures, webinars, tutorials, and discussions.',
  },
  {
    question: 'Do I need an account?',
    answer:
      'Yes, creating an account or signing in allows you to generate transcripts, view history, and export your transcript data smoothly.',
  },
  {
    question: 'How long does transcription take?',
    answer:
      'Transcription is designed to be fast and streamlined. Most typical videos take just a brief period depending on video duration and server processing queues.',
  },
  {
    question: 'Can I copy or download my transcript?',
    answer:
      'Yes. You can copy the full transcript text to your clipboard with one click, or export it in various formats including plain text (.txt), Markdown (.md), and timed subtitle files (.srt).',
  },
  {
    question: 'Is SwarTranscript AI free?',
    answer:
      'SwarTranscript AI offers accessible access for previewing and testing video transcriptions. Specific usage tiers and details will be outlined in future updates.',
  },
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 sm:py-24 scroll-mt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14 animate-slide-up">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1B1E19] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-[#595F52] mt-3">
            Everything you need to know about the product and transcription workflow.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3.5">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.question}
                className="rounded-2xl bg-white border border-[#E8E1D5] overflow-hidden transition-all duration-200 shadow-xs hover:border-zinc-400"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(index)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-extrabold text-[#1B1E19] tracking-tight">
                    {item.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-[#F7F2EB] flex items-center justify-center shrink-0 text-zinc-900 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-zinc-900 text-white' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-[#595F52] leading-relaxed border-t border-[#EFE9DE]/80 animate-in fade-in duration-200">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

