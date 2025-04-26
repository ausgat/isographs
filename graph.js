/**
 * A class representing a simple graph
 */
class SimpleGraph {
    /**
     * Compute all possible permutations of an array
     * @param {Array} vs Array to permute
     * @returns {(Array|Array)} Array of arrays of each permutation
     */
    static permute(vs) {
        if (vs.length == 0) {
            return [[]];
        }
        const permutations = [];
        for (let i = 0; i < vs.length; i++) {
            var rest = [...vs.slice(0, i), ...vs.slice(i+1)];
            for (const perm of this.permute(rest)) {
                permutations.push([vs[i], ...perm]);
            }
        }
        return permutations;
    }

    /**
     * Create a Map by matching keys from one Array with values at the same
     * indices in another Array
     * @param {Array} keys An array of keys
     * @param {Array} values An array of values
     * @returns {Map}
     */
    static mapKeysToValues(keys, values) {
        const map = new Map();
        for (var i = 0; i < keys.length; i++) {
            map.set(keys[i], values[i]);
        }
        return map;
    }

    /**
     * Return every possible mapping of elements in one list to elements in
     * another
     * @param {Array} vs 
     * @param {Array} us 
     * @return {Array|Map}
     */
    static mappings(vs, us) {
        const ms = new Array();
        for (const perm of SimpleGraph.permute(vs)) {
            ms.push(SimpleGraph.mapKeysToValues(perm, us));
        }
        return ms;
    }

    /**
     * Check if every node in one array maps to any node in another
     * @param {Map} mapping The mapping to check
     * @param {Array} vs Nodes from first graph
     * @param {Array} us Nodes from second graph
     * @returns {boolean}
     */
    static allMapToAny(mapping, vs, us) {
        for (const v of vs) {
            if (!us.includes(mapping.get(v))) {
                return false;
            }
        }

        // If false was not returned above, then all v in vs map to something in
        // us
        return true;
    }

    /**
     * @type {Array} vertices The list of vertices (nodes) in the graph.
     */
    vertices = [];

    /**
     * @type {Array} edges The list of edges (connections) in the graph, where
     * each edge is represented as a pair of vertices.
     */
    edges = [];

    /**
     * @type {string} group The group or category the graph belongs to.
     */
    group = "";

    /**
     * Create a new SimpleGraph with vertices, edges, and graph group
     * @param {Array} vertices Vertices of the graph
     * @param {Array} edges Edges of the graph
     * @param {String} group Group the graph belongs to
     */
    constructor(vertices, edges, group) {
        this.vertices = vertices;
        this.edges = edges;
        this.group = group;
    }

    /**
     * Return vertices as nodes compatible with d3-force
     * @return {Array}
     */
    get nodes() {
        var ns = new Array();
        this.vertices.forEach(vert => {
            ns.push({
                id: vert,
                group: this.group
            });
        });
        return ns;
    }

    /**
     * Return edges as links compatible with d3-force
     * @return {Array}
     */
    get links() {
        var ls = new Array();
        this.edges.forEach(edge => {
            ls.push({
                source: edge[0],
                target: edge[1]
            });
        });
        return ls;
    }

    /**
     * Get the number of vertices in the graph
     * @returns {number}
     */
    countVertices() {
        return this.vertices.length;
    }

    /**
     * Get the number of edges in the graph
     * @returns {number}
     */
    countEdges() {
        return this.edges.length;
    }

    /**
     * Check the graph for validity
     * @returns {boolean}
     */
    isValid() {
        // Check for even number of vertices of odd degree
        var degreeSum = 0;
        for (let v = 0; v < this.countVertices(); v++) {
            degreeSum += this.degree(v);
        }
        console.log(degreeSum);
        if (degreeSum % 2 == 1)
            return false;

        // Check that handshaking theorem holds
        if (2 * this.countEdges() != degreeSum)
            return false;

        return true;
    }

    /**
     * Get the degree of a vertex
     * @param {number} v Index of the desired vertex
     * @returns {number}
     */
    degree(v) {
        var degreeCount = 0;
        for (var e of this.edges) {
            if (e.includes(v))
                degreeCount++;
        }
        return degreeCount;
    }

    /**
     * Check if two vertices are adjacent
     * @param {number} v The first vertex
     * @param {number} w The second vertex
     * @returns {boolean}
     */
    adjacent(v, w) {
        this.edges.forEach(e => {
            if (e.includes(v) && e.includes(w))
                return true;
        });
        return false;
    }

