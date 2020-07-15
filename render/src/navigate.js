const EventEmitter = require('events');
const delay = require('delay');
const fs = require('fs');
const puppeteer = require('puppeteer');

process.on('uncaughtException', function(error) {
    console.log(`Uncaught exceptionL ${error.message}`);
});

process.on('unhandledRejection', function(error) {
    console.log(`Unhandled rejection: ${error.message}`);
});

async function navigate(url, label, notifier) {
    var browser = await puppeteer.launch({
        timeout: 10000,
        headless: false
    });
    var page = await browser.newPage();

    page.on('load', async() => {
        console.log('Page loaded.');
        await delay(1000);

        console.log(`Saving trace data to ../trace/${label}.json...`);
        await page.tracing.stop();

        console.log('Closing headless browser...\n');
        await page.close();
        await browser.close();

        await delay(1000);
        if (notifier)
            notifier.emit('next');
    });

    console.log(`Starting navigation to ${url}...`);

    await page.tracing.start({ path: `../traces/${label}.json` });
    await page.goto(url);
}

function main() {
    var domains = fs.readFileSync('domains.txt', { encoding: 'utf-8' }).split('\r\n');
    var startIndex = 0;
    var monitor = new EventEmitter();

    monitor.on('next', () => {
        startIndex += 1;
        if (startIndex < domains.length)
            navigate(domains[startIndex], `trace${startIndex}`, monitor);
    });

    navigate(domains[startIndex], `trace${startIndex}`, monitor);
}

var url = process.argv[2];
var label = url.split('/')[2];

navigate(url, label);