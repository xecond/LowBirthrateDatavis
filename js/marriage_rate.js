// Load CSV data
d3.csv("/data/hs_marriagerate.csv").then(function(data) {
    d3.csv("/data/hs_birthrate.csv").then(function(data2) {
        const regions = data.map(d => d['지 역']);
        const years = data.columns.slice(1);
        
        // Create options for the dropdown
        const regionSelect = d3.select("#region-select");
        regions.forEach(region => {
            regionSelect.append("option")
                .attr("value", region)
                .text(region);
        });

        // Set up SVG canvas
        const margin = { top: 20, right: 80, bottom: 30, left: 60 },
            width = 600 - margin.left - margin.right,
            height = 350 - margin.top - margin.bottom;

        const svg = d3.select("#marriage-chart-container").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scalePoint()
            .domain(years)
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data2, d => d3.max(years, year => +d[year]))])
            .nice()
            .range([height, 0]);

        const y2 = d3.scaleLinear()
        .domain([0, d3.max(data2, d => d3.max(years, year => +d[year]))])
        .nice()
        .range([height, 0]);

        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y));

        const line = d3.line()
            .x(d => x(d.year))
            .y(d => y(d.value));

        // const line2 = d3.line()
        //     .y(d => y2(d.value));

        function updateChart(selectedRegions) {
            svg.selectAll(".line").remove();
            
            selectedRegions.forEach(region => {
                const regionData = data.find(d => d['지 역'] === region);
                const lineData = years.map(year => ({ year: year, value: +regionData[year] }));
                const regionData2 = data2.find(d => d['지 역'] === region);
                const lineData2 = years.map(year => ({ year: year, value: +regionData2[year] }));

                svg.append("path")
                    .datum(lineData)
                    .attr("class", "line")
                    .attr("stroke", "#70BF8A")
                    .attr("d", line);

                svg.append("path")
                    .datum(lineData2)
                    .attr("class", "line")
                    .attr("stroke", "#323232")
                    .attr("d", line);
            });
        }

        // Event listener for region selection
        regionSelect.on("change", function() {
            const selectedRegions = Array.from(this.selectedOptions).map(option => option.value);
            updateChart(selectedRegions);
        });

        // Initial update
        updateChart([regions[0]]);  // Display the first region by default

        // Add legend
        let keys = {"조혼인율":"#70BF8A", "조출생률":"#323232"}
        const legend = svg.append("g")
        .attr("transform", `translate(${width - margin.right + 20}, ${margin.top})`); // Adjust margin for legend

        // Create legend items
        const legendItems = legend.selectAll(".legend-item")
        .data(Object.keys(keys))
        .enter().append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`);
        //console.log(Object.values(keys));

        // Add colored lines
        legendItems.append("line")
        .attr("x1", 0)
        .attr("x2", 18)
        .attr("y1", 9)
        .attr("y2", 9)
        .attr("stroke", d => keys[d]) // Match color to line
        .attr("stroke-width", 3); // Adjust line width if needed

        // Add legend text
        legendItems.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text(d => d)
        .style("fill", "black") // Set text color
        .style("font-size", "14px"); // Set font size
    });
});
