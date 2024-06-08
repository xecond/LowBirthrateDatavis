/* house year */

let house_year = parseInt(document.getElementById('house-year').innerText, 10);
const house_year_max = 2023;
const house_year_min = 2012;
const backBtn = document.querySelector(".back");
const nextBtn = document.querySelector(".next");

d3.csv("/data/hs_houseprice.csv").then(function(data) {
  d3.csv("/data/hs_birth.csv").then(function(data2) {
    function next() {
        if (house_year < house_year_max) {
            house_year += 1;
            document.getElementById('house-year').innerText = house_year;
            updateChart();
        }
        toggleButtons();
    }

    function back() {
        if (house_year > house_year_min) {
            house_year -= 1;
            document.getElementById('house-year').innerText = house_year;
            updateChart();
        }
        toggleButtons();
    }

    function init() {
        nextBtn.setAttribute('disabled', 'true');
        backBtn.addEventListener("click", back);
        nextBtn.addEventListener("click", next);
        updateChart(); // Initial chart rendering
    }

    function toggleButtons() {
        nextBtn.disabled = house_year >= house_year_max;
        backBtn.disabled = house_year <= house_year_min;
    }

    function updateChart() {
        d3.select("div#house-price-chart-container").select("svg").remove();
        createSquareChart(data, data2);
    }

    init();

    function createSquareChart(data, data2) {
        // Transform the data for the selected year
        const transformedData = data.map(d => ({
            region: d['지 역'],
            squares: Math.ceil(+d[house_year] / 10000)  // Convert price to 'squares' and round up
        }));
        const transformedData2 = data2.map(d => ({
          region: d['지 역'],
          squares: Math.ceil(+d[house_year] / 1000)  // Convert price to 'squares' and round up
      }));

        const width = 1200;
        const height = 350;
        const squareSize = 5;  // Size of each square
        const squarePadding = 2; // Padding between squares
        const squaresPerRow = 4; // Squares per row for the grid layout
        const squaresPerRow2 = 4;

        const svg = d3.select("div#house-price-chart-container").append("svg")
            .attr("width", "100%")
            .attr("height", height);

        transformedData.forEach((d, index) => {
            const group = svg.append("g")
                .attr("transform", `translate(${index * (squareSize + squarePadding) * 10}, 10)`);

            // Add the region name
            group.append("text")
                .attr("x", squaresPerRow * (squareSize + squarePadding) + 30)
                .attr("y", squareSize / 2)
                .attr("dy", ".35em")
                .text(d.region)
                .attr("font-size", "14px")
                .attr("font-family", "sans-serif")
                .attr("fill", "black");

            // Draw the squares
            for (let i = 0; i < d.squares; i++) {
                const row = Math.floor(i / squaresPerRow);
                const col = i % squaresPerRow;

                group.append("rect")
                    .attr("x", col * (squareSize + squarePadding) + 55)
                    .attr("y", height - row * (squareSize + squarePadding))
                    .attr("width", squareSize)
                    .attr("height", squareSize)
                    .attr("fill", "#70BF8A")
                    .attr("stroke", "white");
            }
        });
        transformedData2.forEach((d, index) => {
          const group = svg.append("g")
              .attr("transform", `translate(${index * (squareSize + squarePadding) * 10}, 10)`);

          // // Add the region name
          // group.append("text")
          //     .attr("x", squaresPerRow2 * (squareSize + squarePadding) + 30)
          //     .attr("y", squareSize / 2)
          //     .attr("dy", ".35em")
          //     .text(d.region)
          //     .attr("font-size", "14px")
          //     .attr("font-family", "sans-serif")
          //     .attr("fill", "black");

          // Draw the squares
          for (let i = 0; i < d.squares; i++) {
              const row = Math.floor(i / squaresPerRow2);
              const col = i % squaresPerRow2;

              group.append("rect")
                  .attr("x", col * (squareSize + squarePadding) + 55)
                  .attr("y", 50+row * (squareSize + squarePadding))
                  .attr("width", squareSize)
                  .attr("height", squareSize)
                  .attr("fill", "#323232")
                  .attr("stroke", "white");
          }
      });
    }
  });
});

