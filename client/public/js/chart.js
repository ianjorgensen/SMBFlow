var parseData = function(data) {
  var readings = [];
  // extract id's
  for (var i = 1; i < data[0].length; i++) {
    var id = data[0][i];
    var values = [];

    for (var j = 1; j < data.length; j++) {
      values.push({seconds: parseFloat(data[j][0]), contrast: parseFloat(data[j][i])});
    }

    readings.push({
      id: id,
      values: values
    });
  }

  return readings;
};

var drawLineChart = function() {
  $.get(apiHost + 'data', function(data) {
    reagentLines = parseData(data);

    d3.select("svg") && d3.select("svg").remove();

    $('.test-section-chart').html('<svg width="700" height="500"></svg>');

    var svg = d3.select("svg"),
        margin = {top: 20, right: 80, bottom: 30, left: 50},
        width = svg.attr("width") - margin.left - margin.right,
        height = svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear().range([0, width]),
        y = d3.scaleLinear().range([height, 0]),
        z = d3.scaleOrdinal(d3.schemeCategory10);

    var line = d3.line()
        .curve(d3.curveBasis)
        .x(function(d) { return x(d.seconds); })
        .y(function(d) { return y(d.contrast); });


    x.domain(d3.extent(reagentLines[0].values, function(d) {
       return d.seconds;
    }));

    x.domain([
      0,
      d3.max(reagentLines, function(c) { return d3.max(c.values, function(d) { return d.seconds; }); }) + 100
    ]);

    var miny = d3.min(reagentLines, function(c) { return d3.min(c.values, function(d) { return d.contrast; }); })

    if (miny > 0) {
      miny = 0;
    }

    y.domain([miny, 10]);
    z.domain(reagentLines.map(function(c) { return c.id; }));

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y))
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("fill", "#000")
        .text("Contrast");

    var reagentLine = g.selectAll(".reagentLine")
      .data(reagentLines)
      .enter().append("g")
        .attr("class", "reagentLine");

    reagentLine.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line(d.values); })
        .style("stroke", function(d) { return z(d.id); });

    reagentLine.append("text")
        .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
        .attr("transform", function(d) { return "translate(" + x(d.value.seconds) + "," + y(d.value.contrast) + ")"; })
        .attr("x", 3)
        .attr("dy", "0.35em")
        .style("font", "10px sans-serif")
        .text(function(d) { return d.id; });
  });
};
