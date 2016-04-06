'use strict';

angular.module('mean.courses')
  .config(['$viewPathProvider',
   function($viewPathProvider) {
    $viewPathProvider.override('system/views/index.html', 'courses/views/index.html');
   }
]);




var stopHover = function(url){ 
  $('#divHoverOverlay').css('visibility','hidden');
 }
 

var app =angular.module('mean.courses').controller('CoursesController', ['$scope', '$rootScope',
  '$stateParams', '$location', '$http','Global', 'Courses', '$http','$uibModal',
  function($scope, $rootScope, $stateParams, $location, $http, Global, Courses, $uibModal) {
    $scope.global = Global;
 $scope.view_tab ="tab1";
$scope.changeTab = function(tab) {
    $scope.view_tab = tab;
}

$scope.items = ['item1', 'item2', 'item3'];

  $scope.animationsEnabled = true;

  $scope.open = function (size) {
alert('yes')
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      size: size,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      console.log('Modal dismissed at: ' + new Date());
    });
  };

  $scope.toggleAnimation = function () {
    $scope.animationsEnabled = !$scope.animationsEnabled;
  };

 $scope.itemsPerPage = 1;
 $scope.currentFact = 0;
     
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
    if ($scope.currentFact > 0) {
      $scope.currentFact--;
    }
  };

  $scope.DisablePrevPage = function() {
    return $scope.currentFact === 0 ? "disabled-page" : "enabled-page";
  };

  $scope.pageCount = function() {

    return Math.ceil($scope.inspector.Facts.length/$scope.itemsPerPage)-1;
  };

  $scope.nextPage = function() {
    if ($scope.currentFact < $scope.pageCount()) {
      $scope.currentFact++;
    }
  };

  $scope.DisableNextPage = function() {
    return $scope.currentFact === $scope.pageCount() ? "disabled-page" : "enabled-page";
  };

  $scope.setPage = function(n) {
    if($scope.inspector.Facts.length<1) return;
    $scope.currentFact = n;
    $scope.sectionFactChart = $scope.inspector.Facts[n]
    $scope.inspectorIndicatorCode = $scope.inspector.Facts[n].issueCode;
    $scope.inspector.indicatorCode = $scope.inspector.Facts[n].issueCode;
    
  };
