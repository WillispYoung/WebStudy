const puppeteer = require('puppeteer');
const delay = require('delay');
const fs = require('fs');

async function navigate() {
    var browser = await puppeteer.launch({ headless: false });
    var page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 900 });
    await page.setCacheEnabled(false);

    // var client = await page.target().createCDPSession();
    // await client.send("DOM.enable");
    // await client.send("DOMSnapshot.enable");

    page.on('load', async () => {
        // await delay(100);
        // var domss = await client.send('DOMSnapshot.captureSnapshot', { computedStyles: [] });
        // fs.writeFileSync('dom.json', JSON.stringify(domss));

        await delay(100);
        await page.tracing.stop();

        await delay(100);
        await page.close();
        await browser.close();

        await delay(100);
        var data = JSON.parse(fs.readFileSync('trace.json'));
        var ult = data.traceEvents.filter(e => e.name === 'UpdateLayoutTree').map(e => e.dur).reduce((a, b) => a + b);
        var layout = data.traceEvents.filter(e => e.name === 'Layout').map(e => e.dur).reduce((a, b) => a + b);
        console.log(Math.floor((ult + layout) / 1000));
    });

    await page.tracing.start({ path: 'trace.json' });

    await delay(100);
    // await page.goto('http://localhost:8000/www.jd.com.html');
    await page.goto('http://localhost:8000/www.jd.com-reduced.html');
}

navigate();
