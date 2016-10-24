angular.module('mean.courses')
.directive( 'd3Chart', [
  function () {
    return {
      restrict: 'E',
      scope: {
        data: '=',
        d3opts: '=',
        indicatorCode:'=',
        onTransitions:'&'
      },
      link: function (scope, element) {   
      

var inspectorCharts = function(scope, element){  
       var margin = {top: 15, right: 00, bottom: 80, left: 40},
          width = width = $(element[0]).parent().width() - margin.left - margin.right,
          height = 270 - margin.top - margin.bottom;
          var svg = d3.select(element[0])
          .append("svg")          
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
var saveLog = function(params) {
        return $http.post('/api/courses/log/'+scope.d3opts.courseId,params);
      };
d3.select(element[0]).selectAll("*").remove();

scope.inspectorRenderBars = function(globalData, classe) { 
if(typeof classe =='undefined')        return;

//TODO : this is just a hack part section
var elementType = scope.d3opts.elementType;
var elementId = Array.isArray(scope.d3opts.elementId)?scope.d3opts.elementId: [scope.d3opts.elementId];



if(elementType=='section') elementType='part';
  d3.select(element[0]).selectAll("*").remove();
  width = $(element[0]).parent().width() - margin.left - margin.right ;
  
          svg = d3.select(element[0])
          .append("svg")          
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .attr('class','barChart');
        var svgElt =  svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + 2*margin.top + ")");

        var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
        var y = d3.scale.linear().range([height, 0]);

//console.log(classe)
//console.log(globalData)
var  data = $.grep(globalData, function(e){ return e.type == classe; })[0].data;
          data = data.filter(function(e){ return e.elementType == elementType });
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");
              
        if(elementType!=='part') 
            xAxis.tickFormat(function(d) { return data.filter(function(e){ return e.part == d })[0].title; });
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(10);
if(classe=="Readers" | classe=="speed")    
          yAxis.tickFormat(d3.format("d"))
        else
          yAxis.tickFormat(d3.format("%"));
        //Render graph based on 'data'
       
          
          

          //Set our scale's domains
          x.domain(data.map(function(d) { return d.part; }));
          y.domain([0, d3.max(data, function(d) { return d.value; })]);
          
          //Redraw the axes
          svgElt.selectAll('g.axis').remove();
          svgElt.selectAll('path').remove();
          //X axis
          var xax = svgElt.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis);

if(elementType!=='part') 
              xax.selectAll("text")   
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-35)" );
              
          //Y axis
          svgElt.append("g")
              .attr("class", "y axis")
              .call(yAxis)
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end");
              
          var bars = svgElt.selectAll(".bar").data(data);
          bars.enter()
            .append("rect")
            .attr("class", function(d){
              return ($.inArray(d.part, elementId)>-1)? 'bar selected':'bar'; 
            })
            .attr("x", function(d) { return x(d.part); })            
            .attr("width", x.rangeBand())
            .attr("stroke-width", function(d) {
               return ($.inArray(d.part, elementId)>-1)? 6:1;
            }

              )
            .attr('fill', function(d) {
                    var c = '#008cba';
                    var ind = d.metrics;
                    if(typeof ind !="undefined"){
                                  ind = ind.filter(function(e){ return e.code == classe })
                                  if(ind.length>0) c = ind[0].color
                                    else               console.log(d.metrics)
                  }
                  return c; 
              })
            .attr('stroke',  function(d) {
                   
                  return ($.inArray(d.part, elementId)>-1)? '#45348A':'#9E9E9E'; 
              })
            .on("click", function(d) { 
              ///////////// LOG ////////////
                saveLog({
                'name':'barClick',
                'elementId':d._id,
                'params':[
                 {'paramName':'url','paramValue':+d.route}] 
                });
              //////////////////////////////
              if("#"+d.route!=window.location.hash)
               window.location.hash = "#"+d.route+"&tab="+scope.d3opts.tab;
            })
            .on("mouseover", function (d) {
                  d3.select(this).attr("stroke", '#45348A')
                  //d3.select(this).attr("stroke", '#4169E1')
                  //scope.$emit('hover',d.route)
              }) 
              .on("mouseout", function (d) {
                  d3.select(this).attr("stroke", 

                    function(d){return ($.inArray(d.part, elementId)>-1)?  '#45348A':'#9E9E9E'})
                  
                 
              })  .append("title") .text(function(d) {return d.title;   });;

          //Animate bars
          bars
              .transition()
                .duration(0)
                .delay(0)
                .attr("y", function(d) { return y(d.value); })
                .attr("height", function(d) { return height - y(d.value); });
 
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

 
if(typeof dataMediane !='undefined')
      svgElt.append("line")
                     .attr("x1", 0)
                     .attr("y1", y(dataMediane))
                     .attr("x2", width)
                     .attr("y2", y(dataMediane))
                     .attr("class", "medianeLine");
 var legend = svg.selectAll(".legend")
      .data([{"text":"Médiane","color":"#F39C12"}/*,{"text":"Médiane","color":"#F39C12"}*/])
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function (d, i) {return "translate(0," + parseInt(5+i * 20) + ")";});



legend.append("text")
    .attr("x", width )
    .attr("y", '.7em')
    .attr("dy", ".4em")
    .style("text-anchor", "end")
    .text(function (d) {return d.text;});

legend.append("rect")
    .attr("x", width - 80)
    .attr("y", '.7em')
    .attr("width", 30)
    .attr("height", 3)    
    .style("fill", function (d) {return d.color;});

        };

scope.inspectorRenderTransitionNodes = function(data, classe) {

if(typeof classe =='undefined')        return;
//TODO : this is just a hack part section
d3.select(element[0]).selectAll("*").remove();

var elementType = scope.d3opts.elementType;

var elementID = scope.d3opts.currentId;
if(scope.d3opts.currentId==null)
  elementID = 0;
if(elementType=='section') elementType='part';
  d3.select(element[0]).selectAll("*").remove();

 var margin = {top: 15, right: 00, bottom: 80, left: 40},
          width = 530 - margin.left - margin.right,
          height = 270 - margin.top - margin.bottom;
  var svg = d3.select(element[0])
          .append("svg")          
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .attr('class','nodeChart');
          

      

  var gap = parseInt(width /4) ;
  var radius = gap / 3;
  var height = gap * 2;

  var   graph={nodes:[], links:[]}    
  
  


  var elementType=scope.d3opts.elementType;
  
  var elementIDTxt = (scope.d3opts.elementType=='chapter')? 'Chap.':'S';
  

  

 var globalData = $.grep(data, function(e){ return e.type == classe })[0].data;

 //globalData = globalData.filter(function(e){ return e.elementType == elementType });
//

 globalData = globalData.filter(function(e){ return e.part == elementID })[0];
//console.log(globalData); 
//alert(elementID)
  var data={};

  if(classe=='provenance_not_linear')
    data = {
  'normal' : Math.round(parseFloat(100*globalData.transitions.provenance.normal),2),
  'past' : Math.round(parseFloat(100*globalData.transitions.provenance.past),2),
  'future': Math.round(parseFloat(100*globalData.transitions.provenance.future),2)
  }  
  else
    data = {
  'normal' : Math.round(parseFloat(100*globalData.transitions.destination.normal),2),
  'past' : Math.round(parseFloat(100*globalData.transitions.destination.past),2),
  'future': Math.round(parseFloat(100*globalData.transitions.destination.future),2)
  }  
  
   

  var datum =[] ;  
  var identity ={};

  if(classe=='provenance_not_linear'){   
  
       if(data.past>0) datum.push({id: "...", name:'past',value:data.past, color:'#008cba', igap : 0});
      if(data.normal>0) datum.push({id: elementIDTxt+"-1",name:'normal', value:data.normal, color:'#008cba', igap : gap});
      datum.push({id: elementIDTxt,name:'identity', value:0, color:'#45348A', igap : 2*gap});
      if(data.future>0) datum.push({id: "...", name:'future', value:data.future, color:'#008cba', igap : 3*gap});
     
    

    identity ={id: elementIDTxt, x:gap * 2.5, y:height/2}
    // if(elementID>=2) identity ={id:'c3', x:gap * 2.5, y:height/2}  
    datum.forEach(function(c, i) {
            c.x = c.igap + gap/2;
            c.y = height/2  ;
            
            graph.nodes.push(c);
            var node = {id:c.id,x:c.x, y:c.y};

            if(c.id!=elementIDTxt )                        
                          graph.links.push({source: node, target: identity, value:c.value})
                
        });
}
else{
  
     if(data.past>0) datum.push({id: "...", name:'past',value:data.past, color:'#008cba', igap : 0});
      datum.push({id: elementIDTxt,name:'identity', value:0, color:'#45348A', igap : gap});
      if(data.normal>0) datum.push({id: elementIDTxt+"+1",name:'normal', value:data.normal, color:'#008cba', igap : 2*gap});      
      if(data.future>0) datum.push({id: "...", name:'future', value:data.future, color:'#008cba', igap : 3*gap});
  
     

  identity ={id:elementIDTxt, x:gap * 1.5, y:height/2}
    datum.forEach(function(c, i) {
            c.x = c.igap + gap/2;
            c.y = height/2  ;

            graph.nodes.push(c);
            var node = {id:c.id,x:c.x, y:c.y};
            if(c.id!=elementIDTxt )
                          graph.links.push({source: identity, target: node, value:c.value})
                        
                
        }); 
}

svg.append("defs").selectAll('marker')
    .data(graph.links)
    .enter()
    .append('svg:marker')
      .attr('id', function(d){ return 'marker'})
     .attr("refX", 1) /*must be smarter way to calculate shift*/
    .attr("refY", 5)
    .attr( "viewBox","0 0 10 10")
    .attr("markerWidth", 5)
    .attr("markerHeight", 5)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M 0 0 L 10 5 L 0 10 z") //this is actual shape for arrowhead
    .attr('fill', "#1FB1E6");

  var circle = svg.append("g").selectAll(".circle")
            .data(graph.nodes)
            .enter()
            .append("g")
            .attr("class", "circle")
            .attr("fill",  function(d) {return d.color})
            .on("click", function(d) { scope.onTransitions({type:scope.d3opts.elementType,elementId:elementID})});
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
          y1 = d.source.y - 40,
          x2 = d.target.x ,
          y2 = d.target.y - 50,
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
      .attr("dx",  function(d) {return ((classe=='provenance_not_linear')?d.source.x:d.target.x)  })
      .attr("dy",  function(d) {return ((classe=='provenance_not_linear')?d.source.y:d.target.y) + 1.75 * radius });

}
scope.inspectorRenderPie = function(data, classe) {
  if(typeof classe =='undefined')        return;
  var elementType = scope.d3opts.elementType;

var elementID = scope.d3opts.currentId;
if(scope.d3opts.currentId==null)
  elementID = 0;
if(elementType=='section') elementType='part';
  d3.select(element[0]).selectAll("*").remove();



var elementId = elementID;
var color = d3.scale.category20c();
var r = (height + margin.top )/2;

 var globalData = $.grep(data, function(e){ return e.type == classe })[0].data;
 globalData = globalData.filter(function(e){ return e.part == elementID })[0];



 var data = [];
 console.log(globalData);
if((classe=="rereads_seq_tx")||(classe=="rereads_dec_tx"))
  data = [{"label":"Relectures conjointes", "value":Math.round(parseFloat(100*globalData.indicators.rereads_seq_tx),2)}, 
              {"label":"Relectures disjointes", "value":Math.round(parseFloat(100*globalData.indicators.rereads_dec_tx),2)}];

if((classe=="resume_past")||(classe=="resume_future"))
  data = [
              {"label":"Reprise en arrière", "value":Math.round(parseFloat(100*globalData.indicators.resume_past),2)}, 
              {"label":"Reprise normale", "value":Math.round(100 - parseFloat(100*globalData.indicators.resume_past),2)}, 
              {"label":"Reprise en avant", "value":Math.round(parseFloat(100*globalData.indicators.resume_future),2)}
           ];

if(elementType=='section') elementType='part';
  d3.select(element[0]).selectAll("*").remove();
  width = $(element[0]).parent().width() - margin.left - margin.right ;
  
          svg = d3.select(element[0])
          .append("svg")          
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .attr('class','pie');
        var vis =  svg.append("g")
          .data([data])
          .attr("transform", "translate(" + r + "," + (height + margin.top + margin.bottom)/2 + ")");
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
    return (data[i].value+'%');}
    );

var legend = svg.append("g").selectAll("g")
.data(data)
  .enter().append("g")
    .attr("transform", function(d, i) { return "translate("+(2*r+20)+"," + (20+(i+1) * 35) + ")"; });

legend.append("rect")
  .attr("width", 30)
  .attr("height", 20)
  .style("fill", function(d, i) { return color(i); });

legend.append("text")
  .attr("x", 95)
  .attr("y", 10)
  .attr("dy", ".35em")
  .text(function(d) {return d.label; });

/////////// END PIE
}
scope.$watch(function(){
   
            width = $(element[0]).parent().width();     
            
 
            return width 
          }, resize);

    function resize(){

      if(typeof scope.data =='undefined') return;
      

              if(scope.indicatorCode in {'provenance_past':'','provenance_future':'','destination_past':'','destination_future':''})   
              scope.inspectorRenderTransitionNodes(scope.data, scope.indicatorCode)           
                else
                  if(scope.indicatorCode in {'rereads_seq_tx':'','rereads_dec_tx':'','resume_past':'','resume_future':''})
                    scope.inspectorRenderPie(scope.data, scope.indicatorCode)
                  else
                    scope.inspectorRenderBars(scope.data, scope.indicatorCode)
           // else scope.inspectorRenderTransitionNodes(scope.data, scope.indicatorCode)
    
    }
    

