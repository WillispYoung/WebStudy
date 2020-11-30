// Optimization difficulty: it's easy to get the DOM information from HTML files (as provided by browser),
// yet it's hard to map DOM locaiton to HTML code location (so that we know what codes should be removed).
// Moreover, code location is meaningless when DOM is changed (DOM nodes are added) with JavaScript (in 
// this case we need to locate the JavaScript code that is responsible, which is difficult). We propose to
// highlight what elements can be removed, using a simple browser extension.

// The following arrays are [mu-2*sigma, mu-sigma, mu, mu+sigma, mu+2*sigma].
// As mu and sigma refer to the mean value and standard error in normal distribution.
const QUANTITY = [3, 10, 29, 86, 252];
const COVERAGE = [0.0983, 0.0566, 0.326, 1.876, 10.802];

function determineDOMSimilarity(nodes) {

}

function determineCoordinateSimilarity(nodes) {

}

// Get all the elements in DOM.
var elements = document.body.getElementsByTagName('*');
