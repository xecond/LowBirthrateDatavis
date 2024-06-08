// Create a tooltip div and hide it initially
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip");

let selectedCountry = null;

// Load the data.
Promise.all([
  d3.json("./data/countries-50m.json"),
  d3.csv("./data/birthrate_map.csv", d => d.birthrate === "-" ? null : ({name: d.name, birthrate: +d.birthrate}))
]).then(([world, birthrateData]) => {

  // Specify the chart’s dimensions.
  const width = 600;
  const marginTop = 46;
  const height = width / 2 + marginTop;
  const barChartHeight = 400;
  const barChartWidth = width;
  const barChartMargin = {top: 20, right: 30, bottom: 150, left: 60};

  // Fit the projection.
  const projection = d3.geoEqualEarth().fitExtent([[2, marginTop + 2], [width - 2, height]], {type: "Sphere"});
  const path = d3.geoPath(projection);

  // Filter out data with null birthrate
  birthrateData = birthrateData.filter(d => d && !isNaN(d.birthrate));

  // Index the values and create the color scale.
  const valuemap = new Map(birthrateData.map(d => [d.name, d.birthrate]));
  const color = d3.scaleSequential()
        .domain(d3.extent(birthrateData, d => d.birthrate))
        .interpolator(d3.interpolateRgb("red", "blue"));

  // Create the SVG container for the map.
  const svgMap = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 50, width, height])
      .attr("style", "max-width: 100%; height: auto;");

  // Append the legend.
  svgMap.append("g")
      .attr("transform", "translate(20,-20)")
      .append(() => Legend(color, {title: "Birthrate (2022)", width: 260}));

  // Add a white sphere with a black border.
  svgMap.append("path")
    .datum({type: "Sphere"})
    .attr("fill", "white")
    .attr("stroke", "currentColor")
    .attr("d", path);

  // Add a path for each country and color it according to the data.
  svgMap.append("g")
    .selectAll("path")
    .data(topojson.feature(world, world.objects.countries).features)
    .join("path")
      .attr("fill", d => color(valuemap.get(d.properties.name)))
      .attr("d", path)
      .on("mouseover", function(event, d) {
        const countryName = d.properties.name;
        const birthrate = valuemap.get(countryName);
        if (birthrate !== undefined) {
          tooltip.style("display", "block")
              .html(`Country: ${countryName}<br>Birthrate: ${birthrate}`)
              .style("position", "absolute")
              .style("left", 800 + "px")
              .style("top", 300 + "px");
        }
      })
      .on("mouseout", function() {
        tooltip.style("display", "none");
      })
      .on("click", function(event, d) {
        const countryName = d.properties.name;
        if (selectedCountry === countryName) {
          selectedCountry = null; // Deselect country if it's already selected
        } else {
          selectedCountry = countryName; // Select the new country
        }
        updateBarChart(selectedCountry);
      });

  // Add a white mesh.
  svgMap.append("path")
    .datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b))
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("d", path);

  document.getElementById("world-birthrate-map-container").appendChild(svgMap.node());

  // Create the SVG container for the bar chart.
  const svgBarChart = d3.create("svg")
      .attr("width", barChartWidth + barChartMargin.left + barChartMargin.right)
      .attr("height", barChartHeight + barChartMargin.top + barChartMargin.bottom)
      .attr("viewBox", `0 0 ${barChartWidth + barChartMargin.left + barChartMargin.right} ${barChartHeight + barChartMargin.top + barChartMargin.bottom}`)
      .attr("style", "max-width: 100%; height: auto;");

  // Add a group element to the bar chart SVG and apply margin transformation.
  const barChartGroup = svgBarChart.append("g")
      .attr("transform", `translate(${barChartMargin.left},${barChartMargin.top})`);

  // Sort the birthrate data.
  birthrateData.sort((a, b) => d3.ascending(a.birthrate, b.birthrate));

  // Create scales for the bar chart.
  const x = d3.scaleBand()
      .domain(birthrateData.map(d => d.name))
      .range([0, barChartWidth])
      .padding(0.1);

  const y = d3.scaleLinear()
      .domain([0, d3.max(birthrateData, d => d.birthrate)])
      .nice()
      .range([barChartHeight, 0]);

  // Append bars to the bar chart.
  barChartGroup.selectAll("rect")
    .data(birthrateData)
    .join("rect")
      .attr("x", d => x(d.name))
      .attr("y", d => y(d.birthrate))
      .attr("width", x.bandwidth())
      .attr("height", d => barChartHeight - y(d.birthrate))
      .attr("fill", "steelblue")
      .on("click", function(event, d) {
        if (selectedCountry === d.name) {
          selectedCountry = null; // Deselect country if it's already selected
        } else {
          selectedCountry = d.name; // Select the new country
        }
        updateBarChart(selectedCountry);
      });

  // Append x-axis to the bar chart.
  barChartGroup.append("g")
    .attr("transform", `translate(0,${barChartHeight})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("x", 5)
      .attr("y", 5)
      .attr("dy", ".35em")
      .attr("transform", "rotate(45)")
      .attr("text-anchor", "start");

  // Append y-axis to the bar chart.
  barChartGroup.append("g")
    .call(d3.axisLeft(y).ticks(d3.max(birthrateData, d => d.birthrate) / 0.5));

  // Add y-axis label
  barChartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -barChartMargin.left + 10)
    .attr("x", -barChartHeight / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Birthrate");

  document.getElementById("world-birthrate-chart-container").appendChild(svgBarChart.node());

  // Define updateBarChart function inside the Promise to access barChartGroup
  function updateBarChart(selectedCountry) {
    barChartGroup.selectAll("rect")
      .attr("fill", d => d.name === selectedCountry ? "red" : "steelblue");
  }
});

function Legend(color, options) {
    const {title, width} = options;
    const tickSize = 6;
    const height = 44;
    const marginTop = 18;
    const marginRight = 0;
    const marginBottom = 16 + tickSize;
    const marginLeft = 0;
    
    const domain = color.domain();
    const ticks = d3.range(domain[0], domain[1], (domain[1] - domain[0]) / 4).concat(domain[1]);
  
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .style("overflow", "visible")
        .style("display", "block");
  
    let x = d3.scaleLinear()
        .domain(domain)
        .range([marginLeft, width - marginRight]);
  
    svg.append("image")
        .attr("x", marginLeft)
        .attr("y", marginTop)
        .attr("width", width - marginLeft - marginRight)
        .attr("height", height - marginTop - marginBottom)
        .attr("preserveAspectRatio", "none")
        .attr("xlink:href", ramp(color.copy().domain([0, 1])).toDataURL());
  
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x)
            .tickSize(tickSize)
            .tickValues(ticks))
        .call(g => g.select(".domain").remove());
  
    svg.append("text")
        .attr("x", marginLeft)
        .attr("y", marginTop - 6)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text(title);
  
    return svg.node();
  }
  
  function ramp(color, n = 256) {
    const canvas = document.createElement("canvas");
    canvas.width = n;
    canvas.height = 1;
    const context = canvas.getContext("2d");
    for (let i = 0; i < n; ++i) {
      context.fillStyle = color(i / (n - 1));
      context.fillRect(i, 0, 1, 1);
    }
    return canvas;
  }
