const fs = require('fs');

// Data to acquire: top-5 layout task duration.
function getTop5LayoutDuration(traceEvents) {
    var layoutTasks = traceEvents.filter(e => e.name === 'Layout').map(e => parseInt(e.dur / 1000));
    layoutTasks.sort((a, b) => b - a);
    return layoutTasks.slice(0, 5);
}

// Data to extract:
//   number of images, sizes of images ([w, h, w, h, ...])
//   number of text lines, sizes of text lines ([cc, w, cc, w, ...])
//   number of CSS files, total number of rules used, numbers of rules used of each CSS file ([n, ...])
function extractDataFromDomSnapshot(documents, strings) {
    var doc = documents[0];
    var res = {
        nodeCount: doc.nodes.parentIndex.length,
        imageCount: 0,
        imageSizes: [],
        textCount: 0,
        textSizes: []
    };

    var layoutCount = doc.layout.nodeIndex.length;
    for (var i = 0; i < layoutCount; i++) {
        var idx = doc.layout.nodeIndex[i];
        var nameIndex = doc.nodes.nodeName[idx];
        if (nameIndex >= 0 && strings[nameIndex].toUpperCase() === 'IMG') {
            res.imageCount += 1;
            res.imageSizes.push(doc.layout.bounds[i][2]);
            res.imageSizes.push(doc.layout.bounds[i][3]);
        } else {
            var styleIndex = doc.layout.styles[i][0];
            if (styleIndex >= 0 &&
                strings[styleIndex].toUpperCase() !== 'NONE' &&
                strings[styleIndex].startsWith('url')) {
                res.imageCount += 1;
                res.imageSizes.push(doc.layout.bounds[i][2]);
                res.imageSizes.push(doc.layout.bounds[i][3]);
            }
        }
    }

    var texts = doc.layout.text.filter(idx => idx !== -1);
    texts = texts.map(idx => strings[idx]);
    res.textCount = texts.length;
    res.textSizes = texts.map(str => str.length);

    return res;
}

function extractData(filename) {
    var rawData = JSON.parse(fs.readFileSync(filename));
    var targetData = extractDataFromDomSnapshot(rawData.documents, rawData.strings);

    targetData.cssCount = rawData.cssCount;
    targetData.cssRuleCount = rawData.ruleUsage.length;

    var usedCss = new Set();
    for (var i = 0; i < rawData.ruleUsage.length; i++) {
        usedCss.add(rawData.ruleUsage[i].styleSheetId);
    }
    targetData.usedCssCount = usedCss.size;

    var entries = filename.split('-');
    targetData.tag = entries[0].split('/')[1];
    targetData.latency = parseInt(entries[1]);
    targetData.bandwidth = parseInt(entries[2]);
    targetData.top5Layout = getTop5LayoutDuration(rawData.traceEvents);

    rawData = undefined;

    return targetData;
}

async function main() {
    var files = fs.readdirSync('trace/');
    var finalResult = [];
    var nodeCounts = [], imageCounts = [], textCounts = [], cssCounts = [];
    var count = 0;
    for (var f of files) {
        let start = Date.now();
        let filename = 'trace/' + f;
        let res = extractData(filename);
        finalResult.push(res);

        nodeCounts.push(res.nodeCount);
        imageCounts.push(res.imageCount);
        textCounts.push(res.textCount);
        cssCounts.push(res.cssCount);

        count += 1;
        let end = Date.now();
        console.log(count, '\t', end - start, '\t', f);
    }
    fs.writeFileSync('res.json', JSON.stringify({ finalResult }));
    fs.writeFileSync('counts.json', JSON.stringify({ nodeCounts, imageCounts, textCounts, cssCounts }));
}

main();