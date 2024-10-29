// main.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let basePath = '';

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
    basePath = result.filePaths[0];
    console.log("Base path set to:", basePath); // Debug log
    return basePath;
  }
  return null;
});

ipcMain.handle('read-directory', async () => {
  console.log("Reading directory from base path:", basePath); // Debugging log
  function buildTree(dirPath) {
    const tree = [];
    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    items.forEach((item) => {
      const fullPath = path.join(dirPath, item.name);
      const node = {
        name: item.name,
        path: fullPath.replace(basePath, ''), // relative path for Vue
        type: item.isDirectory() ? 'directory' : 'file',
        children: [],
      };

      if (item.isDirectory()) {
        node.children = buildTree(fullPath); // recursive for directories
      }
      tree.push(node);
    });
    return tree;
  }

  return buildTree(basePath);
});

ipcMain.handle('read-file', async (event, filePath) => {
  const absolutePath = path.join(basePath, filePath);
  console.log("Attempting to read file at absolute path:", absolutePath); // Debugging log
  if (!fs.existsSync(absolutePath)) {
    console.error("File not found:", absolutePath); // Error log for missing file
    throw new Error("File not found");
  }
  const content = fs.readFileSync(absolutePath, 'utf-8');
  return content;
});

ipcMain.handle('write-file', async (event, filePath, content) => {
  const absolutePath = path.join(basePath, filePath);
  console.log("Attempting to write to file at absolute path:", absolutePath); // Debugging log
  fs.writeFileSync(absolutePath, content, 'utf-8');
  return 'File saved successfully';
});
