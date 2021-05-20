/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.95,
  height = window.innerHeight * 0.90,
  margin = { top: 20, bottom: 65, left: 60, right: 30 },
  radius = 2.5;

// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let xScale;
let yScale;
let xAxis;
let yAxis;
let xAxisGroup;
let yAxisGroup;

/* APPLICATION STATE */
let state = {
  data: [],
  selection: "Regular", // + YOUR FILTER SELECTION
};

/* LOAD DATA */
// + SET YOUR DATA PATH
d3.csv("../data/gasprices.csv", d3.autoType)
  .then(data => {
    console.log("LOADED DATA:", data);
    state.data = data;
    init();
  });

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init() {
// SCALES
xScale = d3.scaleTime()
  .domain(d3.extent(state.data, function(d) {  
    return new Date(d.date)}))
  //.domain(d3.extent(state.data, d => d.date))
  .range([margin.left, width - margin.right])

yScale = d3.scaleLinear()
  .domain(d3.extent(state.data, d => d.d1))
  .range([height - margin.bottom, margin.top])

// AXES 
const xAxis = d3.axisBottom(xScale)
  .tickFormat(d3.timeFormat("%Y")) //sets it to yearly 
  .ticks(d3.timeYear.every(5)) 

const yAxis = d3.axisLeft(yScale)

// CREATE SVG 
svg = d3.select("#d3-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  //.style('background-color', 'none') changes the svg background color
  //.style("font-family", "verdana") will change later

const xAxisGroup = svg.append("g")
  .attr("class", "xAxis")
  .attr("transform", `translate(${0}, ${height - margin.bottom})`)
  .call(xAxis)
  
xAxisGroup.append("text")
  .attr("class", 'axis-title')
  .attr("x", width / 2)
  .attr("y", 45)
  .attr("text-anchor", "middle")
  .attr("fill", "black")
  .attr("font-size","13")
  .text("Year")
  // .style("font-family", "Calibri")

const yAxisGroup = svg.append("g")
  .attr("class", "yAxis")
  .attr("transform", `translate(${margin.left}, ${0})`)
  .call(yAxis)
  
yAxisGroup.append("text")
  .attr("class", 'axis-title')
  .attr("x", -40)
  .attr("y", height / 2)
  .attr("writing-mode", "vertical-lr")
  .attr("text-anchor", "middle")
  .attr("fill", "black")
  .attr("font-size","13")
  .text("Price in USD")

const dropdown = d3.select("#dropdown")

dropdown.selectAll("options")
  .data([
  //  { key: "All Prices", label: "All Prices"},
    { key: "r1", label: "Regular"},
    { key: "m1", label: "Midgrade"},
    { key: "p1", label: "Premium"},
    { key: "d1", label: "Diesel"}])
  .join("option")
  .attr("value", d => d.key)
  .text(d => d.label)

  dropdown.on("change", event => {
    console.log("DROP DOWN IS CHANGED", event.target.value)
    state.selection = event.target.value
    console.log("NEW STATE", state)
    draw();
})

 
    draw(); // calls the draw function
}

/* DRAW FUNCTION */
// we call this everytime there is an update to the data/state
function draw() {
  console.log("state.selected", state.selection)
  // + FILTER DATA BASED ON STATE
  const filteredData = state.data
  //.filter(d => state.selection === d.r1)

  console.log("filteredData", filteredData)

  const dots = svg
    .selectAll(".dot")
    .data(filteredData, d => new Date(d.date))
    .join(
      enter => enter.append("g")
        .attr("class", "dot")
        .attr("transform", d => `translate(${xScale(new Date(d.date))}, ${yScale(d.r1)})`),
      update => update
        .call(upate => update.transition()
          .duration(1500)
          .attr("transform", d => `translate(${xScale(new Date(d.date))}, ${yScale(d.r1)})`)
    ),
  exit => exit.remove()
    );
  
  dots.selectAll("circle")
      .data(d => [d])
      .join("circle")
      .attr("r", radius)
      .attr("fill", "purple")

  // + DRAW LINE AND/OR AREA
  const lineFunctionr1 = d3.line()
    .x(d => xScale(new Date(d.date)))
    .y(d => yScale(d.r1))
  
  svg.selectAll("path.r1line")
    .data([filteredData])
    .join("path")
    .attr("class", "r1line line")
    .attr("fill", "none")
    .attr("stroke", "#581845")
    .attr("stroke-width", 2)
    .attr("d", lineFunctionr1)
    .classed("visible", state.selection === "r1")

  const lineFunctionm1 = d3.line()
    .x(d => xScale(new Date(d.date)))
    .y(d => yScale(d.m1))
  
  svg.selectAll("path.m1line")
    .data([filteredData])
    .join("path")
    .attr("class", "m1line line")
    .attr("fill", "none")
    .attr("stroke", "#581845")
    //.attr("opacity", ".30")
    .attr("stroke-width", 2)
    .attr("d", lineFunctionm1)
    .classed("visible", state.selection === "m1")

  const lineFunctionp1 = d3.line()
  .x(d => xScale(new Date(d.date)))
  .y(d => yScale(d.p1))
  
  svg.selectAll("path.p1line")
    .data([filteredData])
    .join("path")
    .attr("class", "p1line line")
    .attr("fill", "none")
    .attr("stroke", "#581845")
    .attr("stroke-width", 2)
    .attr("d", lineFunctionp1)
    .classed("visible", state.selection === "p1")
  
  const lineFunctiond1 = d3.line()
  .x(d => xScale(new Date(d.date)))
  .y(d => yScale(d.d1))
  
  svg.selectAll("path.d1line")
    .data([filteredData])
    .join("path")
    .attr("class", "d1line line")
    .attr("fill", "none")
    .attr("stroke", "#581845")
    .attr("stroke-width", 2)
    .attr("d", lineFunctiond1)
    .classed("visible", state.selection === "d1")

  const areaPathr1 = d3.area()
  .x(d => xScale(new Date(d.date)))
  .y0(yScale(0))
  .y1(d => yScale(d.r1))

  svg.selectAll(".area")
  .data([filteredData])
  .join("path")
  .attr("class", 'area')
  .attr("opacity", 0.5)
  .attr("fill", "#581845")
  .attr("stroke-width", 2)
  .transition()
  .duration(1000)
  .attr("d", d => areaPathr1(d))
  // .classed("visible", state.selection === "All Prices" || state.selection === "r1")

}
