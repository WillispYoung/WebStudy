const MainThreadDurationalTasks = [
    'ParseHTML',
    'ParseAuthorStyleSheet',
    'EvaluateScript',
    'UpdateLayoutTree',
    'Layout',
    'UpdateLayer',
    'UpdateLayerTree',
    'Paint',
    'CompositeLayers'
];

const MainThreadInstantTasks = [
    "InvalidateLayout",
    "ScheduleStyleRecalculation"
];

const ThreadNames = [
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

class Task {
    constructor(name, ts, dur, data) {
        this.name = name;
        this.ts = ts;
        this.dur = dur;
        this.data = data;

        this.children = [];
    }

    endtime() { return this.ts + this.dur; }
    includes(e) { return this.ts < e.ts && this.endtime() > e.endtime(); }

    sort() {
        this.children.sort((a, b) => a.ts - b.ts);
        this.children.map(c => c.sort());
    }

    beginMainThreadFrame() {
        return this.children.length > 0 &&
            this.children[0].children.length > 0 &&
            this.children[0].children[0].name === 'BeginMainThreadFrame';
    }

    getTaskDuration() {
        var ctd = [];
        for (var i = 0; i < MainThreadDurationalTasks.length; i++) ctd.push(0);

        if (this.children.length > 0) {
            for (let c of this.children) {
                let td_ = c.getTaskDuration();
                for (var i = 0; i < td_.length; i++)
                    ctd[i] += td_[i];
            }
        }

        let idx = MainThreadDurationalTasks.indexOf(this.name);
        if (idx >= 0) {
            ctd[idx] = 0;
            let sum = ctd.reduce((a, b) => a + b);
            ctd[idx] = this.dur - sum;
        }

        return ctd;
    }
}

class Thread {
    constructor(id) {
        this.id = id;
        this.name = "";

        this.list = [];
        this.trees = [];
    }

    buildTaskTrees() {
        var dependency = [];
        var leafNodes = new Set();
        var listLength = this.list.length;

        for (var i = 0; i < listLength; i++)
            dependency.push([]);

        // Uncover dependency.
        for (var i = 0; i < listLength - 1; i++) {
            let t1 = this.list[i];
            for (var j = i + 1; j < listLength; j++) {
                let t2 = this.list[j];
                if (t1.includes(t2)) {
                    dependency[i].push(j);
                    leafNodes.add(j);
                } else if (t2.includes(t1)) {
                    dependency[j].push(i);
                    leafNodes.add(i);
                }
            }
        }
        // Remove multi-hop dependency.
        for (var i in dependency) {
            let inclusion = [...dependency[i]];
            inclusion.forEach(k => {
                dependency[i] = dependency[i].filter(v => !dependency[k].includes(v));
            });
        }
        // Build task trees.
        var description = new Set();
        for (var i in dependency) {
            for (var j of dependency[i]) {
                if (MainThreadDurationalTasks.indexOf(this.list[i].name) !== -1)
                    description.add(`${this.list[i].name}->${this.list[j].name}`);
                this.list[i].children.push(this.list[j]);
            }
        }
        for (var i in this.list) {
            if (!leafNodes.has(i))
                this.trees.push(this.list[i]);
        }

        dependency = undefined;
        leafNodes = undefined;

        this.sortTrees();

        const fs = require('fs');
        description = Array.from(description);
        description.sort();
        fs.writeFileSync('dependency.json', JSON.stringify({ description }));
    }

    sortTrees() {
        this.trees.sort((a, b) => a.ts - b.ts);
        this.trees.map(t => t.sort());
    }
}

class Process {
    constructor(id) {
        this.id = id;
        this.name = "";

        this.threads = [];
        this.id_to_thread = {};
    }

    addThread(t) {
        this.threads.push(t);
        this.id_to_thread[t.id] = t;
    }
}

class Trace {
    constructor() {
        this.processes = [];
        this.id_to_proc = {};
    }

    addProcess(p) {
        this.processes.push(p);
        this.id_to_proc[p.id] = p;
    }

    saveRendererTaskTrees() {
        const fs = require('fs');
        var count = 0;
        this.processes.forEach(p => {
            p.threads.forEach(t => {
                if (t.name === 'CrRendererMain') {
                    count += 1;
                    t.buildTaskTrees();
                    fs.writeFileSync(`render-trees-${count}.json`, JSON.stringify({ trees: t.trees }));
                }
            });
        });
    }

    taskDurationBeforeFrameUpdate() {
        var res = [];
        this.processes.forEach(p => {
            p.threads.forEach(t => {
                if (t.name === 'CrRendererMain') {
                    t.buildTaskTrees();

                    var td = [];
                    for (var i = 0; i < MainThreadDurationalTasks.length; i++) td.push(0);
                    for (var tree of t.trees) {
                        let td_ = tree.getTaskDuration();
                        for (var i in td_) td[i] += td_[i];
                        if (tree.beginMainThreadFrame()) {
                            res.push(td);
                            td = [];
                            for (var i = 0; i < MainThreadDurationalTasks.length; i++) td.push(0);
                        }
                    }
                }
            });
        });
        return res;
    }
}

Trace.parseTrace = function(tracefile) {
    const fs = require('fs');
    const rawData = JSON.parse(fs.readFileSync(tracefile));

    var trace = new Trace();
    rawData.traceEvents.forEach(e => {
        if (!(e.pid && e.tid))
            return;

        var process = trace.id_to_proc[e.pid];
        if (!process) {
            process = new Process(e.pid);
            trace.addProcess(process);
        }

        var thread = process.id_to_thread[e.tid];
        if (!thread) {
            thread = new Thread(e.tid);
            process.addThread(thread);
        }

        if (e.cat === '__metadata') {
            if (e.name === 'process_name') {
                process.name = e.args.name;
            } else if (e.name === 'thread_name') {
                thread.name = e.args.name;
            }
        } else {
            var task = new Task(e.name, e.ts, e.dur || 0, e.args || e.args.data);
            thread.list.push(task);
        }
    });

    return trace;
}

module.exports = Trace;