scope.$watch('data', function(){

 if(typeof scope.data =='undefined') return; 
 window.setTimeout(function() {
      d3.select(element[0]).selectAll("*").remove();
  }, 0);
            if(scope.indicatorCode in {'provenance_past':'','provenance_future':'','destination_past':'','destination_future':''})   
              scope.inspectorRenderTransitionNodes(scope.data, scope.indicatorCode)           
                else
                  if(scope.indicatorCode in {'rereads_seq_tx':'','rereads_dec_tx':'','resume_past':'','resume_future':''})
                    scope.inspectorRenderPie(scope.data, scope.indicatorCode)
                  else
                    scope.inspectorRenderBars(scope.data, scope.indicatorCode)
          }, true);  
   

scope.$watch('d3opts', function(){
 if(typeof scope.data =='undefined') return;
 
 d3.select(element[0]).selectAll("*").remove();
if(scope.indicatorCode in {'provenance_past':'','provenance_future':'','destination_past':'','destination_future':''})   
              scope.inspectorRenderTransitionNodes(scope.data, scope.indicatorCode)           
                else
                  if(scope.indicatorCode in {'rereads_seq_tx':'','rereads_dec_tx':'','resume_past':'','resume_future':''})
                    scope.inspectorRenderPie(scope.data, scope.indicatorCode)
                  else
                    scope.inspectorRenderBars(scope.data, scope.indicatorCode)
          }, true);  
