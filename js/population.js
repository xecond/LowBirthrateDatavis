// Set dimensions of the map
const width = 800;
const height = 700;

// Create an SVG element to hold the map
const svg = d3.select("#population-map").append("svg")
    .attr("width", width)
    .attr("height", height);

// Define a projection to convert lat/long to pixels
const projection = d3.geoMercator()
    .center([127.7669, 35.9078])
    .scale(5000)
    .translate([width / 2, height / 2]);

// Define a path generator using the projection
const path = d3.geoPath().projection(projection);

let populationData = {};
let availableYears = [];

var cityDictionary = {};
cityDictionary["Seoul"] = "서울";
cityDictionary["Busan"] = "부산";
cityDictionary["Daegu"] = "대구";
cityDictionary["Incheon"] = "인천";
cityDictionary["Gwangju"] = "광주";
cityDictionary["Daejeon"] = "대전";
cityDictionary["Ulsan"] = "울산";
cityDictionary["Sejong"] = "세종";
cityDictionary["Gyeonggi-do"] = "경기";
cityDictionary["Gangwon-do"] = "강원";
cityDictionary["Chungcheongbuk-do"] = "충북";
cityDictionary["Chungcheongnam-do"] = "충남";
cityDictionary["Jeollabuk-do"] = "전북";
cityDictionary["Jeollanam-do"] = "전남";
cityDictionary["Gyeongsangbuk-do"] = "경북";
cityDictionary["Gyeongsangnam-do"] = "경남";
cityDictionary["Jeju-do"] = "제주";

// Function to update the year
function updateYear(selectedIndex) {
    const selectedYear = availableYears[selectedIndex];
    document.getElementById("year").textContent = selectedYear;
    updateMap(selectedYear);
}

// Function to update the map based on the selected year
function updateMap(selectedYear) {
    const yearData = populationData[selectedYear];
    
    d3.json("data/skorea_provinces_geo.json").then(json => {
        json.features.forEach(d => {
            const name = d.properties.name_eng.trim();
            const population = yearData[name];
            d.properties.population = population || 0;
        });

        const maxPopulation = d3.max(json.features, d => d.properties.population);
        const color = d3.scaleSequential(d3.interpolateReds)
            .domain([0, maxPopulation]);

        svg.selectAll(".state")
            .data(json.features)
            .join("path")
            .attr("class", "state")
            .attr("d", path)
            .style("fill", d => {
                const population = d.properties.population;
                return population ? color(population) : "#ccc";
            });

        updatePopulationLegend(yearData, color);
    }).catch(error => {
        console.error("Error loading GeoJSON:", error);
    });
}

// Function to update the population legend
function updatePopulationLegend(yearData, colorScale) {
    const legendDiv = d3.select("#populationLegend");
    legendDiv.html(""); // Clear previous legend

    // Add legend title
    legendDiv.append("div")
        .attr("class", "legend-title")
        .text("인구 (백만명)");

    const legendData = Object.entries(yearData).sort((a, b) => b[1] - a[1]); // Sort by population

    legendData.forEach(([city, population]) => {
        const legendItem = legendDiv.append("div")
            .style("display", "flex")
            .style("align-items", "center")
            .style("margin-bottom", "4px");

        legendItem.append("div")
            .style("width", "20px")
            .style("height", "20px")
            .style("background-color", colorScale(population))
            .style("margin-right", "8px");

        var population_result = (population / 1000).toLocaleString();
        if (population_result == "0") {
            population_result = "-"
        }
        legendItem.append("span")
            .text(`${cityDictionary[city]}: ${population_result}`);
    });
}

// Load and parse the CSV file
d3.csv("data/population.csv").then(data => {
    data.forEach(d => {
        const year = d.year;
        availableYears.push(year);
        populationData[year] = {
            "Seoul": parseInt(d.Seoul, 10),
            "Busan": parseInt(d.Busan, 10),
            "Daegu": parseInt(d.Daegu, 10),
            "Incheon": parseInt(d.Incheon, 10),
            "Gwangju": parseInt(d.Gwangju, 10),
            "Daejeon": parseInt(d.Daejeon, 10),
            "Ulsan": parseInt(d.Ulsan, 10),
            "Sejong": parseInt(d.Sejongsi, 10),
            "Gyeonggi-do": parseInt(d["Gyeonggi-do"], 10),
            "Gangwon-do": parseInt(d["Gangwon-do"], 10),
            "Chungcheongbuk-do": parseInt(d["Chungcheongbuk-do"], 10),
            "Chungcheongnam-do": parseInt(d["Chungcheongnam-do"], 10),
            "Jeollabuk-do": parseInt(d["Jeollabuk-do"], 10),
            "Jeollanam-do": parseInt(d["Jeollanam-do"], 10),
            "Gyeongsangbuk-do": parseInt(d["Gyeongsangbuk-do"], 10),
            "Gyeongsangnam-do": parseInt(d["Gyeongsangnam-do"], 10),
            "Jeju-do": parseInt(d["Jeju-do"], 10)
        };
    });

    // Initialize the slider
    const slider = document.getElementById("yearSlider");
    slider.max = availableYears.length - 1;
    slider.value = availableYears.length - 1;
    updateYear(slider.value);
}).catch(error => {
    console.error("Error loading CSV:", error);
});
