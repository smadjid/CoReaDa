angular.module('mean.courses')
.directive('tableTd', [
  function () {
    return {
        restrict: 'A',
        scope:{
          data:'=',
          indicatorCode:'=',
          issueCode:'=',
          byParts:'=',
          allFacts:'=',
          selectedFact:'='
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
var maxValue = 0;
var maxPart = 0;
var maxRoute='#';
var maxFactId = 0;
var maxPartRoute="#"

  scope.chapters.forEach(function(chapter, i) {
    chapter.parts.forEach(function(part, i) {
    
      var allFacts = part.facts.filter(function(e){ return ((e.issueCode == scope.issueCode))} );      
      var td=$("<td role='button'></td>");
      var tdColor = part.indicators.filter(function(ind){ return ind.code == scope.indicatorCode})[0].color;
       $(td)
        .attr('class','td_issue')
               .attr('data-part',part.id)
               .attr('colspan',1)
               .attr('data-indicator',scope.indicatorCode)
               .attr('data-path',part.route+'&indicator='+scope.indicatorCode)
               .append('<span></span>')
               .css('background-color',tdColor)
               .on("click", function(d) { window.location.hash = '#'+$(this).attr('data-path')});


allFacts.forEach(function(fact){  
 if(! scope.allFacts){
      if(parseFloat(fact.delta) > maxValue)
          {
            maxValue = parseFloat(fact.delta);
            maxFactId=fact._id; 
            maxPart=part.id; 
            maxPartRoute=part.route; 
            maxRoute=fact.route; 
          }
    }
  else{
    $(td)
      .on("click", function(d) {    
                   window.location.hash = fact.route;
                })
      .append("<span data-fact-id="+fact._id+" parent-path="+part.route+"  class='fact section-fact fa-exclamation-circle' role='button'  style='padding:0;color:#FFEB3B;text-shadow:-1px -1px 0 red,  1px -1px 0 red,    -1px 1px 0 red,     1px 1px 0 red;font-size:1.7vw'></span>");
      
      

  }
      
  });
      
   
       html.push(td)  ;


     })
  })

  if(html.length>0){  

if(!scope.allFacts)
  {
    $(html.filter(function(s){ return $(s[0]).attr('data-part') ==maxPart})[0])
    .on("click", function(d) {    
                   window.location.hash = maxRoute;
                })
    .append("<span data-fact-id="+maxFactId+" parent-path="+maxPartRoute+"  class='fact section-fact fa-exclamation-circle' role='button'  ></span>")
  }
}

  $(element).append(html);

  

}

var chaptersIssuesDisplay=function(){
var html=[];
var maxValue = 0;
var maxChap = 0;
var maxRoute='#';
var maxFactId = 0;
var maxChapRoute="#";
  scope.chapters.forEach(function(chapter, i) {    
    var allFacts = chapter.facts.filter(function(e){ return ((e.issueCode == scope.issueCode))} );       
    
    var td=$("<td role='button'></td>");
    var tdColor = chapter.indicators.filter(function(ind){ return ind.code == scope.indicatorCode})[0].color;
     $(td)
      .attr('class','td_issue')
             .attr('data-part',chapter.id)
             .attr('colspan',chapter.parts.length)
             .attr('data-indicator',scope.indicatorCode)
             .attr('data-path',chapter.route+'&indicator='+scope.indicatorCode)
             .append('<span></span>')
             .css('background-color',tdColor)
             .on("click", function(d) {    
                 window.location.hash = '#'+$(this).attr('data-path')
              });
             
    
    allFacts.forEach(function(fact){  

    if(! scope.allFacts){
      if(parseFloat(fact.delta) > maxValue)
      {
        maxValue = parseFloat(fact.delta);
        maxFactId=fact._id; 
        maxChap=chapter.id; 
        maxChapRoute=chapter.route; 
        maxRoute=fact.route; 

        
      }
    }
    else{
     
      $(td)
      .on("click", function(d) {    
                   window.location.hash = fact.route;
                })
      .append("<span data-fact-id="+fact._id+" parent-path="+chapter.route+"  class='fact chapter-fact fa-exclamation-circle' role='button'></span>");
      

    }
    });

   
 
     html.push(td)  ;

  })
  
  if(html.length>0){  
if(!scope.allFacts)

  {
    $(html.filter(function(s){ return $(s[0]).attr('data-part') ==maxChap})[0])
    .on("click", function(d) {    
                   window.location.hash = maxRoute;
                })
    .append("<span data-fact-id="+maxFactId+" parent-path="+maxChapRoute+"  class='fact chapter-fact fa-exclamation-circle' role='button'></span>");
  }

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


  scope.$watch('allFacts', function(){

  if(typeof scope.data=='undefined' | typeof scope.indicatorCode =='undefined' | typeof scope.byParts=='undefined') return;

    scope.chapters = [];
    angular.forEach(scope.data.tomes, function(tome) {
    angular.forEach(tome.chapters, function(chapter) {     
      scope.chapters.push( chapter ); 
    });
  });   
         tableIssuesDisplay()
        }, true);
     

/*scope.$watch('byParts', function(){

  if(typeof scope.data=='undefined' | typeof scope.indicatorCode =='undefined' | typeof scope.byParts=='undefined') return;
  
    scope.chapters = [];
    angular.forEach(scope.data.tomes, function(tome) {
    angular.forEach(tome.chapters, function(chapter) {     
      scope.chapters.push( chapter ); 
    });
  });   
    
         tableIssuesDisplay()
        
    
          }, true); */


            
        }
    }
}])





