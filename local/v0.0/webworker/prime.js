const basics = [2, 3, 5, 7];

function isPrime(n) {
    if (n < 2) return true;
    else if (basics.indexOf(n) >= 0) return true;

    var root = Math.round(Math.sqrt(n));
    for (var v = 2; v <= root; v++) {
        if (n % v === 0) return false;
    }
    return true;
}

onmessage = function(e) {
    var start = Date.now();
    var res = [];
    for (var i = 2; i < 2000000; i++) {
        if (isPrime(i))
            res.push(i);
    }
    var end = Date.now();
    console.log(end - start);
    console.log(res);
}