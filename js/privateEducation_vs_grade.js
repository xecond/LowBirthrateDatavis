

// Load the CSV data
d3.csv("data/privateEducationVSgrade.csv").then(data => {
    showLineGraph(data);
}).catch(error => {
    console.error("Error loading data:", error);
});

function showLineGraph(data) {
    const width = 650;
    const height = 350;
    const margin = { top: 20, right: 140, bottom: 30, left: 40 };

    // Parse the data and convert strings to numbers
    data.forEach(d => {
        d.year = +d.year;
        for (let i = 1; i < Object.keys(d).length; i++) {
            const key = Object.keys(d)[i];
            d[key] = +d[key];
        }
    });

    // Extract keys (years) for line data
    const keys = Object.keys(data[0]).slice(1);

    const xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.year), d3.max(data, d => d.year)])
        .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d3.max(keys, key => d[key]))])
        .range([height - margin.bottom, margin.top]);

    // Create line function
    const line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.value));

    // Create SVG
    const svg = d3.select("#education-grade-chart-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Add lines
    keys.forEach((key, i) => {
        const path = svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", d3.schemeCategory10[i]) // Color each line
            .attr("stroke-width", 3) // Thicken the lines
            .attr("d", d => line(d.map(e => ({ year: e.year, value: e[key] }))));

        // Animate line drawing
        const lineLength = path.node().getTotalLength();
        path.attr("stroke-dasharray", lineLength + " " + lineLength)
            .attr("stroke-dashoffset", lineLength)
            .transition()
            .duration(2000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);
    });

    // Add X axis with larger font size
    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
        .selectAll("text")
        .style("font-size", "12px"); // Change font size here

    // Add Y axis with larger font size
    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .style("font-size", "12px"); // Change font size here

    // Add legend
    const legend = svg.append("g")
    .attr("transform", `translate(${width - margin.right + 20}, ${margin.top})`); // Adjust margin for legend

    // Create legend items
    const legendItems = legend.selectAll(".legend-item")
    .data(keys)
    .enter().append("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    // Add colored lines
    legendItems.append("line")
    .attr("x1", 0)
    .attr("x2", 18)
    .attr("y1", 9)
    .attr("y2", 9)
    .attr("stroke", (d, i) => d3.schemeCategory10[i]) // Match color to line
    .attr("stroke-width", 3); // Adjust line width if needed

    // Add legend text
    legendItems.append("text")
    .attr("x", 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .text(d => d)
    .style("fill", "black") // Set text color
    .style("font-size", "14px"); // Set font size

}
