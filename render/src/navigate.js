const EventEmitter = require('events');
const delay = require('delay');
const fs = require('fs');
const puppeteer = require('puppeteer');

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function randomSuffix() {
    var res = '';
    var l = chars.length;
    for (var i = 0; i < 4; i++) {
        res = res.concat(chars[Math.floor(Math.random() * l)]);
    }
    return res;
}

process.on('uncaughtException', function(error) {
    console.log(`Uncaught exceptionL ${error.message}`);
});

process.on('unhandledRejection', function(error) {
    console.log(`Unhandled rejection: ${error.message}`);
});

async function navigate(url, folder, latency, bandwidth, notifier) {
    var browser = await puppeteer.launch();
    var page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 900 });

    var client = await page.target().createCDPSession();
    await client.send("Network.enable");
    await client.send("Network.emulateNetworkConditions", {
        offline: false,
        latency: latency,
        downloadThroughput: bandwidth * 1024,
        uploadThroughput: bandwidth * 1024
    });

    var domain = url.split('/')[2].split(':')[0];
    var tag = url.split('/')[3];
    var label = `${domain}-${tag}-${latency}ms-${bandwidth}KB`;
    var filename = `${folder}/${label}-${randomSuffix()}.json`;
    page.on('load', async() => {
        console.log('Page loaded.');
        await delay(1000);

        console.log(`Saving trace data to ${filename}...`);
        await page.tracing.stop();

        console.log('Closing headless browser...\n');
        await page.close();
        await browser.close();

        await delay(1000);
        if (notifier)
            notifier.emit('next');
    });

    console.log(`Starting navigation to ${url}...`);

    await page.tracing.start({ path: `${filename}` });
    await page.goto(url);
}

// Navigate a list of domains.
function navigateDomainList() {
    var domains = fs.readFileSync('domains.txt', { encoding: 'utf-8' }).split('\r\n');
    var startIndex = 0;
    var monitor = new EventEmitter();

    monitor.on('next', () => {
        startIndex += 1;
        if (startIndex < domains.length)
            navigate(domains[startIndex], `../traces/trace${startIndex}`, monitor);
    });

    navigate(domains[startIndex], 'traces', 100, 300, monitor);
}

// FOR TESTING: check how precise Chrome's networkEmulation is.
async function navigateUnderGivenCondition(url, latency, bandwidth) {
    var browser = await puppeteer.launch({ headless: false });
    var page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 900 });

    var client = await page.target().createCDPSession();
    await client.send("Network.enable");
    await client.send("Network.emulateNetworkConditions", {
        offline: false,
        latency: latency,
        downloadThroughput: bandwidth * 1024,
        uploadThroughput: bandwidth * 1024
    });

    await page.goto(url);
}

async function localNavigate(tag) {
    var browser = await puppeteer.launch();
    var page = await browser.newPage();

    page.on('load', async() => {
        await delay(1000);
        await page.tracing.stop();
        await page.close();
        await browser.close();
        console.log(filename, 'saved.');
    })

    var filename = tag + '-' + randomSuffix() + '.json';
    await page.tracing.start({ path: `traces/${filename}` });
    await page.goto('http://localhost:8000/' + tag);
}

// navigate(process.argv[2], process.argv[3], 100, parseInt(process.argv[4]));
// navigate('https://www.qq.com', 'test', 100, 200);
// navigateUnderGivenCondition('https://www.speedtest.cn/', 100, 100);
// navigateUnderGivenCondition('http://www.webkaka.com/', 100, 100);
// navigate('http://localhost:8000/singleimage', 'traces', 100, 300);

localNavigate(process.argv[2]);