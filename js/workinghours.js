// Load both CSV files
Promise.all([
    d3.csv("data/workhour.csv"),
    d3.csv("data/birthrate1.csv")
]).then(function(files) {
    let workhourData = files[0];
    let birthrateData = files[1];

    // Parse workhour data
    workhourData.forEach(function(d) {
        d.Value = +d.Value;
        d['oecd average'] = +d['oecd average'];
        d.Difference = d.Value - d['oecd average'];
    });

    // Parse birthrate data
    birthrateData.forEach(function(d) {
        d.Birthrate = +d.Birthrate;
    });

    // Sort workhour data in ascending order based on the Difference value
    workhourData.sort((a, b) => a.Difference - b.Difference);

    // Create a map for birthrate data for easy lookup
    const birthrateMap = new Map(birthrateData.map(d => [d.Country, d.Birthrate]));

    // Create combined data with birthrate
    const combinedData = workhourData.map(d => {
        return {
            ...d,
            Birthrate: birthrateMap.get(d.Country) || null
        };
    });

    // Store the original sorting for toggling
    const originalData = [...combinedData];

    // Set dimensions and margins for the chart
    const margin = {top: 20, right: 60, bottom: 150, left: 100}; // Adjust left margin
    const width = 650 - margin.left - margin.right;
    const height = 530 - margin.top - margin.bottom;

    // Append the svg object to the body of the page
    const svg = d3.select("#world-workinghour-chart-container").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create a tooltip div that is hidden by default
    const tooltip = d3.select("#world-workinghour-chart-container").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("display", "none")
        .style("position", "absolute")
        .style("background", "white")
        .style("border", "1px solid black")
        .style("padding", "8px")
        .style("border-radius", "8px");

    // Y scale for work hours
    const y = d3.scaleLinear()
        .domain([d3.min(workhourData, d => d.Difference), d3.max(workhourData, d => d.Difference)])
        .range([height, 0]);

    // Y scale for birth rate
    const yBirthrate = d3.scaleLinear()
        .domain([0, d3.max(birthrateData, d => d.Birthrate)])
        .range([height, 0]);

    // X scale
    const x = d3.scaleBand()
        .range([0, width])
        .domain(workhourData.map(d => d.Country))
        .padding(0.1);

    // Add Y axis for work hours
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add label for Y axis (work hours)
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 40) // Adjust y position
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Difference in Work Hours");

    // Add Y axis for birth rate
    svg.append("g")
        .attr("transform", `translate(${width},0)`)
        .call(d3.axisRight(yBirthrate));

    // Add label for Y axis (birth rate)
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", width + margin.right - 20)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Birthrate");

    // Add X axis
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    // Bars for work hours
    const bars = svg.selectAll("rect")
        .data(combinedData)
        .enter()
        .append("rect")
        .attr("x", d => x(d.Country))
        .attr("y", d => y(Math.max(0, d.Difference)))
        .attr("width", x.bandwidth())
        .attr("height", d => Math.abs(y(d.Difference) - y(0)))
        .attr("fill", d => d.Difference < 0 ? "green" : "red")
        .on("mouseover", function(event, d) {
            tooltip.style("display", "block")
                .style("opacity", 1)
                .html(`Country: ${d.Country}<br>Workhours: ${d.Value}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("display", "none")
                .style("opacity", 0);
        });

    // Line for birth rate
    const line = d3.line()
        .x(d => x(d.Country) + x.bandwidth() / 2)
        .y(d => yBirthrate(d.Birthrate));

    // Remove any existing lines before adding new ones
    svg.selectAll(".line-path").remove();

    const path = svg.append("path")
        .datum(combinedData)
        .attr("class", "line-path")
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Add points to the line
    const points = svg.selectAll("circle")
        .data(combinedData)
        .enter().append("circle")
        .attr("cx", d => x(d.Country) + x.bandwidth() / 2)
        .attr("cy", d => yBirthrate(d.Birthrate))
        .attr("r", 3)
        .attr("fill", "blue")
        .on("mouseover", function(event, d) {
            tooltip.style("display", "block")
                .style("opacity", 1)
                .html(`Country: ${d.Country}<br>Birthrate: ${d.Birthrate}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("display", "none")
                .style("opacity", 0);
        });

    // Add title
    // svg.append("text")
    //     .attr("x", width / 2)
    //     .attr("y", -20) // Adjust this value as needed to prevent cutting off
    //     .attr("text-anchor", "middle")
    //     .style("font-size", "24px")
    //     .style("font-weight", "bold")
    //     .text("Work Hours Difference and Birthrate by Country");

    // Add legend for work hours
    const legend = svg.append("g")
        .attr("transform", `translate(${width / 2 - 180}, ${height + 100})`);

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", "red");

    legend.append("text")
        .attr("x", 25)
        .attr("y", 13)
        .style("font-size", "14px")
        .text("More than OECD average");

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 25)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", "green");

    legend.append("text")
        .attr("x", 25)
        .attr("y", 38)
        .style("font-size", "14px")
        .text("Less than OECD average");

    // Add legend for birth rate
    const legendBirthrate = svg.append("g")
        .attr("transform", `translate(${width / 2 + 50}, ${height + 100})`)
        .attr("class", "legend-birthrate");

    legendBirthrate.append("line")
        .attr("x1", 40)
        .attr("y1", 9)
        .attr("x2", 58)
        .attr("y2", 9)
        .attr("stroke", "blue")
        .attr("stroke-width", 2);

    legendBirthrate.append("text")
        .attr("x", 60)
        .attr("y", 13)
        .style("font-size", "14px")
        .text("Birthrate")
        .style("cursor", "pointer")
        .on("click", function() {
            // Check the current sorting order
            const isSortedByBirthrate = combinedData.every((d, i, arr) => {
                return i === 0 || arr[i - 1].Birthrate <= d.Birthrate;
            });

            // Sort combinedData by birthrate or revert to the original sorting
            if (isSortedByBirthrate) {
                combinedData.sort((a, b) => a.Difference - b.Difference);
            } else {
                combinedData.sort((a, b) => a.Birthrate - b.Birthrate);
            }

            // Update the x scale domain
            x.domain(combinedData.map(d => d.Country));

            // Transition the bars
            bars.transition()
                .duration(1000)
                .attr("x", d => x(d.Country));

            // Transition the line path
            path.datum(combinedData)
                .transition()
                .duration(1000)
                .attr("d", line);

            // Transition the points
            points.data(combinedData)
                .transition()
                .duration(1000)
                .attr("cx", d => x(d.Country) + x.bandwidth() / 2)
                .attr("cy", d => yBirthrate(d.Birthrate));

            svg.select(".x-axis")
                .transition()
                .duration(1000)
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("transform", "rotate(-45)")
                .style("text-anchor", "end");
        });
});
