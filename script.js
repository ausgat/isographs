const width = 600;
const height = 400;

var graphA = null;
var graphB = null;

var simulation = null;
var isoFound = false;

/**
 * Print a string to the console in a p tag
 * @param {String} str String to print
 */
function println(str) {
    const console = document.getElementById("console");
    const msg = document.createElement("p");
    msg.innerHTML = str;
    console.appendChild(msg);
    console.scrollTop = console.scrollHeight;
}

/**
 * Create a d3-force simulation with the given graphs
 * @param {(SimpleGraph|Array)} graphs Graphs to generate
 * @returns Return a d3-force simulation object
 */
function createSimulation(graphs) {
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const nodes = graphs.map(g => g.nodes).flat();
    const links = graphs.map(g => g.links).flat();

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id)
            .distance(60))
        .force("charge", d3.forceManyBody()
                .strength(-200))
        .force("x", d3.forceX())
        .force("y", d3.forceY());

    const svg = d3.select("div#chart")
        .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", [-width / 2, -height / 2, width, height]);

    const link = svg.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
            .attr("stroke-width", "4");

    const node = svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
            .attr("r", 10)
            .attr("fill", d => color(d.group));

    const label = svg.append("g")
            .classed("labels", true)
            .attr("pointer-events", "none")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .text(d => d.id)
        .attr("alignment-baseline", "middle");

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
        label
            .attr("x", d => d.x)
            .attr("y", d => d.y);
    });

    return simulation;
}

/**
 * Set up drag handling code for a simulation
 * @param {*} The d3-force simulation
 * @param {string} HTML selector
 */
function createDragHandlers(simulation, selector) {
    d3.selectAll(selector).call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    function dragstarted(event) {
        if (!event.active)
            simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    function dragended(event) {
        if (!event.active)
            simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }
}

/**
 * Create an interactive adjacency matrix table with checkboxes
 * @param {number} cols Number of columns
 * @param {number} rows Number of rows
 * @param {string} tableName Name of the table
 * @param {string} prefix Prefix for the node names
 */
function createTable(cols, rows, tableName, prefix) {
    const table = document.getElementById(tableName);
    table.innerHTML = "";

    const thead = document.createElement("thead")
    table.appendChild(thead);
    const tbody = document.createElement("tbody");
    table.appendChild(tbody);
    
    for (var r = 0; r < rows + 1; r++) {
        const rowtr = document.createElement("tr");
        for (var c = 0; c < cols + 1; c++) {
            // Build the headers
            if (r == 0) {
                const header = document.createElement("th");
                header.setAttribute("scope", "col");
                if (c > 0) {
                    header.innerText = prefix + (c-1);
                } else {
                    header.innerText = "🔗";
                }
                rowtr.appendChild(header);
                thead.appendChild(rowtr);

            // Build the rows
            } else {
                if (c == 0) {
                    // Build the left-headers
                    const header = document.createElement("th");
                    header.setAttribute("scope", "row");
                    header.innerText = prefix + (r-1);
                    rowtr.appendChild(header);

                } else {
                    // Build the checkboxes
                    const cell = document.createElement("td");
                    const checkbox = document.createElement("input");
                    checkbox.setAttribute("type", "checkbox");

                    const name = prefix + (r-1) + "_" + prefix + (c-1);
                    const reverseName = prefix + (c-1) + "_" + prefix + (r-1);
                    checkbox.setAttribute("name", name);
                    checkbox.setAttribute("id", name);
                    if (document.getElementById(reverseName) == null)
                        checkbox.classList.add("linkbox");
                    if (r == c)
                        checkbox.disabled = true;

                    // Add an event listener for when the checkbox value is
                    // changed
                    checkbox.addEventListener("change", (ev) => {
                        const otherCheckbox =
                            document.getElementById(reverseName);
                        otherCheckbox.checked = ev.target.checked;
                    });

                    cell.appendChild(checkbox);
                    rowtr.appendChild(cell);
                }
                tbody.appendChild(rowtr);
            }
        }
    }
}

/**
 * Create the tables for the adjacency matrix checkboxes
 * @param {number} rowsAndCols Number of rows and columns
 */
function createTables(rowsAndCols) {
    const num = Number(rowsAndCols);
    createTable(num, num, "atable", "A");
    createTable(num, num, "btable", "B");
}

/**
 * Generate the graphs and simulation to go with it in d3.js
 */
function generateGraphs() {
    const num = Number(document.getElementById("vertnum").value);
    graphA = new SimpleGraph([], [], "A");
    graphB = new SimpleGraph([], [], "B");

    // Fill in the vertices
    for (let n = 0; n < num; n++) {
        graphA.vertices.push("A" + n);
        graphB.vertices.push("B" + n);
    }

    for (var checkbox of document.getElementsByClassName("linkbox")) {
        const [source, target] = checkbox.id.split("_");
        if (checkbox.checked) {
            if (source[0] == "A") {
                graphA.edges.push([source, target]);
            } else if (source[0] == "B") {
                graphB.edges.push([source, target]);
            }
        }
    }
    simulation = createSimulation([graphA, graphB]);
    createDragHandlers(simulation, "g > circle");
}

// Run this code when the page loads
document.addEventListener("DOMContentLoaded", function(){
    const vertNumCombo = document.getElementById("vertnum");
    
    // Create the initial tables
    createTables(Number(vertNumCombo.value));
    vertNumCombo.addEventListener("change", (ev) => {
        const num = Number(ev.target.value);
        createTables(num);
    })

    // Event handler for generate button
    const genButton = document.getElementById("generate");
    genButton.addEventListener("click", (ev) => {
        d3.select("svg").remove();
        generateGraphs();
        isoFound = false;
    });

    // Event handler for check isomorphism button
    const isoButton = document.getElementById("checkiso");
    isoButton.addEventListener("click", (ev) => {
        if (graphA && graphB) {
            const mapping = graphA.isomorphism(graphB);
            if (mapping != null) {
                var mapStrs = [];
                for (var [source, target] of mapping) {
                    mapStrs.push(source + " → " + target);
                }
                println("Graphs A and B are <b>isomorphic</b> with mapping: " +
                    mapStrs.join(", "));

                // Add new physics links
                if (simulation != null && !isoFound) {
                    const links = [];
                    for (var [source, target] of mapping) {
                        links.push({source: source, target: target});
                    }
                    simulation.force("link", d3.forceLink(links).id(d => d.id)
                            .distance(10))
                        .alpha(0.3).restart();
                    isoFound = true; // So we don't make too many links
                }
            } else {
                println("Graphs A and B are <b>not isomorphic</b>!");
            }
        }
    });

    println("Welcome to my little graph isomorphism tester!");
});
