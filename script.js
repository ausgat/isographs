const width = 600;
const height = 400;

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
        .text(d => d.id);

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

// Set up drag handling code
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

document.addEventListener("DOMContentLoaded", function(){
    // Generate example graphs
    const graph1 = new SimpleGraph(['V0', 'V1', 'V2', 'V3', 'V4'], [
        [0, 1],
        [0, 2],
        [1, 2],
        [2, 3],
        [1, 3],
        [3, 4]
    ], "G");

    const graph2 = new SimpleGraph(['U0', 'U1', 'U2', 'U3', 'U4'], [
        [0, 1],
        [1, 2],
        [2, 3],
        [1, 3],
        [3, 4],
        [1, 4]
    ], "H");

    // Create a d3 chart of graphs
    const simulation = createSimulation([graph1, graph2]);
    createDragHandlers(simulation, "g > circle");
});
