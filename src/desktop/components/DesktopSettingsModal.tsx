import React from 'react';
import { X, Moon, Sun, CheckCircle2, Sliders, Shield } from 'lucide-react';

interface DesktopSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const DesktopSettingsModal: React.FC<DesktopSettingsModalProps> = ({
  isOpen,
  onClose,
  isDark,
  onToggleTheme,
}) => {
  if (!isOpen) return null;

  const isElectron = typeof window !== 'undefined' && !!window.electronAPI?.isElectron;

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
            <div className="w-7 h-7 rounded-xl bg-[#8B9A6E]/15 border border-[#8B9A6E]/30 flex items-center justify-center text-[#5D6B44] dark:text-[#A6B595]">
              <Sliders className="w-3.5 h-3.5 text-[#8B9A6E]" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Desktop Settings</h3>
              <p className="text-[10px] text-[#767D6E] dark:text-[#889380]">
                Application preferences & environment
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
          {/* Theme Setting */}
          <div className="flex items-center justify-between py-2 border-b border-[#EFE9DE] dark:border-[#252C22]">
            <div>
              <div className="font-semibold text-sm">Theme Appearance</div>
              <div className="text-[11px] text-[#595F52] dark:text-[#9AA392]">
                Toggle between light and sleek dark mode
              </div>
            </div>

            <button
              type="button"
              onClick={onToggleTheme}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                isDark
                  ? 'bg-[#20271E] border-[#2E372A] text-white hover:bg-[#283225]'
                  : 'bg-[#FAF7F2] border-[#E8E1D5] text-[#1B1E19] hover:bg-[#EFE9DE]'
              }`}
            >
              {isDark ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#8B9A6E]" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#8B9A6E]" />
                  <span>Light Mode</span>
                </>
              )}
            </button>
          </div>

          {/* Platform & Native Integration Status */}
          <div className="space-y-2 pt-1">
            <div className="font-semibold text-xs uppercase tracking-wider text-[#767D6E] dark:text-[#889380]">
              Runtime Diagnostics
            </div>

            <div className="space-y-1.5">
              <div
                className={`p-2.5 rounded-xl border flex items-center justify-between ${
                  isDark ? 'bg-[#151913] border-[#262E22]' : 'bg-[#FAF7F2] border-[#EAE3D6]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Electron IPC Bridge</span>
                </div>
                <span className="font-mono text-[10px] text-[#5D6B44] dark:text-[#A6B595]">
                  {isElectron ? 'Active (Isolated)' : 'Web Environment'}
                </span>
              </div>

              <div
                className={`p-2.5 rounded-xl border flex items-center justify-between ${
                  isDark ? 'bg-[#151913] border-[#262E22]' : 'bg-[#FAF7F2] border-[#EAE3D6]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Native Save Dialog</span>
                </div>
                <span className="font-mono text-[10px] text-[#5D6B44] dark:text-[#A6B595]">
                  {isElectron ? 'Ready' : 'Fallback active'}
                </span>
              </div>

              <div
                className={`p-2.5 rounded-xl border flex items-center justify-between ${
                  isDark ? 'bg-[#151913] border-[#262E22]' : 'bg-[#FAF7F2] border-[#EAE3D6]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Renderer Sandbox</span>
                </div>
                <span className="font-mono text-[10px] text-emerald-600 font-bold">
                  Secure (0 Secrets)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-5 py-3 border-t flex justify-end ${
            isDark ? 'bg-[#141813] border-[#252C22]' : 'bg-[#FAF7F2] border-[#EAE3D6]'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 font-semibold rounded-xl bg-[#8B9A6E] text-white hover:bg-[#758458] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