scope.$watch('indicatorCode', function(){
 if(typeof scope.data =='undefined') return;
 console.log(scope.indicatorCode)
 d3.select(element[0]).selectAll("*").remove();
if(scope.indicatorCode in {'provenance_past':'','provenance_future':'','destination_past':'','destination_future':''})   
              scope.inspectorRenderTransitionNodes(scope.data, scope.indicatorCode)           
                else
                  if(scope.indicatorCode in {'rereads_seq_tx':'','rereads_dec_tx':'','resume_past':'','resume_future':''})
                    scope.inspectorRenderPie(scope.data, scope.indicatorCode)
                  else
                    scope.inspectorRenderBars(scope.data, scope.indicatorCode)
          }, true);  
};

/**************************************************************/
var RereadingsChart = function(scope, element, title){  
   
   
    var margin = {top: 0, right: 10, bottom: 0, left: 40},
          width = 580 - margin.left - margin.right,
          height = 270 - margin.top - margin.bottom;
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
  alert('global')
if(scope.indicatorCode in {'Actions_tx':'', 'mean.duration':'','speed':'',
                        'rereadings_tx':'','rereads_seq_tx':'',
                        'course_readers_rereaders':'','part_readers_rereaders':'','provenance_not_linear':'','provenance_past':'','provenance_future':'','destination_not_linear':'','destination_past':'','destination_future':'',
                      'rupture_tx':'','norecovery_tx':'','resume_future':'','resume_past':'','next_recovery_tx':'','prev_recovery_tx':'','distant_prev_recovery_tx':''
                      })  globalCharts(scope, element)

else 
  if(scope.indicatorCode in {'provenance':'','destination':''})  
       //   globalNodeChart(scope, element)
      globalCharts(scope, element)
    //else globalBubbleChart(scope, element,'titre');
}
else
if(scope.d3opts.type == 'inspector'){
  
inspectorCharts(scope, element,'titre')


}
else
if(scope.d3opts.type == 'fact'){
  alert('fact')
  
inspectorCharts(scope, element,'titre')
//inspectorRenderTransitionNodes

}
else

if(scope.d3opts.type == 'rs'){

  rsBxChart(scope, element, ' '); 

}
else{
if(scope.d3opts.issueClass =='Transition')
   nodeChart(scope, element)
 else 
  if(scope.indicatorCode in {'RRmaxD':'','RRVmaxSeq':''}) 
    RereadingsChart(scope, element)
    else
      barChart(scope, element, ' ');
 
}


        }
    };
  }
]);