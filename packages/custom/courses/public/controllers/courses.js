//'use strict';

angular.module('mean.courses')
  .config(['$viewPathProvider',
   function($viewPathProvider) {
    $viewPathProvider.override('system/views/index.html', 'courses/views/index.html');
   }
]);





var app =angular.module('mean.courses').controller('CoursesController', ['$scope', '$rootScope',
  '$stateParams', '$location', '$http','Global', 'Courses', '$http',
  function($scope, $rootScope, $stateParams, $location, $http, Global, Courses) {
    $scope.global = Global;

 $scope.itemsPerPage = 1;
 
 $scope.$watch('currentFact', function(newValue, oldValue) {  
  $('.inspectorChosenPart').removeClass('inspectorChosenPart');
 if(typeof $scope.inspectorFacts=='undefined') return;
 if($scope.inspectorFacts.Facts.length>0){

    var fact = $scope.inspectorFacts.Facts[newValue];
    $(".fact[data-fact-id='"+fact._id+"']").parent().addClass('inspectorChosenPart').fadeIn(100).fadeOut(100).fadeIn(200).focus().select();
    $scope.inspectorFacts.id = fact.partId;
    $scope.inspectorFacts.indicatorCode = fact.issueCode;


setTimeout(function() {
  $(".fact[data-fact-id='"+fact._id+"']").parent().addClass('inspectorChosenPart').fadeIn(100).fadeOut(100).fadeIn(200).focus().select();
  $scope.$apply();
  }, 0);
  }
 
});

 

     $scope.range = function() {
    var rangeSize = 4;
    var ps = [];
    var start;

    start = $scope.currentFact;
       
    if ( start > $scope.pageCount()-rangeSize ) {
      start = $scope.pageCount()-rangeSize+1;
    }

    for (var i=start; i<start+rangeSize; i++) {
      if(i>=0) 
         ps.push(i);
    }
    return ps;
  };

  $scope.prevPage = function() {
  if ($scope.currentFact > 0){
      $scope.setPage($scope.currentFact-1)
    }
  };

  $scope.DisablePrevPage = function() {
    return $scope.currentFact === 0 ? "disabled" : "enabled-page";
  };

  $scope.pageCount = function() {
   if(typeof $scope.inspectorFacts.Facts != 'undefined')
    return Math.ceil($scope.inspectorFacts.Facts.length/$scope.itemsPerPage)-1;
  };

  $scope.nextPage = function() {
    if ($scope.currentFact < $scope.pageCount()){
      $scope.setPage($scope.currentFact+1)
    }
  };

  $scope.DisableNextPage = function() {
    return $scope.currentFact === $scope.pageCount() ? "disabled" : "enabled-page";
  };



  $scope.setPage = function(n) {
    if($scope.inspectorFacts.Facts.length<1) return;
    
  $scope.currentFact = n;
  loadURL($scope.inspectorFacts.Facts[n].route)

  };
var computeTwoBounderyValues = function(type, indicatorCode){
  var studiedFactData=[];

if(type=='chapter'){
  $scope.courseChapters.forEach(function(chapter, i) {
      var partData = parseFloat(chapter[indicatorCode]);
      studiedFactData.push(partData);
  })
}
else{
  $scope.courseChapters.forEach(function(chapter, i) {
    chapter.parts.forEach(function(part, i) {
      var partData = parseFloat(part[indicatorCode]);
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
var computeMinBounderyValues = function(type, indicatorCode){
  var studiedFactData=[];

if(type=='chapter'){
  $scope.courseChapters.forEach(function(chapter, i) {
      var partData = parseFloat(chapter[indicatorCode]);
      studiedFactData.push(partData);
  })
}
else{
  $scope.courseChapters.forEach(function(chapter, i) {
    chapter.parts.forEach(function(part, i) {
      var partData = parseFloat(part[indicatorCode]);
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

var computeBgColor = function(val, indicator, range){
  var scale = chroma.scale('OrRd').padding([0,0.25]).domain([range.MinValue, range.MaxValue]);
  
  return   scale(val).hex();
}




var computeBounderyValues = function(type, indicatorCode){
  var studiedFactData=[];

if(type=='chapter'){
  $scope.courseChapters.forEach(function(chapter, i) {
      var partData = parseFloat(chapter[indicatorCode]);
      studiedFactData.push(partData);
  })
}
else{
  $scope.courseChapters.forEach(function(chapter, i) {
    chapter.parts.forEach(function(part, i) {
      var partData = parseFloat(part[indicatorCode]);
      studiedFactData.push(partData);
    })
  })
}

  var median = d3.median(studiedFactData, function(d) { return parseFloat(d); }); 
  
  
  var min = d3.min(studiedFactData, function(d) { return parseFloat(d); }); 
  var max = d3.max(studiedFactData, function(d) { return parseFloat(d); }); 
   
  return {'MinValue':min,'MedianValue':median,'MaxValue':max};
}

  $scope.d3opts = [];
  $scope.dataLoading = true;
  $scope.pageLoaded = false;
  $scope.myBrowsers = [ "GC", "AS" ];

  $(window).unbind('hashchange');


  $scope.observedElt ={};

     $('table').hide();
     
     $scope.inspectorDisplaySrc='course';
     $scope.indicatorInspectorShow = 'course';
     $scope.course ={};

     $scope.tableData ={};
     
      $scope.courseParts =[];
      $scope.courseChapters =[];
      $scope.courseFacts =[];
      
      $scope.context = {};

      $scope.formData ='';
      $scope.textBtnForm ='';
      $scope.chartType = 'actions';
      $scope.globalChartSelector = 'actions';
      $scope.elementTypeSelector = 'part';
      $scope.sectionDisplay = false;
      $scope.context.statChart = false;
      $scope.taskPanelTitle = "Tâches";
      $scope.graphShow=false;
      
      $scope.studiedPart = '';
//      $scope.context.otherFacts=[];
      $scope.inspectorChart = false;
      $scope.tabSelect = "stats";
      $scope.currentFact = 0;  
      $scope.allFactsDisplay=false;
      $scope.ChaptersFacts = [];
      $scope.SectionsFacts = [];
      $scope.inspectorFacts={'Facts':[], 'type':'tome', 'selectedFact':'0'};
      $scope.inspectorStats ={'Facts':[], 'indicatorCode':'actions', 'type':'chapter'};
      $scope.courseDisplay = true;
      $scope.indicatorSelectorShow = false;
      $scope.allIndicatorSelectorShow = false;


       $scope.inspector = {'type':'tome', 'selectedFact':{},'Data':[]}


      $scope.tab = 0;
  
  
  $scope.isActiveTab = function(tab){
    return $scope.tab === tab;
  };
 


$scope.resetIndicators = function(){
      $scope.indicatorsHeader=[
        {'code':'actions', 'value':'actions', 'label':'Taux de visites', 'inspectorText':'aux visites', 'issueCode':'actions','category':'Indicateurs de lecture','sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null},
        {'code':'speed', 'value':'speed', 'label':'Vitesse de lecture','inspectorText':'à la vitesse de lecture', 'issueCode':'speed','category':'Indicateurs de lecture','sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null},
        {'code':'reread', 'value':'reread', 'label':'Taux de relecture','inspectorText':'à la relecture', 'issueCode':'reread','category':'Indicateurs de relecture','sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null},
        {'code':'stop', 'value':'stop', 'label':'Arrêts définitifs', 'inspectorText':'aux arrêts de la lectrue','issueCode':'stop','category':'Indicateurs d\'arrêt et reprise','sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null}

      ]
      
}
$scope.resetIndicators();
$scope.selectedIndicators=[
        {'code':'actions', 'value':'actions', 'label':'Taux de visites', 'inspectorText':'aux visites', 
        'issueCode':'actions','category':'Indicateurs de lecture'},
        {'code':'speed', 'value':'speed', 'label':'Vitesse de lecture','inspectorText':'à la vitesse de lecture', 
        'issueCode':'speed','category':'Indicateurs de lecture'},
        {'code':'reread', 'value':'reread', 'label':'Taux de relecture','inspectorText':'à la relecture', 
        'issueCode':'reread','category':'Indicateurs de relecture'},
        {'code':'stop', 'value':'stop', 'label':'Arrêts définitifs', 'inspectorText':'aux arrêts de la lectrue',
        'issueCode':'stop','category':'Indicateurs d\'arrêts et reprise'}
      ]
      $scope.indicatorsSelectionModel=['actions','speed','reread','stop'];


 $scope.findOne = function() {

  
      Courses.get({
        courseId: $stateParams.courseId
      }, function(course) {
     
        $scope.course = course;
        console.log(course);
        $scope.chartType = 'actions';
        $scope.selectedElement = course;
  
        $scope.completeCourseParts();
            $scope.context = {
              'type':'course',      
              'route':$scope.course._id,
              'id':0,
              '_id':$scope.course._id,
              'title':$scope.course.title,
              'Todos':$scope.course.todos,
              'taskText':'(nouvelle tâche)',
              'indicator':'ALL',
              'statsContext':"#",
              'factsContext': $scope.MainChaptersFacts[0].route,
              'subtasks' : computeAllTasks(),
              'd3':ComputeGlobalVisuData()
              
            };

    
    computeCourseStats();
     $scope.context.mainstats = $scope.course.mainstats;
    computePartsStats();

    $scope.tableData = $scope.course;

     
    /********  Update on @ change ****************/
    /* URL#
    csid : course ID
    ptId: tome IS
    chapid : chapId
    secid : section id
    factid : fact id
    indic : indicator title



    */
$(window).bind('hashchange',function(e){
  $scope.dataLoading = true;
  
   loadContext();

  $scope.dataLoading = false;
  
});

$('.editable-text').on('shown', function (e, editable) {
        if (arguments.length != 2) return
        if (!editable.input.$input.closest('.control-group').find('.editable-input >textarea').length > 0 || !editable.options.clear || editable.input.$input.closest('.control-group:has(".btn-clear")').length > 0) return
        
        editable.input.$input.closest('.control-group').find('.editable-buttons').append('<br><button class="btn btn-clear"><i class="icon-trash"></i></button>');
    });



/////TODO:



$scope.toggleSectionDisplay = function(){ 
  
  
    $scope.sectionDisplay =! $scope.sectionDisplay;
    $scope.currentFact = 0;
  if($scope.sectionDisplay) {
         $scope.inspectorFacts.Facts = $scope.SectionsFacts;   
         $scope.inspectorStats.type='part';
  }
  else{
      $scope.inspectorFacts.Facts= $scope.ChaptersFacts;
      $scope.inspectorStats.type='chapter';
  }
  goHome();
  
  

}

$scope.$watch('indicatorsSelectionModel', function(newValue, oldValue) {  
 $scope.selectedIndicators =  $.grep($scope.indicatorsHeader, 
  function(e){return ($.inArray(e.value, $scope.indicatorsSelectionModel)>-1)});
//console.log( $scope.inspectorStats.Indicators)
if($scope.inspectorStats.Indicators !='undefined')
  $scope.inspectorStats.Indicators = $.grep($scope.inspectorStats.Indicators, 
  function(e){return ($.inArray(e.name, $scope.indicatorsSelectionModel)>-1)});


});

$scope.$watch('allIndicatorSelectorShow', function(newValue, oldValue) {  
 
$scope.indicatorsSelectionModel=['actions','speed','reread','stop'];

});


$scope.$watch('tabSelect', function(newValue, oldValue) { 

	selectTab(newValue)});


$scope.getShownTab = function(){
  //alert($("input:checked").attr('value'))
  return $("input:checked").attr('value');
  
}



$scope.getGraphTitle = function(code){
  switch(code) {
    case "actions":
        return('Taux de visites');
        break;
    case "Readers":
        return('Nombre de lecteurs distincts');
        break;
    case "speed":
        return('Vitesse de lecture (en mots par min)');        
        break;    
    case 'mean.duration':
        return('Durée moyenne de lecture de la section(en minutes)')
        break;
    case 'reread':
        return('Taux de lectures qui sont des relectures');
        break;
    case 'stop':
        return('Taux des arrêts définitifs de la lecture');
        break;
    case 'provenance':
        return('Sections de provenance (lues juste avant celle-ci)');
        break;
    case 'destination':
        return('Sections de destination (lues juste après celle-ci)');
        break;
}

}



    if($('.course_title_top').length<1)
      $('.navbar-brand').after('<a role ="button" href ="#" ng-click ="resetPath();goHome()" class ="course_title_top"> <span class ="glyphicon glyphicon-book"></span>  <em>'+$scope.course.title+'</em></a><span class="course_tour_top pull-right"></span>');
      
        reloadURL(); 
       window.setTimeout(function() {
           loadContext(); 
          $('table').show();
          reloadURL(); 
          $scope.$apply();
        }, 0);


       
$scope.dataLoading = false;
$scope.pageLoaded = true;
    
      });
    };



 
$scope.completeCourseParts = function(){ 
  var courseParts = [], courseChapters = [];
  var base_url = "https://openclassrooms.com/courses";
  //$scope.course.url = base_url+'/'+$scope.course.properties.filter(function(value){ return value.property === 'slug'})[0].value
  $scope.course.url = base_url+'/'+$scope.course.url;
 // var course_route = $.param({'csid':course._id})

  
  angular.forEach($scope.course.tomes, function(tome) {
    tome.parts_count = 0;
    tome.route = $.param({'partid':tome._id});
     tome.fullpath = {
          'part':{'id':tome._id, 'route':tome.route, 'title':tome.title},
          'chapter':null,
          'section':null
        };
    tome.url = $scope.course.url;//+'/'+tome.properties.filter(function(value){ return value.property === 'slug'})[0].value
    angular.forEach(tome.chapters, function(chapter) { 
      tome.indicators = [];
      chapter.parts_count = 0;
      chapter.route =$.param({'partid':tome._id, 'chapid':chapter._id});
      chapter.fullpath = {
          'part':{'id':tome._id, 'route':tome.route, 'title':tome.title},
          'chapter':{'id':chapter._id, 'route':chapter.route, 'title':chapter.title},
          'section':null
        };


      chapter.url = $scope.course.url+'/'+chapter.url;
      angular.forEach(chapter.facts,function(fact){        
          fact.route = $.param({'partid':tome._id, 'chapid':chapter._id, 'factid':fact._id});
          fact.tome=tome._id;
          fact.partId=chapter.id;
          fact.partType='chapter';
          fact.partRoute=chapter.route;
          fact.chapter=chapter._id;
          fact.section=null;
          
          fact.d3 =[];
          fact.d3 ={ 'chapter':chapter.route,'tome':tome.route};

        });
      
      angular.forEach(chapter.parts, function(part) {
        part.parent = chapter._id;
        tome.parts_count = tome.parts_count + 1;
        if(tome.parts_count===1) tome.url = chapter.url;
        chapter.parts_count = chapter.parts_count + 1;
        part.route =$.param({'partid':tome._id, 'chapid':chapter._id,'sectionid':part._id});
        part.fullpath = {
          'part':{'id':tome._id, 'route':tome.route, 'title':tome.title},
          'chapter':{'id':chapter._id, 'route':chapter.route, 'title':chapter.title},
          'section':{'id':part._id, 'route':part.route, 'title':part.title}
        };
        part.url = chapter.url+'/'+'#/id/r-'+part.part_id;
        angular.forEach(part.facts,function(fact){
          fact.route = $.param({'partid':tome._id, 'chapid':chapter._id,'sectionid':part._id, 'factid':fact._id});          
          fact.tome=tome._id;
          fact.chapter=chapter._id;
          fact.section=part._id;
          fact.partId=part.id;
          fact.partType='part';
          fact.partRoute=part.route;
          fact.d3 ={'part':part.route, 'chapter':chapter.route,'tome':tome.route};

        });
        part.indicators = [];
        courseParts.push( part );
      });
      chapter.indicators = [];
      courseChapters.push( chapter ); 
    });
  });

  $scope.courseParts = courseParts;
  $scope.courseChapters = courseChapters; 
  
  computeColours();

  updateMainFacts();
  $scope.ChaptersFacts = $scope.MainChaptersFacts;
  $scope.SectionsFacts = $scope.MainSectionsFacts;
  

  $scope.context.statsContext = "#"


}
/*********** Compute colours ********************/
var decideBoundariesScale = function(partType,indicatorCode){
  var boundaryValues = computeTwoBounderyValues(partType, indicatorCode);
var scale = chroma.scale('OrRd').padding([0,0.25]).domain([boundaryValues.MinValue, boundaryValues.MaxValue]);
switch(indicatorCode) {
    case "actions":
        boundaryValues = computeBounderyValues(partType, indicatorCode);
        scale = chroma.scale('OrRd').padding([0,0.25]).domain([boundaryValues.MedianValue, boundaryValues.MinValue]);
        break;
    case "speed":
        boundaryValues = computeTwoBounderyValues(partType, indicatorCode);
        scale = chroma.scale('OrRd').padding([0,0.25]).domain([boundaryValues.MinValue, boundaryValues.MaxValue]);
        break;
    case "reread":
        boundaryValues = computeBounderyValues(partType, indicatorCode);
        scale = chroma.scale('OrRd').padding([0,0.25]).domain([boundaryValues.MedianValue, boundaryValues.MaxValue]);
        break;
    case "reread":
        boundaryValues = computeBounderyValues(partType, indicatorCode);
        scale = chroma.scale('OrRd').padding([0,0.25]).domain([boundaryValues.MedianValue, boundaryValues.MaxValue]);
        break;
    case "stop":
        boundaryValues = computeBounderyValues(partType, indicatorCode);
        scale = chroma.scale('OrRd').padding([0,0.25]).domain([boundaryValues.MedianValue, boundaryValues.MaxValue]);
        break;
}
return {'boundaryValues':boundaryValues,'scale':scale};
}
var computeIndividualIndicatorValue =  function(part,indicatorCode, boundaryValues){
  

  var partData = Math.abs(boundaryValues.MedianValue - parseFloat(part.properties.filter(function(value){ return value.property == indicatorCode})[0].value));
      switch(indicatorCode) {
      case "actions":
        partData = parseFloat(part.properties.filter(function(value){ return value.property == indicatorCode})[0].value);
        break;
      case "speed":
        partData = Math.abs(boundaryValues.MedianValue - 
          parseFloat(part.properties.filter(function(value){ return value.property == indicatorCode})[0].value));
        break;
      case "reread":
        partData = parseFloat(part.properties.filter(function(value){ return value.property == indicatorCode})[0].value);
        break;
      case "stop":
        partData = parseFloat(part.properties.filter(function(value){ return value.property == indicatorCode})[0].value);
        break;
      }
    return partData;
}
var computeColours =  function(){
  angular.forEach($scope.indicatorsHeader, function(indicator){
    var indicatorClass = indicator.code;
    var chaptersData = decideBoundariesScale('chapter',indicatorClass);
    var partsData = decideBoundariesScale('part',indicatorClass);

    var chapterScale = chaptersData.scale;
    var chapterBoundaryValues = chaptersData.boundaryValues;
    var partScale = partsData.scale;
    var partBoundaryValues = partsData.boundaryValues;

    
    angular.forEach($scope.course.tomes, function(tome) {
      angular.forEach(tome.chapters, function(chapter) {
        
        var indicatorValue = computeIndividualIndicatorValue(chapter, indicatorClass, chapterBoundaryValues);
        var chapIndicator={'code':indicatorClass, 
                           'delta':indicatorValue, 
                           'color':chapterScale(indicatorValue).hex()};
        chapter.indicators.push(chapIndicator);
        
        angular.forEach(chapter.parts, function(part) {
          var indicatorValue = computeIndividualIndicatorValue(part, indicatorClass, partBoundaryValues);
         var partIndicator={'code':indicatorClass, 
                           'delta':indicatorValue, 
                           'color':partScale(indicatorValue).hex()};
         part.indicators.push(partIndicator);

        })
        
      });
      
    })
    
  });


}
/*************************************************/
var parseURL =  function(query){

  if (query == '') return null;
  var hash = {};
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    var k = decodeURIComponent(pair[0]);
    var isArray = false;
    if (k.substr(k.length-2) == '[]') {
      isArray = true;
      k = k.substring(0, k.length - 2);
    }
    var v = decodeURIComponent(pair[1]);
    // If it is the first entry with this name
    if (typeof hash[k] === "undefined") {
      if (isArray)  // not end with []. cannot use negative index as IE doesn't understand it
        hash[k] = [v];
      else
        hash[k] = v;
    // If subsequent entry with this name and not array
    } else if (typeof hash[k] === "string") {
      hash[k] = v;  // replace it
    // If subsequent entry with this name and is array
    } else {
      hash[k].push(v);
    }
  }
  return hash;
}; 

var getFullRoute = function(path){
 
   var part = null, chapter=null, section=null, fact=null, partCmp = null, chapterCmp=null, sectionCmp=null, factCmp=null;
   var components = parseURL(path)

   if(typeof $scope.course == 'undefined')
      console.log('Error')
  var result = $scope.course; 
  //if(components != null)
   
   if(components.hasOwnProperty('partid')) {
       part = $.grep($scope.course.tomes, function(e){ return  e._id == components.partid })[0];
       partCmp = {'id': part.id, 'route':part.route , 'title':part.title}
     }

   if(components.hasOwnProperty('chapid')) {
       chapter = $.grep(tome.chapters, function(e){ return  e._id == components.chapid })[0];
       chapterCmp = {'id': chapter.id, 'route':chapter.route , 'title':chapter.title}
     }

   if(components.hasOwnProperty('sectionid')) {
       section = $.grep(chap.parts, function(e){ return  e._id == components.sectionid })[0];
       sectionCmp = {'id': section.id, 'route':section.route , 'title':section.title}
     }

   
  
     
    var result={'part':partCmp, 'chapter':chapterCmp, 'section':sectionCmp}
 
     return result;
}
var resolveRoute = function(path){
 
   
   var components = parseURL(path)

   if(typeof $scope.course == 'undefined')
      console.log('Error')
  var result = $scope.course; 
  if(components != null)
   if(components.hasOwnProperty('partid')) {
    var tome = $.grep($scope.course.tomes, function(e){ return  e._id == components.partid })[0];
     result = tome
     if(components.hasOwnProperty('chapid')){
   var chap = $.grep(tome.chapters, function(e){ return  e._id == components.chapid })[0];
        result = chap
     
     if(components.hasOwnProperty('sectionid')){
  var part = $.grep(chap.parts, function(e){ return  e._id == components.sectionid })[0];
       result = part;
       if(components.hasOwnProperty('factid')){        
    var fact = $.grep(part.facts, function(e){ return  e._id == components.factid })[0];          
         result = fact
       }
      }
      else
        if(components.hasOwnProperty('factid')){
          var fact = $.grep(chap.facts, function(e){ return  e._id == components.factid })[0];          
          result = fact

        }
    }  
  }   
     
     
     return result;
}
var resetPath = function(){     
  $('.chosenPart').removeClass('chosenPart'); 
  $('.inspectorChosenPart').removeClass('chosenPart'); 
  $('.data-table').removeClass('highlight-table');
  $('#divOverlay').css('visibility','hidden');
  ;
  //$('.gly-issue').removeClass('fa fa-exclamation-circle');
  $('.inspector-item-selected').removeClass('inspector-item-selected');
    

 /*   for (var i = 0; i < $scope.context.subtasks.length; i++)   
      {$scope.context.subtasks[i].selected = 'notRelevantTask' }

*/
}

var parseTask = function(path, content){
  var components = parseURL(path);
  var partid=0;
    var chapId=0;
    var partId=0;
    var taskId=0;
    var factId=0;
    var indicator='ALL';
  if(components != null){   
  var tome = components.hasOwnProperty('partid')?$.grep($scope.course.tomes, function(e){ return  e._id == components.partid })[0]:-1;
     if(tome!=-1) partid = tome._id
  var chap = components.hasOwnProperty('chapid')?$.grep(tome.chapters, function(e){ return  e._id == components.chapid })[0]:-1;
     if(chap!=-1) chapId = chap._id;
  var part  = components.hasOwnProperty('sectionid')?$.grep(chap.parts, function(e){ return  e._id == components.sectionid })[0]:-1;
      if(part!=-1) {
        partId = part._id;
        var fact = components.hasOwnProperty('factid')?$.grep(part.facts, function(e){ return  e._id == components.factid })[0]:-1;
        if(fact!=-1) {factId = fact._id; indicator=fact.classof}
      }
      else{
        var fact = components.hasOwnProperty('factid')?$.grep(chap.facts, function(e){ return  e._id == components.factid })[0]:-1;
          if(fact!=-1) {factId = fact._id; indicator=fact.classof}
        var indicator = components.hasOwnProperty('indicator')?$.grep(chap.facts, function(e){ return  e._id == components.indicator })[0]:'ALL';
      }
  
}


 
  
 var route = $scope.course._id+'/'+partid+'/'+chapId+'/'+partId+'/'+factId;
 var todo ={'classof':indicator, 'todo':content,'elementType':'todo'}
  return {'route':route, 'todo':todo}
}
var deparseTask = function(route){

  var components = parseURL(route);
  var partid=0;
    var chapId=0;
    var partId=0;
    var taskId=components.taskid;
    var factId=0;
    var taskIndicator= components.hasOwnProperty('indicator')?components.indicator :'ALL';
  if(components != null){   
  var tome = components.hasOwnProperty('partid')?$.grep($scope.course.tomes, function(e){ return  e._id == components.partid })[0]:-1;
     if(tome!=-1) partid = tome._id
  var chap = components.hasOwnProperty('chapid')?$.grep(tome.chapters, function(e){ return  e._id == components.chapid })[0]:-1;
     if(chap!=-1) chapId = chap._id;
  var part  = components.hasOwnProperty('sectionid')?$.grep(chap.parts, function(e){ return  e._id == components.sectionid })[0]:-1;
      if(part!=-1) {
        partId = part._id;
        var fact = components.hasOwnProperty('factid')?$.grep(part.facts, function(e){ return  e._id == components.factid })[0]:-1;
        if(fact!=-1) {factId = fact._id;}
      }
      else{
        var fact = components.hasOwnProperty('factid')?$.grep(chap.facts, function(e){ return  e._id == components.factid })[0]:-1;
          if(fact!=-1) {factId = fact._id; }

      }
  
}


 
  var result ="#";
 
 
result ="#";
if(partid==0){
  result = result +'taskid='+taskId;
}
else {
  result = result+'partid='+partid;
  if(chapId!=0) {
    result = result+'&chapid='+chapId;
    if(partId != 0){
      result = result+'&sectionid='+partId;
      if(factId != 0)
        result = result+'&factid='+factId;
    }
    else
      if(factId != 0)
        result = result+'&factid='+factId;

  }
  result = result + '&taskid=' + taskId;
}
//  result = result + ',' + chapId + ',' + partId + ',' + factId + ',' + taskId;

  if( taskIndicator!='ALL')    result = result + '&indicator=' + taskIndicator;

  return result;

}


var parseTaskRequest = function(path){ 

  var components = parseURL(path);
  var courseId=$scope.course._id;
  var tomeId=0;
    var chapId=0;
    var partId=0;
    var taskId=components.taskid;
    var factId=0;
    var taskIndicator= components.hasOwnProperty('indicator')?components.indicator :'ALL';
  if(components != null){   
  var tome = components.hasOwnProperty('partid')?$.grep($scope.course.tomes, function(e){ return  e._id == components.partid })[0]:-1;
     if(tome!=-1) tomeId = tome._id
  var chap = components.hasOwnProperty('chapid')?$.grep(tome.chapters, function(e){ return  e._id == components.chapid })[0]:-1;
     if(chap!=-1) chapId = chap._id;
  var part  = components.hasOwnProperty('sectionid')?$.grep(chap.parts, function(e){ return  e._id == components.sectionid })[0]:-1;
      if(part!=-1) {
        partId = part._id;
        var fact = components.hasOwnProperty('factid')?$.grep(part.facts, function(e){ return  e._id == components.factid })[0]:-1;
        if(fact!=-1) {factId = fact._id}
      }
      else{
        var fact = components.hasOwnProperty('factid')?$.grep(chap.facts, function(e){ return  e._id == components.factid })[0]:-1;
          if(fact!=-1) {factId = fact._id}

      }
  
}



 
  var route = courseId;
  var scope = 'course';


if(tomeId ==0){
route =route+'/0/'+taskId;
}
else
  if(chapId ==0){
    route =route+'/'+tomeId+'/0/'+taskId;
    scope ='tome';
  }
  else
    if(partId ==0){
      if(factId ==0){
      route = route+'/'+tomeId+'/'+chapId+'/0/'+taskId;
      scope ='chapter';
      }
      else{
        route = route+'/'+tomeId+'/'+chapId+'/'+factId+'/'+taskId;
        scope ='chapter';

      }
    }
    else
      {

        if(factId ==0){
          route = route+'/'+tomeId+'/'+chapId+'/'+partId+'/0/'+taskId;
          scope ='part';
        }
        else{
          route = route+'/'+tomeId+'/'+chapId+'/'+partId+'/'+factId+'/'+taskId;
          scope ='part';
        }
      }
  
  return {'route':route, 'scope':scope}
}

var computeCourseStats = function(){ 
 
var partsData =[], chapsData =[], tomesData =[];

angular.forEach($scope.course.tomes, function(tome) {  

  angular.forEach(tome.chapters, function(chapter) {  
    
    
     
   chapsData.push({
                        'id':chapter.id,
                        'title':chapter.title,
                        'route':chapter.route,                                                
                      //  'actions':parseInt(chapter.properties.filter(function(value){ return value.property === 'Actions_nb'})[0].value),
                        'actions':chapter.actions,
                        'speed':chapter.speed,
                        'reread':chapter.reread,
                        'stop':chapter.stop,
                        'Readers':parseInt(chapter.properties.filter(function(value){ return value.property === 'Readers'})[0].value)
                      });

      
    angular.forEach(chapter.parts, function(part) {      
      partsData.push({
                        'id':part.id,
                        'title':part.title+' (Sec. '+part.id+' )',
                        'route':part.route,                                                
                        'actions':part.actions,
                        'speed':part.speed,
                        'reread':part.reread,
                        'stop':part.stop,
                        'Readers':parseInt(part.properties.filter(function(value){ return value.property === 'Readers'})[0].value)
                      });
          
                
              
    })                                 
  })
})

partsData = partsData.sort(function(x, y){   return d3.descending(x.actions, y.actions);})
var actions = partsData.slice(0,3);
partsData = partsData.sort(function(x, y){   return d3.descending(x.Readers, y.Readers);})
var Readers = partsData.slice(0,3);
partsData = partsData.sort(function(x, y){   return d3.descending(x.stop, y.stop); })
var stop = partsData.slice(0,3);
partsData = partsData.sort(function(x, y){   return d3.descending(x.reread, y.reread); })
var reread = partsData.slice(0,3);


var topSections={
        'actions':actions[0],
        'Readers':Readers[0],
        'stop':stop[0],
        'reread':reread[0]
      }

chapsData = chapsData.sort(function(x, y){   return d3.descending(x.actions, y.actions);})
actions = chapsData.slice(0,3);

chapsData = chapsData.sort(function(x, y){   return d3.descending(x.Readers, y.Readers);})
Readers = chapsData.slice(0,3);


chapsData = chapsData.sort(function(x, y){   return d3.descending(x.stop, y.stop); })
 stop = chapsData.slice(0,3); 
 var mean_chap_stops = d3.mean(chapsData, function(d) { return parseInt(d.stop); }); 
 

chapsData = chapsData.sort(function(x, y){   return d3.descending(x.reread, y.reread); })
 reread = chapsData.slice(0,3);

var topChaps={
        'actions':actions[0],
        'Readers':Readers[0],
        'stop':stop[0],
        'reread':reread[0]
      }
      
 var result = {
      'actions':parseInt($scope.course.stats.filter(function(value){ return value.property === 'nactions'})[0].value),
      'nusers':parseInt($scope.course.stats.filter(function(value){ return value.property === 'nusers'})[0].value),    
      'mean_duration':parseInt($scope.course.stats.filter(function(value){ return value.property === 'mean.rs.duration'})[0].value/60),
      'mean_chap_speed':Math.round(d3.mean(chapsData, function(d) { return parseInt(d.speed); }),0),
      'mean_chap_stop':Math.round(100* d3.mean(chapsData, function(d) { return parseFloat(d.stop); }),1)+'%',
      'mean_chap_reread': Math.round(100 * d3.mean(chapsData, function(d) { return parseFloat(d.reread); }),1)+'%',

      'mean_sec_speed':Math.round(d3.mean(partsData, function(d) { return parseInt(d.speed); }),0),
      'mean_sec_stop':Math.round(100* d3.mean(partsData, function(d) { return parseFloat(d.stop); }),1)+'%',
      'mean_sec_reread': Math.round(100 * d3.mean(partsData, function(d) { return parseFloat(d.reread); }),1)+'%',
      
      //'median_duration':parseInt($scope.course.stats.filter(function(value){ return value.property === 'median.rs.duration'})[0].value/60),
      //'mean_nparts':parseInt($scope.course.stats.filter(function(value){ return value.property === 'mean.rs.nparts'})[0].value),
      //'median_nparts':parseInt($scope.course.stats.filter(function(value){ return value.property === 'median.rs.nparts'})[0].value),
      'top_chapters':topChaps,
      'top_sections':topSections

  }
  
  $scope.course.mainstats = result;
}


var computeComponentStats = function(element,bySection){ 

var componentData ={'actions':[], 'speed':[], 'stop':[], 'reread':[] }

var data=[];
var ids=[]

if(element.elementType=='chapitre'){
  data = $.grep($scope.courseChapters, function(e){ return  e._id ==element._id})[0];
  if(bySection){
    data = data.parts;

  }
  else{
    return;
  }
}
else
if(element.elementType=='partie'){
  data = $.grep($scope.course.tomes, function(e){ return  e._id ==element._id})[0];
  if(bySection){
    var tomeSecs = [];
    angular.forEach(data.chapters, function(chap){
      angular.forEach(chap.parts, function(p){
        tomeSecs.push(p)
      })

    });

    data = tomeSecs;

   
  }
  else{
     data = data.chapters;
  }

}
else
  return;

    angular.forEach(data, function(elt){
      componentData.actions.push(elt.actions);
      componentData.speed.push(elt.speed);
      componentData.stop.push(elt.stop);
      componentData.reread.push(elt.reread);
      ids.push(elt.id);
    });


var topData={
        'actions':d3.mean(componentData.actions ),
        'speed':d3.mean(componentData.speed ),
        'stop':d3.mean(componentData.stop ),
        'reread':d3.mean( componentData.reread),
        'ids':ids
      } 

  return topData;

}

var computePartsStats = function(){ 
  // HERE
 return;
var partsData =[], chapsData =[], tomesData =[];



angular.forEach($scope.course.tomes, function(tome) {  

  angular.forEach(tome.chapters, function(chapter) {  
      chapsData.push({
                        'id':chapter.id,
                        'title':chapter.title,
                        'route':chapter.route,                                                
                        'actions':chapter.actions,
                        'Readers':parseInt(chapter.properties.filter(function(value){ return value.property === 'Readers'})[0].value)
                      })

    angular.forEach(chapter.parts, function(part) {
      part.properties.filter(function(value){ return value.property === 'actions'})[0].value
      partsData.push({
                        'id':part.id,
                        'title':part.title+' (Sec. '+part.id+' )',
                        'route':part.route,
                        'actions':parseInt(part.properties.filter(function(value){ return value.property === 'actions'})[0].value),
                        'Readers':parseInt(part.properties.filter(function(value){ return value.property === 'Readers'})[0].value)
                      })
          
                
              
    })                                 
  })


partsData = partsData.sort(function(x, y){   return d3.descending(x.actions, y.actions);})
var actions = partsData.slice(0,3);
partsData = partsData.sort(function(x, y){   return d3.descending(x.Readers, y.Readers);})
var Readers = partsData.slice(0,3);
partsData = partsData.sort(function(x, y){   return d3.descending(x.stop, y.stop); })
var stop = partsData.slice(0,3);
partsData = partsData.sort(function(x, y){   return d3.descending(x.reread, y.reread); })
var reread = partsData.slice(0,3);


var topSections={
        'actions':actions[0],
        'Readers':Readers[0],
        'stop':stop[0],
        'reread':reread[0]
      }

chapsData = chapsData.sort(function(x, y){   return d3.descending(x.actions, y.actions);})
actions = chapsData.slice(0,3);

chapsData = chapsData.sort(function(x, y){   return d3.descending(x.Readers, y.Readers);})
Readers = chapsData.slice(0,3);


chapsData = chapsData.sort(function(x, y){   return d3.descending(x.stop, y.stop); })
 stop = chapsData.slice(0,3);

chapsData = chapsData.sort(function(x, y){   return d3.descending(x.reread, y.reread); })
 reread = chapsData.slice(0,3);

var topChaps={
        'actions':actions[0],
        'Readers':Readers[0],
        'stop':stop[0],
        'reread':reread[0]
      }
 var result = {
      'visits':parseInt($scope.course.stats.filter(function(value){ return value.property === 'nactions'})[0].value),
      'nusers':parseInt($scope.course.stats.filter(function(value){ return value.property === 'nusers'})[0].value),  
      'top_chapters':topChaps,
      'top_sections':topSections

  }
  
  tome.mainstats = result
  })
}



var computeAllTasks = function(){ 
 
 var tasks =angular.copy($scope.course.todos);
 for (var i = 0; i < tasks.length; i++)   
      {
        tasks[i].selected = 'relevantTask'  
        tasks[i].route ='taskid='+tasks[i]._id+'&indicator='+tasks[i].classof
        tasks[i].minipath ='Cours'
      } 
angular.forEach($scope.course.tomes, function(tome) { 
    var tomeTasks = angular.copy(tome.todos);
    for (var i = 0; i < tomeTasks.length; i++){
    tomeTasks[i].route =tome.route+'&taskid='+tomeTasks[i]._id+'&indicator='+tomeTasks[i].classof
    tomeTasks[i].minipath ='Partie :'+tome.title
    tasks.push(tomeTasks[i]);
  } 

    angular.forEach(tome.chapters, function(chapter) {  
 var chTasks = angular.copy(chapter.todos);
      for (var i = 0; i < chTasks.length; i++){
        chTasks[i].route =chapter.route+'&taskid='+chTasks[i]._id+'&indicator='+chTasks[i].classof
        chTasks[i].minipath ='Chapitre :'+chapter.title
        tasks.push(chTasks[i]);

      } 
            angular.forEach(chapter.facts, function(fact){
               var factTasks = angular.copy(fact.todos);
                    for(var i = 0; i<factTasks.length; i++){ 
                 //var txt =  $scope.indicatorsHeader.filter(function(value){ return value.value === fact.classof})[0].label;
                      
                      factTasks[i].route = fact.route+'&taskid='+factTasks[i]._id+'&indicator='+factTasks[i].classof
                       factTasks[i].minipath ='Chapitre: '+chapter .title;//+' - ' +txt; 
                      tasks.push(factTasks[i]);}
                  })
            angular.forEach(chapter.parts, function(part) {
           var partTasks = angular.copy(part.todos);
                for (var i = 0; i < partTasks.length; i++){
                  partTasks[i].route =part.route+'&taskid='+partTasks[i]._id+'&indicator='+partTasks[i].classof
                  partTasks[i].minipath ='Section: '+part.title;
                  tasks.push(partTasks[i]);
                }
                  angular.forEach(part.facts, function(fact){
               var factTasks = angular.copy(fact.todos);
                    for(var i = 0; i<factTasks.length; i++){ 
                      factTasks[i].route = fact.route+'&taskid='+factTasks[i]._id+'&indicator='+factTasks[i].classof
                       factTasks[i].minipath ='Section: '+part.title;//+' - ' +txt; 
                      tasks.push(factTasks[i]);}
                  })
                  })
                                 
            });
});

  for (var i = 0; i < tasks.length; i++)   
    {tasks[i].selected = 'relevantTask';
        tasks[i].done = false;}

  return tasks

}


var computeSubFacts = function(element, indicator){return[];   
var issuesCode =[] ;
var type = (element.elementType=='chapitre')?'chapter':'part'
var f = $.grep($scope.selectedIndicators, function(e){ return  e.code ==indicator});
angular.forEach(f, function(ind) {issuesCode.push(ind.issueCode) })
 
  var facts  = $.grep(element.facts, function(e){return ($.inArray(e.issueCode, issuesCode)>-1)}); 
  angular.forEach(facts, function(ind){ind.partId=element.id, ind.partType=type, ind.factRoute=element.route+','+ind._id});
  return facts

}





var goHome = function(){ 
  resetPath();

  window.location.hash = '#';

  
}
$scope.goHome = function(){
  goHome();
}


$scope.taskContexter = function(task,$event) {
  var element = deparseTask(task.route);
 
  loadURL(element);

  $($event.currentTarget).parent().blur();
  $($event.currentTarget).parent().focus();

};


var addTask = function(route,params) {
        return $http.post('/api/tasks/add/'+route,params);
      };
var  deleteTask = function(params) {
        if(params.scope =='course')
          return $http.delete('/api/course/tasks/delete/'+params.route);  
        if(params.scope =='tome')
          return $http.delete('/api/tome/tasks/delete/'+params.route);  
        if(params.scope =='chapter')
          return $http.delete('/api/chapter/tasks/delete/'+params.route);  
        if(params.scope =='part')
          return $http.delete('/api/part/tasks/delete/'+params.route);  
      };
var editTask = function(params, task) { 
        if(params.scope =='course')          
          return $http.post('/api/course/tasks/edit/'+params.route, task);  
        if(params.scope =='tome')
          return $http.post('/api/tome/tasks/edit/'+params.route, task);  
        if(params.scope =='chapter')
          return $http.post('/api/chapter/tasks/edit/'+params.route, task);  
        if(params.scope =='part')
          return $http.post('/api/part/tasks/edit/'+params.route, task); 
        if(params.scope =='fact')
          return $http.post('/api/part/tasks/edit/'+params.route, task);  
      };
var getTasks = function(courseId, partId, todoData) {  
      if(courseId == partId) partId =0;      
        return $http.get('/api/tasks/get/'+courseId+'/'+partId)
        };
      
var filterTasks = function(studiedPart) {
          return studiedPart.todos;
      };


var updateMainFacts = function(){  
  $scope.resetIndicators();

//////////////// CHAPTERS

  var allFacts=[]; 
  angular.forEach($scope.course.tomes, function(tome) {
    angular.forEach(tome.chapters, function(chapter){

      angular.forEach(chapter.facts, function(f){
        f.parentTitle='Chapitre \"'+chapter.title+' \" '
         var indicator=f.issueCode
          var maxV = $scope.indicatorsHeader.filter(function(e){ return ((e.issueCode === f.issueCode))} );
          f.mainFact=false;
          if(maxV.length>0) {          
              maxV=maxV[0].chapterValue;
                  if(f.delta>maxV) {
                    f.mainFact=true;
                    $scope.indicatorsHeader.filter(function(e){ return ((e.issueCode === f.issueCode))} )[0].chapterValue = f.delta;
                    $scope.indicatorsHeader.filter(function(e){ return ((e.issueCode === f.issueCode))} )[0].chapterFactId = f._id
                  }
                }
           
          allFacts.push(f)

      })
    })
  })

  var mainFacts=[];
  $scope.indicatorsHeader.forEach(function(ind){

    if(ind.chapterFactId!=null){
      var fact = allFacts.filter(function(e){return (e._id==ind.chapterFactId)})[0];
      mainFacts.push(fact);

    }
  }) 

 $scope.MainChaptersFacts =  mainFacts;
 $scope.AllChaptersFacts = allFacts;

 //////////////// SECTIONS
 

 $scope.$watch('allFactsDisplay', function(newValue, oldValue) {  
  $scope.currentFact = 0;
 if(newValue){
  $scope.ChaptersFacts = $scope.AllChaptersFacts;
  $scope.SectionsFacts = $scope.AllSectionsFacts;


 }
 else{
    $scope.ChaptersFacts = $scope.MainChaptersFacts;
    $scope.SectionsFacts = $scope.MainSectionsFacts;
  };
 

    setTimeout(function() {
      
     $scope.goHome();
  inspectorCourseData('facts');
    $scope.$apply();
  }, 0);

});

allFacts=[]; 
angular.forEach($scope.course.tomes, function(tome) {
    angular.forEach(tome.chapters, function(chapter){
      
      angular.forEach(chapter.parts, function(part){
        angular.forEach(part.facts, function(f){
          
          f.parentTitle='Section '+part.id+' ('+part.title+') '
          var indicator=f.issueCode
        var maxV = $scope.indicatorsHeader.filter(function(e){ return ((e.issueCode === f.issueCode))} );
        f.mainFact=false;
        if(maxV.length>0) {          
            maxV=maxV[0].sectionValue;
                if(f.delta>maxV) {
                  $scope.indicatorsHeader.filter(function(e){ return ((e.issueCode === f.issueCode))} )[0].sectionValue = f.delta;
                  $scope.indicatorsHeader.filter(function(e){ return ((e.issueCode === f.issueCode))} )[0].sectionFactId = f._id
                  f.mainFact=true;
                }
              }
         
        allFacts.push(f)

      })
      })
    })
  })

 mainFacts=[];
  $scope.indicatorsHeader.forEach(function(ind){

    if(ind.sectionFactId!=null){
      mainFacts.push(allFacts.filter(function(e){return (e._id==ind.sectionFactId)})[0])
    }
  }) 

 $scope.MainSectionsFacts = mainFacts;
 $scope.AllSectionsFacts = allFacts;

}




var inspectorCourseData = function(tab){   

$scope.inspector={} 
var facts=[];
  if($scope.sectionDisplay) {
         facts = $scope.SectionsFacts;   

         $scope.inspectorStats.type='part'
  }
  else{
      facts= $scope.ChaptersFacts;
      $scope.inspectorStats.type='chapter';
  }

if(facts.length>0){
  $scope.inspectorFacts={
  'id':facts[0].partId,
  'type':facts[0].partType,
  'indicatorCode':facts[0].issueCode,
  'Facts': $.grep(facts,  function(e){return ($.inArray(e.classof, $scope.indicatorsSelectionModel)>-1)})  

  };
  $scope.courseFacts = $scope.inspectorFacts;
}
  else
    $scope.inspectorFacts={'Facts':[]}


   $scope.inspector = $scope.inspectorStats;
$scope.inspectorStats.breadcrumbsData ={};
$scope.factTitleDisplay=true;
 
}

var inspectorTomeData = function(tome, indicator, fact, tab){  

  var mainIssues = [];
  var  mainStats = computeComponentStats(tome, $scope.sectionDisplay);
  
   var code= (tab=='stats')?$scope.inspectorStats.indicatorCode:'actions';
   if($scope.sectionDisplay){ 
       mainIssues = $scope.SectionsFacts;

      $scope.factTitleDisplay=true;
       $scope.inspectorStats = {'type':'part',
                   'id':mainStats.ids,
                   'breadcrumbsData': tome.fullpath,
                   'typeTxt': 'cette partie',
                   'indicatorTxt': 'tous les indicateurs',
                   'indicatorCode':code,                  
                    'Indicators' :[
                    {'name':'actions','value':  Math.round(100*mainStats.actions,2)+'%',
                      'comment':'est le taux moyen de visite des sections de cette partie'},
                    {'name':'reread','value':  Math.round(100*mainStats.reread)+'%',
                      'comment':'est le taux moyen de relecture des sections de cette partie'},
                   {'name':'stop', 'value':  Math.round(100*mainStats.stop)+'%',
                      'comment':'est le taux moyen des arrêts définitfs de la lecture sur les sections de cette partie'}  ,
                      {'name':'speed','value':   Math.round(mainStats.speed)+' mots par minutes',
                      'comment':'est la vitesse moyenne de lecture des sections de cette partie'}
                      ]    
                    
                  };
    }
  else{
    mainIssues = $scope.ChaptersFacts;
    $scope.inspectorStats = {'type':'chapter',
                   'id':mainStats.ids,
                   'breadcrumbsData': tome.fullpath,
                   'typeTxt': 'cette partie',
                   'indicatorTxt': 'tous les indicateurs',
                    'indicatorCode':code,
                    'Indicators' :[
                    {'name':'actions','value':  Math.round(100*mainStats.actions,2)+'%',
                      'comment':'est le taux moyen de visite des chapitres de cette partie'},
                    {'name':'reread','value':  Math.round(100*mainStats.reread)+'%',
                      'comment':'est le taux moyen de relecture des chapitres de cette partie'},
                   {'name':'stop', 'value':  Math.round(100*mainStats.stop)+'%',
                      'comment':'est le taux moyen des arrêts définitfs de la lecture sur les chapitres de cette partie'}  ,
                      {'name':'speed','value':   Math.round(mainStats.speed)+' mots par minutes',
                      'comment':'est la vitesse moyenne de lecture des chapitres de cette partie'}
                      ]    
                    
                  };
  }
  
$scope.factTitleDisplay=true;
  var times =[], users =[], rss =[], reread =[], stops =[];


 


  if(indicator!=null) {
    $scope.inspectorStats.Indicators = $scope.inspectorStats.Indicators.filter(function(e){return (e.name==indicator)}); 
  $scope.inspectorStats.indicatorTxt="l'indicateur selectionné"
}
  var facts = mainIssues.filter(function(e){return (e.tome==tome._id)});
/*if(facts.length>0)
  {
   
     $scope.inspectorFacts = {
    'id':facts[0].partId,
    'type':facts[0].partType,
    'indicatorCode':facts[0].issueCode,
    'Facts':$.grep(facts,  function(e){return ($.inArray(e.classof, $scope.indicatorsSelectionModel)>-1)}) 
    }

    
    if(indicator!=null) $scope.inspectorFacts.Facts = 
      $scope.inspectorFacts.Facts.filter(function(e){return (e.classof==indicator)});

    
    if(fact!=null)
     $scope.inspectorFacts.Facts = $scope.inspectorFacts.Facts.filter(function(e){return (e.classof==fact)})
  }
    else $scope.inspectorFacts={'Facts':[]}
  


 if(($scope.inspectorFacts.Facts.length>0) & (tab=='facts')) 
     {
      $('.inspectorChosenPart').removeClass('inspectorChosenPart');
      
    var fact = $scope.inspectorFacts.Facts[0];
    $(".fact[data-fact-id='"+fact._id+"']").parent().addClass('inspectorChosenPart').fadeIn(100).fadeOut(100).fadeIn(200).focus().select();
    }
  else
      
*/
return;
}

var inspectorChapterData = function(chapter, indicator, fact, tab){ 
  
  var mainIssues = [], mainStats = [];
  var code= (tab=='stats')?$scope.inspectorStats.indicatorCode:'actions';
  if($scope.sectionDisplay) {
  	
      mainIssues= $scope.SectionsFacts;
      mainStats = computeComponentStats(chapter, $scope.sectionDisplay)
      $scope.factTitleDisplay=true;alert(mainStats.stop)
       $scope.inspectorStats = {'type':'section',
                   //'id':mainStats.ids,
                   'typeTxt': 'ce chapitre',
                   'breadcrumbsData': chapter.fullpath,
                   'indicatorTxt': 'tous les indicateurs',
                   'indicatorCode':code,                  
                    'Indicators' :[
                    {'name':'actions','value':  Math.round(100*mainStats.actions,2)+'%',
                      'comment':'est le taux moyen de visite des sections de ce chapitre'},
                    {'name':'reread','value':  Math.round(100*mainStats.reread)+'%',
                      'comment':'est le taux moyen de relecture des sections de ce chapitre'},
                   {'name':'stop', 'value':  Math.round(100*mainStats.stop)+'%',
                      'comment':'est le taux moyen des arrêts définitfs de la lecture sur les sections de ce chapitre'}  ,
                      {'name':'speed','value':   mainStats.speed+' mots par minutes',
                      'comment':'est la vitesse moyenne de lecture des sections de ce chapitre'}
                      ]    
                    
                  };
    }
  else{
    mainIssues= $scope.ChaptersFacts;
    $scope.factTitleDisplay=false;
    $scope.inspectorStats = {'type':'chapter',
                   'id':chapter.id,
                   'typeTxt': 'ce chapitre',
                   'breadcrumbsData': chapter.fullpath,
                   'indicatorTxt': 'tous les indicateurs',
                   'indicatorCode':code,                  
                    'Indicators' :[
                    {'name':'actions','value':Math.round(100*chapter.actions,2)+'%',
                      'comment':' des visites sur le cours ont été observées sur ce chapitre ('+chapter.nbactions+' actions)',
                  	   'isFact':($scope.inspectorFacts.Facts.filter(function(f){ return (f.partId==chapter.id &f.classof === 'actions')}).length > 0)?
						chapter.facts.filter(function(f){ return f.classof === 'actions'})[0].route:null},
                    {'name':'reread','value':Math.round(100*chapter.reread,2)+'%',
                      'comment':'des lectures de ce chapitre sont des relectures',
                  	   'isFact':($scope.inspectorFacts.Facts.filter(function(f){ return (f.partId==chapter.id & f.classof === 'reread')}).length > 0)?
						chapter.facts.filter(function(f){ return f.classof === 'reread'})[0].route:null},
                    {'name':'stop','value':Math.round(100*chapter.stop,2)+'%',
                      'comment':'des arrêts définitifs de la lecture se passent sur ce chapitre',
                  	   'isFact':($scope.inspectorFacts.Facts.filter(function(f){ return (f.partId==chapter.id & f.classof === 'stop')}).length > 0)?
						chapter.facts.filter(function(f){ return f.classof === 'stop'})[0].route:null},
                      {'name':'speed','value':chapter.speed+' mots par minute',
                      'comment':'est la vitesse moyenne de lecture sur ce chapitre',
                  	   //'isFact':(chapter.facts.filter(function(f){ return f.classof === 'speed'}).length > 0)?
                       'isFact':($scope.inspectorFacts.Facts.filter(function(f){ return (f.partId==chapter.id & f.classof === 'speed')}).length > 0)?
						chapter.facts.filter(function(f){ return f.classof === 'speed'})[0].route:null}
                      ]    
                    
                  };
  }

  var code= (tab=='stats')?$scope.inspectorStats.indicatorCode:'actions';
  

if(indicator!=null) {
  $scope.inspectorStats.Indicators = $scope.inspectorStats.Indicators.filter(function(e){return (e.name==indicator)});
  $scope.inspectorStats.indicatorTxt="l'indicateur selectionné"
}
  
var facts = mainIssues.filter(function(e){return (e.chapter==chapter._id)});
/*if(facts.length>0)
  {
     $scope.inspectorFacts = {
    'id':facts[0].partId,
    'type':facts[0].partType,
    'indicatorCode':facts[0].issueCode,
    'Facts':$.grep(facts,  function(e){return ($.inArray(e.classof, $scope.indicatorsSelectionModel)>-1)}) 
  }

    
    if(indicator!=null) $scope.inspectorFacts.Facts = $scope.inspectorFacts.Facts.filter(function(e){return (e.classof==indicator)});
    if(fact!=null)
     $scope.inspectorFacts.Facts = $scope.inspectorFacts.Facts.filter(function(e){return (e.classof==fact)})
  }
    else $scope.inspectorFacts={'Facts':[]}
  

      $('.inspectorChosenPart').removeClass('inspectorChosenPart');

 if(( $scope.inspectorFacts.Facts.length>0) & (tab=='facts')) 
     {


      
      var fact = $scope.inspectorFacts.Facts[0];
    $(".fact[data-fact-id='"+fact._id+"']").parent().addClass('inspectorChosenPart').fadeIn(100).fadeOut(100).fadeIn(200).focus().select();
    }
  else
      */
}

var inspectorSectionData = function(section, indicator, fact, tab){  
  $scope.factTitleDisplay=false;
 var mainIssues = $scope.SectionsFacts;
  var code= (tab=='stats')?$scope.inspectorStats.indicatorCode:'actions';
    $scope.inspectorStats = {'type':'part',
                   'id':section.id,
                   'typeTxt': 'cette section',
                   'breadcrumbsData': section.fullpath,
                   'indicatorTxt': 'tous les indicateurs',
                   'indicatorCode':code,
                    'Indicators' :[
                    {'name':'actions','value':Math.round(100*section.actions,2)+'%',
                      'comment':' des visites sur le cours ont été observées sur cette section('+section.nbactions+' actions)',
                       'isFact':($scope.inspectorFacts.Facts.filter(function(f){ return (f.partId==section.id &f.classof === 'actions')}).length > 0)?
            section.facts.filter(function(f){ return f.classof === 'actions'})[0].route:null},
                    {'name':'reread','value':Math.round(100*section.reread,2)+'%',
                      'comment':'des lectures de cette section sont des relectures',
                       'isFact':($scope.inspectorFacts.Facts.filter(function(f){ return (f.partId==section.id & f.classof === 'reread')}).length > 0)?
            section.facts.filter(function(f){ return f.classof === 'reread'})[0].route:null},
                    {'name':'stop','value':Math.round(100*section.stop,2)+'%',
                      'comment':'des arrêts définitifs de la lecture se passent sur cette section',
                       'isFact':($scope.inspectorFacts.Facts.filter(function(f){ return (f.partId==section.id & f.classof === 'stop')}).length > 0)?
            section.facts.filter(function(f){ return f.classof === 'stop'})[0].route:null},
                      {'name':'speed','value':section.speed+' mots par minute',
                      'comment':'est la vitesse moyenne de lecture sur cette section',
                       //'isFact':(section.facts.filter(function(f){ return f.classof === 'speed'}).length > 0)?
                       'isFact':($scope.inspectorFacts.Facts.filter(function(f){ return (f.partId==section.id & f.classof === 'speed')}).length > 0)?
            section.facts.filter(function(f){ return f.classof === 'speed'})[0].route:null}
                      ]       
                    
                  };

if(indicator!=null) {
  $scope.inspectorStats.Indicators = $scope.inspectorStats.Indicators.filter(function(e){return (e.name==indicator)});
$scope.inspectorStats.indicatorTxt="l'indicateur selectionné"
}
  
var facts = mainIssues.filter(function(e){return (e.section==section._id)});
/*if(facts.length>0)
  {
     $scope.inspectorFacts = {
    'id':facts[0].partId,
    'type':facts[0].partType,
    'indicatorCode':facts[0].issueCode,
    'Facts':$.grep(facts,  function(e){return ($.inArray(e.classof, $scope.indicatorsSelectionModel)>-1)}) 
  }

    
    if(indicator!=null) $scope.inspectorFacts.Facts = $scope.inspectorFacts.Facts.filter(function(e){return (e.classof==indicator)});
    if(fact!=null)
    $scope.inspectorFacts.Facts = $scope.inspectorFacts.Facts.filter(function(e){return (e.classof==fact)})
  }
    else $scope.inspectorFacts={'Facts':[]}


 if(( $scope.inspectorFacts.Facts.length>0) & (tab=='facts')) 
    {
      $('.inspectorChosenPart').removeClass('inspectorChosenPart');
      
    var fact = $scope.inspectorFacts.Facts[0];
    $(".fact[data-fact-id='"+fact._id+"']").parent().addClass('inspectorChosenPart').fadeIn(100).fadeOut(100).fadeIn(200).focus().select();
    }
  else
      */
}







/***************** TOUR ********************/
$scope.tour={}
$scope.tour.CompletedEvent = function (scope) {
        console.log("Completed Event called");
    };

    $scope.tour.ExitEvent = function (scope) {
        console.log("Exit Event called");
    };

    $scope.tour.ChangeEvent = function (targetElement, scope) {
        console.log("Change Event called");
        console.log(targetElement);  //The target element
        console.log(this);  //The IntroJS object
    };

    $scope.tour.BeforeChangeEvent = function (targetElement, scope) {
        console.log("Before Change Event called");
        console.log(targetElement);
    };

    $scope.tour.AfterChangeEvent = function (targetElement, scope) {
        console.log("After Change Event called");
        console.log(targetElement);
    };
 
    $scope.tour.IntroOptions = {

        steps:[
        {
            element:'#data-table',
            intro: "<span class='badge-tour'>1/14</span> <h4>Zone Table de données du cours</h4>"+
            "Cette table présente en en-tête la structure du cours (colonnes) et les indicateurs associés (lignes). Les cellules intérieures colorées correspondent aux valeurs des différents indicateurs (carte de chaleur). Les problèmes potentiels détectés sont indiqués à l’aide du symbole"+
             "<span class='fact fa fa-exclamation-circle' role='button' style='padding:0;color:#FFEB3B;'></span>",
            position: 'bottom'
        },
        {
            element: '#inspector-container',
            intro: "<span class='badge-tour'>2/14</span> <h4>Inspecteur</h4>"+
            "Présente les indicateurs calculés sous deux angles: problèmes potentiels et statistiques. L'élément du cours concerné est indiqué en haut à gauche avec possibilité de naviguer vers la plateforme OpenClassrooms pour le voir dans son contexte.",
            position: 'top',
        },
        {
            element: '#task-panel',
            intro: "<span class='badge-tour'>3/14</span> <h4>Tâches</h4>"+
            "Permet de planifier des actions sur l'élément sélectionné depuis sa zone d'édition. ",
            position: 'left',
        },
        
        {
            element:'#granuleSwitchTH',
            intro: "<span class='badge-tour'>4/14</span> <h4><em>Changement Granule</em></h4>"+
            "Permet de sélectionner le niveau de granularité sur lequel les indicateurs sont calculés :"+
            "<ul><li><b>Chapitre</b> : les indicateurs sont calculés par rapport aux chapitres <li> <b>Section</b>: les indicateurs sont calculés par rapport aux sections</ul>",          
            position: 'right'
        },
        {
            element:'.inspectorChosenPart',
            intro: "<span class='badge-tour'>5/14</span> <h4>Problème potentiel détecté</h4>"+
            "Ce symbole indique qu'un problème potentiel pour l’indicateur (en-tête de ligne) a été détecté pour l'élément (en-tête de colonne).",
            position: 'bottom'
        },
        {
            element: '#tableConfg',
            intro: "<span class='badge-tour'>6/14</span> <h4>Configuration</h4>"+
            "Ce menu permet de:" +
            "<ol><li>Sélectionner les indicateurs à afficher" +
            "<li>Sélectionner le seuil de détection des problèmes potentiels : afficher uniquement les principaux problèmes ou avoir un affichage plus exhaustif </ol>",
            position: 'bottom',
        }
        ,
       
        
        {
            element: '#factsTab',
            intro: "<span class='badge-tour'>7/14</span> <h4>Onglet <em>Problèmes</em> </h4> "+
            "Présente les problèmes potentiels détectés pour l'élément. Deux boutons permettent de naviguer entre les éventuels problèmes détectés.",
            position: 'bottom',
        },
        {
            element:'#fact-div',
            intro: "<span class='badge-tour'>8/14</span> <h4>Description de problèmes potentiels</h4>"+
            "Affiche une description du problème sélectionné. Des suggestions pour le résoudre sont parfois proposées et peuvent être marquées comme tâches à faire.",
            position: 'top',
        },
        {
            element:'#dropFactBtn',
            intro: "<span class='badge-tour'>9/14</span> <h4>Bouton <em>Ce n'est pas/plus un problème</em></h4>"+
            "Ce bouton permet d’arrêter l'affichage de ce problème (soit le problème n'en est pas un (faux positif), soit des actions pour le résoudre ont déjà été entreprises).",
            position: 'top',
        },
        {
            element:'#editSuggestionBtn',
            intro: "<span class='badge-tour'>10/14</span> <h4>Bouton <em>Créer une tâche</em></h4>"+            
            "Ce bouton planifie une action permettant sa résolution dans la <b>Zone de Tâches</b>. Le système ajoute alors la suggestion comme action à réaliser, avec la possibilité de la modifier.",
            position: 'top',
        },
        {
            element: '#statsTab',
            intro: "<span class='badge-tour'>11/14</span> <h4>Onglet <em>Statistiques</em></h4>"+
            "Présente quelques statistiques sur l'élément sélectionné. ",
            position: 'top',
        },
        {
            element: '#chartPanel',
            intro: "<span class='badge-tour'>12/14</span> <h4>Graphiques</h4>"+
            "Présente les graphiques illustrant le problème ou la statistique sélectionnée sur le partie gauche de l'inspecteur. L'élément sélectionné est doté d'une bordure épaisse et colorée.",
            position: 'top',
        },
         
        {
            element: '#tasks-table',
            intro: "<span class='badge-tour'>13/14</span> <h4>Liste de <em>Tâches</em></h4>"+
            "Les tâches planifiées sont affichées sur cette table. Un groupe de boutons permet de (gauche à droite)<br/>"+
            "<ul>"+
            "<li><span class='glyphicon glyphicon-pencil'></span> Modifier l'action planifiée"+
            "<li><span class='glyphicon glyphicon-ok'></span> Marquer l'action comme étant faite"+
            "<li><span class='glyphicon glyphicon-trash'></span> Supprimer l'action"+
            "</ul>"
            ,
            position: 'left',
        },
        {
            element: '#tourStarter1',
            intro: "<span class='badge-tour'>14/14</span> <h4><em>Merci</em></h4>"+
            "La visite guidée est terminer. Merci de l'avoir suivie!",
            position: 'left',
        }
       
        ],
        showStepNumbers: false,
        exitOnOverlayClick: true,
        exitOnEsc:true,
        nextLabel: '<strong>Suiv.</strong>',
        prevLabel: '<span style="color:green">Prec.</span>',
        skipLabel: 'Fermer',
        doneLabel: 'MERCI'
    };

    $scope.tour.ShouldAutoStart = false;
    /***************** END TOUR ********************/

var computeGranuleData = function(granularity, element, indicator, fact, tab){
if(typeof tab=='undefined') tab='facts'
switch(granularity){
  case 'course':
    inspectorCourseData(tab);
  break;
  case 'tome':
    inspectorTomeData(element, indicator, fact, tab);
    break;
  case 'chapter':
    inspectorChapterData(element, indicator, fact, tab);
    break
  case 'part':
    inspectorSectionData(element, indicator, fact, tab);
    break

  }



}

var selectTab = function(tab){
  resetPath();
  $('.inspectorChosenPart').removeClass('inspectorChosenPart');
   if((tab == 'facts')&($scope.inspectorFacts.Facts.length>0)){
    
    
    loadURL($scope.context.factsContext);  
    $(".fact[data-fact-id='"+$scope.inspectorFacts.Facts[$scope.currentFact]._id+"']").parent().addClass('inspectorChosenPart').fadeIn(100).fadeOut(100).fadeIn(200).focus().select();

   }
   else{
   	
    loadURL($scope.context.statsContext);
    
    window.setTimeout(function() {
      //  $('.componentInfo.active:visible').trigger( "mouseover" );
    }, 0);
  }

}
/********************************************/
var loadContext = function(){
  var width = $('.data-table').innerWidth() ;
  var top = $('.data-table').offset().top + $('.data-table').innerHeight();
  var left = $('.data-table').offset().left;

   var url = location.hash.slice(1);
 
   var element = resolveRoute(url);

   $scope.context.route = url;
   
   $scope.context.Tasks =element.todos; 
   
   var path = url;
   resetPath();
   var task = null;
    var indicator = 'ALL'
  
  
  var course  = $scope.course;
  var components = parseURL(path)
  if(components == null){
    var tome=-1;
     $scope.context.statsContext = "#";
    $scope.tabSelect = 'stats'
   // selectTab('stats');
  }
  else{
    var tome = components.hasOwnProperty('partid')?$.grep(course.tomes, function(e){ return  e._id == components.partid })[0]:-1;
     var chap = components.hasOwnProperty('chapid')?$.grep(tome.chapters, function(e){ return  e._id == components.chapid })[0]:-1;
    var part  = components.hasOwnProperty('sectionid')?$.grep(chap.parts, function(e){ return  e._id == components.sectionid })[0]:-1;     
    var partElt = -1;
    var tab=components.hasOwnProperty('tab')?components.tab:'facts';
    var fact  = components.hasOwnProperty('factid')?
                (
                  (part==-1)?($.grep(chap.facts, function(e){ return  e._id == components.factid })[0]):
                             ($.grep(part.facts, function(e){ return  e._id == components.factid })[0])
                  ): -1;

    

    task = components.hasOwnProperty('taskid')?
    $.grep(course.todos, function(e){ return  e._id == components.taskid })[0]:null;
     indicator = components.hasOwnProperty('indicator')? 
                            components.indicator: components.hasOwnProperty('factid')?
                            fact.classof:'ALL';

     
            
            $scope.context.statsContext = path;
            $scope.tabSelect = components.hasOwnProperty('factid')?'facts':'stats';

  }
  


  if(tome==-1) {        
    
        computeGranuleData('course',tab);
        $scope.context.factsContext = ($scope.sectionDisplay)?$scope.MainSectionsFacts[0].route:$scope.MainChaptersFacts[0].route;
        $scope.currentFact = 0;
        $scope.context.taskText ='(nouvelle tâche)';
        $scope.context.taskPanelMiniTitle='Cours'
        selectCourse(indicator, task); 
        

    }
    else
     if(chap ==-1) {
       task = components.hasOwnProperty('taskid')?$.grep(tome.todos, function(e){ return  e._id == components.taskid })[0]:null;

       computeGranuleData('tome',tome,null, null,tab);
      partElt = $('.tome_index[data-part ='+tome.id+']')[0];
      $scope.context.taskText ='(nouvelle tâche pour cette partie)'; 
      $scope.context.taskPanelMiniTitle='Partie: '+tome.title;
      selectTome(partElt, task);
    }
    else
      if(part==-1){
        task = components.hasOwnProperty('taskid')?$.grep(chap.todos, function(e){ return  e._id == components.taskid })[0]:null;
        if(fact!=-1){
          partElt = $('.part_index[data-part ='+chap.id+']'); 
          $scope.context.taskText ='(nouvelle tâche pour ce chapitre)';
          $scope.context.taskPanelMiniTitle='Chapitre: '+chap.title;
          $scope.inspectorDisplaySrc='inspector';           
          computeGranuleData('chapter', chap, fact.classof, fact.classof,tab);
          //selectChapterIndicator(chap.route, task, chap, indicator, true);
          selectFact(chap.route, task, fact, indicator)

          
          
        }
        else
        if(indicator =="ALL"){

          computeGranuleData('chapter', chap, null, null,tab);
          partElt = $('.chapter_index[data-part ='+chap.id+']')[0];   
          $scope.context.taskText ='(nouvelle tâche pour ce chapitre)';
          $scope.context.taskPanelMiniTitle='Chapitre: '+chap.title;
          selectChapter(partElt, task, "ALL");

          
          
        }
        else{

          computeGranuleData('chapter', chap, null, null,tab);
          partElt = $('.chapter_index[data-part ='+chap.id+']')[0];
          $scope.context.taskText ='(nouvelle tâche pour ce chapitre)';
          $scope.context.taskPanelMiniTitle='Chapitre: '+chap.title;
          //$scope.sectionDisplay = false;   
          $scope.inspectorDisplaySrc='inspector' ;
         // selectChapterIndicator(chap.route, task, chap, indicator, false);
         $scope.inspectorStats.indicatorCode = indicator;
         selectChapter(partElt, task, indicator);
          
          
        }
      }
      else{
        task = components.hasOwnProperty('taskid')?$.grep(part.todos, function(e){ return  e._id == components.taskid })[0]:null;
        if(fact!=-1){
          partElt = $('.part_index[data-part ='+part.id+']'); 
          computeGranuleData('part', part, fact.classof, fact.classof,tab);          
          $scope.context.taskText ='(nouvelle tâche pour ce problème)';
          $scope.context.taskPanelMiniTitle='Section: '+part.title;
          $scope.inspectorDisplaySrc='inspector';           
          selectFact(part.route, task, fact, indicator)
          
          
        }
        else
        if(indicator =="ALL"){ 
          computeGranuleData('part', part, null, null,tab); 
          //$scope.sectionDisplay = true;
          partElt = $('.part_index[data-part ='+part.id+']');   
          $scope.context.taskText ='(nouvelle tâche pour cette section)'; 
          $scope.context.taskPanelMiniTitle='Section: '+part.title;
          selectSection(partElt, task, "ALL");
          
          
        }
        else{
          computeGranuleData('part', part, null, null,tab); 
          partElt = $('.part_index[data-part ='+part.id+']');  
          $scope.context.taskText ='(nouvelle tâche pour cette section)';
          $scope.context.taskPanelMiniTitle='Section: '+part.title;
          
          $scope.inspectorDisplaySrc='inspector';
          
          $scope.inspectorStats.indicatorCode = indicator;
          selectSection(partElt, task, indicator);
        }
      }


/*************************************************/
  var totalWidth = $('.col-lg-12').width();
     //   $('.data-table').css('width',totalWidth);
        $('th').css('overflow','hidden');
        $('.indicators-header').css('width','50px');
   var nbP = $scope.course.parts.length;
        if (nbP<=0) nbP = 1;
        if (nbP>40) nbP =40;
   var tdW = (totalWidth - 0)/nbP; 
        
        
        $('.data-table td').each(function() {
   
 //   $(this).css('min-width', 10);     // css attribute of your <td> width:15px; i.e.
  //  $(this).css('max-width', 10);     // css attribute of your <td> width:15px; i.e.
});
       // $scope.width =tdW;
        //$('.data-table td').css('width',tdW+'px!important');
        //$('.data-table td').css('display','table');
      //  $('.data-table td').attr('width',tdW)
        
        if($('.course_title_top').length<1)
                $('.navbar-brand').after('<a role ="button" href ="#" ng-click ="resetPath();goHome()" class ="course_title_top"> <span class ="glyphicon glyphicon-book"></span>  <em>'+$scope.course.title+'</em>    </a>  - <span class="course_tour_top pull-right"  role="button"></span>');
                


$('.tableScroller').scroll();
 


}



window.onresize = function(){
   $scope.$broadcast('content.reload');;
}

var reloadURL = function(){ 
  var url = window.location.hash
  window.setTimeout(function() {
    
    window.location.hash = url
   }, 0);


}


var loadURL = function(url){
  if(url == window.location.hash)
 {
  goHome();

}
  else 
    {
      window.location.hash = url;
}


  return false;

};

$scope.loadURL = loadURL;

$scope.triggerClick = function($event){ 

  var url = '#'+$($event.currentTarget).attr('data-path');
  
  loadURL(url); 
  
 }
 $scope.triggerFactClick = function($event){  
  var url = $($event.currentTarget).attr('data-path');
  loadURL(url); 
  
 }

 $scope.triggerHover = function($event){ 
  var url ="#"
//if ($event!==null)  url = $($event.currentTarget).attr('data-path');  
  //  $scope.hoverElements(url); 
 }

 $scope.$on("hover", function (e, msg) {
//$scope.hoverElements(msg)        
      });



var showTasksAndFacts = function(element, indicator, task){ 

  if(indicator ==='ALL'){
       angular.forEach(element.todos, function(todo){
   var results = $.grep($scope.context.subtasks, function(e){ return  e._id == todo._id})[0]
        if(typeof results !== 'undefined') results.selected ='relevantTask';
      });
      angular.forEach(element.facts, function(fact){
        angular.forEach(fact.todos, function(todo){
   var results = $.grep($scope.context.subtasks, function(e){ return  e._id == todo._id})[0];
        if(typeof results !== 'undefined') results.selected ='relevantTask';
      })
      });
    }
    else{
       angular.forEach(element.todos, function(todo){
 var results = $.grep($scope.context.subtasks, function(e){ return  e._id == todo._id && e.classof ==indicator})[0]
      if(typeof results !== 'undefined') results.selected ='relevantTask';
        });
        angular.forEach(element.facts, function(fact){
          angular.forEach(fact.todos, function(todo){
     var results = $.grep($scope.context.subtasks, function(e){ return  e._id == todo._id && e.classof ==indicator})[0];
          if(typeof results !== 'undefined') results.selected ='relevantTask';
        })
        });
    };


    if(task != null){
     
      var task_id =  task._id;

 var selection = $.grep($scope.context.subtasks, function(e){ return  e._id == task_id})[0];
 
selection.selected ='selectedTask';
$('.selectedTask').focus().blur().focus();
        window.setTimeout(function() {
          selection.selected ='selectedTask';
          $('.selectedTask').focus().blur().focus();
        }, 0);        
    }
   

}

 var selectFact= function(url, task,fact, indicator) {
  //url =url+'&indicator='+indicator; 
  $('.td_issue[data-path ="'+url+'"]').addClass('chosenPart');
  $scope.context.route = url;     
  var element = resolveRoute(url);
  
      
 
     $scope.context.inspector_title = element.title;
     $scope.courseDisplay = false;     
     

  showTasksAndFacts(element, indicator, task);
  $scope.context.statsContext = url+'&indicator='+indicator;


  var factID = $scope.inspectorFacts.Facts.indexOf(fact);
  if(factID != $scope.currentFact)
      $scope.setPage(factID);
  $scope.context.factsContext = url+'&'+fact.route;
  
 }


var selectIndictor = function(indicator){ 

  if(indicator ==='ALL') 
    $('#data-table').addClass('highlight-table');
  else{

    var rowTop = $('.indicators-header[data-indicator ="'+indicator+'"]').parent().offset();
    var topTop = rowTop.top;
    var left = rowTop.left;

    var width = $('.data-table').innerWidth() ;
    var height =  $('.indicators-header[data-indicator ="'+indicator+'"]').innerHeight();


    var rowBottom = $('.data-table tbody tr:last-child').offset();
    var topBottom = rowBottom.top;

    $('#divOverlay').offset({top:topTop - 2 ,left:left - 2});
    $('#divOverlay').height(height);
    $('#divOverlay').width(width);
    $('#divOverlay').css('visibility','visible');
    $('#divOverlay').slideDown('fast');    
  }  

}


var highlightTome = function(index){  
  resetPath();
  
  setTimeout(function() {
    var rowTop = $('.tomes-header> th:nth-child('+index+')').offset();
  var topTop = rowTop.top;
  var left = rowTop.left;
  //$('.tomes-header> th:nth-child('+index+')').addClass('chosenPart')

  var oneWidth = $('.tomes-header> th:nth-child('+index+')').innerWidth();
  var height = $('.data-table').innerHeight() ;


  var rowBottom = $('.data-table tbody tr:last-child > td:nth-child('+index+')').offset();
  var topBottom = rowBottom.top;

  $('#divOverlay').offset({top:topTop - 3 ,left:left - 2});
  $('#divOverlay').height(height);
  $('#divOverlay').width(oneWidth);
   $('#divOverlay').css('visibility','visible');
  $('#divOverlay').delay(200).slideDown('fast');
  }, 0);
 

}

$scope.hoverChapter = function(route){ 
  if(route==null) return;
  resetPath();
  setTimeout(function() {
  var rowTop = $('.chapter_index[data-path="'+route+'"]').offset();
  
  var topTop = rowTop.top;
  var left = rowTop.left;

  var oneWidth = $('.chapter_index[data-path="'+route+'"]').innerWidth();
  //$('.chapters-header> th:nth-child('+index+')').addClass('chosenPart')
  var height = $('.data-table').innerHeight() - $('.tomes-header th:first').innerHeight();


  $('#divHoverOverlay').offset({top:topTop - 3 ,left:left - 2});
  $('#divHoverOverlay').height(height);
  $('#divHoverOverlay').width(oneWidth);
  $('divHoverOverlay').css('visibility','visible');
  $('#divHoverOverlay').delay(200).slideDown('fast');

  //$(".gly-issue[parent-path='"+route+"']").addClass('fa fa-exclamation-circle');

  }, 0);
}
var highlightChapter = function(index, route, indicator){  
  resetPath();
  setTimeout(function() {
  var rowTop = $('.chapters-header> th:nth-child('+index+')').offset();

  var topTop = rowTop.top;
  var left = rowTop.left;

  var oneWidth = $('.chapters-header> th:nth-child('+index+')').innerWidth();
  //$('.chapters-header> th:nth-child('+index+')').addClass('chosenPart')
  var height = $('.data-table').innerHeight() - $('.tomes-header th:first').innerHeight();


  var rowBottom = $('.data-table tbody tr:last-child > td:nth-child('+index+')').offset();
  var topBottom = rowBottom.top;

  $('#divOverlay').offset({top:topTop - 3 ,left:left - 2});
  $('#divOverlay').height(height);
  $('#divOverlay').width(oneWidth);
  $('#divOverlay').css('visibility','visible');
  $('#divOverlay').delay(200).slideDown('fast');

  if(indicator!='ALL'){
    url =route+'&indicator='+indicator; 
 $('.td_issue[data-path ="'+url+'"]').addClass('chosenPart');
 console.log($('.td_issue[data-path ="'+url+'"]'))
  }

  //$(".gly-issue[parent-path='"+route+"']").addClass('fa fa-exclamation-circle');

  }, 0);
  

}
$scope.hoverSection = function(route){ 
;
  if(route==null) return;
  resetPath();
  setTimeout(function() {
  var rowTop = $('.part_index[data-path="'+route+'"]').offset();
  
  var topTop = rowTop.top;
  var left = rowTop.left;

  var oneWidth = $('.part_index[data-path="'+route+'"]').innerWidth();
  //$('.chapters-header> th:nth-child('+index+')').addClass('chosenPart')
  var height = $('.data-table').innerHeight() - $('.tomes-header th:first').innerHeight();


  $('#divHoverOverlay').offset({top:topTop - 3 ,left:left - 2});
  $('#divHoverOverlay').height(height);
  $('#divHoverOverlay').width(oneWidth);
  $('divHoverOverlay').css('visibility','visible');
  $('#divOverlay').delay(200).slideDown('fast');

  //$(".gly-issue[parent-path='"+route+"']").addClass('fa fa-exclamation-circle');

  }, 0);
}
var highlightPart = function(index, route, indicator){  
  resetPath();
  
  setTimeout(function() {
    var rowTop = $('.parts-header > th:nth-child('+index+')').offset();
    var topTop = rowTop.top;
    var left = rowTop.left;

    var oneWidth = $('.parts-header > th:nth-child('+index+')').innerWidth();
    //$('.parts-header > th:nth-child('+index+')').addClass('chosenPart')
    var height = $('.data-table').innerHeight() - $('.chapters-header th:first').innerHeight() - $('.tomes-header th:first').innerHeight();



     $('#divOverlay').offset({top:topTop -2 ,left:left - 2});
      $('#divOverlay').height(height);
      $('#divOverlay').width(oneWidth);
      $('#divOverlay').css('visibility','visible');
    $('#divOverlay').delay(200).slideDown('fast');

     if(indicator!='ALL'){
       url =route+'&indicator='+indicator; 
        $('.td_issue[data-path ="'+url+'"]').addClass('chosenPart');
 
  }

//$(".gly-issue[parent-path='"+route+"']").addClass('fa fa-exclamation-circle');

  
  }, 0);
}



var selectSection = function(partElt, task, indicator){   

  var route = $(partElt).attr('data-path');

  var element =resolveRoute(route);  
  
$scope.context.inspector_title = "Section : "+element.title;
$scope.courseDisplay = false;
var url = element.route;
$scope.context.route = url; 

highlightPart($(partElt).index() + 1, route, indicator);

if(indicator=='ALL'){
  showTasksAndFacts(element, 'ALL', task);
$scope.context.url = element.url;

}
else{ 
  url =url+'&indicator='+indicator; 
  element = resolveRoute(url);
  showTasksAndFacts(element, indicator, task);
}

    

    $scope.inspectorDisplaySrc='inspector'
 
}


var selectCourse = function(indicator, task){ 
  resetPath(); 
   $scope.inspectorDisplaySrc='course' ;

  $scope.indicatorInspectorShow = indicator;
  
  //if(indicator==='ALL')
  $scope.context.inspector_title = "Cours : "+$scope.course.title;// +" - " +$scope.context.subfacts.length +" problèmes potentiels";
  $scope.courseDisplay = true;
  $scope.context.url = $scope.course.url;

    

showTasksAndFacts($scope.course, indicator,task);
angular.forEach($scope.course.tomes, function(tome){
  showTasksAndFacts(tome, indicator, task);
  angular.forEach(tome.chapters, function(chapter){
    showTasksAndFacts(chapter, indicator, task);
    angular.forEach(chapter.parts, function(part){
      showTasksAndFacts(part,indicator,task)
    })
  })
});



$scope.observedElt ={'type':'course',
      'id':0,
  'typeTxt':'Ce cours',
  'indicatorTxt': 'tous les indicateurs'
    };


resetPath(); 
window.setTimeout(function() {
  $('#data-table').addClass('highlight-table');
}, 0);



   // selectIndictor(indicator); 
    

}


var selectTome = function(partElt, task){ 

  var route = $(partElt).attr('data-path');
  var element =resolveRoute(route);  
  showTasksAndFacts(element, 'ALL', task);
  

$scope.context.inspector_title = "Partie : "+element.title
$scope.courseDisplay = false;

$scope.context.url = element.url
$scope.inspectorDisplaySrc='inspector'
    highlightTome($(partElt).index() + 1);
    
  //}, 10);

    $scope.context.mainstats = element.mainstats;

}

var selectChapter = function(partElt, task, indicator){   

  var route = $(partElt).attr('data-path');

  var element =resolveRoute(route);  
  
$scope.context.inspector_title = "Chapitre : "+element.title;
$scope.courseDisplay = false;
var url = element.route;
$scope.context.route = url; 

highlightChapter($(partElt).index() + 1, route, indicator);

if(indicator=='ALL'){
  showTasksAndFacts(element, 'ALL', task);
  angular.forEach(element.parts, function(part){
  showTasksAndFacts(part, 'ALL',task);
  $scope.context.url = element.url;
  });


}
else{ 
  url =url+'&indicator='+indicator; 

  element = resolveRoute(url);
 
  showTasksAndFacts(element, indicator, task);
}

    

    $scope.inspectorDisplaySrc='inspector'
 
}

var selectChapterIndicator = function(url, task, chapter, indicator, isFact){  return;
 
  url =url+'&indicator='+indicator; 
  $('.td_issue[data-path ="'+url+'"]').addClass('chosenPart');
  $scope.context.route = url;     
  var element = resolveRoute(url);
  
      
 
     $scope.context.inspector_title = chapter.title;
     $scope.courseDisplay = false;     
     $scope.context.url = chapter.url

  showTasksAndFacts(element, indicator, task);


  
  
    }

var tabsFn = (function() {  
  function init() {
    setHeight();
  }  
  function setHeight() {
    var $tabPane = $('.tab-pane'),
    tabsHeight = $('.nav-tabs').height();
      
    $tabPane.css({ height: tabsHeight });
  }
    
  $(init);
})();




$scope.clearEditingTask = function(){
  $scope.formData ='';return false;
}
var insertLocalTask = function(route, task){

  var element = resolveRoute(route);

  element.todos.unshift(task);


  $scope.context.subtasks =computeAllTasks();


  var rt = route+'&taskid='+task._id;
  if(task.classof!=='ALL') rt = rt + '&indicator='+task.classof
  loadURL(rt);
 
}

$scope.editSuggestion = function(){

  $scope.formData = $scope.inspectorFacts.Facts[$scope.currentFact].suggestion_title; 

  var fact = $scope.inspectorFacts.Facts[$scope.currentFact];
var element = resolveRoute(fact.route);


  $scope.context.route = element.route;

  window.setTimeout(function() {
           $("#taskEditor").trigger( "click" );
           $(".editable-input ").fadeIn(100).fadeOut(100).fadeIn(200).focus().select();
       }, 0);
}



$scope.createTask = function($event){
  $scope.formData =  "Nouvelle tâche ("+"Sec. "+$scope.studiedPart+")"; 
$('#taskInput').focus();  
var element = resolveRoute($($event.currentTarget).attr('href'));

  $scope.context.route = $($event.currentTarget).attr('href');
  
window.setTimeout(function() {
             $(".editable-input ").fadeIn(100).fadeOut(100).fadeIn(200).focus().select();
        }, 0);

}

$scope.addTask = function (data) {
  
  $scope.dataLoading = true;
      if (data != undefined) {

   var addedTask = data;          
   var route = $scope.context.route;
   var query = parseTask(route, addedTask); 
   
   
        
        addTask(query.route,query.todo)
        .success(function(data) {
          insertLocalTask(route, data);
           $scope.formData = undefined;
           $scope.dataLoading = false;
            swal({   title: "Nouvelle tâche ajoutée!",   
            text: "Une nouvelle tâche a été ajoutée avec succès pour l'élément sélectionné.", 
             animation: "slide-from-top",
             type:"info"  ,
            timer: 1500,   showConfirmButton: false });
        })
        .error(function(data) {
        swal("Oops", "Une erreur interne du serveur est survenue. La tâche n'a pu être ajoutée", "error");
      });  
        $scope.dataLoading = false;     
        
      }    
      $scope.formData ='';return false;   
  }
$scope.editTask = function (route, todo, index) {   
  var task ={'todo':todo, 'updated':Date.now};
        editTask(parseTaskRequest(route), task)
        .success(function(data) {
          swal({   title: "Tâche modifiée!",   
            text: "La tâche a été modifiée avec succès.", 
             animation: "slide-from-top",
             type:"info"  ,
            timer: 1500,   showConfirmButton: false });
        });
  }

var updateLocalTasks = function(route, data){
  var element = resolveRoute(route);
  element.todos = data;
  loadContext();

}

var deleteTaskLocally = function(index){
  $scope.context.subtasks.splice(index,1)
}

var editTaskLocally = function(index, task){
  $scope.context.subtasks[index] = task;
}

$scope.openEditableArea = function(status){

  $scope.editableAreaOpen = status;
//if(x==false) $scope.taskPanelTitle = "Tâches"
  //else $scope.taskPanelTitle = x;
}
$scope.markTaskDone = function (route, index) {
  $scope.context.subtasks[index].done=true
}
$scope.deleteTask = function (route, index) {
swal({
      title: "Supprimer la tâche?", 
      text: "Êtes vous sur de vouloir suppprimer cette tâche?", 
      type: "warning",
      showCancelButton: true,
      closeOnConfirm: false,
      confirmButtonText: "Oui",
      cancelButtonText: "Non",
      confirmButtonColor: "#ec6c62"
    }, function() {
      
       deleteTask(parseTaskRequest(route))
        .success(function(data) {
     //     updateLocalTasks($scope.context.route, data)     ;
     deleteTaskLocally(index);
           swal({   title: "Tâche supprimée!",   
            text: "La tâche a été supprimée avec succès", 
             animation: "slide-from-top",
             type:"success"  ,
            timer: 1500,   showConfirmButton: false });
         
              })
      .error(function(data) {
        swal("Oops", "We couldn't connect to the server!", "error");
      });
    });


  }

$scope.dropFact = function () {
  var fact = $scope.inspectorFacts.Facts[$scope.currentFact];
swal({
      title: "Marquer le problème comme résolu?", 
      text: "Êtes vous sur de vouloir marquer ce problème comme résolu et le supprimer des problèmes potentiels?", 
      type: "warning",
      showCancelButton: true,
      closeOnConfirm: false,
      confirmButtonText: "Oui",
      cancelButtonText: "Non",
      confirmButtonColor: "#ec6c62"
    }, function() {
      
       //dropFact(parseTaskRequest(route))
        //.success(function(data) {
     var result = dropFactLocally( $scope.inspectorFacts.Facts[$scope.currentFact].route);
     updateMainFacts();
           swal({   title: "Problème marqué comme résolu!",   
            text: "Succès", 
             animation: "slide-from-top",
             type:"success"  ,
            timer: 1500,   showConfirmButton: false });
         
          /*    })
      .error(function(data) {
        swal("Oops", "We couldn't connect to the server!", "error");
      });*/

setTimeout(function() {
    loadURL(result);
    reloadURL(); 
    $scope.tableData = $scope.course;     
      $scope.$apply()
  }, 0);
      
    });
}

var dropFactLocally = function(route){
  var result = ""
  var components = parseURL(route)
  if(components.hasOwnProperty('partid')) {
    var tome = $.grep($scope.course.tomes, function(e){ return  e._id == components.partid })[0];
     if(components.hasOwnProperty('chapid')){
      var chap = $.grep(tome.chapters, function(e){ return  e._id == components.chapid })[0];
      
     if(components.hasOwnProperty('sectionid')){
        var part = $.grep(chap.parts, function(e){ return  e._id == components.sectionid })[0];
       if(components.hasOwnProperty('factid')){        
        var fact = $.grep(part.facts, function(e){ return  e._id == components.factid })[0];          
         part.facts.splice(part.facts.indexOf(fact),1);
          $scope.inspectorFacts.Facts.splice($scope.inspectorFacts.Facts.indexOf(fact),1);
          result = part.route;
       }
      }
      else
        if(components.hasOwnProperty('factid')){
          var fact = $.grep(chap.facts, function(e){ return  e._id == components.factid })[0];          
          chap.facts.splice(chap.facts.indexOf(fact),1);
          $scope.inspectorFacts.Facts.splice($scope.inspectorFacts.Facts.indexOf(fact),1);
          result = chap.route;
          

        }
    }  
  }   
  
  return result;

}


    $scope.find = function() {
      Courses.query(function(courses) {
        $scope.courses = courses;
      });
    };


  /**********************D3 CHARTS****************************/
var ComputeGlobalVisuData = function(){ 
  var visuData = []
  
   visuData.push({type:'actions',data:factChart(-1,'actions')});  
   visuData.push({type:'stop',data:factChart(-1,'stop')});
   visuData.push({type:'speed',data:factChart(-1,'speed')});  
   visuData.push({type:'reread',data:factChart(-1,'reread')});  
  // visuData.push({type:'Readers',data:factChart(-1,'Readers')});  
   
  // visuData.push({type:'Readers_tx',data:factChart(-1,'Readers_tx')});  
   // visuData.push({type:'mean.duration',data:factChart(-1,'mean.duration')});
  
 // visuData.push({type:'course_readers_rereaders',data:factChart(-1,'course_readers_rereaders')});  
 // visuData.push({type:'part_readers_rereaders',data:factChart(-1,'part_readers_rereaders')});  
 // visuData.push({type:'rupture',data:factChart(-1,'rupture')});  
 // visuData.push({type:'rupture_tx',data:factChart(-1,'rupture_tx')});  
  
  /*visuData.push({type:'recovery',data:factChart(-1,'recovery')});    
  visuData.push({type:'norecovery',data:factChart(-1,'norecovery')});    
  
  visuData.push({type:'next_recovery_tx',data:factChart(-1,'next_recovery')});    
  visuData.push({type:'direct_recovery_tx',data:factChart(-1,'direct_recovery')});    
  visuData.push({type:'prev_recovery_tx',data:factChart(-1,'prev_recovery')});    
  visuData.push({type:'distant_prev_recovery_tx',data:factChart(-1,'distant_prev_recovery')});    
  visuData.push({type:'distant_next_recovery_tx',data:factChart(-1,'distant_next_recovery')});  
  visuData.push({type:'norecovery',data:factChart(-1,'norecovery')});    
  visuData.push({type:'next_recovery',data:factChart(-1,'next_recovery')});    
  visuData.push({type:'direct_recovery',data:factChart(-1,'direct_recovery')});    
  visuData.push({type:'prev_recovery',data:factChart(-1,'prev_recovery')});    
  visuData.push({type:'distant_prev_recovery',data:factChart(-1,'distant_prev_recovery')});    
  visuData.push({type:'distant_next_recovery',data:factChart(-1,'distant_next_recovery')}); 
  

  visuData.push({type:'provenance',data:globalTransitionsProvenance('provenance')});    
  visuData.push({type:'destination',data:globalTransitionsProvenance('destination')});      
*/
  return visuData;
}




var mean = function(numbers) {
    // mean of [3, 5, 4, 4, 1, 1, 2, 3] is 2.875
    var total = 0,
        i;
    for (i = 0; i < numbers.length; i += 1) {
        total += numbers[i];
    }
    return total / numbers.length;
}
var median = function(numbers) {
    // median of [3, 5, 4, 4, 1, 1, 2, 3] = 3
    var median = 0,
        numsLen = numbers.length;
    numbers.sort();
    if (numsLen % 2 === 0) { // is even
        // average of two middle numbers
        median = (numbers[numsLen / 2 - 1] + numbers[numsLen / 2]) / 2;
    } else { // is odd
        // middle number only
        median = numbers[(numsLen - 1) / 2];
    }
    return median;
}
var globalTransitionsProvenance = function(classe){
  var chartData = [];
  var dd = [];
  
   angular.forEach($scope.course.tomes, function(tome){
    var d = tome.properties.filter(function(value){ 
              return value.property.split('_')[0] ===classe    
            });
          d.part =tome.id;
          dd =dd.concat(d);
          chartData =chartData.concat({'part':tome.id,'type':classe, elementType:'tome', 'transitions':d})

          angular.forEach(tome.chapters, function(chapter){
            var d = chapter.properties.filter(function(value){ 
              return value.property.split('_')[0] ===classe    
            });
          d.part =chapter.id; dd =dd.concat(d);
          chartData =chartData.concat({'part':chapter.id,'type':classe, elementType:'chapter', 'transitions':d})

        angular.forEach(chapter.parts, function(part){
          var d = part.properties.filter(function(value){ 
              return value.property.split('_')[0] ===classe    
            });
          d.part =part.id; dd =dd.concat(d);
          chartData =chartData.concat({'part':part.id,'type':classe, elementType:'part', 'transitions':d})
         
        })
      })
    });
  
  
var identity = mean(($.grep(chartData, function(e){ return  e.property === classe+"_identity" }))
  .map(function(d) { return parseInt(d.value); }));
var precedent = mean(($.grep(chartData, function(e){ return  e.property === classe+"_precedent" }))
      .map(function(d) { return parseInt(d.value); }));
var next_p = mean(($.grep(chartData, function(e){ return  e.property === classe+"_next_p" }))
      .map(function(d) { return parseInt(d.value); }));
var shifted_past = mean(($.grep(chartData, function(e){ return  e.property === classe+"_shifted_past" }))
      .map(function(d) { return parseInt(d.value); }));
var shifted_next = mean(($.grep(chartData, function(e){ return  e.property === classe+"_shifted_next" }))
      .map(function(d) { return parseInt(d.value); }));
var somme = identity + precedent + next_p + shifted_past + shifted_next;
var glob =[
      { "property":"identity", value: identity * 100 / somme},
      { "property":"precedent", value: precedent * 100 / somme},
      { "property":"next_p", value: next_p * 100 / somme},
      { "property":"shifted_past", value: shifted_past * 100 / somme},
      { "property":"shifted_next", value: shifted_next * 100 / somme}]

chartData =chartData.concat({'part':0,'type':classe, 'transitions':glob})

var identity = dd.filter(function(value){ return  value.property === classe+'_identity'});
identity =mean(identity.map(function(o){return parseInt(o.value);}));
var precedent = dd.filter(function(value){ return  value.property === classe+'_precedent'});
precedent =mean(precedent.map(function(o){return parseInt(o.value);}));
var next_p = dd.filter(function(value){ return  value.property === classe+'_next_p'});
next_p =mean(next_p.map(function(o){return parseInt(o.value);}));
var shifted_past = dd.filter(function(value){ return  value.property === classe+'_shifted_past'});
shifted_past =mean(shifted_past.map(function(o){return parseInt(o.value);}));
var shifted_next = dd.filter(function(value){ return  value.property === classe+'_shifted_next'});
shifted_next =mean(shifted_next.map(function(o){return parseInt(o.value);}));



chartData =chartData.concat({'part':0,'type':classe, elementType:'course', 
  'transitions':[
              {'property':classe+'_identity', 'value':identity },
              {'property':classe+'_precedent', 'value':precedent },
              {'property':classe+'_next_p', 'value':next_p },
              {'property':classe+'_shifted_past', 'value':shifted_past },
              {'property':classe+'_shifted_next', 'value':shifted_next }
  ]  
})




return chartData

}
var factChart = function(factedPartID, issueCode){
  if(typeof $scope.course =='undefined') return;
    
    var chartData =[];
    var meanData =[];
    var dataEntries =[];
    var colorsEntries =[];
   
   var cpt = 0;

chartData.push({'part':$scope.course._id,
            'title':$scope.course.title,
             'elementType':'course',
            'route':$scope.course.route,
            'value': $scope.course[issueCode],
            'color':'grey'
          })

   angular.forEach($scope.course.tomes, function(tome){
    chartData.push({'part':tome.id,
            'title':tome.title,
             'elementType':'tome',
            'route':tome.route,
            'value': tome[issueCode],
            'color':parseInt(factedPartID) ===parseInt(tome.id)?'#45348A':'grey'
          })
          angular.forEach(tome.chapters, function(chapter){
            chartData.push({'part':chapter.id,
            'title':chapter.title,
             'elementType':'chapter',
            'route':chapter.route,
            'value': chapter[issueCode],
            'color':parseInt(factedPartID) ===parseInt(chapter.id)?'#45348A':'grey',
            'indicators':chapter.indicators
          })
        angular.forEach(chapter.parts, function(part){
          chartData.push({'part':part.id,
            'title':part.title,
             'elementType':'part',
            'route':part.route,
            'value': part[issueCode],
            'color':parseInt(factedPartID) ===parseInt(part.id)?'#45348A':'grey',
            'indicators':part.indicators
          })
        })
      })
    });
 
return chartData;

}

 
  // end
   
  }
]);




app.run(function(editableOptions, editableThemes) {  
  editableOptions.theme = 'bs3';
  editableThemes['bs3'].submitTpl =  '<button type ="submit" class ="btn btn-info"><span></span></button><br/>',
  editableThemes['bs3'].cancelTpl =  '<button type ="button" class ="btn btn-warning" ng-click ="$form.$cancel()">'+
                     '<span></span>'

  editableThemes.bs3.inputClass = 'input-xs';
  editableThemes.bs3.buttonsClass = 'btn-xs';
});
/*app.config(function ($compileProvider) {
  $compileProvider.debugInfoEnabled(false);
});*/
app.config(function($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our assets domain.  Notice the difference between * and **.
    'http://srv*.assets.example.com/**',
    'https://openclassrooms.com/**',
    'https://user.oc-static.com/**'
  ]);

  // The blacklist overrides the whitelist so the open redirect here is blocked.
  $sceDelegateProvider.resourceUrlBlacklist([
    'http://myapp.example.com/clickThru**'
  ]);
});