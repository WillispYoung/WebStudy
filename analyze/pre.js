const { extract } = require('../system/util');
const fs = require('fs');
const { format } = require('path');

// Output format for each file:
// { 
//    metadata: [nodeCount, imageCount, textCount, cssCount, usedCssCount, cssRuleCount, charCount]
//    duration: [
//        [task1, task2, task3, ...], 
//        [], 
//        [], 
//        ...
//    ]
// }

// Run from base directory.

function v0() {
    var files = fs.readdirSync('measure/trace/');
    var formatted = [];

    var count = 0;
    for (var f of files) {
        let filename = 'measure/trace/' + f;
        let data = JSON.parse(fs.readFileSync(filename));
        let res = extract(data);
        var output = {
            metadata: [
                res.nodeCount, res.imageCount, res.textCount,
                res.cssCount, res.usedCssCount, res.cssRuleCount,
                res.charCount
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

    fs.writeFileSync('analyze/data1.json', JSON.stringify({ data: formatted }));
}

function v1() {
    var folder = '../measure/trace/';
    var files = fs.readdirSync(folder);
    var formatted = [];

    for (var f of files) {
        let filename = folder + f;
        let data = JSON.parse(fs.readFileSync(filename));
        let res = extract(data);
        formatted.push({
            image: res.imageCount,
            text: res.textCount,
            char: res.charCount,
            ilc: res.inLayoutCount,
            tds: res.taskDurations
        });
    }

    fs.writeFileSync('data-trace.json', JSON.stringify({ data: formatted }));
}

v1();
