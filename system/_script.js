const { ipcRenderer } = require('electron');
const fs = require('fs');
const delay = require('delay');
const EventEmitter = require('events');

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
var plot_title = document.getElementById('plot-title');
var svg = document.getElementById('plot');
var plot_description = document.getElementById('plot-description');

var log_monitor = new EventEmitter();

log_monitor.on('over', async() => {
    await delay(1000);
    log.value = "";
})

checkButton.onclick = function() {
    var url = linkInput.value;
    log.value = `Starting navigation...\n`;
    ipcRenderer.send('asynchronous-message', { type: 'NAVIGATE', url });
}

ipcRenderer.on('asynchronous-reply', (_, args) => {
    switch (args.type) {
        case "LOG":
            original = log.value;
            log.value = original + args.data + '\n';
            if (args.data === 'Navigation finished.') log_monitor.emit('over');
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
            metadata.innerHTML = ""; // Clear previous data.
            var tags = ['DOM nodes', 'images', 'texts', 'CSS files', 'used CSS files', 'CSS rules'];
            var opt_tags = [];
            for (var i = 0; i < 6; i++) {
                var text = document.createElement("p");
                metadata.appendChild(text);

                var mp = getMetadataPercentile(metadata_[i], i);
                if (mp >= 70) {
                    opt_tags.push(tags[i]);
                    var s = `<p>Number of ${tags[i]}: <span class="soft-highlight">${metadata_[i]}</span> > <span class='highlight'>${mp}%</span> pages.</p>`;
                    text.outerHTML = s;
                } else {
                    var s = `<p>Number of ${tags[i]}: <span class="soft-highlight">${metadata_[i]}</span> > ${mp}% pages.</p>`;
                    text.outerHTML = s;
                }
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

            prediction.outerHTML = `<p id="prediction">Sum of Top-5 Layout Task Durations: <span class="soft-highlight">${sum_of_top5}</span> ms.<br> Predicted (Multiple Regression): <span class='highlight'>${predicted}</span> ms.</p>`;
            prediction = document.getElementById('prediction');

            // Give suggestion for optimization.
            suggestion.innerHTML = ""; // Clear previous suggestion.
            if (opt_tags.length > 0) {
                var p1 = document.createElement('p');
                suggestion.appendChild(p1);
                p1.innerHTML = "Attributes that are greater than 70% pages:";

                for (var i = 0; i < opt_tags.length; i++) {
                    var p_ = document.createElement('p');
                    suggestion.appendChild(p_);
                    p_.className = "indent";
                    p_.innerHTML = `${i + 1}: Number of ${opt_tags[i]}${i === opt_tags.length - 1 ? '.' : ','}`;
                }

                var p_end = document.createElement('p');
                suggestion.appendChild(p_end);
                p_end.innerHTML = "Try to reduce the numbers of these attributes to reduce layout duration.";
            }

            // Update plots.
            plot_title.innerHTML = "Task Durations Before Every Frame Update";
            svg.innerHTML = "";
            plot_description.innerHTML = "";
            plotTaskDurations_(args.data.taskDurations);
            break;
        default:
            break;
    }
});

// SVG drawing.
function plotTaskDurations_(data) {
    const WIDTH = 160;
    const HEIGHT = 120;
    const GAP = 30;
    const AXIS_TICK = 3;
    const TAGS = ['Parse HTML', 'Parse CSS', 'Eval JS', 'Layout', 'Layer', 'Paint'];

    var MAX_VALUE = 0;
    var formatted_data = [];
    for (var arr of data) {
        var entry = [];
        entry.push(arr[0]);
        entry.push(arr[1]);
        entry.push(arr[2] + arr[3]);
        entry.push(arr[4] + arr[5]);
        entry.push(arr[6] + arr[7] + arr[9]);
        entry.push(arr[8]);
        formatted_data.push(entry);

        MAX_VALUE = Math.max(MAX_VALUE, entry.reduce((a, b) => Math.max(a, b)));
    }

    var description = document.createElement("p");
    plot_description.appendChild(description);
    description.innerHTML = `Count of Frame Update: ${data.length}, Maximum Task Duration: ${Math.floor(MAX_VALUE/1000)} ms.`;

    for (var i = 0; i < TAGS.length; i++) {
        var row = Math.floor(i / 3);
        var column = i % 3;

        // Draw axis.
        var axis = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        var axis_points = [
            column * (WIDTH + GAP) + GAP + AXIS_TICK, row * (HEIGHT + GAP) + GAP,
            column * (WIDTH + GAP) + GAP, row * (HEIGHT + GAP) + GAP,
            column * (WIDTH + GAP) + GAP, (row + 1) * (HEIGHT + GAP),
            (column + 1) * (WIDTH + GAP), (row + 1) * (HEIGHT + GAP),
            (column + 1) * (WIDTH + GAP), (row + 1) * (HEIGHT + GAP) - AXIS_TICK
        ];
        var axis_points_attr = "";
        for (var v of axis_points) axis_points_attr = axis_points_attr + v.toString() + ' ';
        axis.setAttribute('points', axis_points_attr);
        axis.style = "fill:none; stroke:black; stroke-width:1;";
        svg.appendChild(axis);

        // Draw plot title.
        var title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        title.setAttribute('x', column * (WIDTH + GAP) + GAP);
        title.setAttribute('y', (row + 1) * (HEIGHT + GAP) + 15);
        title.innerHTML = TAGS[i];
        title.style = "color: black;";
        svg.appendChild(title);

        // Draw data line.
        var data_line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        var line_points = "";
        var x0 = column * (WIDTH + GAP) + GAP;
        var y0 = (row + 1) * (HEIGHT + GAP);
        line_points = line_points + x0.toString() + " ";
        line_points = line_points + y0.toString() + " ";

        var L = formatted_data.length; // count of frame update.
        for (var j = 0; j < L; j++) {
            var x = x0 + WIDTH * (j + 1) / L;
            var y = y0 - HEIGHT * formatted_data[j][i] / MAX_VALUE;
            line_points = line_points + x.toString() + " ";
            line_points = line_points + y.toString() + " ";
        }
        data_line.setAttribute('points', line_points);
        data_line.style = "fill:none; stroke:purple; stroke-width:2;"
        svg.appendChild(data_line);
    }
}