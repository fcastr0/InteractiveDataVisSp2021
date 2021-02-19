d3.csv('../data/squirrelActivities.csv', d3.autoType)
  .then(data => {
    console.log("data", data)

    /** CONSTANTS */
    const width = window.innerWidth * .8;
    const height = window.innerHeight;
    const margins = { top: 20, bottom: 25, left: 50, right: 150 };

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)])
      .range([0, width - margins.right - margins.left])
      .interpolate(d3.interpolateRound)//what does this exactly do?

    const yScale = d3.scaleBand()
      .domain(data.map(d => d.activity))
      .range([margins.top, height - margins.bottom])
      .paddingInner(.4)
      .round(true) //Not sure if this makes a difference or what it does

    /** DRAWING ELEMENTS */
    const svg = d3.select('#barchart-container')
      .append("svg") // this is our drawing space
      .attr("width", width)
      .attr("height", height)

    // draw rectangles
    svg.selectAll("rect")
      .data(data)
      .join("rect")
      .attr("width", (d, i) => xScale(d.count))
      .attr("height", yScale.bandwidth()) //what does the bandwidth actually do?
      .attr("fill", "orange") // try changing this to be a dynamic colorscale
      .attr("y", d => yScale(d.activity))
      .attr("x", d => margins.left) //why doesnt xScale(d.count) work? why does it cause it to flip?

    // draw bottom (left) 'activity' text
    svg.selectAll("text.activity")
      .data(data)
      .join("text")
      .attr("class", 'activity')
      .attr("x", d => margins.left)
      .attr("y", d => yScale(d.activity))
      .attr("dy", "-.25em") // adjust the text a bit lower down
      .attr("text-anchor", 'right') // set the x/y to refer to the middle of the word
      .text(d => d.activity) // set the text

    // draw top 'count' text
    svg.selectAll("text.count")
      .data(data)
      .join("text")
      .attr("class", 'count')
      .attr("x", d => xScale(d.count) + margins.left) //
      .attr("y", d => yScale(d.activity) + yScale.bandwidth() / 2)
      .attr("dx", ".25em") // adjust the text a bit lower down
      .attr("text-anchor", 'start') // set the x/y to refer to the middle of the word
      .text(d => d3.format(",")(d.count)) // set the text, add a formatter to properly format numbers: https://github.com/d3/d3-format
  })