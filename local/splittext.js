const fs = require('fs');
var content = fs.readFileSync('sample.txt', 'utf-8');
var words = content.split(' ');
for (var i = 0; i < 8; i++) {
    console.log(words.slice(100 * i, 100 * (i + 1)).reduce((a, b) => { return a.concat(' ').concat(b); }));
}