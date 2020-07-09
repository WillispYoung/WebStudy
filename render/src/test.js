const fs = require('fs');
const {
    parseTrace,
    CrThread
} = require('./model');

var crTrace = parseTrace('../data/trace.json');

crTrace.getProcesses().forEach(p => {
    p.getThreads().forEach(t => {
        if (t.getName() === CrThread.ThreadNames.RendererMain) {
            var eventNames = t.findRenderEventsFromNonPipelines();
            console.log(eventNames);

            var rpls = t.findRenderPipelines();
            fs.writeFileSync('render-pipelines.json', JSON.stringify({ rpls }));
        }
    });
});