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
        for (var e of this.children) {
            e.sortChildrenByTime();
        }
    }

    // Render pipeline equals to function ScheduledActionSendBeginMainFrame.
    isRenderPipeline() {
        // return this.name === 'RunTask' &&
        //     this.children.length === 1 &&
        //     this.children[0].name === 'ThreadControllerImpl::RunTask' &&
        //     this.children[0].data.src_func === 'ScheduledActionSendBeginMainFrame';
        return this.name === 'RunTask' &&
            this.children.length === 1 &&
            this.children[0].children.length > 0 &&
            this.children[0].children[0].name === 'BeginMainThreadFrame';
    }

    // Timestamp and duration of each top-level task that causes visual changes. 
    // Used to compute in-task delay.
    visualChangeAttributes() {
        var res = [];
        if (CrEvent.RenderEvents.indexOf(this.name) !== -1)
            res.push(this.dur);
        else {
            for (var t of this.children) {
                var tmp = t.visualChangeAttributes();
                for (var v of tmp)
                    res.push(v);
            }
        }
        return res;
    }

    // Includes CrEvent.NetworkEvents. 
    // Only applicable for tasks that are not pipeline and does not cause visual changes.
    networkRelated() {
        if (CrEvent.NetworkEvents.indexOf(this.name) !== -1) return true;
        else {
            for (var t of this.children) {
                if (t.networkRelated())
                    return true;
            }
        }
        return false;
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
// Tasks in render pipeline.
CrEvent.Pipeline = [
    'UpdateLayoutTree',
    'Layout',
    'UpdateLayerTree',
    'Paint',
    'UpdateLayer',
    'CompositeLayers',
    'FireAnimationFrame',
    'FunctionCall',
    'EventDispatch',
    'HitTest'
];
// Frame related events. In Compositor thread.
CrEvent.FrameEvents = [
    'NeedsBeginFrameChanged',
    'RequestMainThreadFrame',
    'ActivateLayerTree',
    'BeginFrame',
    'DrawFrame'
];
// Network related events. In CrRendererMain thread.
CrEvent.NetworkEvents = [
    'ResourceSendRequest',
    'ResourceReceivedData',
    'ResourceReceiveResponse'
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
                    if (dependency.hasOwnProperty(i))
                        dependency[i].push(j);
                    else
                        dependency[i] = [j];

                    leaf_index.add(j);
                } else if (e2.includes(e1)) {
                    if (dependency.hasOwnProperty(j))
                        dependency[j].push(i);
                    else
                        dependency[j] = [i];

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

    // Compute the render delay from earliest visual change to a relative drawFrame event.
    // Render delay consists of: in-task delay, network delay, normal task delay.
    getRenderDelay() {
        if (!this.treeUpdated)
            this.buildEventTrees();
        var res = [];
        var inTaskDelay = 0;
        var networkDelay = 0;
        var normalDelay = 0;
        for (var t of this.trees) {
            if (t.isRenderPipeline()) {
                res.push({ inTaskDelay, networkDelay, normalDelay });
                inTaskDelay = 0;
                networkDelay = 0;
                normalDelay = 0;
            } else {
                var vc = t.visualChangeAttributes();
                if (vc.length > 0) {
                    var vc_dur = 0;
                    for (var v of vc)
                        vc_dur += v;
                    inTaskDelay += t.dur - vc_dur;
                } else if (t.networkRelated)
                    networkDelay += t.dur;
                else
                    normalDelay += t.dur;
            }
        }
        return res;
    }

    getPipelineTaskDuration(prop) {
        if (!this.treeUpdated) {
            this.buildEventTrees();
        }
        var nameToIndex = {};
        for (var i = 0; i < CrEvent.Pipeline.length; i++) {
            nameToIndex[CrEvent.Pipeline[i]] = i;
        }
        var taskDuration = [];
        for (var t of this.trees) {
            if (t.isRenderPipeline()) {
                var totalDuration = t.dur;
                var res = [];
                for (var i = 0; i < CrEvent.Pipeline.length; i++) {
                    res.push(0);
                }
                for (var e of t.children[0].children) {
                    if (e.dur > 0) {
                        var v = prop ? e.dur / totalDuration : e.dur;
                        var idx = nameToIndex[e.name];
                        res[idx] += v;
                    }
                }
                if (prop) {
                    for (var i = 0; i < res.length; i++) {
                        res[i] = parseFloat(res[i].toFixed(3));
                    }
                }
                taskDuration.push(res);
            }
        }
        return taskDuration;
    }
}

CrThread.ThreadNames = [
    'CrBrowserMain',
    'CrRendererMain',
    'CrGpuMain',
    'NetworkService',
    'ThreadPoolForegroundWorker',
    'Chrome_DevToolsHandlerThread',
    'Chrome_IOThread',
    'Compositor',
    'CompositorTileWorker',
    'VizCompositorThread'
];

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

    pipelineAnalysis() {
        var ptd = [];
        this.processes.forEach(p => {
            p.threads.forEach(t => {
                if (t.name === 'CrRendererMain') {
                    var res = t.getPipelineTaskDuration(false);
                    for (var arr of res) {
                        ptd.push(arr);
                    }
                }
            });
        });
        return ptd;
    }

    renderDelayAnalysis() {
        var rd = [];
        this.processes.forEach(p => {
            p.threads.forEach(t => {
                if (t.name === 'CrRendererMain') {
                    var res = t.getRenderDelay();
                    for (var arr of res) {
                        rd.push(arr);
                    }
                }
            });
        });
        return rd;
    }
}

CrTrace.parseTrace = function(tracefile) {
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
    CrThread,
    CrProcess,
    CrTrace
};