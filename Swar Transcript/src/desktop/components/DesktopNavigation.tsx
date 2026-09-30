import React from 'react';
import {
  FileText,
  Sparkles,
  Settings as SettingsIcon,
  Info,
  CheckCircle2,
} from 'lucide-react';

export type DesktopTab = 'transcript' | 'ai-toolkit' | 'settings' | 'about';

interface DesktopNavigationProps {
  activeTab: DesktopTab;
  onSelectTab: (tab: DesktopTab) => void;
  hasTranscript: boolean;
  transcriptTitle?: string;
  isDark: boolean;
}

export const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  activeTab,
  onSelectTab,
  hasTranscript,
  transcriptTitle,
  isDark,
}) => {
  return (
    <header
      className={`px-6 py-3 border-b flex items-center justify-between transition-colors ${
        isDark
          ? 'bg-[#151914] border-[#252C22]'
          : 'bg-[#FAF7F2] border-[#EAE3D6]'
      }`}
    >
      {/* Brand Identity / Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#8B9A6E] flex items-center justify-center text-white shadow-warm-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-[#1B1E19] dark:text-[#E9EFE0]">
                SwarTranscript AI
              </h1>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-[#8B9A6E]/15 text-[#5D6B44] dark:text-[#A6B595]">
                Desktop
              </span>
            </div>
            <p className="text-[11px] text-[#767D6E] dark:text-[#9AA392]">
              Turn YouTube videos into usable text
            </p>
          </div>
        </div>
      </div>

      {/* Primary Desktop Navigation Tabs */}
      <nav className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#EFE9DE] dark:bg-[#1E241C] border border-[#E3DBD0] dark:border-[#2B3327]">
        {/* Tab 1: Transcript */}
        <button
          type="button"
          onClick={() => onSelectTab('transcript')}
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'transcript'
              ? 'bg-white dark:bg-[#2C3428] text-[#1B1E19] dark:text-white shadow-warm-sm'
              : 'text-[#595F52] dark:text-[#9AA392] hover:text-[#1B1E19] dark:hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Transcript</span>
          {hasTranscript && (
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Transcript loaded" />
          )}
        </button>

        {/* Tab 2: AI Toolkit (Unlocked when transcript exists) */}
        <button
          type="button"
          onClick={() => onSelectTab('ai-toolkit')}
          className={`relative inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'ai-toolkit'
              ? 'bg-[#8B9A6E] text-white shadow-warm-sm'
              : hasTranscript
              ? 'text-[#5D6B44] dark:text-[#B5C5A3] hover:text-[#1B1E19] dark:hover:text-white bg-[#8B9A6E]/10 dark:bg-[#8B9A6E]/20'
              : 'text-[#8E9685] dark:text-[#5E6857] hover:text-[#595F52]'
          }`}
          title={hasTranscript ? 'Open AI Toolkit' : 'Generate a transcript first to unlock AI tools'}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Toolkit</span>
          {hasTranscript && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/25 text-white font-bold">
              7 tools
            </span>
          )}
        </button>

        {/* Tab 3: Settings */}
        <button
          type="button"
          onClick={() => onSelectTab('settings')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'settings'
              ? 'bg-white dark:bg-[#2C3428] text-[#1B1E19] dark:text-white shadow-warm-sm'
              : 'text-[#767D6E] dark:text-[#9AA392] hover:text-[#1B1E19] dark:hover:text-white'
          }`}
        >
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>

        {/* Tab 4: About */}
        <button
          type="button"
          onClick={() => onSelectTab('about')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'about'
              ? 'bg-white dark:bg-[#2C3428] text-[#1B1E19] dark:text-white shadow-warm-sm'
              : 'text-[#767D6E] dark:text-[#9AA392] hover:text-[#1B1E19] dark:hover:text-white'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>About</span>
        </button>
      </nav>

      {/* Active Video Status indicator */}
      <div className="hidden lg:flex items-center gap-2 text-xs">
        {hasTranscript ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E241C] border border-[#E8E1D5] dark:border-[#2C3428] text-[#282C24] dark:text-[#D8DFD0] shadow-warm-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="max-w-[200px] truncate font-medium">
              {transcriptTitle || 'Active Video'}
            </span>
          </div>
        ) : (
          <div className="text-[11px] text-[#8E9685] dark:text-[#7A8572] italic">
            Ready to transcribe
          </div>
        )}
      </div>
    </header>
  );
};
