// Optimization difficulty: it's easy to get the DOM information from HTML files (as provided by browser),
// yet it's hard to map DOM locaiton to HTML code location (so that we know what codes should be removed).
// Moreover, code location is meaningless when DOM is changed (DOM nodes are added) with JavaScript (in 
// this case we need to locate the JavaScript code that is responsible, which is difficult). We propose to
// highlight what elements can be removed, using a simple browser extension.

// The following arrays are [mu-2*sigma, mu-sigma, mu, mu+sigma, mu+2*sigma].
// As mu and sigma refer to the mean value and standard error in normal distribution.
// const QUANTITY = [3, 10, 29, 86, 252];
const QUANTITY = [3, 13, 50, 183, 670];
const COVERAGE = [0.0983, 0.0566, 0.326, 1.876, 10.802];

// Accessing an element's attribtues:
// 1. element.attributes is a dictionary-style object. It's not a list.
// 2. element.attributes.length is the number of attribtues declared in HTML.
// 3. element.attributes[i].name and element.attributes[i].value are name and value of the attribute.

// Accessing an element's coordinates:
// 1. element.getBoundingClientRect() returns a dictionary-style object. Denote it as BCR.
// 2. BCR contains the following keys: left, right, top, bottom, x, y.

function clusterElements() {
    // Get all the elements in DOM.
    var allElements = document.body.getElementsByTagName('*');
    var visibleElements = [];

    function isVisible(e) {
        return !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);
    }

    for (let e of allElements)
        if (isVisible(e))
            visibleElements.push(e);

    console.log('Number of visible elements:', visibleElements.length, '/', allElements.length, '.');

    allElements = undefined;

    // Homogeneity value: 0 unchecked, 1 true, -1 false.
    var homogeneity = [];
    for (let i = 0; i < visibleElements.length; i++) {
        let entry = [];
        for (let j = 0; j < visibleElements.length; j++)
            entry.push(0);
        homogeneity.push(entry);
    }

    const MIN_OFFSET = 4;
    function similarPosition(r1, r2) {
        return Math.abs(r1.width - r2.width) <= MIN_OFFSET &&
            Math.abs(r1.height - r2.height) <= MIN_OFFSET &&
            (Math.abs(r1.left - r2.left) <= MIN_OFFSET || Math.abs(r1.top - r2.top) <= MIN_OFFSET);
    }

    function similarComposition(n1, n2) {
        if (n1.tagName !== n2.tagName) return -1;

        let cn1 = n1.children;
        let cn2 = n2.children;

        if (cn1.length !== cn2.length) return -1;

        for (let idx = 0; idx < cn1.length; idx++) {
            if (!similarComposition(cn1[idx], cn2[idx])) return -1;
        }

        return 1;
    }

    var c1 = 0, c2 = 0;

    // External elements: similar size, same row / column.
    // Internal elements: recursively similar tag composition.
    function determineHomogeneity(i, j) {
        // Ignore comparison between parent and child nodes.
        if (visibleElements[i].isSameNode(visibleElements[j].parentElement) ||
            visibleElements[j].isSameNode(visibleElements[i].parentElement)) return -1;

        if (homogeneity[i][j] !== 0) return homogeneity[i][j];

        c1 += 1;

        let ri = visibleElements[i].getBoundingClientRect();
        let rj = visibleElements[j].getBoundingClientRect();

        if (similarPosition(ri, rj)) {
            // What about pure text or span nodes?
            let ci = visibleElements[i].children;
            let cj = visibleElements[j].children;

            if (ci.length !== cj.length) return -1;

            for (let idx = 0; idx < ci.length; idx++) {
                if (!similarComposition(ci[idx], cj[idx])) return -1;
            }

            return 1;
        } else
            return -1;
    }

    let start = Date.now()
    for (let i = 0; i < visibleElements.length - 1; i++) {
        for (let j = i + 1; j < visibleElements.length; j++) {
            c2 += 1;
            homogeneity[i][j] = determineHomogeneity(i, j);
            homogeneity[j][i] = homogeneity[i][j];
        }
    }
    let end = Date.now();

    console.log('Function execution:', c1, '/', c2, ',', end - start, 'ms.');

    start = Date.now();
    for (let i = 0; i < visibleElements.length - 1; i++) {
        for (let j = i + 1; j < visibleElements.length; j++) {
            if (homogeneity[i][j] !== 1) {
                for (let k = 0; k < visibleElements.length; k++) {
                    if (homogeneity[i][k] === 1 && homogeneity[j][k] === 1) {
                        homogeneity[i][j] = 1;
                        homogeneity[j][i] = 1;
                    }
                }
            }
        }
    }
    end = Date.now();

    console.log('Transitivity checking:', end - start, 'ms.');

    var simpleClusters = [];
    for (let i = 0; i < visibleElements.length - 1; i++) {
        for (let j = i + 1; j < visibleElements.length; j++) {
            if (homogeneity[i][j] === 1) {
                let targetFound = false;
                for (let cl of simpleClusters) {
                    if (cl.includes(i) && !cl.includes(j)) {
                        targetFound = true;
                        cl.push(j);
                        break;
                    }
                    else if (cl.includes(j) && !cl.includes(i)) {
                        targetFound = true;
                        cl.push(i);
                        break;
                    }
                    else if (cl.includes(i) && cl.includes(j)) {
                        targetFound = true;
                        break;
                    }
                }
                if (!targetFound) {
                    let cl = [i, j];
                    simpleClusters.push(cl);
                }
            }
        }
    }

    simpleClusters.sort((a, b) => b.length - a.length);

    console.log('Number of clusters:', simpleClusters.length, ', Maximum cluster size:', simpleClusters[0].length);

    if (simpleClusters.length > 0) {
        for (let idx of simpleClusters[0])
            visibleElements[idx].style.border = '3px solid red';
    }

    // Further divide clusters (span across multiple screens) into compact clusters.
    // DOES NOT SEEM NECESSARY AND MEANINGFUL!
    // const VIEWPORT_HEIGHT = window.innerHeight;

    // var compactClusters = [];
    // for (let sc of simpleClusters) {
    //     sc.sort((i, j) => visibleElements[i].getBoundingClientRect().top - visibleElements[j].getBoundingClientRect().top);

    //     let lastUpperBound = -1, sliceStart = 0;
    //     for (let i = 0; i < sc.length; i++) {
    //         let r = visibleElements[sc[i]].getBoundingClientRect();

    //         if (lastUpperBound === -1)
    //             lastUpperBound = r.top;
    //         else {
    //             if (r.top - lastUpperBound < VIEWPORT_HEIGHT / 2)
    //                 lastUpperBound = r.top;
    //             else {
    //                 compactClusters.push(sc.slice(sliceStart, i));

    //                 sliceStart = i;
    //                 lastUpperBound = r.top;
    //             }
    //         }
    //     }

    //     if (sc.length - sliceStart > 1)
    //         compactClusters.push(sc.slice(sliceStart));
    // }

    // compactClusters.sort((a, b) => b.length - a.length);

    // console.log('Number of clusters:', compactClusters.length, ', Maximum cluster size:', compactClusters[0].length, '.');

    // if (compactClusters.length > 0) {
    //     for (let idx of compactClusters[0]) {
    //         visibleElements[idx].style.border = '3px solid red';
    //     }
    // }
}

