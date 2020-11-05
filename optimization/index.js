const NODE_TYPE = ['Element', 'Attr', 'Text', 'CDATASection', 'EntityReference',
    'Entity', 'ProcessingInstruction', 'Comment', 'Document', 'DocumentType',
    'DocumentFragment', 'Notation'];

class CoordinateNode {
    constructor(type, name, value,) {
        this.type = type;       // Node type, integer.
        this.name = name;       // Node name, string.
        this.value = value;     // NodeValue | TextValue | InputValue, string.

        this.index = -1;            // Index in the node list.
        this.bounds = undefined;    // Post-layout coordinates, [x, y, w, h].
        this.innerNodes = [];       // Geographically inner nodes.
    }
}

function determineElementGenre(documents, strings) {
    var doc = documents[0];
    var inLayoutIndex = doc.layout.nodeIndex;

    // Allocate CoordinateNodes from DOM snapshot.
    function getString(idx) {
        if (idx < 0 || idx >= strings.length) return '';
        else return strings[idx];
    }

    var nodes = [];
    var pivots = [];
    for (var i = 0; i < inLayoutIndex.length; i++) {
        let name = getString(doc.nodes.nodeName[idx]);
        let type = NODE_TYPE[doc.nodes.nodeType[idx]];
        let value = getString(doc.nodes.nodeValue[idx]) |
            getString(doc.nodes.textValue[idx]) |
            getString(doc.nodes.inputValue[idx]);

        var n = new CoordinateNode(type, name, value);
        n.bounds = doc.layout.bounds[i];
        n.index = i;
        nodes.push(n);

        pivots.push([0, 0]);
    }

    // Discover direct coordinate coverage.
    function covers(n1, n2) {
        let b1 = n1.bounds;
        let b2 = n2.bounds;
        if (b1[0] <= b2[0] && b1[1] <= b2[1] &&
            b1[0] + b1[2] >= b2[0] + b2[2] &&
            b1[1] + b1[3] >= b2[1] + b2[3])
            return true;
        else
            return false;
    }

    var inclusion = [];
    for (var i = 0; i < inLayoutIndex.length; i++)
        includes.push([]);

    for (var i = 0; i < inLayoutIndex.length - 1; i++) {
        for (var j = i + 1; j < inLayoutIndex.length; j++) {
            if (covers(nodes[i], nodes[j]))
                inclusion[i].push(j);
            else if (covers(nodes[j], nodes[i]))
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

        for (var j of inclusion[i]) {
            nodes[i].innerNodes.push(nodes[j]);
            pivots[j] = nodes[i].bounds.slice(0, 2);
        }
    }

    // Determine same-genre relationship.
    var absoluteSimilarity = [];          // Default 0, True 1, False -1.
    var relativeSimilarity = [];          // Default 0, True 1, False -1.
    for (var i = 0; i < inLayoutIndex.length; i++) {
        var entry = [];
        for (var j = 0; j < inLayoutIndex.length; j++)
            entry.push(0);
        absoluteSimilarity.push(entry);
        relativeSimilarity.push(entry);
    }

    // 8px is the HTML's default margin.
    // Here we take half this margin as minimum offset.
    const MIN_OFFSET = 4;
    function closeCoordinates(list1, list2) {
        if (list1.length !== list2.length) return false;
        for (let i = 0; i < list1.length; i++) {
            if (Math.abs(list1[i] - list2[i]) > MIN_OFFSET)
                return false;
        }
        return true;
    }

    function similarSize(w1, h1, w2, h2) {
        let s1 = w1 * h1;
        let s2 = w2 * h2;
        return (s1 < s2 ? s1 / s2 : s2 / s1) >= 0.9;
    }

    // Two elements are ident1ified as of same genre when:
    // 1. they are displayed in a same row or column, and
    // 2. they have similar sizes, and
    // 3. they have similar inner structure, or
    // 4. they share another element that is of same genre (transitivity).

    // Determine the similarity between outer nodes.
    function getAbsoluteSimilarity(i, j) {
        if (absoluteSimilarity[i][j] !== 0) return absoluteSimilarity[i][j];

        // Transitivity.
        for (let k = 0; j < inLayoutIndex.length; k++) {
            if (k !== i && k !== j) {
                let v1 = getAbsoluteSimilarity(i, k);
                absoluteSimilarity[i][k] = v1;
                absoluteSimilarity[k][i] = v1;

                let v2 = getAbsoluteSimilarity(j, k);
                absoluteSimilarity[j][k] = v2;
                absoluteSimilarity[k][j] = v2;

                if (v1 === 1 && v2 === 1) return 1;
            }
        }

        // Direct comparison.
        let b1 = nodes[i].bounds;
        let b2 = nodes[j].bounds;
        if (similarSize(b1[2], b1[3], b2[2], b2[3]) &&
            (closeCoordinates([b1[1], b1[3]], [b2[1], b2[3]]) ||        // Same row.
                closeCoordinates([b1[0], b1[2]], [b2[0], b2[2]]))) {    // Same column.
            // Outer shapes are similar, then compares their inner structures.
            if (nodes[i].innerNodes.length !== nodes[j].innerNodes.length) return -1;
            if (nodes[i].innerNodes.length === 0) return 1;

            // Find a Bipartite matching relaitonship between i and j's inner nodes.
            let targetIndex = new Set();
            for (let k = 0; k < nodes[i].innerNodes.length; k++) targetIndex.add(k);

            for (let k = 0; k < nodes[i].innerNodes.length; k++) {
                let matchFound = false;
                for (let v of targetIndex) {
                    let i1 = nodes[i].innerNodes[k].index;
                    let i2 = nodes[j].innerNodes[v].index;
                    let rs = getRelativeSimilarity(i1, i2);
                    relativeSimilarity[i1][i2] = rs;
                    relativeSimilarity[i2][i1] = rs;

                    if (rs === 1) {
                        matchFound = true;
                        targetIndex.delete(v);
                        break;
                    }
                }
                if (!matchFound) return -1;
            }
            return 1;
        }
        else return -1;
    }

    // Determine the similarity between inner structures.
    function getRelativeSimilarity(i, j) {
        if (relativeSimilarity[i][j] !== 0) return relativeSimilarity[i][j];

        let b1 = [...nodes[i].bounds];
        b1[0] -= pivots[i][0];
        b1[1] -= pivots[i][1];

        let b2 = [...nodes[j].bounds];
        b2[0] -= pivots[j][0];
        b2[1] -= pivots[j][1];

        if (closeCoordinates(b1, b2)) {
            if (nodes[i].innerNodes.length !== nodes[j].innerNodes.length) return -1;
            if (nodes[i].innerNodes.length === 0) return 1;

            let targetIndex = new Set();
            for (let k = 0; k < nodes[i].innerNodes.length; k++) targetIndex.add(k);

            for (let k = 0; k < nodes[i].innerNodes.length; k++) {
                let matchFound = false;
                for (let v of targetIndex) {
                    let i1 = nodes[i].innerNodes[k].index;
                    let i2 = nodes[j].innerNodes[v].index;
                    let rs = getRelativeSimilarity(i1, i2);
                    relativeSimilarity[i1][i2] = rs;
                    relativeSimilarity[i2][i1] = rs;

                    if (rs === 1) {
                        matchFound = true;
                        targetIndex.delete(v);
                        break;
                    }
                }
                if (!matchFound) return -1;
            }
            return 1;
        }
        else return -1;
    }

    for (var i = 0; i < inLayoutIndex.length - 1; i++) {
        for (var j = i + 1; j < inLayoutIndex.length; j++) {
            let as = getAbsoluteSimilarity(i, j)
            absoluteSimilarity[i][j] = as;
            absoluteSimilarity[j][i] = as;
        }
    }
}