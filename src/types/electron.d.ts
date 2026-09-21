export interface ElectronAPI {
  isElectron: boolean;
  minimize: () => Promise<void>;
  maximize: () => Promise<boolean>;
  close: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
  onMaximizeChange: (callback: (isMaximized: boolean) => void) => () => void;
  saveFile: (options: {
    defaultName: string;
    content: string;
    ext?: 'txt' | 'md' | 'srt';
  }) => Promise<{ success: boolean; filePath?: string; canceled?: boolean; error?: string }>;
  copyToClipboard: (text: string) => Promise<{ success: boolean; error?: string }>;
  openExternal: (url: string) => Promise<{ success: boolean; error?: string }>;
  getAppInfo: () => Promise<{
    version: string;
    name: string;
    platform: string;
  }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
