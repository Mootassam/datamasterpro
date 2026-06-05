const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    // fullscreen: true, // Default to fullscreen
    autoHideMenuBar: true, // Hide menu bar
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: false // Disable devtools
    }
  });

  // Prevent any devtools opening attempts
  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow.webContents.closeDevTools();
  });

  // Disable context menu (right-click menu)
  mainWindow.webContents.on('context-menu', (e) => {
    e.preventDefault();
  });

  mainWindow.loadFile(path.join(__dirname, '../robot007/dist/index.html'));

  // Optional: Remove window frame (if you want truly borderless)
  // mainWindow.setMenuBarVisibility(false);
  // mainWindow.setAutoHideMenuBar(true);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

app.whenReady().then(() => {
  const isDev = !app.isPackaged;
  const backendPath = isDev
    ? path.join(__dirname, '../brain/dist/backend.exe')
    : path.join(process.resourcesPath, 'backend.exe');

  console.log('Spawning backend from:', backendPath);

  backendProcess = spawn(backendPath, [], {
    stdio: 'inherit',
    windowsHide: true,
  });

  // Handle backend process events
  backendProcess.on('error', (err) => {
    console.error('Backend process error:', err);
  });

  backendProcess.on('exit', (code, signal) => {
    console.log(`Backend process exited with code ${code} and signal ${signal}`);
    if (code !== 0) {
      // Handle abnormal exit (optional)
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Improved process cleanup
app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill('SIGTERM');
    backendProcess = null;
  }
  
  if (process.platform !== 'darwin') app.quit();
});

// Additional cleanup for app termination
app.on('before-quit', () => {
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill();
  }
});