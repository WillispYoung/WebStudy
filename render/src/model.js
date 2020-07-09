class CrEvent {
    constructor(name, ts, dur, data) {
        this.name = name;
        this.ts = ts;
        this.dur = dur;
        this.data = data;

        this.children = [];
    }

    getEndtime() {
        return this.ts + this.dur;
    }

    includes(e) {
        return this.ts <= e.ts && this.getEndtime() >= e.getEndtime();
    }

    sortByTime() {
        this.children.sort((a, b) => {
            return a.ts - b.ts;
        });
        for (var e of this.children)
            e.sortByTime();
    }

    isRenderingPipeline() {
        if (this.name === 'RunTask' &&
            this.children.length === 1 &&
            this.children[0].name === 'ThreadControllerImpl::RunTask') {
            var root = this.children[0];
            var l = root.children.length;

            if (l)
                return root.children[0].name === 'BeginMainThreadFrame' &&
                    root.children[l - 1].name === 'CompositeLayers';
            else
                return false;
        }
    }

    getIncludingEventNames() {
        var res = new Set();
        if (this.name !== 'RunTask' && this.name !== 'ThreadControllerImpl::RunTask')
            res.add(this.name);

        for (var e of this.children) {
            var res_ = e.getIncludingEventNames();
            for (var n of res_)
                res.add(n);
        }

        return res;
    }
}

// Rendering related events. In CrRendererMain thread.
CrEvent.RenderEvents = [
    'BeginMainThreadFrame',
    'ParseHTML',
    'ParseAuthorStyleSheet',
    'ScheduleStyleRecalculation',
    'UpdateLayoutTree',
    'InvalidateLayout',
    'Layout',
    'UpdateLayer',
    'UpdateLayerTree',
    'Paint',
    'PaintImage',
    'Draw LazyPixelRef',
    'CompositeLayers'
];

// Frame related events. In Compositor thread.
CrEvent.FrameEvents = [
    'NeedsBeginFrameChanged',
    'BeginFrame',
    'RequestMainThreadFrame',
    'ActivateLayerTree',
    'DrawFrame'
];

class CrEventSequence {
    constructor() {
        this.list = [];
        this.trees = [];
        this.treeUpdated = false;
    }

    addEvent(e) {
        this.list.push(e);
        if (this.treeUpdated)
            this.treeUpdated = false;
    }

    buildEventTrees() {
        var dependency = {};
        var leaf_index = new Set();

        // Discover `includes` dependency. O(n^2)
        var l = this.list.length;
        for (var i = 0; i < l - 1; i++) {
            var e1 = this.list[i];
            for (var j = i + 1; j < l; j++) {
                var e2 = this.list[j];
                if (e1.includes(e2)) {
                    if (!dependency.hasOwnProperty(i))
                        dependency[i] = [];

                    dependency[i].push(j);
                    leaf_index.add(j);
                } else if (e2.includes(e1)) {
                    if (!dependency.hasOwnProperty(j))
                        dependency[j] = [];

                    dependency[j].push(i);
                    leaf_index.add(i);
                }
            }
        }

        // Remove multi-hop dependency.
        for (var k in dependency) {
            var keys = [...dependency[k]];
            keys.forEach(k_ => {
                if (dependency.hasOwnProperty(k_)) {
                    var keys_ = dependency[k_];
                    keys_.forEach(k__ => {
                        var idx = dependency[k].indexOf(k__);
                        if (idx >= 0)
                            dependency[k].splice(idx, 1);
                    })
                }
            })
        }

        // Build trees based on dependency.
        for (var k in dependency) {
            var idx = parseInt(k);
            var root = this.list[idx];
            dependency[k].forEach(k_ => {
                root.children.push(this.list[k_]);
            })
        }

        // Remove leaf nodes and sort events.
        this.trees = this.list.filter((_, i) => {
            return !leaf_index.has(i);
        });
        this.trees.sort((a, b) => {
            return a.ts - b.ts;
        });
        for (var t of this.trees)
            t.sortByTime();

        dependency = undefined;
        leaf_index = undefined;

        this.treeUpdated = true;
    }

    sortByTime() {
        this.trees.sort((a, b) => {
            return a.ts - b.ts;
        });
        for (var t of this.trees)
            t.sortByTime();
    }
}

class CrThread extends CrEventSequence {
    constructor(id) {
        super();
        this.id = id;
        this.name = "";
    }

    setName(n) {
        this.name = n;
    }
    getName() {
        return this.name;
    }

    findRenderPipelines() {
        if (!this.treeUpdated)
            this.buildEventTrees();

        var rpls = [];
        for (var t of this.trees) {
            if (t.isRenderingPipeline())
                rpls.push(t);
        }
        return rpls;
    }

    // For test.
    findRenderEventsFromNonPipelines() {
        if (!this.treeUpdated)
            this.buildEventTrees();

        var res = new Set();
        for (var t of this.trees) {
            if (!t.isRenderingPipeline()) {
                var eventNames = t.getIncludingEventNames();
                for (var en of eventNames) {
                    if (CrEvent.RenderEvents.indexOf(en) !== -1) {
                        res.add(en);
                    }
                }
            }
        }

        return res;
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
};

class CrProcess {
    constructor(id) {
        this.id = id;
        this.name = "";
        this.threads = [];
        this.id_to_thread = {};
    }

    setName(n) {
        this.name = n;
    }
    getName() {
        return this.name;
    }

    getThreads() {
        return this.threads;
    }
    getThreadById(id) {
        return this.id_to_thread[id];
    }

    addThread(t) {
        this.threads.push(t);
        this.id_to_thread[t.id] = t;
    }
}

class CrTrace {
    constructor() {
        this.processes = [];
        this.id_to_proc = {};
    }

    getProcesses() {
        return this.processes;
    }
    getProcessById(id) {
        return this.id_to_proc[id];
    }

    addProcess(p) {
        this.processes.push(p);
        this.id_to_proc[p.id] = p;
    }
}

function parseTrace(tracefile) {
    const fs = require('fs');
    const rawData = JSON.parse(fs.readFileSync(tracefile));

    var crTrace = new CrTrace();
    rawData.traceEvents.forEach(e => {
        if (!(e.pid && e.tid))
            return;

        var process = crTrace.getProcessById(e.pid);
        if (!process) {
            process = new CrProcess(e.pid);
            crTrace.addProcess(process);
        }

        var thread = process.getThreadById(e.tid);
        if (!thread) {
            thread = new CrThread(e.tid);
            process.addThread(thread);
        }

        if (e.cat === '__metadata') {
            if (e.name === 'process_name') {
                process.setName(e.args.name);
            } else if (e.name === 'thread_name') {
                thread.setName(e.args.name);
            }
        } else {
            var event = new CrEvent(e.name, e.ts, e.dur || 0, e.args || e.args.data);
            thread.addEvent(event);
        }
    })

    return crTrace;
}

module.exports = {
    CrEvent,
    CrEventSequence,
    CrThread,
    CrProcess,
    CrTrace,
    parseTrace,
};