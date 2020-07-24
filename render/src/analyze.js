const fs = require('fs');
const { CrTrace } = require('./model');

function numericSimilarity(x, y) {
    if (x === y) return 1;
    else return 1 - Math.abs(x - y) / (Math.abs(x) + Math.abs(y));
}

function arrayMeanNumericSimilarity(X, Y) {
    var res = 0;
    for (var i in X) {
        res += numericSimilarity(X[i], Y[i]);
    }
    return Number.parseFloat((res / X.length).toFixed(3));
}

function arraySum(X) {
    return X.reduce((a, b) => {
        return a + b;
    }, 0);
}

function arrayMedian(X) {
    return X[parseInt(X.length / 2)];
}

function arrayMean(X) {
    return arraySum(X) / X.length;
}

function comparePipelineSimilarity(ptd1, ptd2) {
    var res = [];
    for (var i = 0; i < 10; i++) {
        var arr1 = ptd1[i].filter(a => a !== 0).sort();
        var arr2 = ptd2[i].filter(a => a !== 0).sort();
        var l1 = [arr1[0], arrayMedian(arr1), arrayMean(arr1), arr1[arr1.length - 1]];
        var l2 = [arr2[0], arrayMedian(arr2), arrayMean(arr2), arr2[arr2.length - 1]];
        res.push(arrayMeanNumericSimilarity(l1, l2));
    }
    return res;
}

function test() {
    var folder = '../traces/';
    var files = fs.readdirSync(folder);
    var res = [];
    for (var f of files) {
        var trace = CrTrace.parseTrace(folder + f);
        var rd = trace.renderDelayAnalysis();
        res.push({ domain: f, rd });
    }
    fs.writeFileSync('rd.json', JSON.stringify({ res }));
}

test();