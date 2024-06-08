d3.csv('data/birthrate_policies.csv').then(function(data) {
    data.forEach(d => {
        d.value = +d.value;
    });

    const width = 500;
    const height = 500;
    const margin = 40;
    const radius = Math.min(width, height) / 2 - margin;

    const colors = [
        "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
        "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
    ];

    const colorMap = new Map();
    data.forEach((d, i) => {
        colorMap.set(d.policy, colors[i % colors.length]);
    });

    const svg = d3.select("#policyChart")
        .attr("width", width)
        .attr("height", height + 150) // Increased height to accommodate the new box
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2 + 30})`);

    const tooltip = d3.select("body").append("div")
        .attr("class", "policy-tooltip")
        .style("display", "none");

    const pie = d3.pie()
        .value(d => d.value);
    const data_ready = pie(data);

    const arcGenerator = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    svg.selectAll('path')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arcGenerator)
        .attr('fill', d => colorMap.get(d.data.policy))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .on("mouseover", function(event, d) {
            tooltip.style("display", "block")
                .html(`Policy: ${d.data.policy}<br>Value: ${d.data.value}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("display", "none");
        });

    // 데이터를 birthrate 값에 따라 내림차순으로 정렬
    data.sort((a, b) => b.value - a.value);

    const ul = d3.select("#policyList");
    data.forEach(d => {
        const color = colorMap.get(d.policy);
        
        const li = ul.append("li")
            .style("color", "black")
            .style("display", "flex")
            .style("align-items", "center")
            .on("mouseover", function(event) {
                tooltip.style("display", "block")
                    .html(`Value: ${d.value}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mousemove", function(event) {
                tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("display", "none");
            });

        li.append("div")
            .style("width", "20px")
            .style("height", "20px")
            .style("margin-right", "10px")
            .style("background-color", color);

        li.append("span")
            .style("font-size", "18px")
            .text(d.policy);
    });
}).catch(function(error) {
    console.error('Error loading or parsing CSV file:', error);
});
