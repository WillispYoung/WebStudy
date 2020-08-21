const CrTrace = require('./model');
const fs = require('fs');

var trace = CrTrace.parseTrace(process.argv[2]);
var res = trace.taskDurationBeforeFrameUpdate();
console.log(res.length);
for (var i = 0; i < 9; i++) {
    var v = 0;
    for (var entry of res) {
        v += entry[i];
    }
    console.log(v);
}