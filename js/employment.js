document.addEventListener('DOMContentLoaded', async function() {
    const width = 600;
    const height = 500;
    const margin = {top: 30, right: 60, bottom: 90, left: 40}; 

    const svg = d3.select("#world-employment-chart-container").append("svg")
        .attr("width", width)
        .attr("height", height + 50)  
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // svg.append("text")
    //     .attr("x", (width - margin.left - margin.right) / 2)
    //     .attr("y", -margin.top / 2)
    //     .attr("text-anchor", "middle")
    //     .style("font-size", "24px")
    //     .style("font-weight", "bold")
    //     .text("OECD Employment over age");

    const tooltip = d3.select("#world-employment-chart-container").append("div")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("display", "none")
        .style("background", "#f9f9f9")
        .style("border", "1px solid #ccc")
        .style("padding", "10px")
        .style("border-radius", "3px")
        .style("font-size", "12px");

    const data = await d3.csv("data/employment.csv");
    const birthrateData = await d3.csv("data/birthrate_employment.csv");

    const keys = data.columns.slice(1);
    let originalData = [...data];  // Store original data for reset

    const processedData = data.map(d => {
        d.total = d3.sum(keys, k => +d[k]);
        return d;
    });

    const x = d3.scaleBand()
        .domain(data.map(d => d.COUNTRY))
        .range([0, width - margin.left - margin.right])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(processedData, d => d.total)])
        .nice()
        .range([height - margin.top - margin.bottom, 0]);

    const y2 = d3.scaleLinear()
        .domain([0, d3.max(birthrateData, d => +d.Value)])
        .nice()
        .range([height - margin.top - margin.bottom, 0]);  // Match bar chart range

    const color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeSpectral[keys.length]);

    const stack = d3.stack()
        .keys(keys)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

    let series = stack(processedData);

    const barGroups = svg.append("g")
        .selectAll("g")
        .data(series)
        .join("g")
        .attr("fill", d => color(d.key))
        .attr("class", d => `bar-group bar-group-${d.key}`);

    const bars = barGroups.selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("x", d => x(d.data.COUNTRY))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())
        .on("mouseover", function(event, d) {
            tooltip.style("display", "block")
                .html(`Country: ${d.data.COUNTRY}<br>Age: ${d3.select(this.parentNode).datum().key}<br>Value: ${d[1] - d[0]}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("display", "none");
        })
        .on("click", function(event, d) {
            const ageGroup = d3.select(this.parentNode).datum().key;
            sortByAgeGroup(ageGroup);
        });

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));

    svg.append("g")
        .attr("class", "y-axis-2")
        .attr("transform", `translate(${width - margin.left - margin.right}, 0)`)
        .call(d3.axisRight(y2));

    const legend = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 12)
        .attr("text-anchor", "start")
        .attr("transform", `translate(0, ${height - margin.top - margin.bottom + 60})`)  // Position legend below the chart
        .selectAll("g")
        .data(keys.slice().reverse())
        .join("g")
        .attr("transform", (d, i) => `translate(${i * 80},0)`);  // Adjust spacing between legend items

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", color);

    legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", "0.35em")
        .text(d => d);

    const line = d3.line()
        .x(d => x(d.COUNTRY) + x.bandwidth() / 2)
        .y(d => y2(d.Value));

    function drawLineChart(data) {
        const filteredData = data.filter(d => x.domain().includes(d.COUNTRY));
        const orderedData = x.domain().map(country => filteredData.find(d => d.COUNTRY === country));

        const linePath = svg.selectAll(".line")
            .data([orderedData]);

        linePath
            .enter().append("path")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 3)
            .merge(linePath)
            .transition()
            .duration(1000)
            .ease(d3.easeCubicInOut)
            .attr("d", line);

        linePath.exit().remove();

        const dots = svg.selectAll(".dot")
            .data(orderedData, d => d.COUNTRY);

        dots.enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => x(d.COUNTRY) + x.bandwidth() / 2)
            .attr("cy", d => y2(d.Value))
            .attr("r", 4)
            .attr("fill", "black")
            .attr("stroke", "white")
            .attr("stroke-width", 1.5)
            .merge(dots)
            .transition()
            .duration(1000)
            .ease(d3.easeCubicInOut)
            .attr("cx", d => x(d.COUNTRY) + x.bandwidth() / 2)  // Move horizontally
            .attr("cy", d => y2(d.Value));  // Move vertically

        dots.exit().remove();
    }

    drawLineChart(birthrateData);

    let sortedBy = null;

    function sortByAgeGroup(ageGroup) {
        let sortedData;

        if (sortedBy === ageGroup) {
            sortedBy = null;
            sortedData = originalData.map(d => ({
                ...d,
                total: d3.sum(keys, k => +d[k])
            }));
        } else {
            sortedBy = ageGroup;
            sortedData = [...data].sort((a, b) => d3.ascending(+a[ageGroup], +b[ageGroup]));
        }

        x.domain(sortedData.map(d => d.COUNTRY));

        const updatedSeries = stack(sortedData.map(d => ({
            ...d,
            total: d3.sum(keys, k => +d[k])
        })));

        barGroups.data(updatedSeries, d => d.key);

        barGroups.selectAll("rect")
            .data(d => d, d => d.data.COUNTRY)
            .transition()
            .duration(1000)
            .attr("x", d => x(d.data.COUNTRY))
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]))
            .attr("width", x.bandwidth());

        svg.select(".x-axis")
            .transition()
            .duration(1000)
            .call(d3.axisBottom(x));

        // Clear the old line chart and draw the new one
        drawLineChart(birthrateData.filter(d => sortedData.map(d => d.COUNTRY).includes(d.COUNTRY)));
    }
});
