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

monitor.on('DATA', args => {
    var details = extract(args.data);
    var metadata = [details.nodeCount, details.imageCount, details.textCount, details.cssCount, details.cssRuleCount];
    args.event.reply('asynchronous-reply', { type: 'METADATA', data: metadata });
    args.event.reply('asynchronous-reply', { type: 'PLOT', data: details.taskDurations });
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
        width: 1000,
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