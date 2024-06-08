

// Load the CSV data
d3.csv("data/InflationRate.csv").then(data => {
    showLineGraph_inflation(data);
}).catch(error => {
    console.error("Error loading data:", error);
});

function showLineGraph_inflation(data) {
    const width = 400;
    const height = 300;
    const margin = { top: 40, right: 20, bottom: 60, left: 40 };

    // Define color scale
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Exclude the first column (Total Inflation) from categories
    const categories = Object.keys(data[0]).filter(d => d !== 'year');

    // Create SVG for each category
    categories.forEach((category, index) => {
        const svg = d3.select("#inflation-chart-container").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Define x scale
        const xScale = d3.scaleBand()
            .domain(data.map(d => d.year))
            .range([0, width - margin.left - margin.right])
            .padding(0.1);

        // Define y scale
        const yScale = d3.scaleLinear()
            .domain([80, 120])
            .range([height - margin.top - margin.bottom, 0]);

        // Define the area generator
        const area = d3.area()
            .x(d => xScale(d.year))
            .y0(yScale(100))  // Lower boundary of the area
            .y1(d => yScale(+d[category]));  // Upper boundary of the area

        // Draw the area
        svg.append("path")
            .datum(data)
            .attr("fill", colorScale(index))
            .attr("opacity", 0.3)  // Make the area transparent
            .attr("d", area);

        // Define the line generator
        const line = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(+d[category]));

        // Draw the line
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", colorScale(index)) // Assign unique color based on index
            .attr("stroke-width", 2)
            .attr("d", line);

        // Add x axis
        svg.append("g")
            .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        // Add y axis
        svg.append("g")
            .call(d3.axisLeft(yScale));

        // Add title
        svg.append("text")
            .attr("x", (width - margin.left - margin.right) / 2)
            .attr("y", -margin.top / 2)
            .attr("text-anchor", "middle")
            //.attr("color", "#70BF8A")
            .style("font-family", "poppins")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text(category);
    });
}
