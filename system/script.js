const { ipcRenderer } = require('electron');

var linkInput = document.getElementById('url');
var checkButton = document.getElementById('check');
var log = document.getElementById('log');
var suggestion = document.getElementById('suggestion');
var metadata = document.getElementById('metadata');
var canvas = document.getElementById('plot');
var context = canvas.getContext('2d');

checkButton.onclick = function () {
    var url = linkInput.value;
    log.value = `Start navigating...\n`;
    ipcRenderer.send('asynchronous-message', { type: 'NAVIGATE', url });
}

ipcRenderer.on('asynchronous-reply', (event, args) => {
    switch (args.type) {
        case "LOG":
            original = log.value;
            log.value = original + args.data + '\n';
            break;
        case "METADATA":
            document.getElementById('metadata-title').innerHTML = "Metadata:";
            metadata.innerHTML = "";
            var tags = ['DOM nodes', 'images', 'texts', 'CSS files', 'CSS rules'];
            for (var i = 0; i < 5; i++) {
                var li = document.createElement('li');
                li.appendChild(document.createTextNode(`Number of ${tags[i]}: ${args.data[i]}`));
                metadata.appendChild(li);
            }
            break;
        case "PLOT":
            context.clearRect(0, 0, canvas.width, canvas.height);
            plotTaskDurations(args.data);
            break;
        default:
            break;
    }
});

function plotTaskDurations(data) {
    const PLOT_WIDTH = 60, PLOT_HEIGHT = 60, PLOT_GAP = 6;
    const TAGS = [
        'Parse HTML', 'Parse CSS', 'Eval JS',
        'Layout Tree', 'Layout', 'Layer',
        'Layer Tree', 'Paint', 'Composite', 'JS Side Effect'
    ];

    var data_ = [];
    var MAX_VALUE = 0;

    for (var i = 0; i < 10; i++) {
        context.beginPath();
        context.moveTo((PLOT_WIDTH + PLOT_GAP) * i + PLOT_GAP, PLOT_GAP);
        context.lineTo((PLOT_WIDTH + PLOT_GAP) * i + PLOT_GAP, PLOT_HEIGHT + PLOT_GAP);
        context.lineTo((PLOT_WIDTH + PLOT_GAP) * (i + 1), PLOT_HEIGHT + PLOT_GAP);
        context.lineWidth = 1;
        context.stroke();
        context.closePath();

        data_.push([]);
        for (var arr of data) {
            data_[i].push(arr[i]);
            MAX_VALUE = Math.max(MAX_VALUE, arr[i]);
        }
    }

    for (var i = 0; i < 10; i++) {
        var L = data_[i].length;
        context.beginPath();
        for (var j = 0; j < L; j++) {
            var x = (PLOT_WIDTH + PLOT_GAP) * i + PLOT_GAP + PLOT_WIDTH * j / L;
            var y = PLOT_WIDTH + PLOT_GAP - PLOT_HEIGHT * data_[i][j] / MAX_VALUE;
            if (j === 0)
                context.moveTo(x, y);
            else
                context.lineTo(x, y);
        }
        context.stroke();
        context.closePath();

        context.fillText(TAGS[i], (PLOT_WIDTH + PLOT_GAP) * i + PLOT_GAP, PLOT_HEIGHT + PLOT_GAP + 20);
    }
}