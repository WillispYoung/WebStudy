const { ipcRenderer } = require('electron');
const fs = require('fs');

const PRE_DATA = JSON.parse(fs.readFileSync('system/data.json'))['data'];
const COEF = fs.readFileSync('system/coef.txt').toString().split('\n').slice(0, 6).map(v => parseFloat(v));

var SORTED_PRE_METADATA = [];
for (var i = 0; i < 6; i++) SORTED_PRE_METADATA.push([]);
for (var i = 0; i < PRE_DATA.length; i++)
    for (var j = 0; j < 6; j++)
        SORTED_PRE_METADATA[j].push(PRE_DATA[i].metadata[j]);
for (var i = 0; i < 6; i++)
    SORTED_PRE_METADATA[i].sort((a, b) => a - b);

function getMetadataPercentile(v, i) {
    var j = 0;
    while (j < SORTED_PRE_METADATA[i].length) {
        if (v <= SORTED_PRE_METADATA[i][j]) break;
        else j += 1;
    }
    return Math.floor(100 * j / SORTED_PRE_METADATA[i].length);
}

var linkInput = document.getElementById('url');
var checkButton = document.getElementById('check');
var log = document.getElementById('log');
var suggestion = document.getElementById('suggestion');
var metadata = document.getElementById('metadata');
var prediction = document.getElementById('prediction');
var canvas = document.getElementById('plot');
var context = canvas.getContext('2d');

checkButton.onclick = function () {
    var url = linkInput.value;
    log.value = `Starting navigation...\n`;
    ipcRenderer.send('asynchronous-message', { type: 'NAVIGATE', url });
}

