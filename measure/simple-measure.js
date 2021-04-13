const puppeteer = require('puppeteer');
const delay = require('delay');
const fs = require('fs');

process.on('uncaughtException', function () { });
process.on('unhandledRejection', function () { });

async function navigate() {
    var browser = await puppeteer.launch({ headless: false }); // args: ['--disable-web-security']
    var page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 900 });
    await page.setCacheEnabled(false);
    // await page.setExtraHTTPHeaders({ referer: 'https://www.pinterest.com/' });

    // var client = await page.target().createCDPSession();
    // await client.send("DOM.enable");
    // await client.send("DOMSnapshot.enable");

    // var client = await page.target().createCDPSession();
    // await client.send("Network.enable");
    // await client.send("Network.emulateNetworkConditions", {
    //     offline: false,
    //     latency: 100,
    //     downloadThroughput: 200 * 1024,
    //     uploadThroughput: 200 * 1024
    // });

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

        fs.unlinkSync('trace.json');
    });

    await page.tracing.start({ path: 'trace.json' });

    await delay(100);
    // await page.goto('https://www.jd.com')

    await page.goto('http://localhost:8000/jd-example-sltd.html')

    // await page.goto('http://localhost:8000/www.jd.com.html')
    // await page.goto('http://localhost:8000/www.jd.com-reduced.html')

    // await page.goto('http://localhost:8000/www.taobao.com.html')
    // await page.goto('http://localhost:8000/www.taobao.com-reduced.html')

    // await page.goto('http://localhost:8000/www.163.com.html')
    // await page.goto('http://localhost:8000/www.163.com-reduced.html')

    // await page.goto('http://localhost:8000/www.qq.com.html')
    // await page.goto('http://localhost:8000/www.qq.com-reduced.html')

    // await page.goto('http://localhost:8000/www.csdn.net.html')
    // await page.goto('http://localhost:8000/www.csdn.net-reduced.html')

    // await page.goto('http://localhost:8000/www.360.cn.html')
    // await page.goto('http://localhost:8000/www.360.cn-reduced.html')

    // await page.goto('http://localhost:8000/www.youtube.com.html')
    // await page.goto('http://localhost:8000/www.youtube.com-reduced.html')

    // await page.goto('http://localhost:8000/v.qq.com.html')
    // await page.goto('http://localhost:8000/v.qq.com-reduced.html')

    // await page.goto('http://localhost:8000/youku.com.html')
    // await page.goto('http://localhost:8000/youku.com-reduced.html')

    // await page.goto('http://localhost:8000/www.fandom.com.html')
    // await page.goto('http://localhost:8000/www.fandom.com-reduced.html')

    // await page.goto('https://www.vimeo.com');
}

navigate()
