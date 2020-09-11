const puppeteer = require('puppeteer');
const delay = require('delay');
const fs = require('fs');

process.on('uncaughtException', function (error) {
    console.log(`Uncaught exceptionL ${error.message}`);
});

process.on('unhandledRejection', function (error) {
    console.log(`Unhandled rejection: ${error.message}`);
});

function formatDate() {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let d = new Date();
    let day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${monthNames[d.getMonth()]}-${day}-${d.getHours()}-${d.getMinutes()}-${d.getSeconds()}`;
}

const latencyOptions = [50, 100, 150];     // ms
const bandwidthOptions = [300, 900, 1500]; // kB

async function navigate(url, label, networkCondition=8) {
    const computedStyles = ['background-image'];

    var browser = await puppeteer.launch();
    var page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 900 });
    await page.setCacheEnabled(false);

    var client = await page.target().createCDPSession();
    await client.send("DOM.enable");
    await client.send("DOMSnapshot.enable");
    await client.send("CSS.enable");
    await client.send("Network.enable");

    var latency = latencyOptions[parseInt(networkCondition / 3)];
    var bandwidth = bandwidthOptions[parseInt(networkCondition % 3)];
    await client.send("Network.emulateNetworkConditions", {
        offline: false,
        latency: latency,
        downloadThroughput: bandwidth * 1024,
        uploadThroughput: bandwidth * 1024
    });

    var cssCount = 0;
    client.on('CSS.styleSheetAdded', () => { cssCount += 1; });

    var date = formatDate();
    var trace = `trace/${label}-${latency}ms-${bandwidth}kB-${date}.json`;
    page.on('load', async () => {
        var end = Date.now();
        console.log(`Page loaded after ${end - start} ms...`);
        await delay(1000);

        console.log('Capturing DOM snapshot...');
        var domss = await client.send('DOMSnapshot.captureSnapshot', { computedStyles });
        // fs.writeFileSync('dom.json', JSON.stringify(domss));

        console.log('Capturing CSS rule usage...');
        var css = await client.send("CSS.stopRuleUsageTracking");
        // fs.writeFileSync('css.json', JSON.stringify(css));

        console.log(`Saving trace data to ${trace}...`);
        await page.tracing.stop();

        console.log('Closing headless browser...');
        await client.detach();
        await page.close();
        await browser.close();

        console.log('Merging trace, DOM snapshot and CSS usage...\n');
        var data = JSON.parse(fs.readFileSync(trace));
        data.documents = domss.documents;
        data.strings = domss.strings;
        data.ruleUsage = css.ruleUsage;
        data.cssCount = cssCount;
        fs.writeFileSync(trace, JSON.stringify(data));
    });

    console.log(`Starting navigation to ${url}...`);
    await client.send("CSS.startRuleUsageTracking");
    await page.tracing.start({ path: `${trace}` });

    var start = Date.now();
    await page.goto(url);
}


// E-Commerce:
// navigate('https://www.taobao.com', 'Taobao', 8);
// navigate('https://www.jd.com', 'JD', 8);
// navigate('https://www.suning.com/', 'Suning', 8);
// navigate('http://680.com/', '680', 8);
// navigate('http://www.dangdang.com/', 'Dangdang', 8);
// navigate('https://bj.meituan.com/', 'Meituan', 8);
// navigate('https://www.maigoo.com/', 'Maigoo', 8);
// navigate('https://cn.china.cn/', 'China', 8);
// navigate('https://www.gome.com.cn/', 'Gome', 8);
// navigate('https://www.vmall.com/', 'Huawei', 8);

// News:
// navigate('https://www.baidu.com', 'Baidu', 8);
// navigate('https://www.qq.com', 'QQ', 8);
// navigate('https://www.163.com', '163', 8);
// navigate('https://www.thepaper.cn/', 'Pengpai', 8);
// navigate('https://news.sina.com.cn/', 'Sina', 8);
// navigate('http://news.sohu.com/', 'Sohu', 8);
// navigate('http://news.ifeng.com/', 'Fenghuang', 8);
// navigate('http://www.xinhuanet.com/', 'Xinhua', 8);
// navigate('http://www.people.com.cn/', 'People', 8);
// navigate('https://news.cctv.com/', 'CCTV', 8);

// Others
// navigate('https://www.tmall.com/', 'Tmall', 8);
// navigate('https://www.360.cn/', '360', 8);
// navigate('https://www.csdn.net/', 'CSDN', 8);
// navigate('https://cn.bing.com/', 'Bing', 8);
// navigate('http://www.china.com.cn/', 'China-1', 8);
// navigate('http://www.tianya.cn/', 'Tianya', 8);
// navigate('https://www.apple.com/', 'Apple', 8);
// navigate('http://babytree.com/', 'Babytree', 8);
// navigate('https://www.mama.cn/', 'Mama');
// navigate('https://www.sogou.com/', 'Sogou');
// navigate('https://www.msn.cn/zh-cn', 'MSN');
// navigate('https://www.yy.com/', 'YY');
// navigate('https://www.linkedin.com/', 'Linkedin');
// navigate('https://www.huanqiu.com/', 'Huanqiu');
// navigate('https://www.bilibili.com/', 'Bilibili');
// navigate('https://www.cnblogs.com/', 'CNBlogs');