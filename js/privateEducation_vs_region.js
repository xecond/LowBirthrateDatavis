

d3.csv("/data/privateEducationVSregion.csv").then(data => {
    showStackedBarChart(data);
}).catch(error => {
    console.error("Error loading data:", error);
});

function showStackedBarChart(data) {
    const width = 430;
    const height = 300;
    const margin = { top: 20, right: 140, bottom: 30, left: 80 };
    let sortAscending = true;


    const keys = data.columns.slice(2); // Exclude 'year' and 'Total'
    const stackedData = data.map(d => {
        const stackItem = { year: d.year };
        keys.forEach(key => stackItem[key] = +d[key]);
        return stackItem;
    });


    const totalData = data.map(d => ({ year: d.year, Total: +d.Total })); 

    const svg = d3.select("#education-region-chart-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
        .domain(stackedData.map(d => d.year))
        .range([0, width])
        .paddingInner(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(stackedData, d => d3.sum(keys, key => d[key]))]) 
        .range([height, 0]);

    const stack = d3.stack()
        .keys(keys)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const stackedBars = svg.selectAll(".stack")
        .data(stack(stackedData))
        .enter()
        .append("g")
        .attr("class", "stack")
        .attr("fill", (d, i) => color(i));


    // Tooltip
    const tooltip = d3.select("#education-region-chart-container").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("left", "200px") // Adjust left position
        .style("top", "300px"); // Adjust top position

    stackedBars.selectAll("rect")
        .data(d => d)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.data.year))
        .attr("y", d => yScale(d[1]))
        .attr("height", d => yScale(d[0]) - yScale(d[1]))
        .attr("width", xScale.bandwidth())
        .on("mouseover", function(event, d) {
            const keyIndex = d3.select(this.parentNode).datum().index;
            const key = keys[keyIndex];
            
            // Define tooltip content with subtitle and information
            const tooltipContent = `<div class="tooltip-balloon">
                                        <div class="tooltip-content">
                                            <div class="tooltip-subtitle"></div>
                                            <div>연도: ${d.data.year}</div>
                                            <div>${key}: ${d.data[key]}만원</div>
                                        </div>
                                        <div class="tooltip-pointer"></div>
                                    </div>`;
            
            // Update tooltip HTML content
            tooltip.html(tooltipContent)
                // Make tooltip visible
                .transition().duration(200).style("opacity", 1);
        })
        .on("mouseout", function(d) {
            // Hide tooltip
            tooltip.transition().duration(500).style("opacity", 0);
        });


    // Line Graph for 'Total'
    const line = d3.line()
        .curve(d3.curveMonotoneX)  // Apply a smoothing function
        .x(d => xScale(d.year) + xScale.bandwidth() / 2)
        .y(d => yScale(d.Total));

    // Calculate distance between each point and its corresponding x-axis point
    const distances = totalData.map(d => Math.abs(yScale(d.Total) - yScale(0)));

    // Normalize distances to the range [0, 1]
    const maxDistance = d3.max(distances);
    const normalizedDistances = distances.map(d => d / maxDistance);



    const totalLinePath = svg.append("path")
        .datum(totalData)
        .attr("fill", "none")
        .attr("stroke", "yellow") // Make the line yellow
        .attr("stroke-width", 4) // Make the line thicker
        .attr("d", line);

    // Animate line drawing
    const totalLineLength = totalLinePath.node().getTotalLength();
    totalLinePath
        .attr("stroke-dasharray", `${totalLineLength} ${totalLineLength}`)
        .attr("stroke-dashoffset", totalLineLength)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

    // Axes
    const xAxis = d3.axisBottom(xScale);
    const xAxisGroup = svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    const yAxis = d3.axisLeft(yScale);
    const yAxisGroup = svg.append("g")
        .call(yAxis);

    // Legend
    const legendData = keys.concat('Total');
    const legend = svg.selectAll(".legend")
        .data(legendData)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${width + 20},${i * 20})`);

    legend.filter(d => d !== 'Total').append("rect")
        .attr("x", 0)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", (d, i) => color(i));

    legend.filter(d => d === 'Total').append("line")
        .attr("x1", 0)
        .attr("x2", 18)
        .attr("y1", 9)
        .attr("y2", 9)
        .attr("stroke", "yellow") // Make the legend line yellow
        .attr("stroke-width", 4); // Make the legend line thicker

    legend.filter(d => d !== 'Total').append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text(d => d);

    legend.filter(d => d === 'Total').append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text("전체");
}