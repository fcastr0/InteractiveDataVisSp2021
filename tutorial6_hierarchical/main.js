/**
 * CONSTANTS AND GLOBALS
 * */
 const width = window.innerWidth * 0.9,
 height = window.innerHeight * 0.9,
 margin = { top: 20, bottom: 50, left: 60, right: 40 };

let svg;
let tooltip;

/**
* APPLICATION STATE
* */
let state = {
 data: null,
 hover: null,
 mousePosition: null //might need to delete this as of 3/16
};

/**
* LOAD DATA
* */
d3.json("../data/flare.json", d3.autotype).then(data => {
 state.data = data;
 init();
});

/**
* INITIALIZING FUNCTION
* this will be run *one time* when the data finishes loading in
* */
function init() {
 // with scaleOrdinal, you can specify the color range, and leave the domain blank
 // as you use the colorScale, it will assign each unique key to a color
 const colorScale = d3.scaleOrdinal(d3.schemePaired);

 const container = d3.select("#d3-container").style("position", "relative");

 svg = container
   .append("svg")
   .attr("width", width)
   .attr("height", height);

 // initialize tooltip here — fill it with text in draw whenever state is updated
 tooltip = container.append("div")
   .attr("class", "tooltip")
   .style("position", "absolute")
   .style("top", 0) 
   .style("left", 0)

 const root = d3.hierarchy(state.data) //accessing children
   .sum(d => d.value) // sets the 'value' of each level
   .sort((a, b) => b.value - a.value);
  
  console.log("ROOT IS:", root)

  const circles = d3.pack()
    .size([width, height])
    .padding(1)

// not making a treemap so stuff below is not necessary
//  const treeLayout = d3.treemap()
//    .size([
//      width - margin.left - margin.right,
//      height - margin.top - margin.bottom])
//    .paddingInner(1)
//    .round(true)

 const tree = circles(root) //changed "treeLayout" to circles
 const leaves = tree.leaves()

 // draw tree leaves groups - move into place
 //getting undefined values for g class=leaf -> transform and translate is undefined)
 const leafGroups = svg
   .selectAll(".leaf")
   .data(leaves)
   .join("g") //joins a g element for every leaf
   .attr("class", "leaf") 
   .attr("transform", d => `translate(${d.x}, ${d.y})`); //why cant we use d.xo and d.y0?

 leafGroups.append("circle")
    .attr("fill", d => {
      const level1Ancestor = d.ancestors().find(d => d.depth === 1);
      return colorScale(level1Ancestor.data.name);
    })
    .attr("r", d => d.r)
  
 //wont need this since we are making circles  
 // draw tree leaves rect 
//  leafGroups.append("rect")
//    .attr("width", d => d.x1 - d.x0)
//    .attr("height", d => d.y1 - d.y0)
//    .attr("fill", d => {
//      // grab level 1 category and use that for color
//      const level1Ancestor = d.ancestors().find(d => d.depth === 1);
//      return colorScale(level1Ancestor.data.name);
//    })

 // add mouseover event listener on our group so that it updates state each time one is over
 leafGroups
   .on("mouseenter", (event, d) => { // second argument returns the data associated with that leaf
     state.hover = {
       position: [
        d.x + (d.x - d.x) / 2,
        d.y + (d.y - d.y) / 2
       ], // ^ this makes tooltip appear in the center of our rectangles or circles in this case
       name: d.data.name,
       value: d.data.value,
       // example for something you can do with a leaf node:
       anscestorsPath: d.ancestors()
         .reverse()
         .map(d => d.data.name)
         .join("/")
     }
     // fill in the tooltip once state is updated
     draw() //need to call draw on listener elements
   })
   .on("mouseleave", () => {
     //reset hover when mouse out of the leaf
     state.hover = null
     draw();
   })

 draw(); // calls the draw function
}

/**
* DRAW FUNCTION
* we call this everytime there is an update to the data/state
* */
function draw() {
 // check if there is something saved to `state.hover`
 if (state.hover) {
   tooltip
     .html(
       `
   <div>Name: ${state.hover.name}</div>
   <div>Value: ${state.hover.value}</div>
   <div>Hierarchy Path: ${state.hover.anscestorsPath}</div>
   `
     )
     .transition()
     .duration(300)
     .style("background-color", "#92A8D1")
     .style("transform", `translate(${state.hover.position[0]}px, ${state.hover.position[1]}px )`)
 }

 // hide/show tooltip depending on whether state.hover exists
 // hint: look at the css to see what this is doing
 // ref: https://github.com/d3/d3-selection#selection_classed
 tooltip.classed("visible", state.hover)
}