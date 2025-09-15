const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow; // <-- declare here so it’s accessible in createWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load Angular production build
  mainWindow.loadFile(path.join(__dirname, 'dist', 'preventivi-app', 'browser', 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
