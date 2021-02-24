/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.80,
  margin = { top: 20, bottom: 60, left: 60, right: 60 },
  radius = 5;

// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let xScale;
let yScale;

/* APPLICATION STATE */
let state = {
  data: [],
  selectedParty: "All" // + YOUR INITIAL FILTER SELECTION
};

/* LOAD DATA */
d3.csv("../data/usaheight.csv", d3.autoType).then(raw_data => {
  // + SET YOUR DATA PATH
  console.log("data", raw_data);
  // save our data to application state
  state.data = raw_data;
  init();
});

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init() {
  console.log('State:', state)
  //SCALES
    const xScale = d3.scaleLinear()
      .domain(d3.extent(state.data, d => d.meanheight))
      .range([margin.left, width - margin.right])
  //console.log("xScale:", xScale, xScale, xScale(142.6888017))

    const yScale = d3.scaleLinear()
      .domain(d3.extent(state.data, d => d.year))
      .range([height - margin.bottom, margin.top]) //our min value is at the bottom, max value is at the top of our svg 

  //AXES
    const xAxis = d3.axisBottom(xScale)
    const yAxis = d3.axisLeft(yScale)

  //Creating SVG
    const svg = d3.select("#d3-container")
      .append("svg")
      .attr("width", width)
      .attr("height", height)

    svg.append("g")
      .attr("class", "xAxis")
      .attr("transform", `translate(${0}, ${height - margin.bottom})`)
      .call(xAxis)

      svg.append("g")
      .attr("class", "yAxis")
      .attr("transform", `translate(${margin.left}, ${0})`)
      .call(yAxis)

}

/* DRAW FUNCTION */
// we call this everytime there is an update to the data/state
function draw() {

  // + FILTER DATA BASED ON STATE
  const filteredData = state.data // <--- update to filter

  // + DRAW CIRCLES
  const dot = svg
    .selectAll("circle")
    .data(filteredData, d => d.BioID) // second argument is the unique key for that row
    .join(
      // + HANDLE ENTER SELECTION
      enter => enter.append("circle"),

      // + HANDLE UPDATE SELECTION
      update => update,

      // + HANDLE EXIT SELECTION
      exit => exit.remove()

    );
}
