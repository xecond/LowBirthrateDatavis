// Function to create a bar chart with a line graph for birth rates
function createBarLineChart(data, xKey, yKey, yKeyLabel, divId) {

    // Set up the SVG canvas dimensions
    const margin = { top: 60, right: 70, bottom: 120, left: 50 };
    const width = 550 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    let sortOrder = true; // Variable to track sort order

    const svg = d3.select(divId)
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "parental-leave-tooltip")
        .style("opacity", 0);

    // X-axis
    let x = d3.scaleBand()
        .domain(data.map(d => d[xKey]))
        .range([0, width])
        .padding(0.1);

    const xAxis = svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .attr("class", "x-axis")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    // Y-axis for bar chart
    const y0 = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[yKey])])
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y0));

    // Bars
    const bars = svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d[xKey]))
        .attr("y", d => y0(d[yKey]))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y0(d[yKey]))
        .style("fill", d => d[xKey] === "Korea" ? "purple" : "blue")
        .on("mouseover", function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`${xKey}: ${d[xKey]}<br>${yKeyLabel}: ${d[yKey]}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .on("click", function() {
            sortOrder = !sortOrder;
            sortBars();
        });

    // Y-axis for line chart (Birth Rate)
    const y1 = d3.scaleLinear()
        .domain([0, d3.max(data, d => d["birthrate"])])
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(${width}, 0)`)
        .call(d3.axisRight(y1).ticks(5).tickFormat(d3.format(".1f")));

    // Line
    let line = d3.line()
        .x(d => x(d[xKey]) + x.bandwidth() / 2)
        .y(d => y1(d["birthrate"]));

    const linePath = svg.append("path")
        .datum(data.filter(d => !isNaN(d["birthrate"]))) // Filter out invalid data
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Add dots on the line chart
    const dots = svg.selectAll("dot")
        .data(data.filter(d => !isNaN(d["birthrate"])))
        .enter()
        .append("circle")
        .attr("cx", d => x(d[xKey]) + x.bandwidth() / 2)
        .attr("cy", d => y1(d["birthrate"]))
        .attr("r", 3)
        .attr("fill", "red")
        .on("mouseover", function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`${xKey}: ${d[xKey]}<br>Birth Rate: ${d["birthrate"]}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Labels for Birth Rate
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", width + margin.right - 40) // Move left to ensure it is not cut off
        .attr("x", -height / 2)
        .attr("dy", "1em")
        .attr("text-anchor", "middle")
        .text("Birth Rate");

    // Labels for the X-axis
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text(yKeyLabel);

    // Function to sort bars
    function sortBars() {
        const sortedData = data.sort((a, b) => sortOrder ? d3.ascending(a[yKey], b[yKey]) : d3.descending(a[yKey], b[yKey]));
        x.domain(sortedData.map(d => d[xKey]));

        svg.selectAll(".bar")
            .transition()
            .duration(1000)
            .attr("x", d => x(d[xKey]));

        svg.selectAll(".x-axis")
            .transition()
            .duration(1000)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        svg.selectAll("circle")
            .data(sortedData.filter(d => !isNaN(d["birthrate"])))
            .transition()
            .duration(1000)
            .attr("cy", d => y1(d["birthrate"]));

        line = d3.line()
            .x(d => x(d[xKey]) + x.bandwidth() / 2)
            .y(d => y1(d["birthrate"]));

        linePath
            .datum(sortedData.filter(d => !isNaN(d["birthrate"])))
            .transition()
            .duration(1000)
            .attr("d", line);
    }
}

// Load the data
d3.csv("./data/parental_leave_with_birth_rate.csv").then(data => {
    data.forEach(d => {
        d["Length of maternity leave"] = +d["Length of maternity leave"];
        d["Length of parental leave with job protection available to mothers"] = +d["Length of parental leave with job protection available to mothers"];
        d["Total length of paid maternity, parental and home care leave"] = +d["Total length of paid maternity, parental and home care leave"];
        d["Length of paid father-specific leave"] = +d["Length of paid father-specific leave"];
        d["birthrate"] = +d["birthrate"];
    });

    // Add title
    d3.select("#parental-leave-chart-container")
        .append("h1")
        .attr("class", "chart-title")
        .text("Parental Leave Data");

    createBarLineChart(data, "Country", "Length of maternity leave", "Length of maternity leave (weeks)", "#chart1");
    createBarLineChart(data, "Country", "Length of parental leave with job protection available to mothers", "Length of parental leave with job protection (weeks)", "#chart2");
    createBarLineChart(data, "Country", "Total length of paid maternity, parental and home care leave", "Total length of paid leave (weeks)", "#chart3");
    createBarLineChart(data, "Country", "Length of paid father-specific leave", "Length of paid father-specific leave (weeks)", "#chart4");
});
