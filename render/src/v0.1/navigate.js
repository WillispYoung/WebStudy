const puppeteer = require('puppeteer');
const EventEmitter = require('events');
const delay = require('delay');
const readline = require("readline");

process.on('uncaughtException', function(error) {
    console.log(`Uncaught exceptionL ${error.message}`);
});

process.on('unhandledRejection', function(error) {
    console.log(`Unhandled rejection: ${error.message}`);
});

function formatDate() {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    let date = new Date();
    let month = monthNames[date.getMonth()];
    let day = String(date.getDate()).padStart(2, '0');

    let output = `${month}-${day}-${date.getHours()}-${date.getMinutes()}`;
    return output;
}

async function navigateCloseOnLoad(url) {
    var browser = await puppeteer.launch();
    var page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 900 });

    var client = await page.target().createCDPSession();
    await client.send("Network.enable");
    await client.send("Network.emulateNetworkConditions", {
        offline: false,
        latency: 50,
        downloadThroughput: 300 * 1024,
        uploadThroughput: 300 * 1024
    });

    var filename = `traces/${formatDate()}.json`;
    page.on('load', async() => {
        console.log('Page loaded.');
        await delay(500);

        console.log(`Saving trace data to ${filename}...`);
        await page.tracing.stop();

        console.log('Closing headless browser...\n');
        await client.detach();
        await page.close();
        await browser.close();
    });

    console.log(`Starting navigation to ${url}...`);

    await page.tracing.start({ path: `${filename}` });
    await page.goto(url);
}

function navigateUserPrompt(url) {
    var userInput = new EventEmitter();

    async function navigate() {
        var browser = await puppeteer.launch({ headless: false });
        var page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        userInput.on('close', async() => {
            console.log('Saving tracing data and closing browser...')

            await delay(1000);
            await page.tracing.stop();
            await page.close();
            await browser.close();

            console.log('Browser closed...');
        });

        var filename = `traces/${formatDate()}.json`;
        await page.tracing.start({ path: `${filename}` });
        await page.goto(url);
    }

    navigate();

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Type "stop" to stop navigation: ', function(_) {
        userInput.emit('close', {});
        rl.close();
    })
}

navigateCloseOnLoad('https://www.taobao.com');
// navigateCloseOnLoad('https://www.amazon.com/');
// navigateCloseOnLoad('https://www.ebay.com/');
// navigateCloseOnLoad('http://localhost:8000/taobao.com/')

// navigateUserPrompt('https://observablehq.com/@kerryrodden/sequences-sunburst');
// navigateUserPrompt('https://observablehq.com/@d3/index-chart');
// navigateUserPrompt('https://observablehq.com/@d3/brushable-scatterplot-matrix');
// navigateUserPrompt('https://observablehq.com/@d3/streamgraph-transitions');

// navigateUserPrompt('http://localhost:8000/image-layering/');

// navigateUserPrompt('http://localhost:8000/stacked-to-groups-bars/');