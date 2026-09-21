import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  isElectron: true,
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  onMaximizeChange: (callback: (isMaximized: boolean) => void) => {
    const listener = (_event: any, { isMaximized }: { isMaximized: boolean }) => {
      callback(isMaximized);
    };
    ipcRenderer.on('window:state-changed', listener);
    return () => {
      ipcRenderer.removeListener('window:state-changed', listener);
    };
  },
  saveFile: (options: { defaultName: string; content: string; ext?: string }) =>
    ipcRenderer.invoke('dialog:saveFile', options),
  copyToClipboard: (text: string) => ipcRenderer.invoke('clipboard:write', text),
  openExternal: (url: string) => ipcRenderer.invoke('open:external', url),
  getAppInfo: () => ipcRenderer.invoke('app:getInfo'),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;
