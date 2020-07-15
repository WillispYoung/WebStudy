const fs = require('fs');
const { parseTrace } = require('./model');
const { parse } = require('path');

// var files = fs.readdirSync('../traces/');
// var totalSet = new Set();

// for (var f of files) {
//     console.log(f);
//     var crTrace = parseTrace('../traces/' + f);
//     crTrace.getProcesses().forEach(p => {
//         p.getThreads().forEach(t => {
//             if (t.getName() == 'CrRendererMain') {
//                 var res = t.findRenderTaskProportion();
//                 for (var n of res) {
//                     totalSet.add(n);
//                 }
//             }
//         });
//     });
//     crTrace = undefined;
// }
// console.log(totalSet);

var crTrace = parseTrace('../traces/www.360.cn.json');
crTrace.getProcesses().forEach(p => {
    p.getThreads().forEach(t => {
        if (t.getName() == 'CrRendererMain') {
            var res = t.findRenderTaskProportion();
            fs.writeFileSync('task_proportion.json', JSON.stringify({ res }));
        }
    });
});