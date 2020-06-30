const delay = require('delay')
const fs = require('fs')
const puppeteer = require('puppeteer')

async function navigate(url) {
    var paint_events = []
    var layer_change_events = []

    var browser = await puppeteer.launch()
    var page = await browser.newPage()
    var client = await page.target().createCDPSession()

    await client.send("LayerTree.enable")

    var count1 = 0,
        count2 = 0
    client.on('LayerTree.layerPainted', args => {
        count1 += 1
        args.ts = Date.now()
        paint_events.push(args)
    })

    client.on('LayerTree.layerTreeDidChange', args => {
        count2 += 1
        args.ts = Date.now()
        layer_change_events.push(args)
    })

    page.on('load', async() => {
        console.log('Page loaded...')
        console.log(`${count1} layerPainted events triggered.`)
        console.log(`${count2} layerTreeDidChange events triggered.`)
        await delay(1000)

        console.log('Closing headless browser...')
        await page.tracing.stop()
        await client.detach()
        await page.close()
        await browser.close()

        console.log('Saving trace data...')
        fs.writeFileSync('../data/layer_paint.json',
            JSON.stringify({ paint_events, layer_change_events, navigation_start }))
    })

    // setTimeout(async function () {
    //     await page.tracing.stop()
    //     await client.detach()
    //     await page.close()
    //     await browser.close()

    //     fs.writeFileSync('layer_paint.json',
    //         JSON.stringify({ paint_events, layer_change_events, navigation_start }))
    // }, 20000)

    console.log('Navigation starting...')
    var navigation_start = Date.now()

    await page.tracing.start({ path: '../data/trace.json' })
    await page.goto(url)
}

var url = process.argv[2]
navigate(url)