angular.module('mean.courses')
.directive('tableTd', [
  function () {
    return {
        restrict: 'A',
        scope:{
          data:'=',
          indicatorCode:'=',
          issueCode:'=',
          byParts:'='
        },

        link: function (scope, element, attrs) {
scope.chapters =[]


var tableIssuesDisplay=function(){
  d3.select(element[0]).selectAll('td').remove();
  if(scope.byParts)
    partsIssuesDisplay()
  else
    chaptersIssuesDisplay()    
}

var computeTwoBounderyValues = function(type){
  var studiedFactData=[];

if(type=='chapter'){
  scope.chapters.forEach(function(chapter, i) {
      var partData = parseFloat(chapter.properties.filter(function(value){ return value.property == scope.indicatorCode})[0].value);
      studiedFactData.push(partData);
  })
}
else{
  scope.chapters.forEach(function(chapter, i) {
    chapter.parts.forEach(function(part, i) {
      var partData = parseFloat(part.properties.filter(function(value){ return value.property == scope.indicatorCode})[0].value);
      studiedFactData.push(partData);
    })
  })
}

  var median = d3.median(studiedFactData, function(d) { return parseFloat(d); }); 
  
  for(var i = 0; i<studiedFactData.length; i++){ 
    studiedFactData[i] = Math.abs(studiedFactData[i] - median);
  }
  var min = d3.min(studiedFactData, function(d) { return parseFloat(d); }); 
  var max = d3.max(studiedFactData, function(d) { return parseFloat(d); }); 
   
  return {'MinValue':min,'MedianValue':median,'MaxValue':max};
}
var computeMinBounderyValues = function(type){
  var studiedFactData=[];

if(type=='chapter'){
  scope.chapters.forEach(function(chapter, i) {
      var partData = parseFloat(chapter.properties.filter(function(value){ return value.property == scope.indicatorCode})[0].value);
      studiedFactData.push(partData);
  })
}
else{
  scope.chapters.forEach(function(chapter, i) {
    chapter.parts.forEach(function(part, i) {
      var partData = parseFloat(part.properties.filter(function(value){ return value.property == scope.indicatorCode})[0].value);
      studiedFactData.push(partData);
    })
  })
}

  var median = d3.median(studiedFactData, function(d) { return parseFloat(d); }); 
  
  for(var i = 0; i<studiedFactData.length; i++){ 
    studiedFactData[i] = median - studiedFactData[i];
    if(studiedFactData[i] < 0 ) studiedFactData[i] = 0;
  }
  var min = 0; 
  var max = d3.max(studiedFactData, function(d) { return parseFloat(d); }); 
   
  return {'MinValue':min,'MedianValue':median,'MaxValue':max};
}

var computeBgColor =function(val, indicator, range){
  var scale = chroma.scale('OrRd').domain([range.MinValue, range.MaxValue]);
  
  return   scale(val).hex();
}




var computeBounderyValues = function(type){
  var studiedFactData=[];

if(type=='chapter'){
  scope.chapters.forEach(function(chapter, i) {
      var partData = parseFloat(chapter.properties.filter(function(value){ return value.property == scope.indicatorCode})[0].value);
      studiedFactData.push(partData);
  })
}
else{
  scope.chapters.forEach(function(chapter, i) {
    chapter.parts.forEach(function(part, i) {
      var partData = parseFloat(part.properties.filter(function(value){ return value.property == scope.indicatorCode})[0].value);
      studiedFactData.push(partData);
    })
  })
}

  var median = d3.median(studiedFactData, function(d) { return parseFloat(d); }); 
  
  
  var min = d3.min(studiedFactData, function(d) { return parseFloat(d); }); 
  var max = d3.max(studiedFactData, function(d) { return parseFloat(d); }); 
   
  return {'MinValue':min,'MedianValue':median,'MaxValue':max};
}
var partsIssuesDisplay=function(){
var html=[];

var boundaryValues = computeTwoBounderyValues('part');
var scale = chroma.scale('OrRd').domain([boundaryValues.MinValue, boundaryValues.MaxValue]);
switch(scope.indicatorCode) {
    case "Actions_tx":
        boundaryValues = computeBounderyValues('part');
        scale = chroma.scale('OrRd').domain([boundaryValues.MedianValue, boundaryValues.MinValue]);
        break;
    case "speed":
        boundaryValues = computeTwoBounderyValues('part');
        scale = chroma.scale('OrRd').domain([boundaryValues.MinValue, boundaryValues.MaxValue]);
        break;
    case "rereadings_tx":
        boundaryValues = computeBounderyValues('part');
        scale = chroma.scale('OrRd').domain([boundaryValues.MedianValue, boundaryValues.MaxValue]);
        break;
    case "rereadings_tx":
        boundaryValues = computeBounderyValues('part');
        scale = chroma.scale('OrRd').domain([boundaryValues.MedianValue, boundaryValues.MaxValue]);
        break;
    case "norecovery_tx":
        boundaryValues = computeBounderyValues('part');
        scale = chroma.scale('OrRd').domain([boundaryValues.MedianValue, boundaryValues.MaxValue]);
        break;
}



var maxValue = 0;
var maxPart = 0;
var maxRoute='#';


  scope.chapters.forEach(function(chapter, i) {
    chapter.parts.forEach(function(part, i) {
    
      var allFacts = part.facts.filter(function(e){ return ((e.issueCode == scope.issueCode))} );      
      
      var partData = Math.abs(boundaryValues.MedianValue - parseFloat(part.properties.filter(function(value){ return value.property == scope.indicatorCode})[0].value));
      switch(scope.indicatorCode) {
      case "Actions_tx":
        partData = parseFloat(part.properties.filter(function(value){ return value.property == scope.indicatorCode})[0].value);
        break;
      case "speed":
        partData = Math.abs(boundaryValues.MedianValue - 
          parseFloat(part.properties.filter(function(value){ return value.property == scope.indicatorCode})[0].value));
        break;
      case "rereadings_tx":
        partData = parseFloat(part.properties.filter(function(value){ return value.property == scope.indicatorCode})[0].value);
        break;
      case "norecovery_tx":
        partData = parseFloat(part.properties.filter(function(value){ return value.property == scope.indicatorCode})[0].value);
        break;
      }

      
      var td=$("<td role='button'></td>");
       $(td)
        .attr('class','td_issue')
               .attr('data-part',part.id)
               .attr('colspan',1)
               .attr('data-indicator',scope.indicatorCode)
               .attr('data-path',part.route+'&indicator='+scope.indicatorCode)
               .append('<span></span>')
               .css('background-color',scale(partData).hex())
               .on("click", function(d) {window.location.hash = '#'+part.route+'&indicator='+scope.indicatorCode});

      allFacts.forEach(function(fact){  
        var span = $("<span class='fact' role='button'  style='padding:5px'></span>");
        span
        .attr('parent-path',part.route)
        .addClass("gly-issue")
        .attr('data-fact-id',+fact._id );
        if(parseFloat(fact.value) > maxValue)
        {maxValue = parseFloat(fact.value); maxPart=part.id; maxRoute=fact.route; }

        $(td).append(span) });

      
   
       html.push(td)  ;


     })
  })
if(html.length>0){  

  $(html.filter(function(s){ return $(s[0]).attr('data-part') ==maxPart})[0]).children('.fact')
      .removeClass("gly-issue")
      .addClass("glyphicon glyphicon-warning-sign")
      .css('color','red')
      .css('background-color','rgba(255,255,255,0.57)')
      .css('border','1px solid rgba(0, 220, 0, 0.14902)')
      .css('padding','3px')
      .css('font-size','14px')      
      .on("click", function(d) {window.location.hash = maxRoute});;


}
  
  $(element).append(html);

  

}

var chaptersIssuesDisplay=function(){
var html=[];

var boundaryValues = computeTwoBounderyValues('chapter');
var scale = chroma.scale('OrRd').domain([boundaryValues.MinValue, boundaryValues.MaxValue]);
switch(scope.indicatorCode) {
    case "Actions_tx":
        boundaryValues = computeBounderyValues('chapter');
        scale = chroma.scale('OrRd').domain([boundaryValues.MedianValue, boundaryValues.MinValue]);
        break;
    case "speed":
        boundaryValues = computeTwoBounderyValues('chapter');
        scale = chroma.scale('OrRd').domain([boundaryValues.MinValue, boundaryValues.MaxValue]);
        break;
    case "rereadings_tx":
        boundaryValues = computeBounderyValues('chapter');
        scale = chroma.scale('OrRd').domain([boundaryValues.MedianValue, boundaryValues.MaxValue]);
        break;
    case "rereadings_tx":
        boundaryValues = computeBounderyValues('chapter');
        scale = chroma.scale('OrRd').domain([boundaryValues.MedianValue, boundaryValues.MaxValue]);
        break;
    case "norecovery_tx":
        boundaryValues = computeBounderyValues('chapter');
        scale = chroma.scale('OrRd').domain([boundaryValues.MedianValue, boundaryValues.MaxValue]);
        break;
}



var maxValue = 0;
var maxChap = 0;
var maxRoute='#';

  scope.chapters.forEach(function(chapter, i) {    
    var allFacts = chapter.facts.filter(function(e){ return ((e.issueCode == scope.issueCode))} );    
    
    
    var chapData = Math.abs(boundaryValues.MedianValue - 
      parseFloat(chapter.properties.filter(function(value){ return value.property == scope.indicatorCode})[0].value));
    switch(scope.indicatorCode) {
      case "Actions_tx":
        chapData = parseFloat(chapter.properties.filter(function(value){ return value.property == scope.indicatorCode})[0].value);
        break;
      case "speed":
        chapData = Math.abs(boundaryValues.MedianValue - 
          parseFloat(chapter.properties.filter(function(value){ return value.property == scope.indicatorCode})[0].value));
        break;
      case "rereadings_tx":
        chapData = parseFloat(chapter.properties.filter(function(value){ return value.property == scope.indicatorCode})[0].value);
        break;
      case "norecovery_tx":
        chapData = parseFloat(chapter.properties.filter(function(value){ return value.property == scope.indicatorCode})[0].value);
        break;
      }
    
    var td=$("<td role='button'></td>");
     $(td)
      .attr('class','td_issue')
             .attr('data-part',chapter.id)
             .attr('colspan',chapter.parts.length)
             .attr('data-indicator',scope.indicatorCode)
             .attr('data-path',chapter.route+'&indicator='+scope.indicatorCode)
             .append('<span></span>')
             .css('background-color',scale(chapData).hex());
             

    allFacts.forEach(function(fact){  
      var span = $("<span class='fact' role='button'  style='padding:5px'></span>");
      span      
      .attr('data-fact-id',+fact._id )
      .attr('parent-path',chapter.route)
      .addClass("gly-issue");

      if(parseFloat(fact.value) > maxValue)
      {maxValue = parseFloat(fact.value); maxChap=chapter.id;maxRoute=fact.route; }
 
 

      $(td).append(span) });

   
 
     html.push(td)  ;



  })
  
if(html.length>0){  


  $(html.filter(function(s){ return $(s[0]).attr('data-part') ==maxChap})[0])
  .on("click", function(d) {    
                 window.location.hash = maxRoute;
              })
  .children('.fact')
      .removeClass("gly-issue")
      .addClass("glyphicon glyphicon-warning-sign")
      .css('color','red')
      .css('background-color','rgba(255,255,255,0.57)')
      .css('border','1px solid rgba(0, 220, 0, 0.14902)')
      .css('padding','3px')      
      .css('font-size','14px');


   $(html.filter(function(s){ return $(s[0]).attr('data-part') !=maxChap})).each(function() {
    $(this).on("click", function(d) { 
                 window.location.hash = '#'+$(this).attr('data-path')
              });
   })
   
       


  
}
  
  $(element).append(html);

  

}


  scope.$watch('data', function(){

  if(typeof scope.data=='undefined' | typeof scope.indicatorCode =='undefined' | typeof scope.byParts=='undefined') return;

    scope.chapters = [];
    angular.forEach(scope.data.tomes, function(tome) {
    angular.forEach(tome.chapters, function(chapter) {     
      scope.chapters.push( chapter ); 
    });
  });   
         tableIssuesDisplay()
        }, true);
     

scope.$watch('byParts', function(){

  if(typeof scope.data=='undefined' | typeof scope.indicatorCode =='undefined' | typeof scope.byParts=='undefined') return;
  
    scope.chapters = [];
    angular.forEach(scope.data.tomes, function(tome) {
    angular.forEach(tome.chapters, function(chapter) {     
      scope.chapters.push( chapter ); 
    });
  });   
    
         tableIssuesDisplay()
        
    
          }, true); 


            
        }
    }
}])





