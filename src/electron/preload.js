const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
  setBaseDirectory: (baseDir) => ipcRenderer.invoke('set-base-directory', baseDir),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
});
