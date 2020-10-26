const puppeteer = require('puppeteer');
const delay = require('delay');
const fs = require('fs');

async function navigate() {
    var browser = await puppeteer.launch({ headless: false });
    var page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 900 });
    await page.setCacheEnabled(false);

    page.on('load', async() => {
        await delay(100);
        await page.tracing.stop();

        await delay(100);
        await page.close();
        await browser.close();

        await delay(100);
        var data = JSON.parse(fs.readFileSync('trace.json'));
        var ult = data.traceEvents.filter(e => e.name === 'UpdateLayoutTree').map(e => e.dur).sort((a, b) => b - a);
        var layout = data.traceEvents.filter(e => e.name === 'Layout').map(e => e.dur).sort((a, b) => b - a);
        console.log(layout.slice(0, 5));
        console.log(ult.slice(0, 5));
    });

    await page.tracing.start({ path: 'trace.json' });

    await delay(100);
    await page.goto('http://localhost:8000');
}

navigate();