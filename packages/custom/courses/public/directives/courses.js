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



   

};






var globalNodeChart = function(scope,data, element){  

var width = 500, height = 200, radius = 20, gap = 80 , yfixed= height/2 + radius, graph={nodes:[], links:[]}
var svg = d3.select(element[0]).append("svg")
      .attr("width", width)
      .attr("height", height);  


 

var renderGlobal=function(){

  if(typeof scope.data==='undefined') return;
  if(scope.data.length<=0) return;
  var classe = scope.d3opts.issueCode;  
   
   svg.selectAll('g').remove();
   svg.selectAll('defs').remove();

    var color = d3.scale.category10();

 var globalData = $.grep(scope.data, function(e){ return e.type === classe; })[0].data;


  var data = {
  'identity': parseInt($.grep(globalData, function(e){ return e.property == 'identity'; })[0].value),
  'next_p': parseInt($.grep(globalData, function(e){ return e.property =='next_p'; })[0].value),
  'precedent' : parseInt($.grep(globalData, function(e){ return e.property == 'precedent'; })[0].value),
  'shifted_next' : parseInt($.grep(globalData, function(e){ return e.property == 'shifted_next'; })[0].value),
  'shifted_past': parseInt($.grep(globalData, function(e){ return e.property == 'shifted_past'; })[0].value)
  }  

  var datum = [{id: "...", name:'shifted_past',value:data.shifted_past, color:'#008cba'}, 
  {id: 'P-1',name:'precedent', value:data.precedent, color:'#008cba'}, 
  {id: 'P',name:'identity', value:data.identity, color:'#45348A'},
  {id: 'P+1',name:'next_p', value:data.next_p, color:'#008cba'}, 
  {id: "...", name:'shifted_next', value:data.shifted_next, color:'#008cba'}];
  
  
  var identity = {id:'c3', x:gap * 3, y:height/2}
  datum.forEach(function(c, i) {
            c.x = gap * (i +1);
            c.y = height/2  ;
            graph.nodes.push(c);
            var node = {id:c.id,x:c.x, y:c.y};
            if(classe=='destination')
              graph.links.push({source: identity, target: node, value:c.value})
            else
              graph.links.push({source: node, target: identity, value:c.value})
        });

svg.append("defs").selectAll('marker')
    .data(graph.links)
    .enter()
    .append('svg:marker')
      .attr('id', function(d){ return 'marker'})
     .attr("refX", 1) /*must be smarter way to calculate shift*/
    .attr("refY", 5)
    .attr( "viewBox","0 0 10 10")
    .attr("markerWidth", 4)
    .attr("markerHeight", 4)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M 0 0 L 10 5 L 0 10 z") //this is actual shape for arrowhead
    .attr('fill', "#1FB1E6");

  var circle = svg.append("g").selectAll(".circle")
            .data(graph.nodes)
            .enter()
            .append("g")
            .attr("class", "circle")
            .attr("fill",  function(d) {return d.color});
    var el = circle.append("circle")
            .attr("cx", function(d) {return d.x})
            .attr("cy", function(d) {return d.y})
            .attr("r", radius);
    var cTitle = circle.append("text")
      .text(function(d){
          return d.id;
      })
      .attr("dx",  function(d) {return d.x})
      .attr("dy",  function(d) {return d.y + radius/3})
      .attr("stroke", "white");
 var radians = d3.scale.linear()
  .range([Math.PI / 2, 3 * Math.PI / 2]);

  var arc = d3.svg.line.radial()
    .interpolate("basis")
    .tension(0)
    .angle(function(d) { return radians(d); });

  var  linkArc=function(d) {
       var x1 = d.source.x,
          y1 = d.source.y - 20,
          x2 = d.target.x ,
          y2 = d.target.y - 30,
          dx = x2 - x1,
          dy = y2 - y1,
          dr = Math.sqrt(dx * dx + dy * dy),

          // Defaults for normal edge.
          drx = dr,
          dry = dr - 35,
          xRotation = 90, // degrees
          largeArc = 0, // 1 or 0
          
         sweep = (dx>0) ? 1 : 0; // 1 or 0

          // Self edge.
          if ( d.source.x === d.target.x && d.source.y === d.target.y ) {
             x1 = d.source.x - 20,
             x2 = d.target.x + 20,
            y1 = d.source.y + 15,
            y2 = d.target.y + 15,
            dx = x2 - x1,
          dy = y2 - y1, 
          dx = x2 - x1,
          dy = y2 - y1,
          dr = Math.sqrt(dx * dx + dy * dy),
            // Fiddle with this angle to get loop oriented.
            xRotation = -90;
            // Needs to be 1.
            largeArc = 1;
            // Change sweep to change orientation of loop. 
            sweep = 0;
            // Make drx and dry different to get an ellipse
            // instead of a circle.
            drx = 30;
            dry = 30;            
            // For whatever reason the arc collapses to a point if the beginning
            // and ending points of the arc are the same, so kludge it.
            x2 = x2 + 1;
            y2 = y2 + 1;
          } 

     return "M" + x1 + "," + y1 + "A" + drx + "," + dry + " " + xRotation + "," + 
     largeArc + "," + sweep + " " + x2 + "," + y2;
}


var url =window.location.pathname;


var path = svg.append("g").selectAll("path")
    .data(graph.links)
  .enter().append("path")
    .attr("class", function(d) { return "link"; })
    .attr("marker-end", function(d) { return "url("+url+"#marker)"; });
 path.attr("d", linkArc);

svg.append("g").selectAll("g.linklabelholder")
    .data(graph.links).enter().append("g")
    .attr("class", "linklabelholder")    

    .append("text")
      .text(function(d){
          return d.value+"%";
      })
      
      .attr("stroke-width", ".2px")
      .attr("stroke", function(d) {return d.target.color})
      .attr("dx",  function(d) {return ((classe=='provenance')?d.source.x:d.target.x)  })
      .attr("dy",  function(d) {return ((classe=='provenance')?d.source.y:d.target.y) + 1.75 * radius });
}
   scope.$watch('data', function(){
              renderGlobal();
              
          }, true);  
   scope.$watch('data', function(){
              renderGlobal();
              
          }, true);  
  }


