// Load and parse the CSV file
d3.csv("./data/members.csv").then(data => {
    // Set dimensions of the graph
    const margin = { top: 20, right: 60, bottom: 100, left: 80 };
    const width = 640 - margin.left - margin.right;
    const height = 420 - margin.top - margin.bottom;

    // Create an SVG element to hold the stacked area chart
    const svg = d3.select("#people-per-household-chart-container").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Extract column names for members
    const members = data.columns.slice(2);

    // Normalize the data
    data.forEach(d => {
        let total = 0;
        members.forEach(member => {
            d[member] = (+d[member] / +d.average); // Normalize as percentage of average
            total += d[member];
        });
        // Ensure the total percentages add up to 1 (100%)
        members.forEach(member => {
            d[member] = d[member] / total * d.average;
        });
    });

    // Define scales
    const x = d3.scaleBand()
        .domain(data.map(d => d.year))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => +d.average)]) // Use the average values for y-axis scale
        .range([height, 0]);

    const color = d3.scaleOrdinal()
        .domain(members)
        .range(d3.schemeCategory10);

    // Stack the data
    const stack = d3.stack()
        .keys(members)
        .offset(d3.stackOffsetNone); // Change the offset to create a stacked area chart

    const series = stack(data);

    // Define the area generator
    const area = d3.area()
        .x(d => x(d.data.year) + x.bandwidth() / 2)
        .y0(d => y(d[0]))
        .y1(d => y(d[1]));

    // Add x-axis
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    // Add y-axis
    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y));

    // Add the areas
    svg.selectAll(".layer")
        .data(series)
      .enter().append("path")
        .attr("class", "layer")
        .attr("d", area)
        .style("fill", d => color(d.key));

    // Add legend title
    svg.append("text")
        .attr("x", 20)
        .attr("y", height + 55)
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .style("text-decoration", "underline")
        .text("가구원수 (명)");

    // Add legend
    const legend = svg.selectAll(".legend")
        .data(members)
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${i * 50 + 110},${height+40})`);

    legend.append("rect")
        .attr("x", 0)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", 26)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(d => d);
}).catch(error => {
    console.error("Error loading CSV:", error);
});
