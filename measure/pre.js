const EventEmitter = require('events');
const puppeteer = require('puppeteer');
const delay = require('delay');
const fs = require('fs');

process.on('uncaughtException', function(error) {
    console.log(`Uncaught exception: ${error.message}`);
});

process.on('unhandledRejection', function(error) {
    console.log(`Unhandled rejection: ${error.message}`);
});

// URL start points.
var urls = fs.readFileSync('forum-domains.txt').toString().split('\r\n');
var extendedURLs = new Set(urls);
urls = Array.from(extendedURLs);

const ORIGINAL_LENGTH = urls.length;

var i = 0;
var monitor = new EventEmitter();

monitor.on('next', () => {
    if (i < ORIGINAL_LENGTH - 1) {
        i += 1;
        navigate(urls[i], monitor);
    } else {
        for (var s of urls) fs.appendFileSync('forum-domains-xtd.txt', s + '\n');
        process.exit();
    }
});

async function navigate(url) {
    console.log(i, urls.length);

    var browser = await puppeteer.launch({ headless: true });
    var page = await browser.newPage();

    await page.setViewport({ width: 1600, height: 900 });
    await page.setCacheEnabled(false);

    page.on('load', async() => {
        var links = await page.$$eval('a', as => as.map(a => a.href));
        links = Array.from(links);
        links = links.slice(0, 100);
        for (var l of links) {
            if (extendedURLs.has(l)) continue;
            else {
                extendedURLs.add(l);
                urls.push(l);
            }
        }

        await delay(200);
        await page.close();
        await browser.close();

        await delay(500);
        monitor.emit('next');
    });

    await page.goto(url);
}

navigate(urls[i]);