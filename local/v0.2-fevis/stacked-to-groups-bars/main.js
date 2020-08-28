// const d3 = require('d3');

// Returns an array of m psuedorandom, smoothly-varying non-negative numbers.
// Inspired by Lee Byron’s test data generator.
// http://leebyron.com/streamgraph/
function bumps(m) {
    const values = [];

    // Initialize with uniform random values in [0.1, 0.2).
    for (let i = 0; i < m; ++i) {
        values[i] = 0.1 + 0.1 * Math.random();
    }

    // Add five random bumps.
    for (let j = 0; j < 5; ++j) {
        const x = 1 / (0.1 + Math.random());
        const y = 2 * Math.random() - 0.5;
        const z = 10 / (0.1 + Math.random());
        for (let i = 0; i < m; i++) {
            const w = (i / m - y) * z;
            values[i] += x * Math.exp(-w * w);
        }
    }

    // Ensure all values are positive.
    for (let i = 0; i < m; ++i) {
        values[i] = Math.max(0, values[i]);
    }

    return values;
}

const margin = ({ top: 0, right: 0, bottom: 10, left: 0 });
const width = 600;
const height = 200;
const m = 58;
const n = 5;

xAxis = svg => svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0).tickFormat(() => ""));

xz = d3.range(m);

yz = d3.range(n).map(() => bumps(m));

y01z = d3.stack()
    .keys(d3.range(n))
    (d3.transpose(yz)) // stacked yz
    .map((data, i) => data.map(([y0, y1]) => [y0, y1, i]));

y1Max = d3.max(y01z, y => d3.max(y, d => d[1]));

yMax = d3.max(yz, y => d3.max(y));

z = d3.scaleSequential(d3.interpolateBlues)
    .domain([-0.5 * n, 1.5 * n]);

y = d3.scaleLinear()
    .domain([0, y1Max])
    .range([height - margin.bottom, margin.top]);

x = d3.scaleBand()
    .domain(xz)
    .rangeRound([margin.left, width - margin.right])
    .padding(0.08);

const svg = d3.select("body")
    .append('svg')
    .attr("viewBox", [0, 0, width, height]);

const rect = svg.selectAll("g")
    .data(y01z)
    .join("g")
    .attr("fill", (d, i) => z(i))
    .selectAll("rect")
    .data(d => d)
    .join("rect")
    .attr("x", (d, i) => x(i))
    .attr("y", height - margin.bottom)
    .attr("width", x.bandwidth())
    .attr("height", 0);

svg.append("g")
    .call(xAxis);

function transitionGrouped() {
    y.domain([0, yMax]);

    rect.transition()
        .duration(500)
        .delay((d, i) => i * 20)
        .attr("x", (d, i) => x(i) + x.bandwidth() / n * d[2])
        .attr("width", x.bandwidth() / n)
        .transition()
        .attr("y", d => y(d[1] - d[0]))
        .attr("height", d => y(0) - y(d[1] - d[0]));
}

function transitionStacked() {
    y.domain([0, y1Max]);

    rect.transition()
        .duration(500)
        .delay((d, i) => i * 20)
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .transition()
        .attr("x", (d, i) => x(i))
        .attr("width", x.bandwidth());
}

function update(layout) {
    if (layout === "stacked") transitionStacked();
    else transitionGrouped();
}

update('stacked');