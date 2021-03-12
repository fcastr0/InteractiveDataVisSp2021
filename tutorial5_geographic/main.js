/**
 * CONSTANTS AND GLOBALS
 * */
 const width = window.innerWidth * 0.9,
 height = window.innerHeight * 0.80,
 margin = { top: 20, bottom: 50, left: 60, right: 40 };

/** these variables allow us to access anything we manipulate in
* init() but need access to in draw().
* All these variables are empty before we assign something to them.*/
let svg;

/**
* APPLICATION STATE
* */
let state = {
 geojson: null,
 points: null,
 hover: {
   screenPosition: null, // will be array of [x,y] once mouse is hovered on something
   mapPosition: null, // will be array of [long, lat] once mouse is hovered on something
   visible: false,
 }
};

/**
* LOAD DATA
* Using a Promise.all([]), we can load more than one dataset at a time
* */
Promise.all([
 d3.json("../data/usState.json"),
 d3.csv("../data/usHeatExtremes.csv", d3.autoType),
]).then(([geojson, pointsData]) => {
 state.geojson = geojson
 state.points = pointsData
 console.log("STATE: ", state);
 init();
});

/**
* INITIALIZING FUNCTION
* this will be run *one time* when the data finishes loading in
* */
function init() {
 // create an svg element in our main `d3-container` element
 svg = d3
   .select("#d3-container")
   .append("svg")
   .attr("width", width)
   .attr("height", height);

  const colorScale = d3.scaleSequential(d3.interpolateOrRd)
    .domain(d3.extent(state.points, d => d.changein95percentdays))

   // SPECIFY PROJECTION
   // a projection maps from lat/long -> x/y values
   // so it works a lot like a scale!
   const projection = d3.geoAlbersUsa()
     .fitSize([
     width-margin.left-margin.right,
     height-margin.top-margin.bottom], state.geojson);

   // DEFINE PATH FUNCTION
   const path = d3.geoPath(projection)

   // draw base layer path - one path for each state
   const states = svg.selectAll("path.states")
     .data(state.geojson.features)
     .join("path")
     .attr("class", 'states')
     .attr("stroke", "#7E354D")
     .attr("fill", "transparent")
     .attr("d", path)

   // EXAPMLE #1: lat/long => x/y
   // draw point for CUNY graduate center
   const gradCenterPoint =  { latitude: 40.7423, longitude: -73.9833 };
   svg.selectAll("circle.point")
     .data([gradCenterPoint])
     .join("circle")
     .attr("r", 10)
     .attr("fill", "#7D1B7E")
     .attr("transform", d=> {
       // use our projection to go from lat/long => x/y
       // ref: https://github.com/d3/d3-geo#_projection
       const [x, y] = projection([d.longitude, d.latitude])
       return `translate(${x}, ${y})`
     })

    // Added transition from here since finding out this adds our points from state.points
    // const heatdots = svg.selectAll("circle.heat")
    //  .data(state.points)
    //  .join("circle")
    //  .attr("r", 10)
    //  .attr("fill", d => {
    //    return colorScale(d.changein95percentdays)
    //  })
    //  .style("opacity", .70)
    //  .attr("stroke", "gray")
    //  .attr("stroke-width", .25)
    //  .attr("transform", d => {
    //   const [x,y] = projection([d.longitude, d.latitude]);
    //   return `translate(${x}, ${y})`
    // })

    const heatdots = svg.selectAll("circle.heat")
     .data(state.points)
     .join(
       enter => enter
        .append("circle")
        .attr("r", 5)
        .attr("opacity", .25)
        .attr("stroke", "gray")
        .attr("stroke-width", .25)
        .call(enter => enter
          .transition()
            .duration(1000)
            .delay((d, i) => i * 3)
            .attr("fill", d => {
            return colorScale(d.changein95percentdays)
            })
            .attr("opacity", .85)
            .attr("r", 10) // transition effect is not taking place, no increase in radius, opacity, 
            .attr("transform", d => {
              const [x,y] = projection([d.longitude, d.latitude]);
              return `translate(${x}, ${y})` 
            })
            ),
        
        update => update
          .call(update => update),
        exit => exit
          .call(exit => exit)
          .remove()    
      );

   // EXAMPLE #2: x/y=> lat/long
   // take mouse screen position and report location value in lat/long
   // set up event listener on our svg to see where the mouse is
   heatdots
   .on("mousemove", (event, d) => {
     console.log(d)

     // 1. get mouse x/y position
     const {clientX, clientY} = event

     // 2. invert the projection to go from x/y => lat/long
     // ref: https://github.com/d3/d3-geo#projection_invert
     const [long, lat] = projection.invert([clientX, clientY])
     state.hover=  {
       screenPosition: [clientX, clientY], // will be array of [x,y] once mouse is hovered on something
       mapPosition: [long, lat], // will be array of [long, lat] once mouse is hovered on something
       visible: true,
       states: d.State // added 'states' to later show in the tooltip / saved here to be called later
     }
     draw();
   }).on("mouseout", event=>{
     // hide tooltip when not moused over a state
     state.hover.visible = false
     draw(); // redraw
   })


 draw(); // calls the draw function
}

/**
* DRAW FUNCTION
* we call this everytime there is an update to the data/state
* */
function draw() {
 // add div to HTML and re-populate content every time `state.hover` updates
 d3.select("#d3-container") // want to add
   .selectAll('div.hover-content')
   .data([state.hover])
   .join("div")
   .attr("class", 'hover-content')
   .classed("visible", d=> d.visible)
  // Not needed since I am placing a fixed tooltip 
  //  .style("position", 'absolute')
  //  .style("transform", d=> {
  //    // only move if we have a value for screenPosition
  //    if (d.screenPosition)
  //    return `translate(${d.screenPosition[0]}px, ${d.screenPosition[1]}px)`
  //  })
   .html(d=> {
     return `
     <div>Find Out Where You Are!</div>
     <div>
     Hovered Location: ${d.mapPosition}
     State: ${d.states} 
     </div>
     `
     //placed saved tooltip feature above^
   })
}