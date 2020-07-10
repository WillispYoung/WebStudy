const fs = require('fs');
const { parseTrace, CrThread } = require('./model');

var crTrace = parseTrace('../data/trace.json');

crTrace.getProcesses().forEach(p => {
    p.getThreads().forEach(t => {
        if (t.getName() === CrThread.ThreadNames.RendererMain) {
            var tse = t.getAllTaskSideEffect();
            // fs.writeFileSync('side-effect.json', JSON.stringify(tse));
            console.log(tse);
        }
    });
});