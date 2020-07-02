const fs = require('fs')

class CrTracce {
    constructor() {
        this.processes = []
        this.id_to_index = {} // pid -> index
    }

    getProcessById(id) {
        if (this.id_to_index.hasOwnProperty(id))
            return this.processes[this.id_to_index[id]]
        return undefined
    }

    getProcesses() {
        return this.processes
    }

    addProcess(p) {
        this.id_to_index[p.id] = this.processes.length
        this.processes.push(p)
    }
}

class CrProcess {
    constructor(id) {
        this.id = id
        this.name = ""
        this.threads = []
        this.id_to_index = {} // tid -> index
    }

    setName(n) {
        this.name = n
    }

    getThreadById(id) {
        if (this.id_to_index.hasOwnProperty(id))
            return this.threads[this.id_to_index[id]]
        return undefined
    }

    getThreadsByName(name) {
        return this.threads.filter(t => { return t.name === name })
    }

    getThreads() {
        return this.threads
    }

    getThreadNames() {
        var res = new Set()
        for (var i in this.threads) {
            res.add(this.threads[i].name)
        }
        return res
    }

    addThread(t) {
        this.id_to_index[t.id] = this.threads.length
        this.threads.push(t)
    }
}

class CrThread {
    constructor(id) {
        this.id = id
        this.name = ""
        this.eventList = []
        this.eventTree = []
    }

    setName(n) {
        this.name = n
    }

    addEvent(e) {
        this.eventList.push(e)
    }

    buildEventTree() {
        var dependency = {}
        var child_indexes = new Set()

        // Discover `includes` dependency.
        for (var i = 0; i < this.eventList.length; i++) {
            var e1 = this.eventList[i]
            for (var j = i + 1; j < this.eventList.length; j++) {
                var e2 = this.eventList[j]
                if (e1.includes(e2)) {
                    if (!dependency.hasOwnProperty(i))
                        dependency[i] = []
                    dependency[i].push(j)
                    child_indexes.add(j)
                } else if (e2.includes(e1)) {
                    if (!dependency.hasOwnProperty(j))
                        dependency[j] = []
                    dependency[j].push(i)
                    child_indexes.add(i)
                }
            }
        }

        // Remove multi-hop dependency.
        for (var k in dependency) {
            var keys = [...dependency[k]]
            keys.forEach(k_ => {
                if (dependency.hasOwnProperty(k_)) {
                    var keys_ = dependency[k_]
                    keys_.forEach(k__ => {
                        var idx = dependency[k].indexOf(k__)
                        if (idx >= 0) dependency[k].splice(idx, 1)
                    })
                }
            })
        }

        // Build trees based on dependency.
        for (var k in dependency) {
            var idx = parseInt(k)
            var root = this.eventList[idx]
            dependency[k].forEach(k_ => {
                root.children.push(this.eventList[k_])
            })
        }

        this.eventTree = this.eventList.filter((_, i) => !child_indexes.has(i))
        this.eventTree.sort((a, b) => a.ts - b.ts)
        for (var i in this.eventTree)
            this.eventTree[i].sortByTime()

        dependency = undefined
        child_indexes = undefined
    }

    getIncludingEventNames() {
        var res = new Set()
        for (var i in this.eventTree) {
            var res_ = this.eventTree[i].getIncludingEventNames()
            for (var n of res_)
                res.add(n)
        }
        return res
    }

    filterEventsByNames(nameList) {
        var tmp = [...this.eventList]
        tmp.forEach(e => e.children = undefined)
        return tmp.filter(e => nameList.indexOf(e.name) !== -1)
    }

    filterEventsByPeriod(start, end) {

    }

    getIdelPeriods() {
        var res = []

    }
}

CrThread.ThreadNames = {
    BrowserMain: 'CrBrowserMain',
    RendererMain: 'CrRendererMain',
    GPUMain: 'CrGpuMain',
    NetworkService: 'NetworkService',
    ForegroundWorker: 'ThreadPoolForegroundWorker',
    DevToolsHandler: 'Chrome_DevToolsHandlerThread',
    IOThread: 'Chrome_IOThread',
    Compositor: 'Compositor',
    CompositorTileWorker: 'CompositorTileWorker',
    VizCompositor: 'VizCompositorThread'
}

