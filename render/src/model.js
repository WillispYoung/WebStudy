class CrEvent {
    constructor(name, ts, dur, data) {
        this.name = name;
        this.ts = ts;
        this.dur = dur;
        this.data = data;

        this.children = [];
    }

    getEndtime() { return this.ts + this.dur; }

    includes(e) { return this.ts <= e.ts && this.getEndtime() >= e.getEndtime(); }

    sortChildrenByTime() {
        this.children.sort((a, b) => {
            return a.ts - b.ts;
        });
        for (var e of this.children)
            e.sortChildrenByTime();
    }

    isRenderingPipeline() {
        // A pipeline is indicated by following attributes:
        // "data": {
        //     "src_file": "../../cc/trees/proxy_impl.cc",
        //     "src_func": "ScheduledActionSendBeginMainFrame"
        // }
        return this.name === 'RunTask' &&
            this.children.length === 1 &&
            this.children[0].name === 'ThreadControllerImpl::RunTask' &&
            this.children[0].data.src_func === 'ScheduledActionSendBeginMainFrame';
    }

    // Value 1: earliest timestamp when visual change happens.
    // Value 2: the number of visual changes caused by this task. 
    // Note: a render-related task included by another render-related task 
    //       is not considered to contribute to value 2.
    findVisualChanges() {
        if (CrEvent.RenderEvents.indexOf(this.name) !== -1)
            return [this.ts, 1];

        var visualChangesOfChildren = [-1, 0];
        for (var e of this.children) {
            var vc = e.findVisualChanges();
            if (vc[0] !== -1)
                visualChangesOfChildren[0] = vc[0];

            visualChangesOfChildren[1] += vc[1];
        }

        return visualChangesOfChildren;
    }

    // Side effect: the duration of render tasks caused by non-render tasks.
    getTaskSideEffect(isTopLevel) {
        if (isTopLevel) {
            if (this.name === 'RunTask' &&
                this.children.length === 1 &&
                this.children[0].name === 'ThreadControllerImpl::RunTask') {

                // Value 1: duration of top-level task.
                // Value 2: render task duration.
                // Value 3: count of render tasks.
                var res = [];
                var root = this.children[0];
                for (var e of root.children) {
                    // When a task is not render-related, its side effect is accounted.
                    if (CrEvent.RenderEvents.indexOf(e.name) === -1 && e.dur > 0) {
                        var v = e.getTaskSideEffect(false);
                        if (v[0] > 0)
                            res.push([e.dur, v[0], v[1]]);
                    }
                }
                return res;
            } else
                return [];
        } else {
            // Value 1: render task duration.
            // Value 2: count of render tasks.
            if (CrEvent.RenderEvents.indexOf(this.name) !== -1)
                return [this.dur, 1];

            var res = [0, 0];
            for (var e of this.children) {
                var v = e.getTaskSideEffect(false);
                res[0] += v[0];
                res[1] += v[1];
            }

            return res;
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

    getSourceFunction() {
        if (this.name === 'RunTask' &&
            this.children.length === 1 &&
            this.children[0].name === 'ThreadControllerImpl::RunTask') {
            var node = this.children[0];
            return node.data && node.data.src_func;
        }
    }
}

// Rendering related events. In CrRendererMain thread.
CrEvent.RenderEvents = [
    // 'BeginMainThreadFrame',
    'ParseHTML',
    'ParseAuthorStyleSheet',
    'ScheduleStyleRecalculation',
    // 'EvaluateScript',
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
    'RequestMainThreadFrame',
    'ActivateLayerTree',
    'BeginFrame',
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
            t.sortChildrenByTime();

        dependency = undefined;
        leaf_index = undefined;

        this.treeUpdated = true;
    }

    sortByTime() {
        this.trees.sort((a, b) => {
            return a.ts - b.ts;
        });
        for (var t of this.trees)
            t.sortChildrenByTime();
    }
}

class CrThread extends CrEventSequence {
    constructor(id) {
        super();
        this.id = id;
        this.name = "";
    }

    setName(n) { this.name = n; }
    getName() { return this.name; }

    // RendererMain only.
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

    // RendererMain only.
    // Value 1: processing delay from the earliest visual change to its relative render pipeline.
    // Value 2: processing duration of render pipeline.
    // Value 3: the number of visual changes before a relative render pipeline.
    getVisualChangesProcessingAttributes() {
        if (!this.treeUpdated)
            this.buildEventTrees();

        var visualChanges = [];
        var renderPipelines = [];
        for (var t of this.trees) {
            if (t.isRenderingPipeline()) {
                renderPipelines.push([t.ts, t.dur]);
            } else {
                var v = t.findVisualChanges();
                if (v[0] !== -1) {
                    visualChanges.push(v);
                }
            }
        }

        var i = 0;
        var j = 0;
        var res = [];
        while (i < renderPipelines.length && j < visualChanges.length) {
            var v1 = renderPipelines[i];
            var v2 = visualChanges[j];
            if (v2[0] < v1[0]) {
                var count = 1;
                while (j < visualChanges.length) {
                    if (visualChanges[j][0] < v1[0]) {
                        count += visualChanges[j][1];
                        j += 1;
                    } else
                        break;
                }
                res.push([v1[0] - v2[0], v1[1], count]);
            } else {
                res.push([0, v1[1], 0]);
            }
            i += 1;
        }
        return res;
    }

    // RendererMain only.
    getAllTaskSideEffect() {
        if (!this.treeUpdated)
            this.buildEventTrees();

        var res = [];
        for (var t of this.trees) {
            var tse = t.getTaskSideEffect(true);
            for (var v of tse)
                res.push(v);
        }

        return res;
    }

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

    getAllSourceFunction() {
        var srcFunc = new Set();
        for (var t of this.trees) {
            srcFunc.add(t.getSourceFunction())
        }
        return srcFunc;
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

    setName(n) { this.name = n; }
    getName() { return this.name; }

    getThreads() { return this.threads; }
    getThreadById(id) { return this.id_to_thread[id]; }

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

    getProcesses() { return this.processes; }
    getProcessById(id) { return this.id_to_proc[id]; }

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