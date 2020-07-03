const fs = require('fs')
const { CrTrace, CrProcess, CrThread, CrEvent } = require('./model')

var rawData = JSON.parse(fs.readFileSync('../data/trace.json'))
var crTrace = new CrTrace()

rawData.traceEvents.forEach(e => {
    if (!(e.pid && e.tid)) return

    var process = crTrace.getProcessById(e.pid)
    if (!process) {
        process = new CrProcess(e.pid)
        crTrace.addProcess(process)
    }

    var thread = process.getThreadById(e.tid)
    if (!thread) {
        thread = new CrThread(e.tid)
        process.addThread(thread)
    }

    if (e.cat === '__metadata') {
        if (e.name === 'process_name') {
            process.setName(e.args.name)
        } else if (e.name === 'thread_name') {
            thread.setName(e.args.name)
        }
    } else {
        var event = new CrEvent(e.name, e.ts, e.dur || 0, e.args || e.args.data)
        thread.addEvent(event)
    }
})

let idlePeriods
crTrace.processes.forEach(p => {
    p.threads.forEach(t => {
        if (t.name === CrThread.ThreadNames.RendererMain) {
            t.buildEventTrees()
            idlePeriods = t.getIdlePeriods(5)
        } else if (t.name === CrThread.ThreadNames.Compositor) {
            frameEvents = t.filterByNames([
                CrEvent.FrameEvents.BeginFrame,
                CrEvent.FrameEvents.DrawFrame
            ])
        }
    })
})