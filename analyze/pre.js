const { extract } = require('../system/util');
const fs = require('fs');

// Output format for each file:
// { 
//    metadata: [nodeCount, imageCount, textCount, cssCount, usedCssCount, cssRuleCount]
//    duration: [
//        [task1, task2, task3, ...], 
//        [], 
//        [], 
//        ...
//    ]
// }

// Run from base directory.
var files = fs.readdirSync('measure/forum/');
var formatted = [];

var count = 0;
for (var f of files) {
    let filename = 'measure/forum/' + f;
    let data = JSON.parse(fs.readFileSync(filename));
    let res = extract(data);
    var output = {
        metadata: [
            res.nodeCount, res.imageCount, res.textCount,
            res.cssCount, res.usedCssCount, res.cssRuleCount
        ],
        duration: res.taskDurations
    };
    formatted.push(output);
    data = undefined;
    res = undefined;
    output = undefined;

    count += 1;
    console.log(count);
}

fs.writeFileSync('analyze/data.json', JSON.stringify({ data: formatted }));