class CrEvent {
    constructor(cat, name, ts, dur, data) {
        this.cat = cat
        this.name = name
        this.ts = ts
        this.dur = dur
        this.data = data

        this.children = []
    }

    includes(e) {
        return this.ts <= e.ts && this.ts + this.dur >= e.ts + e.dur
    }

    isRenderRelated() {
        for (var k in CrEvent.RenderEvents) {
            if (this.name === CrEvent.RenderEvents[k])
                return true
        }
        var childrenRenderRelated = false
        for (var i in this.children) {
            if (this.children[i].isRenderRelated()) {
                childrenRenderRelated = true
                break
            }
        }
        return childrenRenderRelated
    }

    getIncludingEventNames() {
        var res = new Set()
        res.add(this.name)

        for (var i in this.children) {
            var res_ = this.children[i].getIncludingEventNames()
            for (var n of res_)
                res.add(n)
            res_ = undefined
        }
        return res
    }

    sortByTime() {
        this.children.sort((a, b) => { return a.ts - b.ts })
        for (var i in this.children) {
            this.children[i].sortByTime()
        }
    }
}

// Events in RendererMain.
CrEvent.RenderEvents = {
    ParseHTML: 'ParseHTML',
    ParseCSS: 'ParseAuthorStyleSheet',
    // EvaluateScript: 'EvaluateScript',
    StyleRecaculation: 'ScheduleStyleRecalculation',
    UpdateLayoutTree: 'UpdateLayoutTree',
    Layout: 'Layout',
    InvalidateLayout: 'InvalidateLayout',
    UpdateLayer: 'UpdateLayer',
    UpdateLayerTree: 'UpdateLayerTree',
    Paint: 'Paint',
    PaintImage: 'PaintImage',
    Composite: 'CompositeLayers',
    DrawLazyPixel: 'Draw LazyPixelRef',
    BeginMainThreadFrame: 'BeginMainThreadFrame'
}

// Events in Compositor.
CrEvent.FrameEvents = {
    NeedsBeginFrameChanged: 'NeedsBeginFrameChanged',
    BeginFrame: 'BeginFrame',
    RequestMainThreadFrame: 'RequestMainThreadFrame',
    ActivateLayerTree: 'ActivateLayerTree',
    DrawFrame: 'DrawFrame'
}

function modelTesting(traceFile) {
    var ct = new CrTracce()
    var rawData = JSON.parse(fs.readFileSync(traceFile))

    rawData.traceEvents.forEach(e => {
        var process = ct.getProcessById(e.pid)
        if (!process) {
            process = new CrProcess(e.pid)
            ct.addProcess(process)
        }

        var thread = process.getThreadById(e.tid)
        if (!thread) {
            thread = new CrThread(e.tid)
            process.addThread(thread)
        }

        switch (e.name) {
            case 'thread_name':
                thread.setName(e.args.name)
                break
            case 'process_name':
                process.setName(e.args.name)
                break
            default:
                if (e.cat !== '__metadata') {
                    var event = new CrEvent(e.cat,
                        e.name,
                        e.ts,
                        e.dur || 0,
                        e.args || e.args.data)
                    thread.addEvent(event)
                }
                break
        }
    })

    var bmtf = []
    var cl = []
    var bf = []
    var df = []

    ct.getProcesses().forEach(p => {
        p.getThreads().forEach(t => {
            // t.buildEventTree()

            if (t.name === CrThread.ThreadNames.RendererMain) {
                bmtf = t.filterEventsByNames([CrEvent.RenderEvents.BeginMainThreadFrame])
                cl = t.filterEventsByNames([CrEvent.RenderEvents.Composite])
            } else if (t.name === CrThread.ThreadNames.Compositor) {
                bf = t.filterEventsByNames([CrEvent.FrameEvents.BeginFrame])
                df = t.filterEventsByNames([CrEvent.FrameEvents.DrawFrame])
            }
        })
    })

    bmtf.sort((a, b) => a.ts - b.ts)
    cl.sort((a, b) => a.ts - b.ts)

    for (var i = 0; i < df.length - 1; i++) {
        console.log((df[i + 1].ts - df[i].ts) / 1000)
    }
}

modelTesting('../data/trace.json')