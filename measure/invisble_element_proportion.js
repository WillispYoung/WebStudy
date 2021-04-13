const fs = require('fs');

var output = [];

const FILE_DIR = 'trace/';
const filenames = fs.readdirSync(FILE_DIR);

const VIEWPORT = [1536, 864];

var count = 0;
for (let fn of filenames) {
    var snapshot = JSON.parse(fs.readFileSync(FILE_DIR + fn)).documents[0];
    totalNodeCount = snapshot.nodes.parentIndex.length;
    inLayoutNodeCount = snapshot.layout.nodeIndex.length;
    invisibleNodeCount = 0

    for (let bound of snapshot.layout.bounds) {
        if (bound[0] > VIEWPORT[0] || bound[1] > VIEWPORT[1])
            invisibleNodeCount += 1;
    }

    output.push([totalNodeCount, inLayoutNodeCount, invisibleNodeCount]);

    snapshot = undefined;
    count += 1;
    console.log(count);
}

fs.writeFileSync('invisible_node.json', JSON.stringify({ ps: output }));
