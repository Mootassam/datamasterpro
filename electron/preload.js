const allowedChannels = ['custom-channel-1', 'custom-channel-2'];

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (channel, data) => {
    if (allowedChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  onMessage: (channel, callback) => {
    if (allowedChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  }
});