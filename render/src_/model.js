class Task {
    constructor(name, ts, dur, data) {
        this.name = name;
        this.ts = ts;
        this.dur = dur;
        this.data = data;

        this.children = [];
    }

    endtime() { return this.ts + this.dur; }
    includes(e) { return this.ts <= e.ts && this.endtime() >= e.endtime(); }


}