    /**
     * Get all of a vertex's neighbors
     * @param {*} v
     * @returns {Array}
     */
    neighbors(v) {
        var ns = Array();
        this.edges.forEach(e => {
            if (e[0] == v)
                ns.push(e[1]);
            else if (e[1] == v)
                ns.push(e[0])
        })
        return ns;
    }

    /**
     * Check for isomorphisms between two graphs and return the first one
     * @param {SimpleGraph} graph The other graph to check this one against
     * @returns The first mapping that proves there's an isomorphism
     */
    isomorphism(graph) {
        for (const mapping of SimpleGraph.mappings(this.vertices,
                graph.vertices)) {
            var allVertsMap = true;
            for (const [v, u] of mapping){
                const vNeighbors = this.neighbors(v);
                const uNeighbors = graph.neighbors(u);

                // Break the loop and go to the next mapping set unless the
                // number of neighbors match
                if (vNeighbors.length != uNeighbors.length) {
                    allVertsMap = false;
                    break;
                }
            
                // Check if all v's neighbors map to any of u's neighbors
                if (!SimpleGraph.allMapToAny(mapping, vNeighbors, uNeighbors)) {
                    allVertsMap = false;
                    break;
                }
            }

            // If all vertices map, we have a complete mapping, and the graphs
            // are isomorphic
            if (allVertsMap) {
                return mapping;
            }
        }
        
        // If we got here, no mapping matched
        return null;

    }

    /**
     * Check if this graph is isomorphic with another graph
     * @param {SimpleGraph} graph 
     * @returns {boolean}
     */
    isIsomorphicWith(graph) {
        const mapping = this.isomorphism(graph);
        if (mapping != null)
            return true;
        else
            return false;
    }
}

// Graph tests

const graphA1 = new SimpleGraph(
    ['A', 'B', 'C'],
    [['A', 'B'], ['B', 'C'], ['C', 'A']],
"A");

const graphB1 = new SimpleGraph(
    ['X', 'Y', 'Z'],
    [['X', 'Y'], ['Y', 'Z'], ['Z', 'X']],
"B");

console.assert(graphA1.isIsomorphicWith(graphB1),
    'Pair 1 should be isomorphic');

const graphA2 = new SimpleGraph(
    ['A', 'B', 'C', 'D'],
    [['A', 'B'], ['B', 'C'], ['C', 'D']],
"A");

const graphB2 = new SimpleGraph(
    ['W', 'X', 'Y', 'Z'],
    [['W', 'X'], ['X', 'Y'], ['Y', 'Z'], ['Z', 'W']],
"B");

console.assert(!graphA2.isIsomorphicWith(graphB2),
    'Pair 2 should not be isomorphic');

const graphA3 = new SimpleGraph(
    ['A', 'B', 'C', 'D'],
    [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A']],
"A");

const graphB3 = new SimpleGraph(
    ['W', 'X', 'Y', 'Z'],
    [['W', 'X'], ['X', 'Y'], ['Y', 'Z'], ['Z', 'W']],
"B");

console.assert(graphA3.isIsomorphicWith(graphB3),
    'Pair 3 should be isomorphic');

const graphA4 = new SimpleGraph(
    ['A', 'B', 'C', 'D', 'E'],
    [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'E']],
"A");

const graphB4 = new SimpleGraph(
    ['P', 'Q', 'R', 'S', 'T'],
    [['P', 'Q'], ['Q', 'R'], ['R', 'S'], ['S', 'T'], ['T', 'P']],
"B");

console.assert(!graphA4.isIsomorphicWith(graphB4),
    'Pair 4 should not be isomorphic');

const graphA5 = new SimpleGraph(
    ['A', 'B', 'C', 'D'],
    [['A', 'B'], ['A', 'C'], ['A', 'D']],
"A");

const graphB5 = new SimpleGraph(
    ['X', 'Y', 'Z', 'W'],
    [['X', 'Y'], ['X', 'Z'], ['X', 'W']],
"B");

console.assert(graphA5.isIsomorphicWith(graphB5),
    'Pair 5 should be isomorphic');

const graphA6 = new SimpleGraph(
    ['A', 'B', 'C'],
    [['A', 'B'], ['B', 'C']],
"A");

const graphB6 = new SimpleGraph(
    ['X', 'Y', 'Z'],
    [['X', 'Y'], ['Y', 'Z'], ['Z', 'X']],
"B");

console.assert(!graphA6.isIsomorphicWith(graphB6),
    'Pair 6 should not be isomorphic');
