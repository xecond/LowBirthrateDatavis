// Set dimensions of the graph
const margin = { top: 40, right: 30, bottom: 50, left: 50 };
const width = 960 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Create an SVG element to hold the line graph
const svg = d3.select("#lineGraph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Load and parse the CSV file
d3.csv("./data/dual_households.csv").then(data => {
    // Format the data
    const parseYear = d3.timeParse("%Y");
    data.forEach(d => {
        d.year = parseYear(d.year);
        d.dual = +d.dual;
    });

    // Define scales
    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.year))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([42, 47]) 
        .range([height, 0]);

    // Define line generator
    const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.dual));

    // Add x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(d3.timeYear.every(1)).tickFormat(d3.timeFormat("%Y")));

    // Add y-axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add the line path
    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line)
        .style("stroke", "steelblue");

    // Add title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Households with Dual Income");

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Year");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Dual Households (percentage)");
}).catch(error => {
    console.error("Error loading CSV:", error);
});
