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

        // Discover including dependency.
        for (var i = 0; i < this.eventList.length; i++) {
            var e1 = this.eventList[i]
            for (var j = i + 1; j < this.eventList.length; j++) {
                var e2 = this.eventList[j]
                if (e1.includes(e2)) {
                    if (!dependency.hasOwnProperty(i)) dependency[i] = []
                    dependency[i].push(j)
                    child_indexes.add(j)
                } else if (e2.includes(e1)) {
                    if (!dependency.hasOwnProperty(j)) dependency[j] = []
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

        // Update render_related attribute.
        this.eventList.forEach(e => {
            e.updateRenderRelated()
        })

        // Keep only top-level event nodes.
        this.eventTree = this.eventList.filter((_, i) => {
            return !child_indexes.has(i)
        })

        dependency = undefined
        child_indexes = undefined
    }

    getEventNames() {
        var res = new Set()
        for (var i in this.eventList) {
            res.add(this.eventList[i].name)
        }
        return res
    }

    getRenderPipelines() {
        var tmp = []
        var render_event_names = Object.keys(CrEvent.RenderEvents)
        var sorted_events = [...this.eventList]
            .sort((a, b) => {
                return a.ts - b.ts
            })
        sorted_events.forEach(e => {
            if (render_event_names.indexOf(e.name) !== -1)
                tmp.push(e.name)
            if (e.name === 'CompositeLayers') {
                console.log(tmp)
                tmp = []
            }
        })
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

        this.render_related = false
    }

    includes(e) {
        return this.ts <= e.ts && this.ts + this.dur >= e.ts + e.dur
    }
}

CrEvent.RenderEvents = {
    ParseHTML: 'ParseHTML',
    ParseCSS: 'ParseAuthorStyleSheet',
    UpdateLayoutTree: 'UpdateLayoutTree',
    Layout: 'Layout',
    UpdateLayer: 'UpdateLayer',
    UpdateLayerTree: 'UpdateLayerTree',
    Paint: 'Paint',
    PaintImage: 'PaintImage',
    Composite: 'CompositeLayers'
}

function modelTesting(traceFile) {
    var ct = new CrTracce()
    var rawData = JSON.parse(fs.readFileSync(traceFile))

    rawData.traceEvents.forEach(e => {
        var proc = ct.getProcessById(e.pid)
        if (!proc) {
            proc = new CrProcess(e.pid)
            ct.addProcess(proc)
        }

        var thread = proc.getThreadById(e.tid)
        if (!thread) {
            thread = new CrThread(e.tid)
            proc.addThread(thread)
        }

        switch (e.name) {
            case 'thread_name':
                thread.setName(e.args.name)
                break
            case 'process_name':
                proc.setName(e.args.name)
                break
            default:
                if (e.cat !== '__metadata') {
                    var event = new CrEvent(e.cat, e.name, e.ts,
                        e.dur || 0, e.args || e.args.data)
                    thread.addEvent(event)
                }
                break
        }
    })

    ct.getProcesses().forEach(p => {
        p.getThreads().forEach(t => {
            if (t.name === CrThread.ThreadNames.RendererMain)
                t.getRenderPipelines()
            t.buildEventTree()
        })
    })
}

modelTesting('../data/trace.json')