ipcRenderer.on('asynchronous-reply', (_, args) => {
    switch (args.type) {
        case "LOG":
            original = log.value;
            log.value = original + args.data + '\n';
            break;
        case "DATA":
            // Update metadata and comparison.
            var metadata_ = [
                args.data.nodeCount,
                args.data.imageCount,
                args.data.textCount,
                args.data.cssCount,
                args.data.usedCssCount,
                args.data.cssRuleCount
            ];
            document.getElementById('metadata-title').innerHTML = "Metadata:";
            metadata.innerHTML = "";  // Clear previous data.
            var tags = ['DOM nodes', 'images', 'texts', 'CSS files', 'used CSS files', 'CSS rules'];
            var opt_tags = [];
            for (var i = 0; i < 6; i++) {
                var li = document.createElement('li');
                var text = document.createElement("p");
                li.appendChild(text);

                var mp = getMetadataPercentile(metadata_[i], i);
                if (mp >= 70) opt_tags.push(tags[i]);
                var s = `<p>Number of ${tags[i]}: ${metadata_[i]} > <span class='highlight'>${mp}%</span> pages.</p>`;
                text.outerHTML = s;
                metadata.appendChild(li);
            }
            // Give layout duration prediction.
            var layout = [];
            for (var arr of args.data.taskDurations)
                layout.push(arr[4] + arr[5]);
            layout.sort((a, b) => b - a);

            var sum_of_top5 = 0;
            for (var i = 0; i < 5; i++) sum_of_top5 += layout[i];
            sum_of_top5 = Math.floor(sum_of_top5 / 1000);

            var predicted = 0;
            for (var i = 0; i < 6; i++) predicted += COEF[i] * metadata_[i];
            predicted = Math.floor(predicted / 1000);

            prediction.outerHTML = `<p id="prediction">Sum of top-5 layout task durations: ${sum_of_top5} ms, predicted: <span class='highlight'>${predicted}</span> ms.</p>`;
            prediction = document.getElementById('prediction');

            // Give suggestion for optimization.
            if (opt_tags.length > 0) {
                var sug_text = "The following attributes are greater than 70% pages:\n";
                for (var i = 0; i < opt_tags.length; i++)
                    sug_text = sug_text + `  ${i + 1}: number of ${opt_tags[i]}${i === opt_tags.length - 1 ? '.' : ','}\n`
                sug_text = sug_text + "Try to reduce the numbers of these attributes to reduce layout duration.\n";
                suggestion.value = sug_text;
            } else {
                suggestion.value = "";
            }
            

            // Update plots.
            context.clearRect(0, 0, canvas.width, canvas.height);
            plotTaskDurations(args.data.taskDurations);
            break;

        // The following 2 cases are obsolete.
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
    // Place plots in 2 rows.
    const PLOT_WIDTH = 160, PLOT_HEIGHT = 120, PLOT_GAP = 30, AXIS_TICK = 3;
    const TAGS = ['Parse HTML', 'Parse CSS', 'Eval JS', 'Layout', 'Layer', 'Paint'];

    var data_ = [];
    var MAX_VALUE = 0;

    context.translate(0.5, 0.5); // Avoid blurry.
    context.strokeStyle = '#000';
    for (var i = 0; i < TAGS.length; i++) {
        context.beginPath();
        if (i < 3) {
            context.moveTo((PLOT_WIDTH + PLOT_GAP) * i + PLOT_GAP + AXIS_TICK, PLOT_GAP);
            context.lineTo((PLOT_WIDTH + PLOT_GAP) * i + PLOT_GAP, PLOT_GAP);
            context.lineTo((PLOT_WIDTH + PLOT_GAP) * i + PLOT_GAP, PLOT_HEIGHT + PLOT_GAP);
            context.lineTo((PLOT_WIDTH + PLOT_GAP) * (i + 1), PLOT_HEIGHT + PLOT_GAP);
            context.lineTo((PLOT_WIDTH + PLOT_GAP) * (i + 1), PLOT_HEIGHT + PLOT_GAP - AXIS_TICK);
        } else {
            context.moveTo((PLOT_WIDTH + PLOT_GAP) * (i - 3) + PLOT_GAP + AXIS_TICK, PLOT_HEIGHT + 2 * PLOT_GAP);
            context.lineTo((PLOT_WIDTH + PLOT_GAP) * (i - 3) + PLOT_GAP, PLOT_HEIGHT + 2 * PLOT_GAP);
            context.lineTo((PLOT_WIDTH + PLOT_GAP) * (i - 3) + PLOT_GAP, 2 * (PLOT_HEIGHT + PLOT_GAP));
            context.lineTo((PLOT_WIDTH + PLOT_GAP) * (i - 2), 2 * (PLOT_HEIGHT + PLOT_GAP));
            context.lineTo((PLOT_WIDTH + PLOT_GAP) * (i - 2), 2 * (PLOT_HEIGHT + PLOT_GAP) - AXIS_TICK);
        }
        context.lineWidth = 1;
        context.stroke();
        context.closePath();

        data_.push([]);
    }

    for (var arr of data) {
        data_[0].push(arr[0]);
        data_[1].push(arr[1]);
        data_[2].push(arr[2] + arr[3]);
        data_[3].push(arr[4] + arr[5]);
        data_[4].push(arr[6] + arr[7] + arr[9]);
        data_[5].push(arr[8]);
        // data_[6].push(0);   // TODO.
        MAX_VALUE = Math.max(MAX_VALUE, arr.reduce((a, b) => Math.max(a, b)), 0);
    }

    context.font = '12px Arial';
    for (var i = 0; i < TAGS.length; i++) {
        var L = data_[i].length;
        context.beginPath();
        for (var j = 0; j < L; j++) {
            var x = 0, y = 0;
            if (i < 3) {
                x = (PLOT_WIDTH + PLOT_GAP) * i + PLOT_GAP + PLOT_WIDTH * j / L;
                y = PLOT_HEIGHT + PLOT_GAP - 0.8 * PLOT_HEIGHT * data_[i][j] / MAX_VALUE - 2; // Avoid overlapping the X axis.
            } else {
                x = (PLOT_WIDTH + PLOT_GAP) * (i - 3) + PLOT_GAP + PLOT_WIDTH * j / L;
                y = 2 * (PLOT_HEIGHT + PLOT_GAP) - 0.8 * PLOT_HEIGHT * data_[i][j] / MAX_VALUE - 2;
            }

            if (j === 0)
                context.moveTo(x, y);
            else
                context.lineTo(x, y);
        }

        if (i < 3)
            context.fillText(TAGS[i], (PLOT_WIDTH + PLOT_GAP) * i + PLOT_GAP, PLOT_HEIGHT + 1.5 * PLOT_GAP);
        else
            context.fillText(TAGS[i], (PLOT_WIDTH + PLOT_GAP) * (i - 3) + PLOT_GAP, 2 * PLOT_HEIGHT + 2.5 * PLOT_GAP);

        context.strokeStyle = '#C0C';
        context.stroke();
        context.closePath();
    }
}