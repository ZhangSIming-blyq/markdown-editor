const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

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

  win.loadURL('http://localhost:8080'); // 启动开发时加载的 URL
}

app.on('ready', createWindow);

// 处理文件读取
ipcMain.handle('open-file', async () => {
  const { filePaths } = await dialog.showOpenDialog({ properties: ['openFile'] });
  if (filePaths.length > 0) {
    const fileContent = fs.readFileSync(filePaths[0], 'utf-8');
    return { content: fileContent, path: filePaths[0] };
  }
  return { content: '', path: '' };
});

// 处理文件保存
ipcMain.handle('save-file', async (event, filePath, content) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return 'File saved successfully';
  } catch (error) {
    console.error('Error saving file:', error);
    return 'Failed to save file';
  }
});
