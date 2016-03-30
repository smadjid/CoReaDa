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
      

var inspectorCharts = function(scope, element){  
        var margin = {top: 5, right: 00, bottom: 100, left: 40},
          width = 530 - margin.left - margin.right,
          height = 300 - margin.top - margin.bottom;
          var svg = d3.select(element[0])
          .append("svg")          
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)

scope.inspectorRenderBars = function(globalData, classe) { 


  d3.select(element[0]).selectAll("*").remove();
  width = $(element[0]).parent().width() - margin.left - margin.right ;
  
          svg = d3.select(element[0])
          .append("svg")          
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .attr('class','barChart')
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
        var y = d3.scale.linear().range([height, 0]);


var  data = $.grep(globalData, function(e){ return e.type == classe; })[0].data;

          data = data.filter(function(e){ return e.elementType == scope.d3opts.elementType });

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");
              
        if(scope.d3opts.elementType!=='part') 
            xAxis.tickFormat(function(d) { return data.filter(function(e){ return e.part == d })[0].title; });
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(10);
if(classe=="mean.duration")    
          yAxis.tickFormat(d3.format("d"))
        else
          yAxis.tickFormat(d3.format("%"));
        //Render graph based on 'data'
       
          
          

          //Set our scale's domains
          x.domain(data.map(function(d) { return d.part; }));
          y.domain([0, d3.max(data, function(d) { return d.value; })]);
          
          //Redraw the axes
          svg.selectAll('g.axis').remove();
          svg.selectAll('path').remove();
          //X axis
          var xax = svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis);

if(scope.d3opts.elementType!=='part') 
              xax.selectAll("text")   
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-25)" );
              
          //Y axis
          svg.append("g")
              .attr("class", "y axis")
              .call(yAxis)
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end");
              
          var bars = svg.selectAll(".bar").data(data);
          bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.part); })            
            .attr("width", x.rangeBand())
            .on("click", function(d) { 
              
            //  if("#"+d.route!==window.location.hash)
               //window.location.hash = "#"+d.route
            })
            .on("mouseover", function (d) {
                  d3.select(this).attr("stroke-width", '3')
                  d3.select(this).attr("stroke", '#4169E1')
                  scope.$emit('hover',d.route)
              }) 
              .on("mouseout", function (d) {
                  d3.select(this).attr("stroke", 'none')
                  
                  stopHover();
              })             
           
            .append("title") .text(function(d) {return d.title;   });;

          //Animate bars
          bars
              .transition()
              .duration(0)
              .attr('height', function(d) { return height - y(d.value); })
              .attr("y", function(d) { return y(d.value); })
              .attr('stroke', 'white')
               .attr("fill", function(d) {return (d.part==scope.d3opts.elementId)? '#45348A':'#008cba'; });


    var xmedian = d3.scale.ordinal()
        .rangeBands([0, width], 0); 
    xmedian.domain(data.map(function(d) { return d.part; }));



    var dataMediane = d3.median(data, function(d) { return parseFloat(d.value); }); 
    var ymedian = d3.svg.line()
        .x(function(d, i) { 
          return xmedian(d.part) ; })
        .y(function(d, i) { return y(dataMediane); }) 


  

  var xmean = d3.scale.ordinal()
        .rangeBands([0, width], 0);
    xmean.domain(data.map(function(d) { return d.part; }));

    var dataMean = d3.mean(data, function(d) { return parseFloat(d.value); }); 
    var ymean = d3.svg.line()
        .x(function(d, i) { 
          return xmedian(d.part) + i; })
        .y(function(d, i) { return y(dataMean); }) 

  svg.append("path")
      .datum(data)
      .attr("class", "medianeLine")
      .attr("d", ymedian);
/*  svg.append("path")
      .datum(data)
      .attr("class", "meanLine")
      .attr("d", ymean);
  */

 var legend = svg.selectAll(".legend")
      .data([{"text":"Moyenne","color":"#d35400"}/*,{"text":"Médiane","color":"#F39C12"}*/])
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function (d, i) {return "translate(0," + i * 20 + ")";});



legend.append("text")
    .attr("x", width - 10)
    .attr("y", -15)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function (d) {return d.text;});

legend.append("rect")
    .attr("x", width - 90)
    .attr("y", -15)
    .attr("width", 30)
    .attr("height", 3)    
    .style("fill", function (d) {return d.color;});

        };

