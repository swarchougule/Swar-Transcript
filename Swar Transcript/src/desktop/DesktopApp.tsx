import React, { useState, useEffect } from 'react';
import { DesktopTitleBar } from './components/DesktopTitleBar';
import { DesktopNavigation, type DesktopTab } from './components/DesktopNavigation';
import { DesktopTranscriptView } from './components/DesktopTranscriptView';
import { DesktopAiToolkitView } from './components/DesktopAiToolkitView';
import { DesktopAboutModal } from './components/DesktopAboutModal';
import { DesktopSettingsModal } from './components/DesktopSettingsModal';
import { DesktopAuthModal } from './components/DesktopAuthModal';
import type { TranscriptData } from '../types/transcript';

export const DesktopApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DesktopTab>('transcript');
  const [transcript, setTranscript] = useState<TranscriptData | null>(null);

  // Modals state
  const [aboutOpen, setAboutOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  // Theme state with localStorage persistence and dark class on <html>
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('swar_theme');
    if (saved) return saved === 'dark';
    return false; // Default clean warm theme
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('swar_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('swar_theme', 'light');
    }
  }, [isDark]);

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleSelectTab = (tab: DesktopTab) => {
    if (tab === 'about') {
      setAboutOpen(true);
      return;
    }
    if (tab === 'settings') {
      setSettingsOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  const handleTranscriptLoaded = (newTranscript: TranscriptData) => {
    setTranscript(newTranscript);
  };

  return (
    <div
      className={`h-screen w-screen flex flex-col overflow-hidden font-sans select-none transition-colors ${
        isDark ? 'bg-[#0F120E] text-[#E5EADF]' : 'bg-[#F7F2EB] text-[#1B1E19]'
      }`}
    >
      {/* 1. BRANDING & WINDOW TITLE BAR */}
      <DesktopTitleBar
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        onOpenAuth={() => setAuthOpen(true)}
        onOpenAbout={() => setAboutOpen(true)}
      />

      {/* 2. DESKTOP NAVIGATION BAR */}
      <DesktopNavigation
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        hasTranscript={!!transcript}
        transcriptTitle={transcript?.video?.title}
        isDark={isDark}
      />

      {/* 3. MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'transcript' ? (
          <DesktopTranscriptView
            transcript={transcript}
            onTranscriptLoaded={handleTranscriptLoaded}
            onOpenAiToolkit={() => setActiveTab('ai-toolkit')}
            onOpenAuth={() => setAuthOpen(true)}
            isDark={isDark}
          />
        ) : (
          <DesktopAiToolkitView
            transcript={transcript}
            onBackToTranscript={() => setActiveTab('transcript')}
            onOpenAuth={() => setAuthOpen(true)}
            isDark={isDark}
          />
        )}
      </main>

      {/* MODALS */}
      <DesktopAboutModal
        isOpen={aboutOpen}
        onClose={() => setAboutOpen(false)}
        isDark={isDark}
      />

      <DesktopSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />

      <DesktopAuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        isDark={isDark}
      />
    </div>
  );
};

export default DesktopApp;
