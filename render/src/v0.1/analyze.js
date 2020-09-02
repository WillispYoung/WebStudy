const CrTrace = require('./model');
const fs = require('fs');

var trace = CrTrace.parseTrace(process.argv[2]);
var res = trace.taskDurationBeforeFrameUpdate();
fs.writeFileSync('td.json', JSON.stringify(res));

var raw = [];
for (var i = 0; i < res.td.length; i++)
    raw.push(res.td[i][4]);
raw.sort((a, b) => a - b);
var l = raw.length;
var top5 = raw.slice(l - 5, l);
console.log('Top-5 Layout duration:', top5);

var layout = [];
for (var i = 0; i < res.td.length; i++) {
    layout.push({ v: res.td[i][4], idx: i });
}
layout.sort((a, b) => a.v - b.v);

var ll = layout.length;
var top5 = layout.slice(ll - 5, ll);

var output = [];
for (v of top5) {
    output.push(res.ld[v.idx].length);
}
console.log('Number of Layout sub-tasks:', output);