var computeTwoBounderyValues = function(type, indicatorCode){
  var studiedFactData=[];

if(type=='chapter'){
  $scope.courseChapters.forEach(function(chapter, i) {
      var partData = parseFloat(chapter.properties.filter(function(value){ return value.property == indicatorCode})[0].value);
      studiedFactData.push(partData);
  })
}
else{
  $scope.courseChapters.forEach(function(chapter, i) {
    chapter.parts.forEach(function(part, i) {
      var partData = parseFloat(part.properties.filter(function(value){ return value.property == indicatorCode})[0].value);
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
      var partData = parseFloat(chapter.properties.filter(function(value){ return value.property == indicatorCode})[0].value);
      studiedFactData.push(partData);
  })
}
else{
  $scope.courseChapters.forEach(function(chapter, i) {
    chapter.parts.forEach(function(part, i) {
      var partData = parseFloat(part.properties.filter(function(value){ return value.property == indicatorCode})[0].value);
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




var computeBounderyValues = function(type, indicatorCode){
  var studiedFactData=[];

if(type=='chapter'){
  $scope.courseChapters.forEach(function(chapter, i) {
      var partData = parseFloat(chapter.properties.filter(function(value){ return value.property == indicatorCode})[0].value);
      studiedFactData.push(partData);
  })
}
else{
  $scope.courseChapters.forEach(function(chapter, i) {
    chapter.parts.forEach(function(part, i) {
      var partData = parseFloat(part.properties.filter(function(value){ return value.property == indicatorCode})[0].value);
      studiedFactData.push(partData);
    })
  })
}

  var median = d3.median(studiedFactData, function(d) { return parseFloat(d); }); 
  
  
  var min = d3.min(studiedFactData, function(d) { return parseFloat(d); }); 
  var max = d3.max(studiedFactData, function(d) { return parseFloat(d); }); 
   
  return {'MinValue':min,'MedianValue':median,'MaxValue':max};
}

 $scope.findOne = function() {

  $scope.d3opts = [];
  $scope.dataLoading = true;
  $scope.pageLoaded = false;
  $scope.myBrowsers = [ "GC", "AS" ];

  $(window).unbind('hashchange');


  $scope.observedElt ={};
  $scope.inspector ={'type':'chapter', 'Facts':[],'selectedFact':{},'Data':[], 'indicatorCode':'Actions_tx'}

     $('table').hide();
     
     $scope.inspectorDisplaySrc='course';
     $scope.indicatorInspectorShow = 'course';
     $scope.course ={};
     $scope.tableData ={};
     
      $scope.courseParts =[];
      $scope.courseChapters =[];
      
      $scope.context = {};

      $scope.formData ='';
      $scope.textBtnForm ='';
      $scope.chartType = 'Actions_tx';
      $scope.globalChartSelector = 'Actions_tx';
      $scope.elementTypeSelector = 'part';
      $scope.sectionDisplay = false;
      $scope.context.statChart = false;
      $scope.taskPanelTitle = "Tâches";
      ;
      $scope.graphShow=false;
      
      $scope.achievementSelector = 'mean.achievement';
      $scope.rsSelector = 'nparts';
      $scope.topSelector = 'Actions_tx';
      $scope.flopSelector = 'Actions_tx';
      $scope.topElementSelector ='sections',
      $scope.flopElementSelector ='tomes',
      $scope.statSelector ='visits';      
      $scope.coursePstatSelector = 'time';
      $scope.studiedPart = '';
//      $scope.context.otherFacts=[];
      $scope.inspectorChart = false;
      


      $scope.tab = 0;
  
  $scope.changeTab = function(newTab){
    $scope.tab = newTab;
  };
  
  $scope.isActiveTab = function(tab){
    return $scope.tab === tab;
  };
 


$scope.resetIndicators = function(){
      $scope.indicatorsHeader=[
        {'code':'Actions_tx', 'value':'actions', 'label':'Taux de visites', 'inspectorText':'aux visites', 'issueCode':'Actions_tx','category':'Indicateurs de lecture','sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null},
        {'code':'speed', 'value':'speed', 'label':'Vitesse de lecture','inspectorText':'à la vitesse de lecture', 'issueCode':'speed','category':'Indicateurs de lecture','sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null},
        {'code':'rereadings_tx', 'value':'reread', 'label':'Taux de relecture','inspectorText':'à la relecture', 'issueCode':'rereadings_tx','category':'Indicateurs de relecture','sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null},
        {'code':'norecovery_tx', 'value':'stop', 'label':'Arrêts définitifs', 'inspectorText':'aux arrêts de la lectrue','issueCode':'norecovery_tx','category':'Indicateurs d\'sectionValue et reprise','sectionValue':0.0,'chapterValue':0.0,'sectionFactID':null, 'chapterFactId':null}

      ]
      
}
$scope.resetIndicators();
$scope.selectedIndicators=[
        {'code':'Actions_tx', 'value':'actions', 'label':'Taux de visites', 'inspectorText':'aux visites', 
        'issueCode':'Actions_tx','category':'Indicateurs de lecture'},
        {'code':'speed', 'value':'speed', 'label':'Vitesse de lecture','inspectorText':'à la vitesse de lecture', 
        'issueCode':'speed','category':'Indicateurs de lecture'},
        {'code':'rereadings_tx', 'value':'reread', 'label':'Taux de relecture','inspectorText':'à la relecture', 
        'issueCode':'rereadings_tx','category':'Indicateurs de relecture'},
        {'code':'norecovery_tx', 'value':'stop', 'label':'Arrêts définitifs', 'inspectorText':'aux arrêts de la lectrue',
        'issueCode':'norecovery_tx','category':'Indicateurs d\'arrêts et reprise'}
      ]
      $scope.indicatorsSelectionModel=['actions','speed','reread','stop'];
  
      Courses.get({
        courseId: $stateParams.courseId
      }, function(course) {
     
        $scope.course = course;
        $scope.chartType = 'Actions_tx';
        $scope.selectedElement = course;
  
        $scope.completeCourseParts();
            $scope.context = {
              'type':'course',      
              'route':$scope.course._id,
              'id':0,
              '_id':$scope.course._id,
              'title':$scope.course.title,
              'Todos':$scope.course.todos,
              'taskText':'(nouvelle tâche pour ce contexte)',
              'indicator':'ALL',
              'd3':[]
              
            };

    
    $scope.context.subtasks =computeAllTasks();
    $scope.context.d3 = ComputeGlobalVisuData();
    $scope.context.d3.stats =courseFactsStat();
    $scope.context.Tops = computeTopParts();
    $scope.context.Flops = computeFlopParts();
    $scope.context.stats = computeCourseStats();

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
   //console.log('old: '+e.originalEvent.oldURL)
    //console.log('new: '+e.originalEvent.newURL)
  $scope.dataLoading = true;
  
   loadContext();

  $scope.dataLoading = false;
  
});

$('.editable-text').on('shown', function (e, editable) {
        if (arguments.length != 2) return
        if (!editable.input.$input.closest('.control-group').find('.editable-input >textarea').length > 0 || !editable.options.clear || editable.input.$input.closest('.control-group:has(".btn-clear")').length > 0) return
        
        editable.input.$input.closest('.control-group').find('.editable-buttons').append('<br><button class="btn btn-clear"><i class="icon-trash"></i></button>');
    });





$scope.toggleSectionDisplay = function(){
  goHome();

  
  setTimeout(function() {
    $scope.sectionDisplay =! $scope.sectionDisplay;
    $scope.$apply();
  }, 0);

  

}
$scope.$watch('indicatorsSelectionModel', function(newValue, oldValue) {
  
 $scope.selectedIndicators =  $.grep($scope.indicatorsHeader, 
  function(e){return ($.inArray(e.value, $scope.indicatorsSelectionModel)>-1)}); 
 
 

});
$scope.showTab = function(tab){
  $("input[value='"+tab+"']").prop('checked', true);
  $scope.factsPaginator = (tab=="fact")?true:false;
  
}

$scope.getShownTab = function(){
  //alert($("input:checked").attr('value'))
  return $("input:checked").attr('value');
  
}

$scope.showComponentChart=function(param){
  
  if(param==-1){
    $scope.inspectorChart = false; 
    $("#componentChartOverlay").fadeOut(100);
    
    return;
  }
  $scope.inspectorIndicatorCode = param;
  $scope.inspector.indicatorCode = param;
  $scope.inspectorChart = true;
  
    $("#componentChartOverlay").fadeIn(100).focus().select();
    
  
}


$scope.$watch('inspector.indicatorCode', function(newValue, oldValue) { 

  switch($scope.inspector.indicatorCode) {
    case "Actions_tx":
        $scope.graphTitle ='Taux de visites';
        break;
    case "speed":
        $scope.graphTitle ='Vitesse de lecture (en mots par min)';        
        break;    
    case 'mean.duration':
        $scope.graphTitle ='Durée moyenne de lecture de la section(en minutes)'
        break;
    case 'rereadings_tx':
        $scope.graphTitle ='Taux de lectures qui sont des relectures'
        break;
    case 'norecovery_tx':
        $scope.graphTitle ='Taux des arrêts définitifs de la lecture'
        break;
    case 'provenance':
        $scope.graphTitle ='Sections de provenance (lues juste avant celle-ci)'
        break;
    case 'destination':
        $scope.graphTitle ='Sections de destination (lues juste après celle-ci)'
        break;
};

});



    if($('.course_title_top').length<1)
        $('.navbar-brand').after('<a role ="button" href ="#" ng-click ="resetPath();goHome()" class ="course_title_top"> <span class ="glyphicon glyphicon-book"></span>  <em>'+$scope.course.title+'</em></a>');

       window.setTimeout(function() {
           loadContext(); 
          $('table').show();
          reloadURL(); 

        }, 0);


       
$scope.dataLoading = false;
$scope.pageLoaded = true;
    
      });
    };


var courseFactsStat = function(){
  

var facts =[];


    angular.forEach($scope.course.tomes, function(tome) {  
      angular.forEach(tome.chapters, function(chapter) {  
         angular.forEach(chapter.parts, function(part) {
           var partFacts = angular.copy(part.facts);
                for (var i = 0; i < partFacts.length; i++){
                  
                  facts.push(partFacts[i]);
                 }                
          });
      })
    })

return [
      {'indicator':'ALL', count:facts.length},
      {'indicator':'Readings', count:$.grep(facts, function(e){ return  e.classof === 'Readings'}).length},
      {'indicator':'Rereading', count:$.grep(facts, function(e){ return  e.classof === 'Rereading'}).length},
      {'indicator':'Transition', count:$.grep(facts, function(e){ return  e.classof === 'Transition'}).length},
      {'indicator':'Stop', count:$.grep(facts, function(e){ return  e.classof === 'Stop'}).length}
     ]
 
}

 
$scope.completeCourseParts =function(){ 
  var courseParts = [], courseChapters = [];
  var base_url = "https://openclassrooms.com/courses";
  $scope.course.url = base_url+'/'+$scope.course.properties.filter(function(value){ return value.property === 'slug'})[0].value
 // var course_route = $.param({'csid':course._id})

  
  angular.forEach($scope.course.tomes, function(tome) {
    tome.parts_count = 0;
    tome.route = $.param({'partid':tome._id});
    tome.url = $scope.course.url;//+'/'+tome.properties.filter(function(value){ return value.property === 'slug'})[0].value
    angular.forEach(tome.chapters, function(chapter) { 
      tome.indicators = [];
      chapter.parts_count = 0;
      chapter.route =$.param({'partid':tome._id, 'chapid':chapter._id});


      chapter.url = $scope.course.url+'/'+chapter.properties.filter(function(value){ return value.property === 'slug'})[0].value;
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
        part.url = chapter.url+'/'+'#/id/r-'+part.properties.filter(function(value){ return value.property === 'part_id'})[0].value
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

  updateMainFacts()


}
/*********** Compute colours ********************/
var decideBoundariesScale = function(partType,indicatorCode){
  var boundaryValues = computeTwoBounderyValues(partType, indicatorCode);
var scale = chroma.scale('OrRd').domain([boundaryValues.MinValue, boundaryValues.MaxValue]);
switch(indicatorCode) {
    case "Actions_tx":
        boundaryValues = computeBounderyValues(partType, indicatorCode);
        scale = chroma.scale('OrRd').domain([boundaryValues.MedianValue, boundaryValues.MinValue]);
        break;
    case "speed":
        boundaryValues = computeTwoBounderyValues(partType, indicatorCode);
        scale = chroma.scale('OrRd').domain([boundaryValues.MinValue, boundaryValues.MaxValue]);
        break;
    case "rereadings_tx":
        boundaryValues = computeBounderyValues(partType, indicatorCode);
        scale = chroma.scale('OrRd').domain([boundaryValues.MedianValue, boundaryValues.MaxValue]);
        break;
    case "rereadings_tx":
        boundaryValues = computeBounderyValues(partType, indicatorCode);
        scale = chroma.scale('OrRd').domain([boundaryValues.MedianValue, boundaryValues.MaxValue]);
        break;
    case "norecovery_tx":
        boundaryValues = computeBounderyValues(partType, indicatorCode);
        scale = chroma.scale('OrRd').domain([boundaryValues.MedianValue, boundaryValues.MaxValue]);
        break;
}
return {boundaryValues,scale};
}
var computeIndividualIndicatorValue =  function(part,indicatorCode, boundaryValues){
  

  var partData = Math.abs(boundaryValues.MedianValue - parseFloat(part.properties.filter(function(value){ return value.property == indicatorCode})[0].value));
      switch(indicatorCode) {
      case "Actions_tx":
        partData = parseFloat(part.properties.filter(function(value){ return value.property == indicatorCode})[0].value);
        break;
      case "speed":
        partData = Math.abs(boundaryValues.MedianValue - 
          parseFloat(part.properties.filter(function(value){ return value.property == indicatorCode})[0].value));
        break;
      case "rereadings_tx":
        partData = parseFloat(part.properties.filter(function(value){ return value.property == indicatorCode})[0].value);
        break;
      case "norecovery_tx":
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
var resetPath =function(){     
  $('.chosenPart').removeClass('chosenPart'); 
  $('.data-table').removeClass('highlight-table');
  $('#divOverlay').css('visibility','hidden');
  $('#divHoverOverlay').css('visibility','hidden');
  $('.gly-issue').removeClass('fa fa-exclamation-circle');
  $('.inspector-item-selected').removeClass('inspector-item-selected');
    

    for (var i = 0; i < $scope.context.subtasks.length; i++)   
      {$scope.context.subtasks[i].selected = 'notRelevantTask' }


}

var parseTask =function(path, content){
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
var deparseTask =function(route){

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


var parseTaskRequest =function(path){ 

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

var computeCourseStats =function(){ 

  var result = {
    'reading' :{
      'visits':parseInt($scope.course.stats.filter(function(value){ return value.property === 'nactions'})[0].value),
      'nusers':parseInt($scope.course.stats.filter(function(value){ return value.property === 'nusers'})[0].value),
    },
    'achievement':{
      'mean':parseInt($scope.course.stats.filter(function(value){ return value.property === 'mean.achievement'})[0].value),
      'median':parseInt($scope.course.stats.filter(function(value){ return value.property === 'median.achievement'})[0].value)
    },
    'rs':{
      'nRS':parseInt($scope.course.stats.filter(function(value){ return value.property === 'nRS'})[0].value),
      'mean_duration':parseInt($scope.course.stats.filter(function(value){ return value.property === 'mean.rs.duration'})[0].value/60),
      'median_duration':parseInt($scope.course.stats.filter(function(value){ return value.property === 'median.rs.duration'})[0].value/60),
      'mean_nparts':parseInt($scope.course.stats.filter(function(value){ return value.property === 'mean.rs.nparts'})[0].value),
      'median_nparts':parseInt($scope.course.stats.filter(function(value){ return value.property === 'median.rs.nparts'})[0].value),
    }
  }

  return result;
}

var computeTopParts =function(){ 
 
var partsData =[], chapsData =[], tomesData =[];

angular.forEach($scope.course.tomes, function(tome) {  
      tome.properties.filter(function(value){ return value.property === 'Actions_tx'})[0].value
      tomesData.push({
                        'title':tome.title,
                        'route':tome.route,
                        'Actions_tx':parseInt(tome.properties.filter(function(value){ return value.property === 'Actions_tx'})[0].value),
                        'Readers':parseInt(tome.properties.filter(function(value){ return value.property === 'Readers'})[0].value),
                        'RS_nb':parseInt(tome.properties.filter(function(value){ return value.property === 'RS_nb'})[0].value)
                      })

  angular.forEach(tome.chapters, function(chapter) {  
    chapter.properties.filter(function(value){ return value.property === 'Actions_tx'})[0].value
      chapsData.push({
                        'title':chapter.title,
                        'route':chapter.route,
                        'Actions_tx':parseInt(chapter.properties.filter(function(value){ return value.property === 'Actions_tx'})[0].value),
                        'Readers':parseInt(chapter.properties.filter(function(value){ return value.property === 'Readers'})[0].value),
                        'RS_nb':parseInt(chapter.properties.filter(function(value){ return value.property === 'RS_nb'})[0].value)
                      })

    angular.forEach(chapter.parts, function(part) {
      part.properties.filter(function(value){ return value.property === 'Actions_tx'})[0].value
      partsData.push({
                        'title':part.title+' (Sec. '+part.id+' )',
                        'route':part.route,
                        'Actions_tx':parseInt(part.properties.filter(function(value){ return value.property === 'Actions_tx'})[0].value),
                        'Readers':parseInt(part.properties.filter(function(value){ return value.property === 'Readers'})[0].value),
                        'RS_nb':parseInt(part.properties.filter(function(value){ return value.property === 'RS_nb'})[0].value)
                      })
          
                
              
    })                                 
  })
})

partsData = partsData.sort(function(x, y){   return d3.descending(x.Actions_tx, y.Actions_tx);})
var Actions_tx = partsData.slice(0,3);
var topActions_tx =Actions_tx.map(function(o){return {'title':o.title, 'route':o.route}})
partsData = partsData.sort(function(x, y){   return d3.descending(x.Readers, y.Readers);})
var Readers = partsData.slice(0,3);
var topReaders =Readers.map(function(o){return {'title':o.title, 'route':o.route}})
partsData = partsData.sort(function(x, y){   return d3.descending(x.RS_nb, y.RS_nb); })
var RS_nb = partsData.slice(0,3);
var topRS_nb =RS_nb.map(function(o){return {'title':o.title, 'route':o.route}})
partsData = {'Actions_tx':topActions_tx, 'Readers':topReaders,'RS_nb':topRS_nb};

chapsData = chapsData.sort(function(x, y){   return d3.descending(x.Actions_tx, y.Actions_tx);})
Actions_tx = chapsData.slice(0,3);
topActions_tx =Actions_tx.map(function(o){return {'title':o.title, 'route':o.route}})
chapsData = chapsData.sort(function(x, y){   return d3.descending(x.Readers, y.Readers);})
Readers = chapsData.slice(0,3);
topReaders =Readers.map(function(o){return {'title':o.title, 'route':o.route}})
chapsData = chapsData.sort(function(x, y){   return d3.descending(x.RS_nb, y.RS_nb); })
RS_nb = chapsData.slice(0,3);
topRS_nb =RS_nb.map(function(o){return {'title':o.title, 'route':o.route}})
chapsData = {'Actions_tx':topActions_tx, 'Readers':topReaders,'RS_nb':topRS_nb};

tomesData = tomesData.sort(function(x, y){   return d3.descending(x.Actions_tx, y.Actions_tx);})
Actions_tx = tomesData.slice(0,3);
topActions_tx =Actions_tx.map(function(o){return {'title':o.title, 'route':o.route}})
tomesData = tomesData.sort(function(x, y){   return d3.descending(x.Readers, y.Readers);})
Readers = tomesData.slice(0,3);
topReaders =Readers.map(function(o){return {'title':o.title, 'route':o.route}})
tomesData = tomesData.sort(function(x, y){   return d3.descending(x.RS_nb, y.RS_nb); })
RS_nb = tomesData.slice(0,3);
topRS_nb =RS_nb.map(function(o){return {'title':o.title, 'route':o.route}})
tomesData = {'Actions_tx':topActions_tx, 'Readers':topReaders,'RS_nb':topRS_nb};

return{'Sections':partsData, 'Chapters':chapsData, 'Tomes':tomesData}
}

var computeFlopParts =function(){ 
 
var partsData =[], chapsData =[], tomesData =[];

angular.forEach($scope.course.tomes, function(tome) {  
      tome.properties.filter(function(value){ return value.property === 'Actions_tx'})[0].value
      tomesData.push({
                        'title':tome.title,
                        'route':tome.route,
                        'Actions_tx':parseInt(tome.properties.filter(function(value){ return value.property === 'Actions_tx'})[0].value),
                        'Readers':parseInt(tome.properties.filter(function(value){ return value.property === 'Readers'})[0].value),
                        'RS_nb':parseInt(tome.properties.filter(function(value){ return value.property === 'RS_nb'})[0].value)
                      })

  angular.forEach(tome.chapters, function(chapter) {  
    chapter.properties.filter(function(value){ return value.property === 'Actions_tx'})[0].value
      chapsData.push({
                        'title':chapter.title,
                        'route':chapter.route,
                        'Actions_tx':parseInt(chapter.properties.filter(function(value){ return value.property === 'Actions_tx'})[0].value),
                        'Readers':parseInt(chapter.properties.filter(function(value){ return value.property === 'Readers'})[0].value),
                        'RS_nb':parseInt(chapter.properties.filter(function(value){ return value.property === 'RS_nb'})[0].value)
                      })

    angular.forEach(chapter.parts, function(part) {
      part.properties.filter(function(value){ return value.property === 'Actions_tx'})[0].value
      partsData.push({
                        'title':part.title+' (Sec. '+part.id+' )',
                        'route':part.route,
                        'Actions_tx':parseInt(part.properties.filter(function(value){ return value.property === 'Actions_tx'})[0].value),
                        'Readers':parseInt(part.properties.filter(function(value){ return value.property === 'Readers'})[0].value),
                        'RS_nb':parseInt(part.properties.filter(function(value){ return value.property === 'RS_nb'})[0].value)
                      })
          
                
              
    })                                 
  })
})

partsData = partsData.sort(function(x, y){   return d3.descending(x.Actions_tx, y.Actions_tx);})
var Actions_tx = partsData.slice(-3);
var flopActions_tx =Actions_tx.map(function(o){return {'title':o.title, 'route':o.route}})
partsData = partsData.sort(function(x, y){   return d3.descending(x.Readers, y.Readers);})
var Readers = partsData.slice(-3);
var flopReaders =Readers.map(function(o){return {'title':o.title, 'route':o.route}})
partsData = partsData.sort(function(x, y){   return d3.descending(x.RS_nb, y.RS_nb); })
var RS_nb = partsData.slice(-3);
var flopRS_nb =RS_nb.map(function(o){return {'title':o.title, 'route':o.route}})
partsData = {'Actions_tx':flopActions_tx, 'Readers':flopReaders,'RS_nb':flopRS_nb};

chapsData = chapsData.sort(function(x, y){   return d3.descending(x.Actions_tx, y.Actions_tx);})
Actions_tx = chapsData.slice(-3);
flopActions_tx =Actions_tx.map(function(o){return {'title':o.title, 'route':o.route}})
chapsData = chapsData.sort(function(x, y){   return d3.descending(x.Readers, y.Readers);})
Readers = chapsData.slice(-3);
flopReaders =Readers.map(function(o){return {'title':o.title, 'route':o.route}})
chapsData = chapsData.sort(function(x, y){   return d3.descending(x.RS_nb, y.RS_nb); })
RS_nb = chapsData.slice(-3);
flopRS_nb =RS_nb.map(function(o){return {'title':o.title, 'route':o.route}})
chapsData = {'Actions_tx':flopActions_tx, 'Readers':flopReaders,'RS_nb':flopRS_nb};

tomesData = tomesData.sort(function(x, y){   return d3.descending(x.Actions_tx, y.Actions_tx);})
Actions_tx = tomesData.slice(-3);
flopActions_tx =Actions_tx.map(function(o){return {'title':o.title, 'route':o.route}})
tomesData = tomesData.sort(function(x, y){   return d3.descending(x.Readers, y.Readers);})
Readers = tomesData.slice(-3);
flopReaders =Readers.map(function(o){return {'title':o.title, 'route':o.route}})
tomesData = tomesData.sort(function(x, y){   return d3.descending(x.RS_nb, y.RS_nb); })
RS_nb = tomesData.slice(-3);
flopRS_nb =RS_nb.map(function(o){return {'title':o.title, 'route':o.route}})
tomesData = {'Actions_tx':flopActions_tx, 'Readers':flopReaders,'RS_nb':flopRS_nb};
return{'Sections':partsData, 'Chapters':chapsData, 'Tomes':tomesData}
}


var computeAllTasks =function(){ 
 
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
                      
                      factTasks[i].route =fact.route+'&taskid='+factTasks[i]._id+'&indicator='+factTasks[i].classof
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
                 //var txt =  $scope.indicatorsHeader.filter(function(value){ return value.value === fact.classof})[0].label;
                      
                      factTasks[i].route =fact.route+'&taskid='+factTasks[i]._id+'&indicator='+factTasks[i].classof
                       factTasks[i].minipath ='Section: '+part.title;//+' - ' +txt; 
                      tasks.push(factTasks[i]);}
                  })
                  })
                                 
            });
});

  for (var i = 0; i < tasks.length; i++)   
    {tasks[i].selected = 'relevantTask';
        tasks[i].done =false;}

  return tasks

}


var computeSubFacts =function(element, indicator){return[];   
var issuesCode =[] ;
var type = (element.elementType=='chapitre')?'chapter':'part'
var f = $.grep($scope.selectedIndicators, function(e){ return  e.code ==indicator});
angular.forEach(f, function(ind) {issuesCode.push(ind.issueCode) })
 
  var facts  = $.grep(element.facts, function(e){return ($.inArray(e.issueCode, issuesCode)>-1)}); 
  angular.forEach(facts, function(ind){ind.partId=element.id, ind.partType=type, ind.factRoute=element.route+','+ind._id});
  return facts

}





var goHome =function(){ 

  window.location.hash = '#';
  
}
$scope.goHome =function(){
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
        f.parentTitle='Chapitre \"'+chapter.title+' \" : '
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

 //////////////// SECTIONS

allFacts=[]; 
angular.forEach($scope.course.tomes, function(tome) {
    angular.forEach(tome.chapters, function(chapter){
      
      angular.forEach(chapter.parts, function(part){
        angular.forEach(part.facts, function(f){
          
          f.parentTitle='Section \"'+part.title+' \": '
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
}



var findCourseIssues = function(){   
$scope.inspector={} 
  if($scope.sectionDisplay) {
         $scope.inspector.Facts = $scope.MainSectionsFacts;
         $scope.inspector.type='part';
  }
  else{
      $scope.inspector.Facts= $scope.MainChaptersFacts;
      $scope.inspector.type='chapter';
  }
$scope.factTitleDisplay=true;

}
var findTomeIssues = function(tome){  

  var mainIssues = [];
   if($scope.sectionDisplay) 
       mainIssues = $scope.MainSectionsFacts
  else
    mainIssues = $scope.MainChaptersFacts;
  
$scope.factTitleDisplay=true;
  var times =[], users =[], rss =[], rereadings_tx =[], stops =[];


  
$scope.inspector = {'type':'tome',
                   'id':tome.id,
                   'typeTxt': 'cette partie',
                    'indicatorCode':'Actions_tx',
                   'Facts': mainIssues.filter(function(e){return (e.tome==tome._id)}), 
                    'Indicators' :[
                    {'name':'Actions_tx','value':Math.round(100*tome.properties.filter(function(value){ return value.property === 'Actions_tx'})[0].value,2)+'%',
                      'comment':' des visites  sur le cours ont été observées sur cette partie (avec un total de '+tome.properties.filter(function(value){ return value.property === 'Actions_nb'})[0].value+' visites)'},
/*                    {'name':'Actions_nb','value':tome.properties.filter(function(value){ return value.property === 'Actions_nb'})[0].value,
                      'comment':' des visites sur le cours ont été observées sur cette partie'},*/
                    {'name':'rereadings_tx','value':Math.round(100*tome.properties.filter(function(value){ return value.property === 'rereadings_tx'})[0].value,2)+'%',
                      'comment':'des lectures de cette partie sont des relectures'},
                    {'name':'norecovery_tx','value':Math.round(100*tome.properties.filter(function(value){ return value.property === 'norecovery_tx'})[0].value,2)+'%',
                      'comment':'des arrêts définitifs de la lecture se passent sur cette partie'},  
             /*         {'name':'speed','value':tome.properties.filter(function(value){ return value.property === 'speed'})[0].value+' mots par minute',
                      'comment':'est la vitesse moyenne de lecture sur cette partie'}*/
                      ]    
                    
                  };
}

var findChapterIssues = function(chapter, indicator, fact){ 
  
  var mainIssues = [];
  if($scope.sectionDisplay) {
      mainIssues= $scope.MainSectionsFacts;
      $scope.factTitleDisplay=true
    }
  else{
    mainIssues= $scope.MainChaptersFacts;
    $scope.factTitleDisplay=false;
  }
  $scope.inspector = {'type':'chapter',
                   'id':chapter.id,
                   'typeTxt': 'ce chapitre',
                   'indicatorCode':'Actions_tx',
                   'Facts': mainIssues.filter(function(e){return (e.chapter==chapter._id)}), 
                    'Indicators' :[
                    {'name':'Actions_tx','value':Math.round(100*chapter.properties.filter(function(value){ return value.property === 'Actions_tx'})[0].value,2)+'%',
                      'comment':' des visites sur le cours ont été observées sur ce chapitre'},
                   /* {'name':'Actions_nb','value':chapter.properties.filter(function(value){ return value.property === 'Actions_nb'})[0].value,
                      'comment':' des visites sur le cours ont été observées sur ce chapitre (avec un total de '+chapter.properties.filter(function(value){ return value.property === 'Actions_nb'})[0].value+' visites)'},*/
                    {'name':'rereadings_tx','value':Math.round(100*chapter.properties.filter(function(value){ return value.property === 'rereadings_tx'})[0].value,2)+'%',
                      'comment':'des lectures de ce chapitre sont des relectures'},
                    {'name':'norecovery_tx','value':Math.round(100*chapter.properties.filter(function(value){ return value.property === 'norecovery_tx'})[0].value,2)+'%',
                      'comment':'des arrêts définitifs de la lecture se passent sur ce chapitre'}  ,
                      {'name':'speed','value':chapter.properties.filter(function(value){ return value.property === 'speed'})[0].value+' mots par minute',
                      'comment':'est la vitesse moyenne de lecture sur ce chapitre'}
                      ]    
                    
                  };
if(indicator!=null)
  {
    $scope.inspector.Indicators = $scope.inspector.Indicators.filter(function(e){return (e.name==indicator)});
    $scope.inspector.Facts = $scope.inspector.Facts.filter(function(e){return (e.classof==indicator)})
  }
  if(fact!=null)
    $scope.inspector.Facts = $scope.inspector.Facts.filter(function(e){return (e.classof==fact)})
      

}

var findSectionIssues = function(section){  
  $scope.factTitleDisplay=false;
 var mainIssues = $scope.MainSectionsFacts;
  
    $scope.inspector = {'type':'part',
                   'id':section.id,
                   'typeTxt': 'cette section',
                   'indicatorCode':'Actions_tx',
                   'Facts': section.facts,//mainIssues.filter(function(e){return (e.section==section._id)}), 
                    'Indicators' :[
                    /*{'name':'Actions_tx','value':Math.round(100*section.properties.filter(function(value){ return value.property === 'Actions_tx'})[0].value,2)+'%',
                      'comment':' des visites sur le cours ont été observées sur cette section(avec un total de '+section.properties.filter(function(value){ return value.property === 'Actions_nb'})[0].value+' visites)'},*/
                    {'name':'Actions_nb','value':section.properties.filter(function(value){ return value.property === 'Actions_nb'})[0].value,
                      'comment':' des visites sur le cours ont été observées sur cette section'},
                    {'name':'rereadings_tx','value':Math.round(100*section.properties.filter(function(value){ return value.property === 'rereadings_tx'})[0].value,2)+'%',
                      'comment':'des lectures de cette section sont des relectures'},
                    {'name':'norecovery_tx','value':Math.round(100*section.properties.filter(function(value){ return value.property === 'norecovery_tx'})[0].value,2)+'%',
                      'comment':'des arrêts définitifs de la lecture se passent sur cette section'}  ,
                      {'name':'speed','value':section.properties.filter(function(value){ return value.property === 'speed'})[0].value+' mots par minute',
                      'comment':'est la vitesse moyenne de lecture sur cette section'}
                      ]    
                    
                  };
                  


}

var computeGranuleFacts = function(granularity, element, indicator, fact){

switch(granularity){
  case 'course':
    findCourseIssues();
  break;
  case 'tome':
    findTomeIssues(element, indicator);
    break;
  case 'chapter':
    findChapterIssues(element, indicator, fact);
    break
  case 'part':
    findSectionIssues(element, indicator, fact);
    break

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
  
  
  
  var components = parseURL(path)
  if(components == null){
    var tome=-1;
  }
  else{
    
    var course  = $scope.course;
    var tome = components.hasOwnProperty('partid')?$.grep(course.tomes, function(e){ return  e._id == components.partid })[0]:-1;
    var chap = components.hasOwnProperty('chapid')?$.grep(tome.chapters, function(e){ return  e._id == components.chapid })[0]:-1;
    var part  = components.hasOwnProperty('sectionid')?$.grep(chap.parts, function(e){ return  e._id == components.sectionid })[0]:-1;     
    var partElt = -1;
    var fact  = components.hasOwnProperty('factid')?
                (
                  (part==-1)?($.grep(chap.facts, function(e){ return  e._id == components.factid })[0]):
                             ($.grep(part.facts, function(e){ return  e._id == components.factid })[0])
                  ): -1;

    task = components.hasOwnProperty('taskid')?
    $.grep(course.todos, function(e){ return  e._id == components.taskid })[0]:null;
     indicator = components.hasOwnProperty('indicator')? components.indicator:'ALL';
    
   }

   


  if(tome==-1) {        
    
        $scope.context.taskText ='(nouvelle tâche globale)';
        $scope.context.taskPanelMiniTitle='Cours'
        displayCourseInfos(indicator, task); 
        computeGranuleFacts('course');
        $scope.showTab("stats");
        
    }
    else
     if(chap ==-1) {
       task = components.hasOwnProperty('taskid')?$.grep(tome.todos, function(e){ return  e._id == components.taskid })[0]:null;

       computeGranuleFacts('tome', tome);
      partElt = $('.tome_index[data-part ='+tome.id+']')[0];
      $scope.context.taskText ='(nouvelle tâche pour cette partie)'; 
      $scope.context.taskPanelMiniTitle='Partie: '+tome.title;
      displayTomeInfos(partElt, task);
      $scope.showTab("stats");
      ;
    }
    else
      if(part==-1){
        task = components.hasOwnProperty('taskid')?$.grep(chap.todos, function(e){ return  e._id == components.taskid })[0]:null;
        if(fact!=-1){
          $scope.inspector.selectedFact =fact.classof ;
          partElt = $('.part_index[data-part ='+chap.id+']'); 
          //$scope.studiedPart = chap.id;
          $scope.context.taskText ='(nouvelle tâche pour ce chapitre)';
          $scope.context.taskPanelMiniTitle='Chapitre: '+chap.title;
          $scope.inspectorDisplaySrc='inspector';           
          computeGranuleFacts('chapter', chap, fact.classof, fact.classof);
          displayChapterIssues(chap.route, task, chap, indicator);
          $scope.showTab("facts");

         

        }
        else
        if(indicator =="ALL"){
          $scope.inspector.selectedFact =null ;
          computeGranuleFacts('chapter', chap, null, null);
          partElt = $('.chapter_index[data-part ='+chap.id+']')[0];   
          $scope.context.taskText ='(nouvelle tâche pour ce chapitre)';
          $scope.context.taskPanelMiniTitle='Chapitre: '+chap.title;
          displayChapterInfos(partElt, task);
          $scope.showTab("stats");
          
        }
        else{
          $scope.inspector.selectedFact =null ;
          computeGranuleFacts('chapter', chap, indicator, null);
          partElt = $('.chapter_index[data-part ='+chap.id+']')[0];
          $scope.context.taskText ='(nouvelle tâche pour ce chapitre)';
          $scope.context.taskPanelMiniTitle='Chapitre: '+chap.title;
          //$scope.sectionDisplay = false;   
          $scope.inspectorDisplaySrc='inspector' ;
          displayChapterIssues(chap.route, task, chap, indicator);
          $scope.inspectorIndicatorCode = indicator;
          $scope.inspector.indicatorCode = indicator;
          $scope.showTab("stats");
        }
      }
      else{
        task = components.hasOwnProperty('taskid')?$.grep(part.todos, function(e){ return  e._id == components.taskid })[0]:null;
        if(fact!=-1){
          $scope.inspector.selectedFact = fact.classof;
          partElt = $('.part_index[data-part ='+part.id+']'); 
          computeGranuleFacts('part', part, fact.classof, fact.classof);          
          $scope.context.taskText ='(nouvelle tâche pour cette section)';
          $scope.context.taskPanelMiniTitle='Section: '+part.title;
          $scope.inspectorDisplaySrc='inspector'; 
          displayPartIssues(part.route, task, part, indicator);
          $scope.showTab("facts");
          
        }
        else
        if(indicator =="ALL"){ 
        $scope.inspector.selectedFact =null ;
          computeGranuleFacts('part', part, null, null); 
          //$scope.sectionDisplay = true;
          partElt = $('.part_index[data-part ='+part.id+']');   
          $scope.context.taskText ='(nouvelle tâche pour cette section)'; 
          $scope.context.taskPanelMiniTitle='Section: '+part.title;
          displayPartInfos(partElt, task);
          $scope.showTab("stats");
          
        }
        else{
          $scope.inspector.selectedFact =null; 
          partElt = $('.part_index[data-part ='+part.id+']');  
          $scope.context.taskText ='(nouvelle tâche pour cette section)';
          $scope.context.taskPanelMiniTitle='Section: '+part.title;
          computeGranuleFacts('part', part, indicator, null); 
          $scope.inspectorDisplaySrc='inspector';
          //$scope.sectionDisplay = true; 
          displayPartIssues(part.route, task, part, indicator);
          $scope.inspectorIndicatorCode = indicator;
          $scope.inspector.indicatorCode = indicator;
          $scope.showTab("stats");
          

        }
      }


/*************************************************/
  var totalWidth = $('.col-lg-9').width();
        $('.data-table').css('width',totalWidth);
        $('th').css('overflow','hidden');
        $('.indicators-header').css('width','50px');
   var nbP = $scope.course.parts.length;
        if (nbP<=0) nbP = 1;
        if (nbP>40) nbP =40;
   var tdW = (totalWidth - 0)/nbP; 
        
        
        $('.data-table td').each(function() {
   
    $(this).css('min-width', 10);     // css attribute of your <td> width:15px; i.e.
    $(this).css('max-width', 10);     // css attribute of your <td> width:15px; i.e.
});
       // $scope.width =tdW;
        //$('.data-table td').css('width',tdW+'px!important');
        //$('.data-table td').css('display','table');
      //  $('.data-table td').attr('width',tdW)
        
        if($('.course_title_top').length<1)
                $('.navbar-brand').after('<a role ="button" href ="#" ng-click ="resetPath();goHome()" class ="course_title_top"> <span class ="glyphicon glyphicon-book"></span>  <em>'+$scope.course.title+'</em></a>');


$('.tableScroller').scroll();
 
$scope.setPage(0);

}



window.onresize = function(){
   $scope.$broadcast('content.reload');;
}

var reloadURL =function(){ 
  var url = window.location.hash
  window.setTimeout(function() {
    
    window.location.hash = url
   }, 0);


}


var loadURL =function(url){
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

$scope.triggerClick =function($event){ 

  var url = '#'+$($event.currentTarget).attr('data-path');
  
  loadURL(url); 
  
 }
 $scope.triggerFactClick =function($event){  
  var url = $($event.currentTarget).attr('data-path');
  loadURL(url); 
  
 }

 $scope.triggerHover =function($event){ 
  var url ="#"
//if ($event!==null)  url = $($event.currentTarget).attr('data-path');  
  //  $scope.hoverElements(url); 
 }

 $scope.$on("hover", function (e, msg) {
//$scope.hoverElements(msg)        
      });

//  $scope.stopHover =  stopHover();


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


var displayChapterIssues =function(url, task, chapter, indicator){  
 
  //resetPath();
  url =url+'&indicator='+indicator; 
  $('.td_issue[data-path ="'+url+'"]').addClass('chosenPart');
  $('.td_issue[data-path ="'+url+'"]').hide;
  $scope.context.route = url;     
  var element = resolveRoute(url);
  
      
 
     $scope.context.inspector_title = chapter.title;
     $scope.context.url = chapter.url

  showTasksAndFacts(element, indicator, task);

  
  
    }

var displayPartIssues =function(url, task, part, indicator){   
 // resetPath();
  url =url+'&indicator='+indicator;
  $('.td_issue[data-path ="'+url+'"]').addClass('chosenPart');
  $scope.context.route = url;     
  var element = resolveRoute(url);
  
     $scope.context.inspector_title = "Section : "+ part.title;//+' - '+nb+ txt ;
     $scope.context.url = part.url;


  showTasksAndFacts(element, indicator, task);

  
  
    }

var selectIndictor =function(indicator){

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


var highlightTome =function(index){  
  resetPath();
  
  setTimeout(function() {
    var rowTop = $('.tomes-header> th:nth-child('+index+')').offset();
  var topTop = rowTop.top;
  var left = rowTop.left;
  $('.tomes-header> th:nth-child('+index+')').addClass('chosenPart')

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


var highlightChapter =function(index, route){  
  resetPath();
  setTimeout(function() {
    var rowTop = $('.chapters-header> th:nth-child('+index+')').offset();

  var topTop = rowTop.top;
  var left = rowTop.left;

  var oneWidth = $('.chapters-header> th:nth-child('+index+')').innerWidth();
  $('.chapters-header> th:nth-child('+index+')').addClass('chosenPart')
  var height = $('.data-table').innerHeight() - $('.tomes-header th:first').innerHeight();


  var rowBottom = $('.data-table tbody tr:last-child > td:nth-child('+index+')').offset();
  var topBottom = rowBottom.top;

  $('#divOverlay').offset({top:topTop - 3 ,left:left - 2});
  $('#divOverlay').height(height);
  $('#divOverlay').width(oneWidth);
  $('#divOverlay').css('visibility','visible');
  $('#divOverlay').delay(200).slideDown('fast');

  $(".gly-issue[parent-path='"+route+"']").addClass('fa fa-exclamation-circle');

  }, 0);
  

}

var highlightPart =function(index, route){  
  resetPath();
  
  setTimeout(function() {
    var rowTop = $('.parts-header > th:nth-child('+index+')').offset();
    var topTop = rowTop.top;
    var left = rowTop.left;

    var oneWidth = $('.parts-header > th:nth-child('+index+')').innerWidth();
    $('.parts-header > th:nth-child('+index+')').addClass('chosenPart')
    var height = $('.data-table').innerHeight() - $('.chapters-header th:first').innerHeight() - $('.tomes-header th:first').innerHeight();



     $('#divOverlay').offset({top:topTop -2 ,left:left - 2});
      $('#divOverlay').height(height);
      $('#divOverlay').width(oneWidth);
      $('#divOverlay').css('visibility','visible');
    $('#divOverlay').delay(200).slideDown('fast');

$(".gly-issue[parent-path='"+route+"']").addClass('fa fa-exclamation-circle');

  
  }, 0);
}



var displayPartInfos =function(partElt, task){

var part = $(partElt).attr('data-part');

    var route = $(partElt).attr('data-path');



    var element =resolveRoute(route);
    showTasksAndFacts(element, 'ALL', task);


var sec_num = parseInt(element.properties.filter(function(value){ return value.property === 'mean.duration'})[0].value, 10); 
    var minutes = Math.floor(sec_num  / 60);
    var seconds = sec_num -  (minutes * 60);
    var meanTime    = minutes+' h '+seconds+' min';
    if (minutes == 0) meanTime = seconds+' minutes';

    var reads = parseInt(element.properties.filter(function(value){ return value.property === 'Readings'})[0].value);
    var rereads = parseInt(100*element.properties.filter(function(value){ return value.property === 'rereadings_tx'})[0].value)
    var rereadTx = rereads ;    
    rereadTx = Math.floor(rereadTx)+'%';

    var stop = parseInt(100*element.properties.filter(function(value){ return value.property === 'rupture_tx'})[0].value);
    var nrs = parseInt($scope.course.stats.filter(function(value){ return value.property === 'nRS'})[0].value);
    var stopTx = Math.floor(stop)+'%';

    var provData =[
    {'property':'identity', 'value': parseInt(element.properties.filter(function(value){ return value.property === 'provenance_identity'})[0].value),
    text:'est la même section (relectures)'},
    {'property':'precedent', 'value': parseInt(element.properties.filter(function(value){ return value.property ===  "provenance_precedent"})[0].value),
    text:'est la section qui la précède'},
    {'property':'next_p', 'value': parseInt(element.properties.filter(function(value){ return value.property ===  "provenance_next_p"})[0].value),
    text:'est la section qui la suit'},
    {'property':'shifted_past', 'value': parseInt(element.properties.filter(function(value){ return value.property ===  "provenance_shifted_past"})[0].value),
    text:'est une section plus en arrière'},
    {'property':'shifted_next', 'value': parseInt(element.properties.filter(function(value){ return value.property ===  "provenance_shifted_next"})[0].value),
    text:'est une section plus en avant'}
    ];

var destData =[
    {'property':'identity', 'value': parseInt(element.properties.filter(function(value){ return value.property === 'destination_identity'})[0].value),
    text:'est la même section (relectures)'},
    {'property':'precedent', 'value': parseInt(element.properties.filter(function(value){ return value.property ===  "destination_precedent"})[0].value),
    text:'est la section qui la précède'},
    {'property':'next_p', 'value': parseInt(element.properties.filter(function(value){ return value.property ===  "destination_next_p"})[0].value),
    text:'est la section qui la suit'},
    {'property':'shifted_past', 'value': parseInt(element.properties.filter(function(value){ return value.property ===  "destination_shifted_past"})[0].value),
    text:'est une section plus en arrière'},
    {'property':'shifted_next', 'value': parseInt(element.properties.filter(function(value){ return value.property ===  "destination_shifted_next"})[0].value),
    text:'est une section plus en avant'}
    ];    
   


$scope.observedElt ={
      'type':'part',
      'typeTxt':'Cette section ',
      'id':element.id,
      'nbUsers':Math.round(100*element.properties.filter(function(value){ return value.property === 'Readers_tx'})[0].value,2)+'%',
      'nbRS':Math.round(100*element.properties.filter(function(value){ return value.property === 'RS_tx'})[0].value,2)+'%',
      'Actions_tx':Math.round(100*element.properties.filter(function(value){ return value.property === 'Actions_tx'})[0].value,2)+'%',
      'meanTime': meanTime,
      'meanRereads':rereadTx,
      'meanStops':stopTx,
      'maxProvPercent':d3.max(provData, function(d) { return d.value; }),
      'maxProvTxt':$.grep(provData, function(e){ return  e.value === d3.max(provData, function(d) { return d.value; })})[0].text,
      'provLinearity':provData.filter(function(value){ return value.property === 'precedent'})[0].value+'%',
      'destLinearity':destData.filter(function(value){ return value.property === 'next_p'})[0].value+'%',
      'maxDestPercent':d3.max(destData, function(d) { return d.value; }),
      'maxDestTxt':$.grep(destData, function(e){ return  e.value === d3.max(destData, function(d) { return d.value; })})[0].text
    };    


$scope.context.inspector_title = "Section : "+element.title;
$scope.context.url = element.url;

$scope.inspectorDisplaySrc='inspector';


  //alert('ok')

highlightPart($(partElt).index() + 1, route);
}

var displayCourseInfos =function(indicator, task){ 
  $scope.indicatorInspectorShow = indicator;
  resetPath(); 
  //if(indicator==='ALL')
  $scope.context.inspector_title = "Cours : "+$scope.course.title;// +" - " +$scope.context.subfacts.length +" problèmes potentiels";
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


var nbUsers = 0;
var nbRS = 0;
var Actions_tx =0;

$scope.observedElt ={'type':'course',
      'id':0,
  'typeTxt':'Ce cours',
      'nbUsers':0,//$scope.course.properties.filter(function(value){ return value.property === 'Users_nb'})[0].value,
      'nbRS':$scope.course.properties.filter(function(value){ return value.property === 'RS_nb'})[0].value,
      'Actions_tx':$scope.course.properties.filter(function(value){ return value.property === 'Actions_tx'})[0].value
    };

//window.setTimeout(function() {
    resetPath();
    //$(':focus').blur();
    selectIndictor(indicator); 
      if(indicator ==='ALL') 
        $scope.inspectorDisplaySrc='course'

    else 
    $scope.inspectorDisplaySrc='indicators'
 // }, 10);
}


var displayTomeInfos =function(partElt, task){ 

  var route = $(partElt).attr('data-path');
  var element =resolveRoute(route);  
  var nbUsers = 0;
  var nbRS = 0;
  var Actions_tx = 0;
  showTasksAndFacts(element, 'ALL', task);
  
  angular.forEach(element.chapters, function(chapitre){
  angular.forEach(chapitre.parts, function(part){
  showTasksAndFacts(part, 'ALL',task);
    nbUsers = 0;//nbUsers + parseInt(part.properties.filter(function(value){ return value.property === 'Users_nb'})[0].value);
    nbRS = nbUsers + parseInt(part.properties.filter(function(value){ return value.property === 'RS_nb'})[0].value);
    Actions_tx = nbUsers + parseInt(part.properties.filter(function(value){ return value.property === 'Actions_tx'})[0].value);
  })

  });


$scope.context.inspector_title = "Partie : "+element.title

$scope.context.url = element.url
$scope.inspectorDisplaySrc='inspector'
//window.setTimeout(function() {
    
    //$(':focus').blur();
    highlightTome($(partElt).index() + 1);
    
  //}, 10);

    
}

var displayChapterInfos =function(partElt, task){ 
  

  var route = $(partElt).attr('data-path');


  var element =resolveRoute(route);  
  showTasksAndFacts(element, 'ALL', task);
  angular.forEach(element.parts, function(part){
  showTasksAndFacts(part, 'ALL',task);
  });

  var nbUsers = 0;
  var nbRS = 0;
  var Actions_tx = 0;


  angular.forEach(element.parts, function(part){
  showTasksAndFacts(part, 'ALL',task);
    // nbUsers = nbUsers + parseInt(part.properties.filter(function(value){ return value.property === 'Users_nb'})[0].value);
    nbRS = nbRS + parseInt(part.properties.filter(function(value){ return value.property === 'RS_nb'})[0].value);
    Actions_tx = nbUsers + parseInt(part.properties.filter(function(value){ return value.property === 'Actions_tx'})[0].value);
  })


$scope.context.inspector_title = "Chapitre : "+element.title;
$scope.context.url = element.url;


var times =[], users =[], rss =[], rereadings_tx =[], stops =[];

angular.forEach(element.parts, function(part){
  times.push(parseInt(part.properties.filter(function(value){ return value.property === 'mean.duration'})[0].value)); 
  users.push(100*part.properties.filter(function(value){ return value.property === 'Readers_tx'})[0].value);
  rss.push(100*part.properties.filter(function(value){ return value.property === 'RS_tx'})[0].value);
  var reads = parseInt(part.properties.filter(function(value){ return value.property === 'Readings'})[0].value);
  var rereads = parseInt(100*part.properties.filter(function(value){ return value.property === 'rereadings_tx'})[0].value);
  rereadings_tx.push(rereads);
  stops.push(parseInt(100*part.properties.filter(function(value){ return value.property === 'rupture_tx'})[0].value));
});

var nrs = parseInt($scope.course.stats.filter(function(value){ return value.property === 'nRS'})[0].value);

var sec_num = Math.round(d3.sum(times),2); 
    var minutes = Math.floor(sec_num  / 60);
    var seconds = sec_num -  (minutes * 60);
    var meanTime    = minutes+' h '+seconds+' min';
    if (minutes == 0) meanTime = seconds+' minutes';

    var nrs = parseInt($scope.course.stats.filter(function(value){ return value.property === 'nRS'})[0].value);
    var stopTx = Math.floor(100 * Math.round(d3.mean(stops),2) / nrs)+'%';

    var provData =[
    {'property':'identity', 'value': parseInt(element.properties.filter(function(value){ return value.property === 'provenance_identity'})[0].value),
    text:'est la même section (relectures)'},
    {'property':'precedent', 'value': parseInt(element.properties.filter(function(value){ return value.property ===  "provenance_precedent"})[0].value),
    text:'est la section qui la précède'},
    {'property':'next_p', 'value': parseInt(element.properties.filter(function(value){ return value.property ===  "provenance_next_p"})[0].value),
    text:'est la section qui la suit'},
    {'property':'shifted_past', 'value': parseInt(element.properties.filter(function(value){ return value.property ===  "provenance_shifted_past"})[0].value),
    text:'est une section plus en arrière'},
    {'property':'shifted_next', 'value': parseInt(element.properties.filter(function(value){ return value.property ===  "provenance_shifted_next"})[0].value),
    text:'est une section plus en avant'}
    ];

var destData =[
    {'property':'identity', 'value': parseInt(element.properties.filter(function(value){ return value.property === 'destination_identity'})[0].value),
    text:'est la même section (relectures)'},
    {'property':'precedent', 'value': parseInt(element.properties.filter(function(value){ return value.property ===  "destination_precedent"})[0].value),
    text:'est la section qui la précède'},
    {'property':'next_p', 'value': parseInt(element.properties.filter(function(value){ return value.property ===  "destination_next_p"})[0].value),
    text:'est la section qui la suit'},
    {'property':'shifted_past', 'value': parseInt(element.properties.filter(function(value){ return value.property ===  "destination_shifted_past"})[0].value),
    text:'est une section plus en arrière'},
    {'property':'shifted_next', 'value': parseInt(element.properties.filter(function(value){ return value.property ===  "destination_shifted_next"})[0].value),
    text:'est une section plus en avant'}
    ];    
   

$scope.observedElt ={'type':'chapter',
      'typeTxt':'ce chapitre ',      
      'id':element.id,
      'nbUsers':parseInt(100*element.properties.filter(function(value){ return value.property === 'Readers_tx'})[0].value)+'%',
      'nbRS':parseInt(100*element.properties.filter(function(value){ return value.property === 'RS_tx'})[0].value)+'%',
      'Actions_tx':Math.round(100*element.properties.filter(function(value){ return value.property === 'Actions_tx'})[0].value,2)+'%',
      'meanTime': meanTime,
      'meanRereads':parseInt(100*element.properties.filter(function(value){ return value.property === 'rereadings_tx'})[0].value)+'%',
      'meanStops':parseInt(100*element.properties.filter(function(value){ return value.property === 'rupture_tx'})[0].value)+'%',
      'maxProvPercent':d3.max(provData, function(d) { return d.value; }),
      'maxProvTxt':$.grep(provData, function(e){ return  e.value === d3.max(provData, function(d) { return d.value; })})[0].text,
      'maxDestPercent':d3.max(destData, function(d) { return d.value; }),
      'maxDestTxt':$.grep(destData, function(e){ return  e.value === d3.max(destData, function(d) { return d.value; })})[0].text,
      'provLinearity':provData.filter(function(value){ return value.property === 'precedent'})[0].value+'%',
      'destLinearity':destData.filter(function(value){ return value.property === 'next_p'})[0].value+'%'
    }; 
//window.setTimeout(function() {
    
    //$(':focus').blur();
    highlightChapter($(partElt).index() + 1, route);
    $scope.inspectorDisplaySrc='inspector'
  //}, 10);
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

var computeInspectorCourseProperties = function(properties){
  var prop = {'property':'', 'value':''}
  
   
   return ({
   'overview':[
      {'property':'Nombre de sections', 
        'value':$scope.course.parts.length},
        {'property':'Nombre de jours d\'observation', 
        'value':'72 jours'},
        {'property':'Nombre de lecteurs distincts', 
        'value':1230}
    ],
  'readings':[
      {'property':'Nombre moyen de lecteurs distincts par section', 
        'value':properties.filter(function(value) { return value.property === 'mean.readers'})[0].value}
   ],
   'rereading':[
      {'property':'Nombre moyen de lecteurs distincts par section', 
        'value':properties.filter(function(value) { return value.property === 'mean.readers'})[0].value}
   ],
   'transitions':[
      {'property':'Nombre moyen de lecteurs distincts par section', 
        'value':properties.filter(function(value) { return value.property === 'mean.readers'})[0].value}
   ],
   'stops':[
      {'property':'Nombre moyen de lecteurs distincts par section', 
        'value':properties.filter(function(value) { return value.property === 'mean.readers'})[0].value}
   ]

  })

}

var computeInspectorPartProperties = function(properties){
  var prop = {'property':'', 'value':''}  
   return ({
   'overview':[
      {'property':'Nombre de lecteurs distinct', 
        'value':properties.filter(function(value) { return value.property === 'Readers'})[0].value},
        {'property':'Durée médiane de lecture (s)', 
        'value':properties.filter(function(value) { return value.property === 'median.duration'})[0].value},
        {'property':'Nombre de lectures', 
        'value':properties.filter(function(value) { return value.property === 'Readings'})[0].value}
    ]

  })

}

$scope.clearEditingTask =function(){
  $scope.formData ='';return false;
}
var insertLocalTask =function(route, task){

  var element = resolveRoute(route);

  element.todos.unshift(task);


  $scope.context.subtasks =computeAllTasks();


  var rt = route+'&taskid='+task._id;
  if(task.classof!=='ALL') rt = rt + '&indicator='+task.classof
  loadURL(rt);
 
}

$scope.editSuggestion =function($event, fact, suggestion){
  $scope.formData = suggestion; 
  
var element = resolveRoute(fact.route);


  $scope.context.route = element.route;

  window.setTimeout(function() {
           $("#taskEditor").trigger( "click" );
           $(".editable-input ").fadeIn(100).fadeOut(100).fadeIn().focus().select();
       }, 0);



}



$scope.createTask =function($event){
  $scope.formData =  "Nouvelle tâche ("+"Sec. "+$scope.studiedPart+")"; 
$('#taskInput').focus();  
var element = resolveRoute($($event.currentTarget).attr('href'));

  $scope.context.route = $($event.currentTarget).attr('href');
  
window.setTimeout(function() {
             $(".editable-input ").fadeIn(100).fadeOut(100).fadeIn().focus().select();
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

var updateLocalTasks =function(route, data){
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

$scope.dropFact = function (route, index) {
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
     var result = dropFactLocally(index);
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
          $scope.inspector.Facts.splice($scope.inspector.Facts.indexOf(fact),1);
          result = part.route;
       }
      }
      else
        if(components.hasOwnProperty('factid')){
          var fact = $.grep(chap.facts, function(e){ return  e._id == components.factid })[0];          
          chap.facts.splice(chap.facts.indexOf(fact),1);
          $scope.inspector.Facts.splice($scope.inspector.Facts.indexOf(fact),1);
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
var ComputeGlobalVisuData =function(){ 
  var visuData = []
  
   visuData.push({type:'Actions_tx',data:factChart(-1,'Actions_tx')});  
   visuData.push({type:'RS_nb',data:factChart(-1,'RS_nb')});  
   visuData.push({type:'Readers',data:factChart(-1,'Readers')});  
   visuData.push({type:'Actions_tx',data:factChart(-1,'Actions_tx')});  
   visuData.push({type:'speed',data:factChart(-1,'speed')});  
   visuData.push({type:'Readers_tx',data:factChart(-1,'Readers_tx')});  
   visuData.push({type:'RS_tx',data:factChart(-1,'RS_tx')});  
  visuData.push({type:'mean.duration',data:factChart(-1,'mean.duration')});
  visuData.push({type:'rereadings_tx',data:factChart(-1,'rereadings_tx')});  
  visuData.push({type:'course_readers_rereaders',data:factChart(-1,'course_readers_rereaders')});  
  visuData.push({type:'part_readers_rereaders',data:factChart(-1,'part_readers_rereaders')});  
  visuData.push({type:'rupture',data:factChart(-1,'rupture')});  
  visuData.push({type:'rupture_tx',data:factChart(-1,'rupture_tx')});  
  visuData.push({type:'recovery',data:factChart(-1,'recovery')});    
  visuData.push({type:'norecovery',data:factChart(-1,'norecovery')});    
  visuData.push({type:'norecovery_tx',data:factChart(-1,'norecovery_tx')});
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

  return visuData;
}




var mean =function(numbers) {
    // mean of [3, 5, 4, 4, 1, 1, 2, 3] is 2.875
    var total = 0,
        i;
    for (i = 0; i < numbers.length; i += 1) {
        total += numbers[i];
    }
    return total / numbers.length;
}
var median =function(numbers) {
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
var globalTransitionsProvenance =function(classe){
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
            'value': parseFloat($scope.course.properties.filter(function(value){ return  value.property === issueCode})[0].value),
            'color':'grey'
          })

   angular.forEach($scope.course.tomes, function(tome){
    chartData.push({'part':tome.id,
            'title':tome.title,
             'elementType':'tome',
            'route':tome.route,
            'value': parseFloat(tome.properties.filter(function(value){ return  value.property === issueCode})[0].value),
            'color':parseInt(factedPartID) ===parseInt(tome.id)?'#45348A':'grey'
          })
          angular.forEach(tome.chapters, function(chapter){
            chartData.push({'part':chapter.id,
            'title':chapter.title,
             'elementType':'chapter',
            'route':chapter.route,
            'value': parseFloat(chapter.properties.filter(function(value){ return  value.property === issueCode})[0].value),
            'color':parseInt(factedPartID) ===parseInt(chapter.id)?'#45348A':'grey',
            'indicators':chapter.indicators
          })
        angular.forEach(chapter.parts, function(part){
          chartData.push({'part':part.id,
            'title':part.title,
             'elementType':'part',
            'route':part.route,
            'value': parseFloat(part.properties.filter(function(value){ return  value.property === issueCode})[0].value),
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
app.animation('.parts-header', function() {
  return {
    enter: function(element, done) { console.log('enter');
      element.css('display', 'none');
      $(element).fadeIn(1000, function() {
        done();
      });
    },
    leave: function(element, done) {console.log('enter');
      $(element).fadeOut(1000, function() {
        done();
      });
    },
    move: function(element, done) {console.log('enter');
      element.css('display', 'none');
      $(element).slideDown(200, function() {
        done();
      });
    }
  }
});