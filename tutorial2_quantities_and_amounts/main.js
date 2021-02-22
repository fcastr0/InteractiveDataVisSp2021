d3.csv('../data/squirrelActivities.csv', d3.autoType)
  .then(data => {
    console.log("data", data)

    /** CONSTANTS */
    const width = window.innerWidth * .8;
    const height = window.innerHeight / 2;
    const margins = { top: 30, bottom: 25, left: 25, right: 150};
    const color = d3.scaleSequential()
      .domain([0, d3.max(data, d => d.count)])
      .interpolator(d3.interpolatePurples)

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)])
      .range([0, width - margins.right - margins.left])
      .interpolate(d3.interpolateRound)

    const yScale = d3.scaleBand()
      .domain(data.map(d => d.activity))
      .range([margins.top, height - margins.bottom])
      .paddingInner(.35)
      .round(true)

    const svg = d3.select('#barchart-container')
      .append("svg") 
      .attr("width", width)
      .attr("height", height)

    svg.selectAll("rect")
      .data(data)
      .join("rect")
      .attr("width", (d, i) => xScale(d.count))
      .attr("height", yScale.bandwidth()) 
      .attr("y", d => yScale(d.activity))
      .attr("x", d => margins.left)
      .attr("fill", d => color(d.count))

    svg.selectAll("text.activity")
      .data(data)
      .join("text")
      .attr("class", 'activity')
      .attr("x", d => margins.left)
      .attr("y", d => yScale(d.activity))
      .attr("dy", "-.25em") 
      .attr("text-anchor", 'right') 
      .text(d => d.activity)

    svg.selectAll("text.count")
      .data(data)
      .join("text")
      .attr("class", 'count')
      .attr("x", d => xScale(d.count) + margins.left) //
      .attr("y", d => yScale(d.activity) + yScale.bandwidth() / 2)
      .attr("dx", ".10em")
      .attr("text-anchor", 'start')
      .text(d => d3.format(",")(d.count)) // set the text, add a formatter to properly format numbers: https://github.com/d3/d3-format
  })