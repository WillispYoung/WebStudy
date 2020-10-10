const { ipcRenderer } = require('electron');

var linkInput = document.getElementById('url');
var checkButton = document.getElementById('check');
var logArea = document.getElementById('log');

checkButton.onclick = function () {
    var url = linkInput.value;
    logArea.value = `Start navigating...\n`;
    ipcRenderer.send('asynchronous-message', { type: 'NAVIGATE', url });
}

ipcRenderer.on('asynchronous-reply', (event, args) => {
    console.log(args);
    switch (args.type) {
        case "LOG":
            console.log(args);
            original = logArea.value;
            logArea.value = original + args.data + '\n';
            break;
        default:
            break;
    }
});
