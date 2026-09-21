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
              <div className="w-7 h-7 rounded-lg bg-[#8B9A6E] flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-[#1B1E19]">
                SwarTranscript
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase bg-[#8B9A6E]/15 text-[#5D6B44] border border-[#8B9A6E]/30 rounded">
                AI
              </span>
            </div>
            <p className="text-xs text-[#595F52]">
              Turn YouTube Videos into Text. Instantly.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-[#595F52]">
            <button
              onClick={() => scrollTo()}
              className="hover:text-[#1B1E19] transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollTo('features')}
              className="hover:text-[#1B1E19] transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollTo('faq')}
              className="hover:text-[#1B1E19] transition-colors"
            >
              FAQ
            </button>
            <a
              href="#privacy"
              onClick={(e) => {
                e.preventDefault();
                alert('Privacy Policy information is part of the future production documentation.');
              }}
              className="hover:text-[#1B1E19] transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#terms"
              onClick={(e) => {
                e.preventDefault();
                alert('Terms of Service information is part of the future production documentation.');
              }}
              className="hover:text-[#1B1E19] transition-colors"
            >
              Terms
            </a>
          </nav>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#767D6E] gap-3 text-center sm:text-left">
          <p>© {currentYear} SwarTranscript AI. All rights reserved.</p>
          <p className="text-[11px]">
            Designed for rapid and accessible video transcription.
          </p>
        </div>
      </div>
    </footer>
  );
};
