import React, { useEffect, useState } from 'react';
import {
  Minus,
  Square,
  Copy,
  X,
  Sun,
  Moon,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface DesktopTitleBarProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenAuth: () => void;
  onOpenAbout: () => void;
}

export const DesktopTitleBar: React.FC<DesktopTitleBarProps> = ({
  isDark,
  onToggleTheme,
  onOpenAuth,
  onOpenAbout,
}) => {
  const { user } = useAuth();
  const [isMaximized, setIsMaximized] = useState(false);
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI?.isElectron;

  useEffect(() => {
    if (window.electronAPI?.isMaximized) {
      window.electronAPI.isMaximized().then(setIsMaximized);
    }

    if (window.electronAPI?.onMaximizeChange) {
      const cleanup = window.electronAPI.onMaximizeChange((maximized) => {
        setIsMaximized(maximized);
      });
      return cleanup;
    }
  }, []);

  const handleMinimize = () => {
    if (window.electronAPI?.minimize) {
      window.electronAPI.minimize();
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI?.maximize) {
      window.electronAPI.maximize().then(setIsMaximized);
    }
  };

  const handleClose = () => {
    if (window.electronAPI?.close) {
      window.electronAPI.close();
    }
  };

  return (
    <div
      className={`h-10 select-none flex items-center justify-between px-3 border-b text-xs transition-colors ${
        isDark
          ? 'bg-[#121611] border-[#22281F] text-[#D8DFD0]'
          : 'bg-[#F2ECE2] border-[#E3DBD0] text-[#282C24]'
      }`}
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Left: Branding & App Title */}
      <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button
          type="button"
          onClick={onOpenAbout}
          className="flex items-center gap-2 hover:opacity-85 transition-opacity focus:outline-none"
          title="About SwarTranscript AI Desktop"
        >
          <div className="w-5 h-5 rounded-md bg-[#8B9A6E] flex items-center justify-center text-white font-bold shadow-xs">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="font-bold tracking-tight text-[13px] font-sans">
            SwarTranscript AI
          </span>
        </button>

        <span
          className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
            isDark ? 'bg-[#1D231B] text-[#95A287]' : 'bg-[#E5DDD0] text-[#5D6B44]'
          }`}
        >
          Desktop
        </span>
      </div>

      {/* Center: Subtle Title / Drag Area */}
      <div className="flex-1 text-center truncate px-4 pointer-events-none text-[11px] opacity-60">
        Turn YouTube videos into usable text
      </div>

      {/* Right: Controls & Window Buttons */}
      <div
        className="flex items-center gap-1.5"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Account / User Button */}
        <button
          type="button"
          onClick={onOpenAuth}
          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
            user
              ? isDark
                ? 'bg-[#1C221A] text-[#A6B595] hover:bg-[#252E23]'
                : 'bg-[#E7DFD3] text-[#4F5B39] hover:bg-[#DDD3C5]'
              : isDark
              ? 'bg-[#8B9A6E]/20 text-[#A6B595] hover:bg-[#8B9A6E]/30'
              : 'bg-[#8B9A6E]/15 text-[#5D6B44] hover:bg-[#8B9A6E]/25'
          }`}
          title={user ? `Signed in as ${user.email}` : 'Sign In to your account'}
        >
          <UserIcon className="w-3 h-3" />
          <span className="max-w-[110px] truncate">
            {user ? user.email?.split('@')[0] : 'Sign In'}
          </span>
        </button>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={onToggleTheme}
          className={`p-1.5 rounded-md transition-colors ${
            isDark
              ? 'hover:bg-[#22281F] text-[#A8B49E]'
              : 'hover:bg-[#E3DBD0] text-[#595F52]'
          }`}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Electron Native Window Controls */}
        {isElectron && (
          <div className="flex items-center ml-1">
            {/* Minimize */}
            <button
              type="button"
              onClick={handleMinimize}
              className={`w-8 h-7 flex items-center justify-center rounded-sm transition-colors ${
                isDark ? 'hover:bg-[#252E22] text-[#D8DFD0]' : 'hover:bg-[#E1D8CC] text-[#282C24]'
              }`}
              title="Minimize"
              aria-label="Minimize"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            {/* Maximize / Restore */}
            <button
              type="button"
              onClick={handleMaximize}
              className={`w-8 h-7 flex items-center justify-center rounded-sm transition-colors ${
                isDark ? 'hover:bg-[#252E22] text-[#D8DFD0]' : 'hover:bg-[#E1D8CC] text-[#282C24]'
              }`}
              title={isMaximized ? 'Restore' : 'Maximize'}
              aria-label={isMaximized ? 'Restore' : 'Maximize'}
            >
              {isMaximized ? (
                <Copy className="w-3 h-3 rotate-180" />
              ) : (
                <Square className="w-3 h-3" />
              )}
            </button>

            {/* Close (Standard Red on hover) */}
            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-7 flex items-center justify-center rounded-sm text-neutral-400 hover:bg-[#E81123] hover:text-white transition-colors"
              title="Close"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
