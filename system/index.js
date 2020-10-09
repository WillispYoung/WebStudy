const { app, BrowserWindow } = require('electron');

function createWindow() {

    var window = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: { nodeIntegration: true }
    });

}

app.whenReady().then(createWindow)