const { ipcRenderer } = require('electron');
const delay = require('delay');
const EventEmitter = require('events');

var linkInput = document.getElementById('url');
var checkButton = document.getElementById('check');
var log = document.getElementById('log');
var svg = document.getElementById('plot');

var logMonitor = new EventEmitter();
var renderingData = undefined;

logMonitor.on('over', async() => {
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
            if (args.data === 'Navigation finished.') logMonitor.emit('over');
            break;

        case "DATA":
            renderingData = args.data;
            document.getElementById('v1').innerHTML = renderingData.nodeCount;
            document.getElementById('v2').innerHTML = renderingData.imageCount;
            document.getElementById('v3').innerHTML = renderingData.textCount;
            document.getElementById('v4').innerHTML = renderingData.charCount;
            document.getElementById('v5').innerHTML = renderingData.invisibleNodeProportion.toFixed(2);

            document.getElementById('v6').innerHTML = `${renderingData.loadTime}ms`;

            var estimateLayout = 0.041 * renderingData.nodeCount + 47.44 * Math.log(renderingData.nodeCount) +
                0.17 * renderingData.imageCount + 0.008 * renderingData.charCount - 105.7;

            document.getElementById('v9').innerHTML = `${estimateLayout.toFixed(2)}ms`;

            plotTaskDurations();
            break;
    }
});

function plotTaskDurations() {
    svg.innerHTML = '';

    const DATA = renderingData.taskDurations;
    const TAGS = ['Parse HTML', 'Parse CSS', 'Eval JS', 'Layout', 'Layer', 'Paint'];

    const WIDTH = 160;
    const HEIGHT = 120;
    const GAP = 30;
    const AXIS_TICK = 3;

    var MAX_VALUE = 0;
    var formatted_data = [];
    var renderingSum = 0;
    var layoutSum = 0;
    for (var arr of DATA) {
        renderingSum += arr.reduce((a, b) => a + b, 0);
        renderingSum -= arr[2] + arr[3];
        layoutSum += arr[4] + arr[5];

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

    document.getElementById('v7').innerHTML = `${parseInt(renderingSum/1000)}ms`;
    document.getElementById('v8').innerHTML = `${parseInt(layoutSum/1000)}ms`;

    document.getElementById('v11').innerHTML = DATA.length;
    document.getElementById('v12').innerHTML = `${parseInt(MAX_VALUE/1000)}`;

    if (document.getElementById('plot_opt').value == 0) {
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
                var x = x0 + parseInt(WIDTH * (j + 1) / L);
                var y = y0 - parseInt(HEIGHT * formatted_data[j][i] / MAX_VALUE);
                line_points = line_points + x.toString() + " ";
                line_points = line_points + y.toString() + " ";
            }
            data_line.setAttribute('points', line_points);
            data_line.style = "fill:none; stroke:purple; stroke-width:2;"
            svg.appendChild(data_line);
        }
    } else {
        const SVG_WIDTH = 600;
        const SVG_HEIGHT = 330;

        // Draw axis.
        var axis = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        var axis_points = `${GAP+AXIS_TICK},${GAP} 
            ${GAP},${GAP} 
            ${GAP},${SVG_HEIGHT-GAP} 
            ${SVG_WIDTH-GAP},${SVG_HEIGHT-GAP} 
            ${SVG_WIDTH-GAP},${SVG_HEIGHT-GAP} 
            ${SVG_WIDTH-GAP},${SVG_HEIGHT-GAP-AXIS_TICK}`;
        axis.setAttribute('points', axis_points);
        axis.style = "fill:none; stroke:black; stroke-width:1;";
        svg.appendChild(axis);

        MAX_SUM = 0;
        for (arr of formatted_data) {
            sum = arr.reduce((a, b) => a + b);
            MAX_SUM = Math.max(MAX_SUM, sum);
        }

        var axis_tick = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        axis_tick.textContent = `${parseInt(MAX_SUM/1000)}ms`;
        axis_tick.setAttribute('x', GAP + AXIS_TICK + 5);
        axis_tick.setAttribute('y', GAP + 5);
        axis_tick.setAttribute('font-size', '12px');
        axis_tick.style = 'fill: black;'
        svg.appendChild(axis_tick);

        const BAR_WIDTH = (SVG_WIDTH - 2 * GAP - 2) / DATA.length;
        const AXIS_LIMIT = SVG_HEIGHT - 2 * GAP;
        const COLORS = ['blue', 'orange', 'green', 'red', 'purple', 'brown'];

        // Draw plot labels.
        for (i = 0; i < 6; i++) {
            var label_rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            label_rect.setAttribute('x', 460);
            label_rect.setAttribute('y', GAP + 15 * i - 10);
            label_rect.setAttribute('width', 10);
            label_rect.setAttribute('height', 10);
            label_rect.style = `fill: ${COLORS[i]}; stroke: none;`;
            svg.appendChild(label_rect);

            var label_text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label_text.setAttribute('x', 475);
            label_text.setAttribute('y', GAP + 15 * i);
            label_text.setAttribute('font-size', '12px');
            label_text.textContent = TAGS[i];
            svg.append(label_text);
        }

        for (i = 0; i < formatted_data.length; i++) {
            var yet_sum = SVG_HEIGHT - GAP - 1; // vertically stacking
            for (j = 0; j < 6; j++) {
                var bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                var x = GAP + 1 + BAR_WIDTH * i;
                var height = parseInt(formatted_data[i][j] * AXIS_LIMIT / MAX_SUM);
                var y = yet_sum - height;
                yet_sum = y;

                bar.setAttribute('x', x);
                bar.setAttribute('y', y);
                bar.setAttribute('width', BAR_WIDTH - 1);
                bar.setAttribute('height', height);
                bar.style = `fill: ${COLORS[j]}; stroke: none;`;
                svg.appendChild(bar);
            }
        }
    }

    document.getElementById('result').style = null;
}

document.getElementById('plot_opt').onchange = plotTaskDurations;