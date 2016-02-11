angular.module('mean.courses')
.directive( 'd3Chart', [
  function () {
    return {
      restrict: 'E',
      scope: {
        data: '=',
        d3opts: '='
      },
      link: function (scope, element) {

        var barChart = function(scope, element, title){   
        var margin = {top: 20, right: 10, bottom: 30, left: 40},
          width = 580 - margin.left - margin.right,
          height = 200 - margin.top - margin.bottom;

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


    var xmedian = d3.scale.ordinal()
        .rangeBands([0, width], 0);
    xmedian.domain(data.map(function(d) { return d.part; }));

    var dataMediane = d3.median(data, function(d) { return parseInt(d.value); }); 
    var ymedian = d3.svg.line()
        .x(function(d, i) { 
          return xmedian(d.part) + i; })
        .y(function(d, i) { return y(dataMediane); }) 

  svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", ymedian);
  
  // Add title     
    svg.append("svg:text")
        .attr("class", "title")
       .attr("x", -25)
       .attr("y", -10)
       .text(title);

        };

  // add legend   
var legend = svg.selectAll(".legend")
    .data(["Médiane"])
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function (d, i) {
    return "translate(0," + i * 20 + ")";
});

legend.append("text")
    .attr("x", width - 10)
    .attr("y", -10)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function (d) {return d;});

legend.append("rect")
    .attr("x", width - 85)
    .attr("y", -10)
    .attr("width", 30)
    .attr("height", 3)    
    .style("fill", 'orange');



    scope.$watch('data', function(){

              scope.render(scope.data);
          }, true);  

};

var arcChart = function(scope, element){ 
      

};

if(scope.d3opts.issueCode in {'RVminVisit':'','RminVisit':'','RVmaxVisit':'','RmaxVisit':''}) 
  barChart(scope, element, 'Nombre de visites');
if(scope.d3opts.issueCode in {'RVminDuration':'','RminDuration':'','RmaxDuration':''}) 
  barChart(scope, element, 'Durée de lecture (en secondes)');
if(scope.d3opts.issueCode in {'RRmax':''}) 
  barChart(scope, element, 'Nombre de relectures');

if(scope.d3opts.issueCode in {'RRmaxS':'','RRVmaxS':''}) 
  barChart(scope, element, 'Nombre de relectures dans les mêmes séances');

if(scope.d3opts.issueCode in {'RRVmaxD':'','RRmaxD':''}) 
  barChart(scope, element, 'Nombre de relectures dans des séances distinctes');


if(scope.d3opts.issueCode ==='StopRSEnd')
  barChart(scope, element, 'Nombre de fins de séance');

if(scope.d3opts.issueCode === 'StopRSExit')
  barChart(scope, element, 'Nombre de fins de séance sans reprise');

if(scope.d3opts.issueCode === 'StopRecNext')
  barChart(scope, element, 'Nombre de fins de séance avec reprise sur la prochiane partie');

if(scope.d3opts.issueCode === 'StopRecback')
  barChart(scope, element, 'Nombre de fins de séance avec reprise sur la partie précéédente');

if(scope.d3opts.issueCode === 'StopRecShift')
  barChart(scope, element, 'Nombre de fins de séance avec reprise sur des parties lointanines');



//if(scope.d3opts.type === 'Transition')
   // arcChart(scope, element);

          
        }
    };
  }
]);