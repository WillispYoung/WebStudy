// Optimization difficulty: it's easy to get the DOM information from HTML files (as provided by browser),
// yet it's hard to map DOM locaiton to HTML code location (so that we know what codes should be removed).
// Moreover, code location is meaningless when DOM is changed (DOM nodes are added) with JavaScript (in 
// this case we need to locate the JavaScript code that is responsible, which is difficult). We propose to
// highlight what elements can be removed in the browser, using a simple extension.

class CoordinateNode {
    constructor(element, rect) {
        // Corresponding DOM element.
        this.element = element;

        // Post-layout coordinates.
        this.x = rect.x;
        this.y = rect.y;
        this.width = rect.width;
        this.height = rect.height;
        this.right = rect.right;
        this.bottom = rect.bottom;

        // Used in relative similarity.
        this.pivotX = 0;
        this.pivotY = 0;

        // Geographically inner nodes. Stores indexes.
        this.innerNodes = [];
    }
}

function determineElementSimilarity(nodes) {
    // Discover direct coordinate coverage.
    function covers(i, j) {
        return nodes[i].x <= nodes[j].x &&
            nodes[i].y <= nodes[j].y &&
            nodes[i].right >= nodes[j].right &&
            nodes[i].bottom >= nodes[j].bottom;
    }

    var inclusion = [];
    for (var i = 0; i < nodes.length; i++)
        inclusion.push([]);

    for (var i = 0; i < nodes.length - 1; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
            if (covers(i, j))
                inclusion[i].push(j);
            else if (covers(j, i))
                inclusion[j].push(i);
        }
    }

    for (var i in inclusion) {
        if (inclusion[i].length > 0) {
            let entry = [...inclusion[i]];
            entry.forEach(k => {
                inclusion[i] = inclusion[i].filter(v => !inclusion[k].includes(v));
            })
        }

        nodes[i].innerNodes = [...inclusion[i]];
        for (var j of inclusion[i]) {
            nodes[j].pivotX = nodes[i].x;
            nodes[j].pivotY = nodes[i].y;
        }
    }

    // Determine same-genre relationship.
    var absoluteSimilarity = [];          // Default 0, True 1, False -1.
    var relativeSimilarity = [];          // Default 0, True 1, False -1.
    for (var i = 0; i < nodes.length; i++) {
        var entry = [];
        for (var j = 0; j < nodes.length; j++)
            entry.push(0);
        absoluteSimilarity.push(entry);
        relativeSimilarity.push([...entry]);
    }

    // 8px is the HTML's default margin.
    // Here we take half this margin as minimum offset.
    const MIN_OFFSET = 4;
    function closeCoordinates(i, j, abs) {
        // Check absolutely close coordinates.
        if (abs) {
            // s1 = nodes[i].width * nodes[i].height;
            // s2 = nodes[j].width * nodes[j].height;
            // similarSize = (s1 > s2 ? s2 / s1 : s1 / s2) >= 0.9;
            sameRow = Math.abs(nodes[i].x - nodes[j].x) <= MIN_OFFSET && Math.abs(nodes[i].right - nodes[j].right) <= MIN_OFFSET;
            sameColumn = Math.abs(nodes[i].y - nodes[j].y) <= MIN_OFFSET && Math.abs(nodes[i].bottom - nodes[j].bottom) <= MIN_OFFSET;
            similarSize = Math.abs(nodes[i].width - nodes[j].width) <= MIN_OFFSET && Math.abs(nodes[i].height - nodes[j].height) <= MIN_OFFSET;
            return similarSize && (sameRow || sameColumn);
        }
        // Check relatively close coordinates.
        else {
            return Math.abs(nodes[i].width - nodes[j].width) <= MIN_OFFSET &&
                Math.abs(nodes[i].height - nodes[j].height) <= MIN_OFFSET &&
                Math.abs(nodes[i].x - nodes[i].pivotX - nodes[j].x + nodes[j].pivotX) <= MIN_OFFSET &&
                Math.abs(nodes[i].y - nodes[i].pivotY - nodes[j].y + nodes[j].pivotY) <= MIN_OFFSET;
        }
    }

    // Two elements are identified as of same genre when:
    // 1. they are displayed in a same row or column, and
    // 2. they have similar sizes, and
    // 3. they have similar inner structure, or
    // 4. they share another element that is of same genre (transitivity).

    // Determine the similarity between outer nodes.
    function getAbsoluteSimilarity(i, j) {
        if (absoluteSimilarity[i][j] !== 0) return absoluteSimilarity[i][j];

        if (closeCoordinates(i, j, true)) {
            // Outer shapes are similar, then compares their inner structures.
            if (nodes[i].innerNodes.length !== nodes[j].innerNodes.length) return -1;
            if (nodes[i].innerNodes.length === 0) return 1;

            let target = new Set(nodes[j].innerNodes);
            for (let i_ of nodes[i].innerNodes) {
                let matchFound = false;
                for (let j_ of target) {
                    let rs = getRelativeSimilarity(i_, j_);
                    relativeSimilarity[i_][j_] = rs;
                    relativeSimilarity[j_][i_] = rs;

                    if (rs === 1) {
                        matchFound = true;
                        target.delete(j_);
                        break;
                    }
                }
                if (!matchFound) return -1;
            }
            return 1;
        }
        else
            return -1;
    }

    // Determine the similarity between inner structures.
    function getRelativeSimilarity(i, j) {
        if (absoluteSimilarity[i][j] === 1) return 1;
        if (relativeSimilarity[i][j] !== 0) return relativeSimilarity[i][j];

        if (closeCoordinates(i, j, false)) {
            if (nodes[i].innerNodes.length !== nodes[j].innerNodes.length) return -1;
            if (nodes[i].innerNodes.length === 0) return 1;

            let target = new Set(nodes[j].innerNodes);
            for (let i_ of nodes[i].innerNodes) {
                matchFound = false;
                for (let j_ of target) {
                    let rs = getRelativeSimilarity(i_, j_);
                    relativeSimilarity[i_][j_] = rs;
                    relativeSimilarity[j_][i_] = rs;

                    if (rs === 1) {
                        matchFound = true;
                        target.delete(j_);
                        break;
                    }
                }
                if (!matchFound) return -1;
            }
            return 1;
        }
        else return -1;
    }

    count_ = 0;
    for (var i = 0; i < nodes.length - 1; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
            let as = getAbsoluteSimilarity(i, j)
            absoluteSimilarity[i][j] = as;
            absoluteSimilarity[j][i] = as;

            if (as === 1) count_ += 1;
        }
    }
    console.log(`Similarity computed: ${count_}.`);

    // Aggregate similarity information.
    var clusters = [];
    for (let i = 0; i < nodes.length - 1; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            if (absoluteSimilarity[i][j] === 1) {
                destinationFound = false;
                for (let cl of clusters) {
                    if (cl.includes(i) && !cl.includes(j)) {
                        destinationFound = true;
                        cl.push(j);
                        break;
                    }
                    else if (cl.includes(j) && !cl.includes(i)) {
                        destinationFound = true;
                        cl.push(i);
                        break;
                    }
                    else if (cl.includes(i) && cl.includes(j)) {
                        destinationFound = true;
                        break;
                    }
                }
                if (!destinationFound) {
                    let cl = [i, j];
                    clusters.push(cl);
                }
            }
        }
    }

    // Determine cluster containing relationship.
    // Contained clusters are removed from return value.
    // One cluster contains another cluster, only if:
    // Every element in the latter cluster is covered by one element in the former cluster.
    var top = new Set();        // Index of top-level clusters.
    for (let i = 0; i < clusters.length; i++) top.add(i);

    function containCluster(i, j) {
        for (let j_ of clusters[j]) {
            let topFound = false;
            for (let i_ of clusters[i]) {
                if (nodes[i_].x <= nodes[j_].x &&
                    nodes[i_].y <= nodes[j_].y &&
                    nodes[i_].spanX >= nodes[j_].spanX &&
                    nodes[i_].spanY >= nodes[j_].spanY) {
                    topFound = true;
                    break;
                }
            }
            if (!topFound) return false;
        }
        return true;
    }

    for (let i = 0; i < clusters.length - 1; i++) {
        if (!top.has(i)) continue;
        for (let j = i + 1; j < clusters.length; j++) {
            if (!top.has(j)) continue;
            if (containCluster(i, j)) top.delete(j);
            else if (containCluster(j, i)) {
                top.delete(i);
                break;
            }
        }
    }

    console.log(`Top-level clusters computed: ${top.size}/${clusters.length}.`);

    // Data reference: top --> clusters --> nodes.
    return { clusters, top };
}

var elements = document.body.getElementsByTagName('*');
var nodes = [];

for (let elem of elements) {
    let rect = elem.getBoundingClientRect();
    if (rect) {
        var cn = new CoordinateNode(elem, rect);
        nodes.push(cn);
    }
}

var sim = determineElementSimilarity(nodes);

// Reduce elements according to the overall distribution.
const ELEMENT_QUANTITY_TICKS = [3, 10, 29, 86, 252];
const CLUSTER_COVERAGE_TICKS = [0.0983, 0.0566, 0.326, 1.876, 10.802];
const COLOR_LEVEL = ['green', 'yellow', 'red'];

for (let cluster of sim.clusters) {
    var idx = -1;
    for (let i = 3; i > 0; i--) {
        if (cluster.length > ELEMENT_QUANTITY_TICKS[i]) {
            idx = i - 1;
            break;
        }
    }
    if (idx >= 0) {
        var toRemove = cluster.slice(ELEMENT_QUANTITY_TICKS[idx + 1]);
        for (let idx_ of toRemove) {
            nodes[idx_].element.style.border = `2px solid ${COLOR_LEVEL[idx]}`;
        }
    }
}
