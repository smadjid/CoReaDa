angular.module('mean.courses')
.directive('tableTd', [
  function () {
    return {
        restrict: 'A',
        scope:{
          data:'=',
          indicatorCode:'=',
          courseId:'=',
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



var saveLog = function(params) {
        return $http.post('/api/courses/log/'+scope.courseId,params);
      };
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
      var tdColor = part.metrics.filter(function(ind){ return ind.code == scope.indicatorCode})[0].color;
       $(td)
        .attr('class','td_issue')
               .attr('data-part',part.id)
               .attr('colspan',1)
               .attr('data-indicator',scope.indicatorCode)
               .attr('data-path',part.route+'&indicator='+scope.indicatorCode)
               .append('<span></span>')
               .css('background-color',tdColor)
               .on("click", function(d) { 
               
             ///////////// LOG ////////////
                saveLog({
                'name':'cellClick',
                'elementId':part._id,
                'params':[
                 {'paramName':'url','paramValue':part.route+'&indicator='+scope.indicatorCode}] 
                });
            //////////////////////////////
          window.location.hash = '#'+$(this).attr('data-path');
              });


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
      .prop('onclick',null).off('click')
      .empty() 
      .on("click", function(d) {    
                   
                    ///////////// LOG ////////////
                saveLog({
                'name':'factCellClick',
                'elementId':fact._id,
                'params':[
                 {'paramName':'url','paramValue':fact.route}] 
                });
            //////////////////////////////
            window.location.hash = fact.route;
                })
      .append("<img data-fact-id="+fact._id+" parent-path="+part.route+"  class='fact section-fact' role='button' width='25' src='/courses/assets/img/fact.png'></img>");      
      

  }
      
  });
      
   
       html.push(td)  ;


     })
  })

  if(html.length>0){  

if(!scope.allFacts)
  {
    $(html.filter(function(s){ return $(s[0]).attr('data-part') ==maxPart})[0])
    .prop('onclick',null).off('click')
    .empty() 
    .on("click", function(d) {    
                   window.location.hash = maxRoute;
                })
    .append("<img data-fact-id="+maxFactId+" parent-path="+maxPartRoute+"  class='fact section-fact'  role='button' width='25' src='/courses/assets/img/fact.png'></img>")  
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
    var tdColor = chapter.metrics.filter(function(ind){ return ind.code == scope.indicatorCode})[0].color;
    ;
     $(td)
      .attr('class','td_issue')
             .attr('data-part',chapter.id)             
             .attr('colspan',chapter.parts.length)
             .attr('data-indicator',scope.indicatorCode)
             .attr('data-indicator-value',chapter.metrics.filter(function(ind){ return ind.code == scope.indicatorCode})[0].delta)
             .attr('data-path',chapter.route+'&indicator='+scope.indicatorCode)
             
             .on("click", function(d) {    
                   ///////////// LOG ////////////
                saveLog({
                'name':'factCellClick',
                'elementId':chapter._id,
                'params':[
                 {'paramName':'url','paramValue':chapter.route}] 
                });
            //////////////////////////////
                 window.location.hash = '#'+$(this).attr('data-path')
               //alert('one')
              })
             .append('<span></span>')
             .css('background-color',tdColor);
             
    
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
      .prop('onclick',null).off('click')
      .empty()  
      .on("click", function(d) {   
             ///////////// LOG ////////////
                saveLog({
                'name':'factCellClick',
                'elementId':fact._id,
                'params':[
                 {'paramName':'url','paramValue':fact.route}] 
                });
            //////////////////////////////
                   window.location.hash = fact.route;
                })
      .append("<img data-fact-id="+fact._id+" parent-path="+chapter.route+"  class='fact chapter-fact'' width='25' role='button' src='/courses/assets/img/fact.png' ></img>");
      

    }
    });

   
 
     html.push(td)  ;

  })
  
  if(html.length>0){  
if(!scope.allFacts)

  {
    $(html.filter(function(s){ return $(s[0]).attr('data-part') ==maxChap})[0])
    .prop('onclick',null).off('click')
    .empty()    
    .on("click", function(d) {   
    
                  window.location.hash = maxRoute;
                  return false;
                })
    .append("<img data-fact-id="+maxFactId+" parent-path="+maxChapRoute+"  class='fact chapter-fact' width='25' role='button' src='/courses/assets/img/fact.png'></img>");
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
     


            
        }
    }
}])





