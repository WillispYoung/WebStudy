const CrTrace = require('./model');
const fs = require('fs');

var trace = CrTrace.parseTrace(process.argv[2]);
var res = trace.taskDurationBeforeFrameUpdate();
fs.writeFileSync('td.json', JSON.stringify({ res }));