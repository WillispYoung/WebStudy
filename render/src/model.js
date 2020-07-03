class CrEvent {
    constructor(name, ts, dur, data) {
        this.name = name
        this.ts = ts
        this.dur = dur
        this.data = data

        this.children = []
    }

    includes(e) { return this.ts <= e.ts && this.ts + this.dur >= e.ts + e.dur }
    getEndTimestamp() { return this.ts + this.dur }

    isRenderRelated() {
        for (var n of CrEvent.RenderEvents) {
            if (this.name === n)
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

        for (var c of this.children) {
            var res_ = c.getIncludingEventNames()
            for (var n of res_)
                res.add(n)
            res_ = undefined
        }
        return res
    }

    sortByTime() {
        this.children.sort((a, b) => a.ts - b.ts)
        for (var e of this.children) e.sortByTime()
    }
}

// Events in RendererMain.
CrEvent.RenderEvents = {
    ParseHTML: 'ParseHTML',
    ParseCSS: 'ParseAuthorStyleSheet',
    EvaluateScript: 'EvaluateScript',
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

class CrEventSequence {
    constructor() {
        this.list = []
        this.trees = []
    }

    addEvent(e) { this.list.push(e) }

    buildEventTrees() {
        var dep = {}
        var leaf_index = new Set()

        // Discover `includes` dependency.
        var l = this.list.length
        for (var i = 0; i < l - 1; i++) {
            var e1 = this.list[i]
            for (var j = i + 1; j < l; j++) {
                var e2 = this.list[j]
                if (e1.includes(e2)) {
                    if (!dep.hasOwnProperty(i)) dep[i] = []
                    dep[i].push(j)
                    leaf_index.add(j)
                } else if (e2.includes(e1)) {
                    if (!dep.hasOwnProperty(j)) dep[j] = []
                    dep[j].push(i)
                    leaf_index.add(i)
                }
            }
        }

        // Remove multi-hop dependency.
        for (var k in dep) {
            var keys = [...dep[k]]
            keys.forEach(k_ => {
                if (dep.hasOwnProperty(k_)) {
                    var keys_ = dep[k_]
                    keys_.forEach(k__ => {
                        var idx = dep[k].indexOf(k__)
                        if (idx >= 0) dep[k].splice(idx, 1)
                    })
                }
            })
        }

        // Build trees based on dependency.
        for (var k in dep) {
            var idx = parseInt(k)
            var root = this.list[idx]
            dep[k].forEach(k_ => {
                root.children.push(this.list[k_])
            })
        }

        // Remove leaf nodes and sort events.
        this.trees = this.list.filter((_, i) => !leaf_index.has(i))
        this.trees.sort((a, b) => a.ts - b.ts)
        for (var t of this.trees) t.sortByTime()

        dep = undefined
        leaf_index = undefined
    }

    filterByNames(names) {
        var tmp = [...this.list]
        tmp.forEach(e => e.children = [])
        return tmp.filter(e => names.indexOf(e.name) !== -1)
    }

    filterByPeriod(start, end) {
        var tmp = [...this.tree]
        return tmp.filter(e => start <= e.ts <= end || start <= e.ts + e.dur <= end)
    }

    sortByTime() {
        this.trees.sort((a, b) => a.ts - b.ts)
        for (var t of this.trees) t.sortByTime()
    }

    getEventInitiator(e) {}

    // Idle: no events in given `limit` milliseconds.
    getIdlePeriods(limit) {
        var res = []
        var l = this.trees.length
        for (var i = 0; i < l - 1; i++) {
            var t1 = this.trees[i]
            var t2 = this.trees[i + 1]
            var gap = t2.ts - (t1.ts + t1.dur)
            gap = Math.round(gap / 1000)
            if (gap >= limit) res.push([t1.ts + t1.dur, t2.ts])
        }
        return res
    }

    getEventDuration() {
        var res = {}
        this.list.forEach(e => {
            if (!res.hasOwnProperty(e.name)) res[e.name] = 0
            res[e.name] += e.dur
        })
        var total = 0
        this.trees.forEach(t => total += t.dur)
        res.total = total
        return res
    }
}

class CrThread extends CrEventSequence {
    constructor(id) {
        super()
        this.id = id
        this.name = ""
    }

    setName(n) { this.name = n }
    getName() { return this.name }
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

class CrProcess {
    constructor(id) {
        this.id = id
        this.name = ""
        this.threads = []
        this.id_to_thread = {}
    }

    setName(n) { this.name = n }
    getName() { return this.name }

    getThreads() { return this.threads }
    getThreadById(id) { return this.id_to_thread[id] }

    addThread(t) {
        this.threads.push(t)
        this.id_to_thread[t.id] = t
    }
}

class CrTrace {
    constructor() {
        this.processes = []
        this.id_to_proc = {}
    }

    getProcesses() { return this.processes }
    getProcessById(id) { return this.id_to_proc[id] }

    addProcess(p) {
        this.processes.push(p)
        this.id_to_proc[p.id] = p
    }
}

module.exports = {
    CrEvent,
    CrEventSequence,
    CrThread,
    CrProcess,
    CrTrace
}