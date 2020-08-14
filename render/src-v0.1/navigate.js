const puppeteer = require('puppeteer');
const delay = require('delay');

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

async function navigate(url) {
    var browser = await puppeteer.launch();
    var page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 900 });

    var filename = `traces/${formatDate()}.json`;
    page.on('load', async() => {
        console.log('Page loaded.');
        await delay(3000);

        console.log(`Saving trace data to ${filename}...`);
        await page.tracing.stop();

        console.log('Closing headless browser...\n');
        await page.close();
        await browser.close();
    });

    console.log(`Starting navigation to ${url}...`);

    await page.tracing.start({ path: `${filename}` });
    await page.goto(url);
}

navigate('http://localhost:8000/webworker/');