function clusterByClassName() {
    if (document.getElementById('resultPanel')) {
        document.getElementById('resultPanel').remove();
    }

    var allElements = document.body.getElementsByTagName('*');

    var allClassNames = [];
    var simpleClusters = [];

    function isVisible(e) {
        return !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);
    }

    // function isVisible(e) {
    //     return e.offsetWidth > 0 && e.offsetHeight > 0;
    // }

    for (let element of allElements) {
        if (isVisible(element)) {
            element.originalBackground = element.style.background;
            element.originalBorder = element.style.border;

            if (element.className.length > 0) {
                let cns = element.className.trim().split(/\s+/);
                for (let name of cns) {
                    let idx = allClassNames.indexOf(name);
                    if (idx >= 0) {
                        simpleClusters[idx].push(element);
                    } else {
                        allClassNames.push(name);
                        simpleClusters.push([element]);
                    }
                }
            } else {
                var cascadingClassName = element.tagName;
                var possibleClassedParent = element.parentElement;

                // Find first classed parent node until reach document.body.
                while (!possibleClassedParent.isSameNode(document.body)) {
                    if (possibleClassedParent.className.length > 0) {
                        let cns = possibleClassedParent.className.trim().split(/\s+/);
                        for (let name of cns) {
                            let fullname = name + ' ' + cascadingClassName;
                            let idx = allClassNames.indexOf(fullname);
                            if (idx >= 0) {
                                simpleClusters[idx].push(element);
                            } else {
                                allClassNames.push(fullname);
                                simpleClusters.push([element]);
                            }
                        }
                        break;
                    } else {
                        cascadingClassName = possibleClassedParent.tagName + ' ' + cascadingClassName;
                        possibleClassedParent = possibleClassedParent.parentElement;
                    }
                }
            }
        }
    }

    var stats = [];

    for (let i = 0; i < allClassNames.length; i++) {
        stats.push([i, allClassNames[i], simpleClusters[i].length]);
    }

    stats.sort((a, b) => b[2] - a[2]);      // Sort by element quantity.

    for (let entry of stats) {
        for (let i = 3; i > 0; i--) {
            if (entry[2] > QUANTITY[i]) {
                entry.push(QUANTITY[i]);
                break;
            }
        }
    }

    function makeDraggable(target) {
        var dragStartX = 0, dragStartY = 0;
        target.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            dragStartX = e.clientX;
            dragStartY = e.clientY;

            target.onmouseup = stopDragging;
            target.onmousemove = moveElement;
        }

        function moveElement(e) {
            e = e || window.event;
            e.preventDefault();
            target.style.left = (target.offsetLeft + e.clientX - dragStartX) + 'px';
            target.style.top = (target.offsetTop + e.clientY - dragStartY) + 'px';
            dragStartX = e.clientX;
            dragStartY = e.clientY;
        }

        function stopDragging() {
            target.onmouseup = null;
            target.onmousemove = null;
        }
    }

    var resultPanel = document.createElement('div');
    resultPanel.id = 'resultPanel';
    resultPanel.style.position = 'fixed';
    resultPanel.style.zIndex = '10';
    resultPanel.style.left = '20px';
    resultPanel.style.top = '20px';
    resultPanel.style.width = '300px';
    resultPanel.style.height = '240px';
    resultPanel.style.fontSize = '14px';
    resultPanel.style.fontFamily = 'Arial';
    resultPanel.style.background = '#99CCFF';
    resultPanel.style.border = '4px solid #6699FF';
    document.body.appendChild(resultPanel);

    var resultPanelTitle = document.createElement('p');
    resultPanelTitle.innerHTML = 'Cluster Result';
    // resultPanelTitle.style.height = '30px';
    resultPanelTitle.style.margin = '-0.5px';
    resultPanelTitle.style.paddingTop = '2px';
    resultPanelTitle.style.color = 'white';
    resultPanelTitle.style.fontSize = '20px';
    resultPanelTitle.style.fontWeight = 'bold';
    resultPanelTitle.style.textAlign = 'center';
    resultPanelTitle.style.background = 'steelblue';
    resultPanel.appendChild(resultPanelTitle);

    var statsList = document.createElement('ul');
    statsList.style.height = '200px';
    statsList.style.marginTop = '2px';
    statsList.style.overflowY = 'scroll';
    resultPanel.appendChild(statsList);

    var statsListTitle = document.createElement('li');
    statsListTitle.style.display = 'flex';
    statsListTitle.style.borderBottom = '2px solid #CC9966';
    statsList.appendChild(statsListTitle);

    var statsListClassName = document.createElement('P');
    statsListClassName.style.width = '180px';
    // statsListClassName.style.margin = '4px';
    statsListClassName.style.fontSize = '16px';
    statsListClassName.style.fontWeight = 'bold';
    statsListClassName.innerHTML = 'Class Name';
    statsListTitle.appendChild(statsListClassName);

    var statsListReduction = document.createElement('P');
    statsListReduction.style.width = '100px';
    // statsListReduction.style.margin = '4px';
    statsListReduction.style.fontSize = '16px';
    statsListReduction.style.fontWeight = 'bold';
    statsListReduction.innerHTML = 'Reduction';
    statsListTitle.appendChild(statsListReduction);

    var lastHighlightRadio = null;

    for (let entry of stats) {
        if (entry.length > 3) {
            var statsEntry = document.createElement('li');
            // statsEntry.setAttribute('clusterIndex', entry[0]);
            statsEntry.style.display = 'flex';
            statsEntry.style.margin = '2px';
            statsEntry.style.height = '24px';
            statsEntry.style.alignItems = 'center';
            statsList.appendChild(statsEntry);

            var p1 = document.createElement('p');
            p1.style.width = '180px';
            // p1.style.margin = '4px';
            p1.innerHTML = entry[1];
            statsEntry.appendChild(p1);

            var p2 = document.createElement('p');
            p2.style.width = '80px';
            // p2.style.margin = '4px';
            p2.innerHTML = `${entry[2] - entry[3]} / ${entry[2]}`;
            statsEntry.appendChild(p2);

            var radio = document.createElement('input');
            radio.setAttribute('type', 'radio');
            radio.setAttribute('clusterIndex', entry[0]);
            radio.style.marginTop = '-5px';
            // radio.style.verticalAlign = 'center';
            statsEntry.appendChild(radio);

            radio.onchange = function () {
                if (this.checked) {
                    if (lastHighlightRadio) {
                        lastHighlightRadio.checked = false;
                        var lastHighlightClusterIndex = lastHighlightRadio.getAttribute('clusterIndex');
                        for (let element of simpleClusters[lastHighlightClusterIndex]) {
                            element.style.background = element.originalBackground;
                            // element.style.border = element.originalBorder;
                        }
                    }

                    var nowHighlightClusterIndex = this.getAttribute('clusterIndex');
                    for (let element of simpleClusters[nowHighlightClusterIndex]) {
                        element.style.background = '#ff9999';
                        // element.style.border = '2px solid #ff9999';
                    }
                    lastHighlightRadio = this;
                }
            };
        }
    }

    makeDraggable(resultPanel);
}

chrome.runtime.onMessage.addListener(
    function (request) {
        switch (request.name) {
            case 'CLUSTER':
                setTimeout(clusterByClassName, 1000);
                break;

            case 'SAVEDOM':
                var file = new Blob([document.documentElement.outerHTML
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')]);
                    // .replace(/<!--.*-->/, '');
                var a = document.createElement('a'), url = URL.createObjectURL(file);
                a.href = url;
                a.download = `${window.location.hostname}.html`;
                document.body.appendChild(a);
                a.click();

                setTimeout(function () {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 100);

                break;
        }
    }
);
