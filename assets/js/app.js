// Define svg width and height;
var svgWidth = 960;
var svgHeight = 500;

// Define svg margin;
var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

// Define chart width and height
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)
  .classed("chart",true);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.95,
      d3.max(censusData, d => d[chosenXAxis]) * 1.05
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderXCircles(circlesGroup, newXScale, chosenXaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating circles text with a transition to
// new circles
function renderXText(circlesText, newXScale, chosenXaxis) {

  circlesText.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));

  return circlesText;
}

// function used for updating y-scale var upon click on axis label
function yScale(censusData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8, 
	  d3.max(censusData, d => d[chosenYAxis]) * 1.05
	])
    .range([height, 0]);

  return yLinearScale;

}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderYCircles(circlesGroup, newYScale, chosenYaxis) {

  circlesGroup.transition()
    .duration(1000)
	.attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function used for updating circles text with a transition to
// new circles
function renderYText(circlesText, newYScale, chosenYaxis) {

  circlesText.transition()
    .duration(1000)
    .attr("y", d => newYScale(d[chosenYAxis]) + 3);

  return circlesText;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, censusData, circles) {

  if (chosenXAxis === "poverty") {
    var xlabel = "In Poverty (%)";
  }
  else if (chosenXAxis === "age") {
    var xlabel = "Age (Median)";
  }
  else if (chosenXAxis === "income") {
    var xlabel = "Income (Median)";
  };
  
  if (chosenYAxis === "healthcare") {
    var ylabel = "Lacks Healthcare (%)";
  }
  else if (chosenYAxis === "obesity") {
    var ylabel = "Obese (%)";
  }
  else if (chosenYAxis === "smokes") {
    var ylabel = "Smokes (%)";
  };

  var toolTip = d3.select("body").append("div")
    .attr("class", "d3-tip")
	.style("display","none");
 
  // on mouseover event
  circles.on("mouseover", function(d,i) {
	toolTip.style("display","block");
    toolTip.html(`${censusData[i].state}<br>
				${xlabel}: ${censusData[i][chosenXAxis]}<br>
				${ylabel}: ${censusData[i][chosenYAxis]}`)
			.style("left",d3.event.pageX+"px")
			.style("top",d3.event.pageY+"px");
  });
  // onmouseout event
  circles.on("mouseout", function() {
      toolTip.style("display","none");
    });

  return circles;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(censusData, err) {
  if (err) throw err;

  // parse data
  censusData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
	data.healthcare = +data.healthcare;
	data.obesity = +data.obesity;
	data.smokes = +data.smokes;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(censusData, chosenXAxis);

  // yLinearScale function above csv import
  var yLinearScale = yScale(censusData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // bind data 
  var circles = chartGroup.selectAll(null)
    .data(censusData)
    .enter()
    .append("g")
	.classed("stateCircle", true);

 // append initial circles
  var circlesGroup = circles.append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
	
  // append text inside circles
  var circlesText = circles.append("text")
	.text((d) => d.abbr)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]) + 3)
	.classed("stateText", true);

  // Create group for 3 x- axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xlabelsGroup.append("text")
    .attr("y", 20)
	.attr("x", 0)
    .attr("value", "poverty") // value to grab for event listener
    .classed("aText active", true)
    .text("In Poverty (%)");

  var ageLabel = xlabelsGroup.append("text")
    .attr("y", 40)
	.attr("x", 0)
    .attr("value", "age") // value to grab for event listener
    .classed("aText inactive", true)
    .text("Age (Median)");
	
  var incomeLabel = xlabelsGroup.append("text")
    .attr("y", 60)
	.attr("x", 0)
    .attr("value", "income") // value to grab for event listener
    .classed("aText inactive", true)
    .text("Income (Median)");

  // Create group for 3 y-axis labels
  
  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)");
	
  var healthcareLabel = ylabelsGroup.append("text")
    .attr("y", 0 - margin.left + 50)
	.attr("x", 0 - (height / 2))
    .attr("dy", "1em")
	.attr("value", "healthcare") // value to grab for event listener
    .classed("aText active", true)
    .text("Lacks Healthcare (%)");
  
  var obesityLabel = ylabelsGroup.append("text")
    .attr("y", 0 - margin.left + 30)
	.attr("x", 0 - (height / 2))
    .attr("dy", "1em")
	.attr("value", "obesity") // value to grab for event listener
    .classed("aText inactive", true)
    .text("Obese (%)");

  var smokesLabel = ylabelsGroup.append("text")
    .attr("y", 0 - margin.left + 10)
	.attr("x", 0 - (height / 2))
    .attr("dy", "1em")
	.attr("value", "smokes") // value to grab for event listener
    .classed("aText inactive", true)
    .text("Smokes (%)");
	
  // updateToolTip function 
  updateToolTip(chosenXAxis, chosenYAxis, censusData, circles);

  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        console.log(chosenXAxis);

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(censusData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);
		
		// updates circles with new x text
        circlesText = renderXText(circlesText, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        updateToolTip(chosenXAxis, chosenYAxis, censusData, circles);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("aText active", true)
            .classed("aText inactive", false);
          ageLabel
            .classed("aText active", false)
            .classed("aText inactive", true);
		  incomeLabel
            .classed("aText active", false)
            .classed("aText inactive", true);
        }
        else if (chosenXAxis === "age") {
          povertyLabel
            .classed("aText active", false)
            .classed("aText inactive", true);
          ageLabel
            .classed("aText active", true)
            .classed("aText inactive", false);
		  incomeLabel
            .classed("aText active", false)
            .classed("aText inactive", true);
        }
		 else if (chosenXAxis === "income") {
          povertyLabel
            .classed("aText active", false)
            .classed("aText inactive", true);
          ageLabel
            .classed("aText active", false)
            .classed("aText inactive", true);
		  incomeLabel
            .classed("aText active", true)
            .classed("aText inactive", false);
        }
      }
    });
	
	  // y axis labels event listener
  ylabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenXAxis with value
        chosenYAxis = value;

        console.log(chosenYAxis)

        // functions here found above csv import
        // updates y scale for new data
        yLinearScale = yScale(censusData, chosenYAxis);

        // updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new y values
        circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);
		
		// updates circles with new y text
        circlesText = renderYText(circlesText, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        updateToolTip(chosenXAxis, chosenYAxis, censusData, circles);

        // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
          healthcareLabel
            .classed("atext active", true)
            .classed("atext inactive", false);
          obesityLabel
            .classed("atext active", false)
            .classed("atext inactive", true);
		  smokesLabel
            .classed("atext active", false)
            .classed("atext inactive", true);
        }
        else if (chosenYAxis === "obesity") {
          healthcareLabel
            .classed("atext active", false)
            .classed("atext inactive", true);
          obesityLabel
            .classed("atext active", true)
            .classed("atext inactive", false);
		  smokesLabel
            .classed("atext active", false)
            .classed("atext inactive", true);
        }
		else if (chosenYAxis === "smokes") {
          healthcareLabel
            .classed("atext active", false)
            .classed("atext inactive", true);
          obesityLabel
            .classed("atext active", false)
            .classed("atext inactive", true);
		  smokesLabel
            .classed("atext active", true)
            .classed("atext inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});
