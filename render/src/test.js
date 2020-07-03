const fs = require('fs')
const {
    CrTrace,
    CrProcess,
    CrThread,
    CrEvent
} = require('./model')

const renderEventNames = Object.values(CrEvent.RenderEvents)

var files = fs.readdirSync('../data/')
var thread_running_durations = []
var start = Number.MAX_SAFE_INTEGER
var end = 0

for (var f of files) {
    var rawData = JSON.parse(fs.readFileSync('../data/' + f))
    var crTrace = new CrTrace()
    var trd = {}

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

    crTrace.processes.forEach(p => {
        p.threads.forEach(t => {
            t.buildEventTrees()
            trd[t.name] = t.getRunningDuration()

            start = Math.min(start, t.trees[0].ts)
            end = Math.max(end, t.trees[t.trees.length - 1].getEndTimestamp())
        })
    })

    for (var k in trd) {
        var v = trd[k] / (end - start)
        v = Number.parseFloat(v.toFixed(4))
        trd[k] = v

    }
    thread_running_durations.push(trd)

    rawData = undefined
    crTrace = undefined
}

fs.writeFileSync('running_duration.json', JSON.stringify({ res: thread_running_durations }))