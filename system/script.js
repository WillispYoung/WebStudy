const { ipcRenderer } = require('electron');

var linkInput = document.getElementById('url');
var checkButton = document.getElementById('check');
var log = document.getElementById('log');
var suggestion = document.getElementById('suggestion');
var metadata = document.getElementById('metadata');
var canvas = document.getElementById('plot');

checkButton.onclick = function () {
    var url = linkInput.value;
    log.value = `Start navigating...\n`;
    ipcRenderer.send('asynchronous-message', { type: 'NAVIGATE', url });
}

ipcRenderer.on('asynchronous-reply', (event, args) => {
    console.log(args);
    switch (args.type) {
        case "LOG":
            original = log.value;
            log.value = original + args.data + '\n';
            break;
        case "METADATA":
            var li = document.createElement('li');
            if (args.tag === 'NODE')
                li.appendChild(document.createTextNode(`Number of DOM nodes: ${args.data}`));
            else if (args.tag === 'IMAGE')
                li.appendChild(document.createTextNode(`Number of images: ${args.data}`));
            else if (args.tag === 'TEXT')
                li.appendChild(document.createTextNode(`Number of texts: ${args.data}`));
            else if (args.tag === 'CSS')
                li.appendChild(document.createTextNode(`Number of CSS files: ${args.data}`));
            else if (args.tag === 'RULE')
                li.appendChild(document.createTextNode(`Number of CSS rules: ${args.data}`));
            metadata.appendChild(li);
            break;
        case "PLOT":
            plotTaskDurations(args.data);
            break;
        default:
            break;
    }
});

function plotTaskDurations(data) {
    
}