scope.inspectorRenderTransitionNodes = function(data, classe) {
var width =  $(element[0]).parent().width() - margin.left - margin.right ; 
  var gap = parseInt(width /6) ;
  var radius = gap / 4;
  var height = gap * 3;

  var   graph={nodes:[], links:[]}    
  
  
  d3.select(element[0]).selectAll("*").remove();

  svg = d3.select(element[0])
          .append("svg")          
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .attr('class','nodeChart');

  var elementID = parseInt(scope.d3opts.elementId);
  var elementIDTxt = (scope.d3opts.elementType=='chapter')? 'S':'S';
  

  

 var globalData = $.grep(data, function(e){ return e.type == classe })[0].data;

 globalData = globalData.filter(function(e){ return e.elementType == scope.d3opts.elementType });
 

 globalData = globalData.filter(function(e){ return e.part == elementID })[0].transitions;

  var data = {
  'identity': parseInt(globalData.filter(function(e){ return e.property == classe+'_identity'; })[0].value),
  'next_p': parseInt(globalData.filter(function(e){ return e.property == classe+'_next_p'; })[0].value),
  'precedent' : parseInt(globalData.filter(function(e){ return e.property == classe+'_precedent'; })[0].value),
  'shifted_next' : parseInt(globalData.filter(function(e){ return e.property == classe+'_shifted_next'; })[0].value),
  'shifted_past': parseInt(globalData.filter(function(e){ return e.property == classe+'_shifted_past'; })[0].value)
  }  
  
   

  var datum =[] ;
  if(scope.d3opts.elementType=='part') 
    {if(elementID==1)
        datum = [ 
      {id: elementID,name:'identity', value:data.identity, color:'#45348A'},
      {id: elementID+1,name:'next_p', value:data.next_p, color:'#008cba'}, 
      {id: "...", name:'shifted_next', value:data.shifted_next, color:'#008cba'}]
      else
          datum = [{id: "...", name:'shifted_past',value:data.shifted_past, color:'#008cba'}, 
              {id: elementID-1,name:'precedent', value:data.precedent, color:'#008cba'}, 
              {id: elementID,name:'identity', value:data.identity, color:'#45348A'},
              {id: elementID+ 1,name:'next_p', value:data.next_p, color:'#008cba'}, 
              {id: "...", name:'shifted_next', value:data.shifted_next, color:'#008cba'}]
    }
  else
    datum = [{id: "...", name:'shifted_past',value:data.shifted_past, color:'#008cba'}, 
  {id: elementIDTxt+"-1",name:'precedent', value:data.precedent, color:'#008cba'}, 
  {id: elementIDTxt,name:'identity', value:data.identity, color:'#45348A'},
  {id: elementIDTxt+"+ 1",name:'next_p', value:data.next_p, color:'#008cba'}, 
  {id: "...", name:'shifted_next', value:data.shifted_next, color:'#008cba'}]
  
  
  
  var identity ={};
   if(elementID==1) identity ={id:'c1', x:gap , y:height/2}
    else identity ={id:'c3', x:gap * 3, y:height/2}
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
          if ( d.source.x == d.target.x && d.source.y == d.target.y ) {
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
scope.$watch(function(){
   
            width = $(element[0]).parent().width();     
            
 
            return width 
          }, resize);

    function resize(){

      if(typeof scope.data =='undefined') return;
      
              if(scope.d3opts.issueCode in {'Actions_tx':'', 'speed':'','rereadings_tx':'','norecovery_tx':''})              
               scope.inspectorRenderBars(scope.data, scope.d3opts.issueCode)
           // else scope.inspectorRenderTransitionNodes(scope.data, scope.d3opts.issueCode)
    
    }
    

scope.$watch('data', function(){
  console.log(scope.data); 
  if(typeof scope.data =='undefined') return;

  if(scope.d3opts.issueCode in {'Actions_tx':'', 'speed':'','rereadings_tx':'','norecovery_tx':''})              
    scope.inspectorRenderBars(scope.data, scope.d3opts.issueCode)
           // else scope.inspectorRenderTransitionNodes(scope.data, scope.d3opts.issueCode)
          }, true);  
   

scope.$watch('d3opts', function(){
  console.log(scope.d3opts);   
  if(typeof scope.data =='undefined') return;
    if(scope.d3opts.issueCode in {'Actions_tx':'', 'speed':'','rereadings_tx':'','norecovery_tx':''})              
     scope.inspectorRenderBars(scope.data, scope.d3opts.issueCode)
           // else scope.inspectorRenderTransitionNodes(scope.data, scope.d3opts.issueCode)
          }, true);  
};

/**************************************************************/
var RereadingsChart = function(scope, element, title){  
   
   
    var margin = {top: 20, right: 10, bottom: 30, left: 40},
          width = 580 - margin.left - margin.right,
          height = 320 - margin.top - margin.bottom;
          var color = d3.scale.category20c();
          var r = height/2;

          var data = [{"label":"Conjointe", "value":parseInt(scope.data.seq_rereads)}, 
              {"label":"Disjointe", "value":parseInt(scope.data.dec_rereads)}];

        var vis = d3.select(element[0])
          .append("svg")
          .attr('class','rereadChart')
          .data([data])
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append("svg:g").attr("transform", "translate(" + r + "," + r + ")");
var pie = d3.layout.pie().value(function(d){return d.value;});

// declare an arc generator function
var arc = d3.svg.arc().outerRadius(r);

// select paths, use arc generator to draw
var arcs = vis.selectAll("g.slice").data(pie).enter().append("svg:g").attr("class", "slice");
arcs.append("svg:path")
    .attr("fill", function(d, i){
        return color(i);
    })
    .attr("d", function (d) {
        // log the result of the arc generator to show how cool it is :)
        
        return arc(d);
    });

// add the text
arcs.append("svg:text").attr("transform", function(d){
      d.innerRadius = 0;
      d.outerRadius = r;
    return "translate(" + arc.centroid(d) + ")";}).attr("text-anchor", "left").text( function(d, i) {
    return (data[i].label+' : ' +data[i].value+'%');}
    );

      }    







var nodeChart = function(scope, element){ 
  var width = 500, height = 200, radius = 20, gap = 80 , yfixed= height/2 + radius, graph={nodes:[], links:[]}
  var classe = scope.data.issueCode.split('_')[0];
  var variable = scope.data.issueCode.split('_')[1];
  var elementID = parseFloat(scope.data.partIndex);
  var data = {
  'identity': parseFloat($.grep(scope.data.transition, function(e){ return e.property == classe+'_identity'; })[0].value),
  'next_p': parseFloat($.grep(scope.data.transition, function(e){ return e.property == classe+'_next_p'; })[0].value),
  'precedent' : parseFloat($.grep(scope.data.transition, function(e){ return e.property == classe+'_precedent'; })[0].value),
  'shifted_next' : parseFloat($.grep(scope.data.transition, function(e){ return e.property == classe+'_shifted_next'; })[0].value),
  'shifted_past': parseFloat($.grep(scope.data.transition, function(e){ return e.property == classe+'_shifted_past'; })[0].value)
  }  
  var datum = [{id: "...", name:'shifted_past',value:data.shifted_past, color:'#008cba'}, 
  {id: elementID-1,name:'precedent', value:data.precedent, color:'#008cba'}, 
  {id: elementID,name:'identity', value:data.identity, color:'#45348A'},
  {id: elementID+1,name:'next_p', value:data.next_p, color:'#008cba'}, 
  {id: "...", name:'shifted_next', value:data.shifted_next, color:'#008cba'}];
  $.grep(datum, function(e){if(e.name==variable) e.color='red'});
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
          if ( d.source.x == d.target.x && d.source.y == d.target.y ) {
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




if(scope.d3opts.type == 'global') 
{  
if(scope.d3opts.issueCode in {'Actions_tx':'', 'mean.duration':'','speed':'',
                        'rereadings_tx':'','course_readers_rereaders':'','part_readers_rereaders':'',
                      'rupture_tx':'','norecovery_tx':'','next_recovery_tx':'','prev_recovery_tx':'','distant_prev_recovery_tx':''
                      })  globalCharts(scope, element)

else 
  if(scope.d3opts.issueCode in {'provenance':'','destination':''})  
       //   globalNodeChart(scope, element)
      globalCharts(scope, element)
    //else globalBubbleChart(scope, element,'titre');
}
else
if(scope.d3opts.type == 'inspector'){
inspectorCharts(scope, element,'titre')
/*if(scope.d3opts.issueCode in {'Actions_tx':'', 'mean.duration':'','speed':'',
                        'rereadings_tx':'','course_readers_rereaders':'','part_readers_rereaders':'',
                      'rupture_tx':'','norecovery_tx':'','next_recovery_tx':'','prev_recovery_tx':'','distant_prev_recovery_tx':''
                      })  inspectorCharts(scope, element,'titre')

  else if(scope.d3opts.issueCode in {'provenance':'','destination':''})
      nodeChart(scope, element);*/

}
else
if(scope.d3opts.type == 'fact'){
  
inspectorCharts(scope, element,'titre')

  /*if(scope.d3opts.issueCode in {'provenance':'','destination':''})
      nodeChart(scope, element);*/

}
else

if(scope.d3opts.type == 'rs'){

  rsBxChart(scope, element, ' '); 

}
else{
if(scope.d3opts.issueClass =='Transition')
   nodeChart(scope, element)
 else 
  if(scope.d3opts.issueCode in {'RRmaxD':'','RRVmaxSeq':''}) 
    RereadingsChart(scope, element)
    else
      barChart(scope, element, ' ');
 
}


        }
    };
  }
]);