import { app, BrowserWindow, ipcMain, dialog, clipboard, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1260,
    height: 840,
    minWidth: 960,
    minHeight: 650,
    frame: false, // frameless for custom desktop titlebar
    titleBarStyle: 'hidden',
    backgroundColor: '#0F120E', // dark background while initializing
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    icon: path.join(__dirname, '../public/favicon.svg'),
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    mainWindow.loadFile(indexPath);
  }

  // Handle external links safely via default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window:state-changed', { isMaximized: true });
  });

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window:state-changed', { isMaximized: false });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Window control IPC handlers
ipcMain.handle('window:minimize', () => {
  mainWindow?.minimize();
});

ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
  return mainWindow?.isMaximized() ?? false;
});

ipcMain.handle('window:close', () => {
  mainWindow?.close();
});

ipcMain.handle('window:isMaximized', () => {
  return mainWindow?.isMaximized() ?? false;
});

// Native file save dialog
ipcMain.handle('dialog:saveFile', async (_event, { defaultName, content, ext = 'txt' }) => {
  if (!mainWindow) return { success: false, error: 'Window not available' };

  try {
    const filters =
      ext === 'md'
        ? [
            { name: 'Markdown Document', extensions: ['md'] },
            { name: 'All Files', extensions: ['*'] },
          ]
        : [
            { name: 'Text Document', extensions: ['txt'] },
            { name: 'All Files', extensions: ['*'] },
          ];

    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Save Transcript',
      defaultPath: defaultName || `transcript.${ext}`,
      filters,
    });

    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }

    await fs.promises.writeFile(filePath, content, 'utf-8');
    return { success: true, filePath };
  } catch (err: any) {
    console.error('Error saving file:', err);
    return { success: false, error: err.message };
  }
});

// Clipboard write
ipcMain.handle('clipboard:write', (_event, text: string) => {
  try {
    clipboard.writeText(text);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

// Open external URL
ipcMain.handle('open:external', (_event, url: string) => {
  if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
    shell.openExternal(url);
    return { success: true };
  }
  return { success: false, error: 'Invalid URL' };
});

// App version and metadata
ipcMain.handle('app:getInfo', () => {
  return {
    version: app.getVersion(),
    name: 'SwarTranscript AI',
    platform: process.platform,
  };
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