var nodeChart = function(scope, element){ 
var width = 500, height = 200, radius = 20, gap = 80 , yfixed= height/2 + radius, graph={nodes:[], links:[]}
  var classe = scope.data.issueCode.split('_')[0];
  var variable = scope.data.issueCode.split('_')[1];
  var elementID = parseInt(scope.data.partIndex);
  var data = {
  'identity': parseInt($.grep(scope.data.transition, function(e){ return e.property == classe+'_identity'; })[0].value),
  'next_p': parseInt($.grep(scope.data.transition, function(e){ return e.property == classe+'_next_p'; })[0].value),
  'precedent' : parseInt($.grep(scope.data.transition, function(e){ return e.property == classe+'_precedent'; })[0].value),
  'shifted_next' : parseInt($.grep(scope.data.transition, function(e){ return e.property == classe+'_shifted_next'; })[0].value),
  'shifted_past': parseInt($.grep(scope.data.transition, function(e){ return e.property == classe+'_shifted_past'; })[0].value)
  }  
  var datum = [{id: "...", name:'shifted_past',value:data.shifted_past, color:'#008cba'}, 
  {id: elementID-1,name:'precedent', value:data.precedent, color:'#008cba'}, 
  {id: elementID,name:'identity', value:data.identity, color:'#45348A'},
  {id: elementID+1,name:'next_p', value:data.next_p, color:'#008cba'}, 
  {id: "...", name:'shifted_next', value:data.shifted_next, color:'#008cba'}];
  $.grep(datum, function(e){if(e.name===variable) e.color='red'});
  var identity = {id:'c3', x:gap * 3, y:height/2}
  datum.forEach(function(c, i) {
            c.x = gap * (i +1);
            c.y = height/2  ;
            graph.nodes.push(c);
            var node = {id:c.id,x:c.x, y:c.y};
            if(classe=='destination')
              graph.links.push({source: identity, target: node, value:c.value})
            else
              graph.links.push({source: node, target: identity, value:c.value})
        });
  var svg = d3.select(element[0]).append("svg")
      .attr("width", width)
      .attr("height", height);    
    var color = d3.scale.category10();
svg.append("defs").selectAll('marker')
    .data(graph.links)
    .enter()
    .append('svg:marker')
      .attr('id', function(d){ return 'marker'})
     .attr("refX", 1) /*must be smarter way to calculate shift*/
    .attr("refY", 5)
    .attr( "viewBox","0 0 10 10")
    .attr("markerWidth", 4)
    .attr("markerHeight", 4)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M 0 0 L 10 5 L 0 10 z") //this is actual shape for arrowhead
    .attr('fill', "#1FB1E6");

  var circle = svg.append("g").selectAll(".circle")
            .data(graph.nodes)
            .enter()
            .append("g")
            .attr("class", "circle")
            .attr("fill",  function(d) {return d.color});
    var el = circle.append("circle")
            .attr("cx", function(d) {return d.x})
            .attr("cy", function(d) {return d.y})
            .attr("r", radius);
    var cTitle = circle.append("text")
      .text(function(d){
          return d.id;
      })
      .attr("dx",  function(d) {return d.x})
      .attr("dy",  function(d) {return d.y + radius/3})
      .attr("stroke", "white");
 var radians = d3.scale.linear()
  .range([Math.PI / 2, 3 * Math.PI / 2]);

  var arc = d3.svg.line.radial()
    .interpolate("basis")
    .tension(0)
    .angle(function(d) { return radians(d); });

  var  linkArc=function(d) {
       var x1 = d.source.x,
          y1 = d.source.y - 20,
          x2 = d.target.x ,
          y2 = d.target.y - 30,
          dx = x2 - x1,
          dy = y2 - y1,
          dr = Math.sqrt(dx * dx + dy * dy),

          // Defaults for normal edge.
          drx = dr,
          dry = dr - 35,
          xRotation = 90, // degrees
          largeArc = 0, // 1 or 0
          
         sweep = (dx>0) ? 1 : 0; // 1 or 0

          // Self edge.
          if ( d.source.x === d.target.x && d.source.y === d.target.y ) {
             x1 = d.source.x - 20,
             x2 = d.target.x + 20,
            y1 = d.source.y + 15,
            y2 = d.target.y + 15,
            dx = x2 - x1,
          dy = y2 - y1, 
          dx = x2 - x1,
          dy = y2 - y1,
          dr = Math.sqrt(dx * dx + dy * dy),
            // Fiddle with this angle to get loop oriented.
            xRotation = -90;
            // Needs to be 1.
            largeArc = 1;
            // Change sweep to change orientation of loop. 
            sweep = 0;
            // Make drx and dry different to get an ellipse
            // instead of a circle.
            drx = 30;
            dry = 30;            
            // For whatever reason the arc collapses to a point if the beginning
            // and ending points of the arc are the same, so kludge it.
            x2 = x2 + 1;
            y2 = y2 + 1;
          } 

     return "M" + x1 + "," + y1 + "A" + drx + "," + dry + " " + xRotation + "," + 
     largeArc + "," + sweep + " " + x2 + "," + y2;
}

var url =window.location.pathname;


var path = svg.append("g").selectAll("path")
    .data(graph.links)
  .enter().append("path")
    .attr("class", function(d) { return "link"; })
    .attr("marker-end", function(d) { return "url("+url+"#marker)"; });
 path.attr("d", linkArc);

svg.append("g").selectAll("g.linklabelholder")
    .data(graph.links).enter().append("g")
    .attr("class", "linklabelholder")    

    .append("text")
      .text(function(d){
          return d.value+"%";
      })
      
      .attr("stroke-width", ".2px")
      .attr("stroke", function(d) {return d.target.color})
      .attr("dx",  function(d) {return ((classe=='provenance')?d.source.x:d.target.x)  })
      .attr("dy",  function(d) {return ((classe=='provenance')?d.source.y:d.target.y) + 1.75 * radius });

  }






if(scope.d3opts.type === 'global') 
  window.setTimeout(function() {
   
if(typeof scope.data==='undefined') return
  else globalNodeChart(scope, scope.data, element)

        }, 70);



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

if(scope.d3opts.issueClass ==='Transition')
   nodeChart(scope, element);

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