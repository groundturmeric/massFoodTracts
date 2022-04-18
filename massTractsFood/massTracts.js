

promises = [
    d3.csv("./data/foodsources.csv"),
    d3.json("./geojson/MASSlilafinal.geojson"),
];


Promise.all(promises).then(function (data) {


    const foodsources = data[0];

    // console.log(foodsources);

    const tracts = data[1];



    // console.log (busRoutes);

    const width = document.querySelector("#chartmass").clientWidth;
    const height = document.querySelector("#chartmass").clientHeight;
    const svg = d3.select("#chartmass")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + window.innerWidth + " " + window.innerHeight)
        .classed("svg-content", true);
    // .attr("width", width)
    // .attr("height", height);


    const projection = d3.geoMercator()
        .translate([width / 2.34, height / 1.5])
        .center([-70.821001, 41.9])
        .scale(12850);

    const path = d3.geoPath()
        .projection(projection);

    const tractsPath = d3.geoPath()
        .projection(projection);

    const busRoutesPath = d3.geoPath()
        .projection(projection);





    //DRAW MAP
    const tractColorScale = d3.scaleSequential()
        // .domain(d3.extent(tracts, d => +d.MAssFilteredData_MedianFamilyIncome))
        // .domain([14999,220000])
        .domain([220000, 14999])
        // .interpolator(d3.interpolateBlues);
        // .interpolator(d3.interpolateGreys);
        // .interpolator(d3.interpolateSpectral);
        // .interpolator(d3.interpolateOrRd);
        .interpolator(d3.interpolateRdPu);

    svg.selectAll("path.tracts")
        .data(tracts.features)
        .enter()
        .append("path")
        .attr("d", tractsPath)
        .attr("class", "tracts")
        .attr("stroke-width", 0)
        .style('fill', function (d) {
            return tractColorScale(d.properties.MAssFilteredData_MedianFamilyIncome);
        })






    // const colorScale = d3.scaleOrdinal(d3.schemeSet2)
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(["supermarket", "restaurant", "convenience store", "fast food", "farmers market",])
        .range(["#87f462", "#2b9d33", "yellow", "#007edd", "#01e7bd"]);
    // turquoise: #01e7bd

    // var colors = [ "#00FB36","#F95B34", "#FF9C34", "#EE3E64", "#F36283",  "#B7D84B","#44ACCF"];


    const points = svg.selectAll("circle")
        .data(foodsources)
        .enter().append("circle")
        .attr("cx", function (d) {
            var proj = projection([d.Long, d.Lat]);
            return proj[0];
        }).attr("cy", function (d) {
            var proj = projection([d.Lon, d.Lat]);
            return proj[1];
        }).attr("r", 3)
        .attr("stroke", "white")
        .attr("stroke-width", 0.5)
        .attr("stroke-opacity", 0.5)
        .attr("fill", function (d) {
            return colorScale(d.type);
        })





    //<><><><<><><><><><><TOOLTIP><><><><><><><><><><><><//



    const tooltip = d3.select("#chartmass")
        .append("div")
        .attr("class", "tooltip");

    svg.selectAll("circle")
        .on("mouseover", function (e, d) {

            // let cx = +d3.select(this).attr("cx")*k + tX + 0;
            // let cy = +d3.select(this).attr("cy")*k + tY - 0;

            tooltip.style("visibility", "visible")


            d3.select(this)
                .attr("r", 10 / k)
                // .attr("r", 10 / k)
                // .attr("stroke", "white")
                .attr("stroke-width", 3 / k)
                .attr("stroke-opacity", 1);

        }).on('mousemove', function (e, d) {
            let x = e.offsetX;
            let y = e.offsetY;

            tooltip.style("left", x + "px")
                .style("top", y + "px")
                .html(`<b>${d.name}</b><br>${d.type}`);
        })
        .on("mouseout", function () {

            tooltip.style("visibility", "hidden");

            d3.select(this)
                .attr("r", 3 / k)
                // .attr("stroke", "white")
                .attr("stroke-width", 0.5 / k)
                .attr("stroke-opacity", 0.5);

        });


    //><><><><><>ToolTip on TRACTS><><><><><><><


    svg.selectAll("path.tracts")
        .on("click", function (d, i,) {
            // console.log("just had a mouseover", d3.select(d));

            console.log(this);

            d3.select(this)
                .classed("active", true)
                .style('fill', "rgb(142, 0, 0)")
                ;


            let ttx = d3.pointer(event)[0] * k + tX;
            let tty = d3.pointer(event)[1] * k + tY;

            tooltip.style("visibility", "visible")
                .style("left", (ttx) + "px")
                .style("top", (tty) + "px")
                .html(`<b>Median Family Income: </b>${i.properties.MAssFilteredData_MedianFamilyIncome} $<br>
              <b>Poverty Rate</b> ${i.properties.MAssFilteredData_PovertyRate}% <br>
                    <b>County: </b> ${i.properties.MAssFilteredData_County}<br>
                    <b>Tract Geoid:</b> ${i.properties.GEOID10}<br>`);



        })
        .on('mousemove', function (e, d) {
            let x = e.offsetX;
            let y = e.offsetY;

            tooltip.style("left", (ttx) + "px")
            .style("top", (tty) + "px")
            .html(`<b>Median Family Income: </b>${i.properties.MAssFilteredData_MedianFamilyIncome} $<br>
          <b>Poverty Rate</b> ${i.properties.MAssFilteredData_PovertyRate}% <br>
                <b>County: </b> ${i.properties.MAssFilteredData_County}<br>
                <b>Tract Geoid:</b> ${i.properties.GEOID10}<br>`);
        })
        .on("mouseout", function (d) {
            d3.select(this)
                .classed("active", false)
                .style('stroke-width', 0)
                .style('fill', function (d) {
                    return tractColorScale(d.properties.MAssFilteredData_MedianFamilyIncome);
                });

            tooltip.style("visibility", "hidden");
        });










    /* FILTER BY CHECKBOX

    We'll use the same filtering pattern we've seen before
    to filter the markers on the map by museum type.

    */

    d3.selectAll(".type--option").on("click", function () {

        let isChecked = d3.select(this).property("checked");
        let foodType = d3.select(this).property("value");

        let selection = points.filter(function (d) {
            return d.type === foodType;
        });

        if (isChecked == true) {
            selection.attr("opacity", 1)
                .attr("pointer-events", "all");
        } else {
            selection.attr("opacity", 0)
                .attr("pointer-events", "none");
        }

    });


    /*
    ADDING ZOOM

    Maps are great candidates for zooming. But zooming is actually
    a very complex task -- made especially complex in SVG!

    D3 has a built-in module, d3.zoom() for handling zoom events.

    */

    const zoom = d3.zoom()
        .scaleExtent([1, 10])
        .on('zoom', zoomed);

    svg.call(zoom);

    let k = 1;
    let tX = 0;
    let tY = 0;

    function zoomed(e) {

        console.log(e);

        k = e.transform.k;
        tX = e.transform.x;
        tY = e.transform.y;

        svg.selectAll("*").attr("transform", e.transform);

        svg.selectAll("circle").attr("r", 3 / k)
            .attr("stroke-width", 0.5 / k)
            .attr("stroke", "white")

    }




    // choroplethiseMap(pathSelection, lifeExpData);


});