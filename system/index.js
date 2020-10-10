const { app, BrowserWindow, ipcMain } = require('electron');
const EventEmitter = require('events');

const { navigate, extract } = require('./util.js');

process.on('uncaughtException', function (error) {
    console.log(`Uncaught exception: ${error.message}`);
});

process.on('unhandledRejection', function (error) {
    console.log(`Unhandled rejection: ${error.message}`);
});

const monitor = new EventEmitter();

monitor.on('DATA', data => {
    var details = extract(data);
});

ipcMain.on('asynchronous-message', (event, args) => {
    switch (args.type) {
        case 'NAVIGATE':
            navigate(args.url, event, monitor);
            break;
        default:
            break;
    }
});

function createWindow() {
    var window = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            worldSafeExecuteJavaScript: true
        }
    });

    window.loadFile('system/main.html');
    // window.removeMenu();
    window.setTitle('Render Delay Check');
}

app.whenReady().then(createWindow);