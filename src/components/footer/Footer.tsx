import React from 'react';
import { Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const scrollTo = (id?: string) => {
    if (!id) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#FAF7F2] border-t border-[#E8E1D5] pt-12 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#E8E1D5]">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <span className="text-xl font-extrabold text-[#1B1E19]">
                SwarTranscript
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-zinc-900 text-white rounded shadow-xs">
                AI
              </span>
            </div>
            <p className="text-xs text-[#595F52]">
              Turn YouTube Videos into Text. Instantly.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-[#595F52]">
            <button
              onClick={() => scrollTo()}
              className="hover:text-zinc-900 transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => scrollTo('features')}
              className="hover:text-zinc-900 transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollTo('faq')}
              className="hover:text-zinc-900 transition-colors cursor-pointer"
            >
              FAQ
            </button>
            <a
              href="#privacy"
              onClick={(e) => {
                e.preventDefault();
                alert('Privacy Policy information is part of the future production documentation.');
              }}
              className="hover:text-zinc-900 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#terms"
              onClick={(e) => {
                e.preventDefault();
                alert('Terms of Service information is part of the future production documentation.');
              }}
              className="hover:text-zinc-900 transition-colors"
            >
              Terms
            </a>
          </nav>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#767D6E] gap-3 text-center sm:text-left">
          <p>© {currentYear} SwarTranscript AI. All rights reserved.</p>
          <p className="text-[11px] font-medium">
            Designed for rapid and accessible video transcription.
          </p>
        </div>
      </div>
    </footer>
  );
};

