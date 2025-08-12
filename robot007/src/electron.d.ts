interface ElectronAPI {
    sendMessage: (channel: string, data?: any) => void;
    onMessage: (channel: string, callback: (...args: any[]) => void) => void;
    checkForUpdates: () => void;
    restartApp: () => void;
  }
  
  declare global {
    interface Window {
      electronAPI?: ElectronAPI;
    }
  }