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
var top5_dur = raw.slice(l - 5, l);
// console.log('Top-5 Layout duration:', top5);

var layout = [];
for (var i = 0; i < res.td.length; i++) {
    layout.push({ v: res.td[i][4], idx: i });
}
layout.sort((a, b) => a.v - b.v);

var ll = layout.length;
var top5_idx = layout.slice(ll - 5, ll);

console.log('Index', '\t', 'total duration', '\t', 'sub-task duration');
for (var i = 0; i < 5; i++) {
    let sub_tasks = res.ld[top5_idx[i].idx].map(a => parseInt(a.dur / 1000));
    sub_tasks.sort((a, b) => a - b);
    console.log(top5_idx[i].idx, '\t', parseInt(top5_dur[i] / 1000), '\t\t\t', sub_tasks);
}