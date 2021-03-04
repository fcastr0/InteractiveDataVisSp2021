/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.95,
  height = window.innerHeight * 0.90,
  margin = { top: 20, bottom: 65, left: 60, right: 30 },
  radius = 5;

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
  selection: "All Prices", // + YOUR FILTER SELECTION
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
  .domain(d3.extent(state.data, function(d) {  //why does this work but the .domain at the bottom doesnt?
    return new Date(d.date)
}))
  //.domain(d3.extent(state.data, d => d.date))
  .range([margin.left, width - margin.right])
  //console.log("xScale is:", xScale, xScale(1/2/1995))

yScale = d3.scaleLinear()
  .domain(d3.extent(state.data, d => d.r1)) // to get the scale on the y-axis I think we need to map to something that isnt r1
  .range([height - margin.bottom, margin.top])

// AXES 
const xAxis = d3.axisBottom(xScale)
  .tickFormat(d3.timeFormat("%Y")) //sets it to yearly 
  .ticks(d3.timeYear.every(1)) //this works but the ending date doesnt look good 

const yAxis = d3.axisLeft(yScale)

// CREATE SVG 
svg = d3.select("#d3-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style('background-color', 'none') //changes the svg background color
  .style("font-family", "verdana")

const xAxisGroup = svg.append("g")
  .attr("class", "xAxis")
  .attr("transform", `translate(${0}, ${height - margin.bottom})`)
  .call(xAxis)
  
xAxisGroup.append("text")
  .attr("class", 'axis-title')
  .attr("x", width / 2)
  .attr("y", 45)
  .attr("text-anchor", "middle")
  .attr("fill", "black") //why do we have to add a fill attribute?
  .attr("font-size","13")
  .text("Year")
  // .style("font-family", "Calibri")

// svg.selectAll("text.date") tried to format the dates... its a no go
//   .data(state.data)        also tried to change ticks from 2ys to 1 yr
//   .join("text")
//   .attr("class", 'date')
//   .attr("x", d => xScale(d.date))
//   .attr("y", 0)
//   .attr("dx", "-.8em")
//   .attr("dy", ".15em")
//   .attr("transform", "rotate(-65)")

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
    { key: "All Prices", label: "All Prices"},
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
  const filteredData = state.data // this will maybe have to be an else if statement
  .filter(d => state.selection === d.r1)

  yScale.domain(d3.extent(filteredData, d => d.r1))

  console.log("filteredData", filteredData)

  // + DRAW LINE AND/OR AREA
  const lineFunction = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.r1))
  
  svg.selectAll("path.line")
    .data([filteredData])
    .join("path")
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("d", lineFunction)

  //select all ()
  // join data()
  //render elements
}
