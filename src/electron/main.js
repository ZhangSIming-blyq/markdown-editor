// main.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let baseDirectory = '';

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });
  win.loadURL('http://localhost:8080');
}

app.on('ready', createWindow);

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  if (!result.canceled && result.filePaths.length > 0) {
    baseDirectory = result.filePaths[0];
    console.log("Base directory set to:", baseDirectory);
    return baseDirectory;
  }
  return null;
});

ipcMain.handle('read-file', async (event, relativePath) => {
  if (!baseDirectory) {
    console.error("Base directory is not set.");
    throw new Error("Base directory is not set.");
  }

  const fullPath = path.join(baseDirectory, relativePath);
  console.log("Attempting to read file at absolute path:", fullPath);

  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    console.log("File read successfully.");
    return content;
  } catch (error) {
    console.error("File not found:", fullPath);
    throw new Error("File not found");
  }
});

ipcMain.handle('write-file', async (event, relativePath, content) => {
  if (!baseDirectory) {
    console.error("Base directory is not set.");
    throw new Error("Base directory is not set.");
  }

  const fullPath = path.join(baseDirectory, relativePath);
  console.log("Writing file to path:", fullPath);
  console.log("Content to write:", content);

  try {
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log("File written successfully.");
    return 'File saved successfully';
  } catch (error) {
    console.error("Error writing file:", error);
    throw error;
  }
});

ipcMain.handle('set-base-directory', (event, baseDir) => {
  baseDirectory = baseDir;
  console.log("Base directory set to:", baseDirectory);
});
