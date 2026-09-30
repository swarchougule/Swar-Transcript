import React from 'react';
import { X, Sparkles, Cpu, Layers, Keyboard, ShieldCheck } from 'lucide-react';

interface DesktopAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const DesktopAboutModal: React.FC<DesktopAboutModalProps> = ({
  isOpen,
  onClose,
  isDark,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`w-full max-w-md rounded-2xl border shadow-warm-xl overflow-hidden animate-in zoom-in-95 duration-150 ${
          isDark
            ? 'bg-[#181D17] border-[#293225] text-[#E5EADF]'
            : 'bg-white border-[#E8E1D5] text-[#1B1E19]'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isDark ? 'bg-[#141813] border-[#252C22]' : 'bg-[#FAF7F2] border-[#EAE3D6]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#8B9A6E] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">SwarTranscript AI</h3>
              <p className="text-[10px] text-[#767D6E] dark:text-[#889380]">
                Desktop Edition • v1.0.0
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#767D6E] hover:text-[#1B1E19] dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Summary */}
          <p className="text-[#595F52] dark:text-[#9AA392] leading-relaxed">
            A premium standalone desktop productivity application engineered for ultra-fast YouTube transcript generation and multi-modal AI intelligence.
          </p>

          {/* Engine highlights */}
          <div className="space-y-2 pt-1">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#767D6E] dark:text-[#889380]">
              Technology & Engine
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                  isDark ? 'bg-[#151913] border-[#262E22]' : 'bg-[#FAF7F2] border-[#EAE3D6]'
                }`}
              >
                <Cpu className="w-4 h-4 text-[#8B9A6E] shrink-0" />
                <div>
                  <div className="font-semibold">Groq LPUs</div>
                  <div className="text-[10px] text-[#767D6E] dark:text-[#889380]">Llama 3.3 Engine</div>
                </div>
              </div>

              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                  isDark ? 'bg-[#151913] border-[#262E22]' : 'bg-[#FAF7F2] border-[#EAE3D6]'
                }`}
              >
                <Layers className="w-4 h-4 text-[#8B9A6E] shrink-0" />
                <div>
                  <div className="font-semibold">Apify Scraper</div>
                  <div className="text-[10px] text-[#767D6E] dark:text-[#889380]">YouTube Subtitles</div>
                </div>
              </div>
            </div>

            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                isDark ? 'bg-[#151913] border-[#262E22]' : 'bg-[#FAF7F2] border-[#EAE3D6]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <div className="font-semibold">Zero-Secret Architecture</div>
                <div className="text-[10px] text-[#767D6E] dark:text-[#889380]">
                  API tokens remain strictly server-side in Supabase Edge Functions.
                </div>
              </div>
            </div>
          </div>

          {/* Keyboard shortcuts */}
          <div className="space-y-2 pt-1">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#767D6E] dark:text-[#889380] flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5" />
              <span>Keyboard Shortcuts</span>
            </h4>

            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between py-1 border-b border-[#EFE9DE] dark:border-[#252C22]">
                <span className="text-[#595F52] dark:text-[#9AA392]">Search within transcript</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#FAF7F2] dark:bg-[#20271E] border border-[#E8E1D5] dark:border-[#2D3629]">Ctrl + F</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#EFE9DE] dark:border-[#252C22]">
                <span className="text-[#595F52] dark:text-[#9AA392]">Save transcript to file</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#FAF7F2] dark:bg-[#20271E] border border-[#E8E1D5] dark:border-[#2D3629]">Ctrl + S</kbd>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#595F52] dark:text-[#9AA392]">Copy full text</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#FAF7F2] dark:bg-[#20271E] border border-[#E8E1D5] dark:border-[#2D3629]">Ctrl + C</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-between text-[11px] text-[#767D6E] dark:text-[#889380] ${
            isDark ? 'bg-[#141813] border-[#252C22]' : 'bg-[#FAF7F2] border-[#EAE3D6]'
          }`}
        >
          <span>Created by Swar Chougule</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 font-semibold rounded-lg bg-[#8B9A6E] text-white hover:bg-[#758458] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
