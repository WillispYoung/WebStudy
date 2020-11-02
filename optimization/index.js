const NODE_TYPE = ['Element', 'Attr', 'Text', 'CDATASection', 'EntityReference',
    'Entity', 'ProcessingInstruction', 'Comment', 'Document', 'DocumentType',
    'DocumentFragment', 'Notation'];

class CoordinateNode {
    constructor(id, type, name, value,) {
        this.id = id;           // Integer. Weak info.
        this.type = type;       // Node type, integer. Very weak info.
        this.name = name;       // Node name, string. Weak info.
        this.value = value;     // NodeValue | TextValue | InputValue, string.

        this.innerNodes = [];   // Geographically inner nodes.
    }

    setBounds(bounds) {
        this.bounds = bounds;   // Post-layout coordinates, [x, y, w, h].
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
    for (var i = 0; i < inLayoutIndex.length; i++) {
        let idx = inLayoutIndex[i];
        let name = getString(doc.nodes.nodeName[idx]);
        let type = NODE_TYPE[doc.nodes.nodeType[idx]];
        let value = getString(doc.nodes.nodeValue[idx]) |
            getString(doc.nodes.textValue[idx]) |
            getString(doc.nodes.inputValue[idx]);

        var n = new CoordinateNode(idx, type, name, value);
        n.setBounds(doc.layout.bounds[i]);
        nodes.push(n);
    }

    // Discover direct coordinate inclusion.
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
            let item = [...inclusion[i]];
            item.forEach(k => {
                inclusion[i] = inclusion[i].filter(v => !inclusion[k].includes(v));
            })
        }

        for (var j of inclusion[i])
            nodes[i].innerNodes.push(nodes[j]);
    }

    // Determine same-genre relationship.
    var sameGenreMatrix = [];
    for (var i = 0; i < inLayoutIndex.length; i++) {
        var entry = [];
        for (var j = 0; j < inLayoutIndex.length; j++)
            entry.push(false);
        sameGenreMatrix.push(entry);
    }

    for (var i = 0; i < inLayoutIndex.length - 1; i++) {
        for (var j = i + 1; j < inLayoutIndex.length; j++) {
            // Two elements are identified as of same genre when:
            // 1. they are displayed in a same row or column, and
            // 2. they have similar sizes, and
            // 3. they have similar inner structure, or
            // 4. they share another element that is of same genre.
        }
    }
}