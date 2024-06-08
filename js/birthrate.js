// Set dimensions of the graph


// Create an SVG element to hold the stacked bar chart


// Load and parse the CSV file
d3.csv("data/birthrate.csv").then(data => {
    // Set up SVG canvas
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = 1100 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#birthrate-barchart-container").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);


    // Extract column names for ages
    const ages = data.columns.slice(2);

    // Normalize the data
    data.forEach(d => {
        let total = +d.total;
        d.total = total;
        ages.forEach(age => d[age] = +d[age] / total);
    });

    // Define scales
    const x = d3.scaleBand()
        .domain(data.map(d => d.year))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.total)])
        .nice()
        .range([height, 0]);

    const color = d3.scaleOrdinal()
        .domain(ages)
        .range(d3.schemeCategory10);

    // Stack the data
    const stack = d3.stack()
        .keys(ages)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetExpand);

    const series = stack(data);

    // Add x-axis
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    // Add y-axis
    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y));

    // Add the bars
    svg.selectAll(".serie")
        .data(series)
      .enter().append("g")
        .attr("class", "serie")
        .attr("fill", d => color(d.key))
      .selectAll("rect")
        .data(d => d)
      .enter().append("rect")
        .attr("x", d => x(d.data.year))
        .attr("y", d => y(d[1] * d.data.total))
        .attr("height", d => y(d[0] * d.data.total) - y(d[1] * d.data.total))
        .attr("width", x.bandwidth());

    // Add legend title
    svg.append("text")
        .attr("x", width - 18)
        .attr("y", -10)
        .attr("text-anchor", "end")
        .style("font-family", "poppins")
        .style("font-size", "12px")
        .style("text-decoration", "underline")
        .text("연령대");

    // Add legend
    const legend = svg.selectAll(".legend")
        .data(ages)
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(d => d);
}).catch(error => {
    console.error("Error loading CSV:", error);
});
