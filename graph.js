class SimpleGraph {
    vertices = [];
    edges = [];
    group = "";

    constructor(vertices, edges, group) {
        this.vertices = vertices;
        this.edges = edges;
        this.group = group;
    }

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

    get links() {
        var ls = new Array();
        this.edges.forEach(edge => {
            ls.push({
                source: this.vertices[edge[0]],
                target: this.vertices[edge[1]]
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
        for (let e = 0; e < this.countEdges(); e++) {
            if (this.edges[e].includes(v))
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
     * @param {number} v
     * @returns {(number|Array)}
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
     * Check if this graph is isomorphic with another graph
     * @param {SimpleGraph} graph 
     * @returns {boolean}
     */
    isIsomorphicWith(graph) {
        return false;
    }
}
