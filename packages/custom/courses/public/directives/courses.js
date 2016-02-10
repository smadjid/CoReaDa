angular.module('mean.courses')
.directive( 'barChart', [
  function () {
    return {
      restrict: 'E',
      scope: {
        data: '='
      },
      link: function (scope, element) {
        
        var margin = {top: 1, right: 1, bottom: 30, left: 40},
          width = 580 - margin.left - margin.right,
          height = 360 - margin.top - margin.bottom;
        var svg = d3.select(element[0])
          .append("svg")
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
        var y = d3.scale.linear().range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(10);

        //Render graph based on 'data'
        scope.render = function(data) {

          //Set our scale's domains
          x.domain(data.map(function(d) { return d.part; }));
          y.domain([0, d3.max(data, function(d) { return d.value; })]);
          
          //Redraw the axes
          svg.selectAll('g.axis').remove();
          //X axis
          svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis);
              
          //Y axis
          svg.append("g")
              .attr("class", "y axis")
              .call(yAxis)
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("Valeur");
              
          var bars = svg.selectAll(".bar").data(data);
          bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.part); })
            .attr("width", x.rangeBand())
            .on("click", function(d) {  console.log(d.route);scope.loadURL()(d.route)  })
            .append("title") .text(function(d) {return d.title;   });;

          //Animate bars
          bars
              .transition()
              .duration(500)
              .attr('height', function(d) { return height - y(d.value); })
              .attr("y", function(d) { return y(d.value); })
              .attr('stroke', 'white')
              .attr("fill", function(d) { return d.color; });



var x2 = d3.scale.ordinal()
  .rangeBands([0, width], 0);
    x2.domain(data.map(function(d) { return d.part; }));

          var dataSum = d3.sum(data, function(d) { return parseInt(d.value); }); 
 

 var line = d3.svg.line()
    .x(function(d, i) { 
      return x2(d.part) + i; })
    .y(function(d, i) { return y(dataSum/data.length); }); 
  
  svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);

        };

         //Watch 'data' and run scope.render(newVal) whenever it changes
         //Use true for 'objectEquality' property so comparisons are done on equality and not reference
          scope.$watch('data', function(){

              scope.render(scope.data);
          }, true);  
        }
    };
  }
]);