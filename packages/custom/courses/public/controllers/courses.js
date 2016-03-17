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
  function($scope, $rootScope, $stateParams, $location, $http, Global, Courses) {
    $scope.global = Global;


 $scope.findOne = function() {

  $scope.d3opts = [];
  $scope.dataLoading = true;
  $scope.pageLoaded = false;
  $(window).unbind('hashchange');


  $scope.observedElt ={}

     $('table').hide();
     
     $scope.inspectorDisplaySrc='course';
     $scope.indicatorInspectorShow = 'course';
     
      $scope.courseParts =[];
      $scope.courseChapters =[];
      
      $scope.context = {};
      $scope.course ={}
      $scope.formData ='';
      $scope.textBtnForm ='';
      $scope.chartType = 'Actions_tx';
      $scope.globalChartSelector = 'Actions_tx';
      $scope.elementTypeSelector = 'part';
      $scope.sectionDisplay = false;
      $scope.context.statChart = false;
      
      $scope.achievementSelector = 'mean.achievement';
      $scope.rsSelector = 'nparts';
      $scope.topSelector = 'Actions_tx';
      $scope.flopSelector = 'Actions_tx';
      $scope.topElementSelector ='sections',
      $scope.flopElementSelector ='tomes',
      $scope.statSelector ='visits';
      $scope.sectionPstatSelector = 'Actions_tx';
      $scope.coursePstatSelector = 'time';
      $scope.studiedPart = '';
      $scope.context.otherFacts=[];

      $scope.indicatorsHeader=[
        {'code':'Actions_tx', 'name':'actions', 'display':'Visites', 'inspectorText':'aux visites', 'issueCode':'RminVisit'},
        {'code':'speed', 'name':'speed', 'display':'Vitesse','inspectorText':'à la vitesse de lecture', 'issueCode':'RmaxSpeed'},
        {'code':'rereadings_tx', 'name':'reread', 'display':'Relecture','inspectorText':'à la relecture', 'issueCode':'RRmax'},
        {'code':'norecovery_tx', 'name':'stop', 'display':'Arrêts', 'inspectorText':'aux arrêts de la lectrue','issueCode':'StopRSExit'}

      ]
  
      Courses.get({
        courseId: $stateParams.courseId
      }, function(course) {
     
        $scope.course = course;
        $scope.chartType = 'Actions_tx';
        $scope.selectedElement = course;
  
        completeCourseParts($scope.course, $scope.courseParts, $scope.courseChapters);
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

     
    /********  Update on @ change ****************/
$(window).bind('hashchange',function(){ 

  loadContext();
});


$scope.toggleSectionDisplay = function(){
  $scope.sectionDisplay =! $scope.sectionDisplay;
 
  //$(window).trigger('resize')
}

$scope.$watch('indicatorInspectorShow', function(newValue, oldValue) {
            if(newValue ==='Readings')
              $scope.globalChartSelector = 'Actions_tx'
            else
              if(newValue ==='Rereading')
                $scope.globalChartSelector = 'rereadings_tx'
              else
                if(newValue ==='Stop')
                  $scope.globalChartSelector = 'rupture_tx'
                else
                  if(newValue ==='Transition')
                    $scope.globalChartSelector = 'provenance';

       
    });


$scope.$watch('sectionPstatSelector', function(newValue, oldValue) {
  $scope.context.statChart = false;
  var statChart = $('#statChart').detach();
  switch($scope.sectionPstatSelector) {
    case "Actions_tx":
        $scope.graphTitle ='Taux des visites';
        break;
    case "Readers_tx":
        $scope.graphTitle ='Taux de lecteurs ';        
        break;    
    case 'mean.duration':
        $scope.graphTitle ='Durée moyenne de lecture de la section(en minutes)'
        break;
    case 'rereadings_tx':
        $scope.graphTitle ='Taux de lectures qui sont des relectures'
        break;
    case 'rupture':
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

  
var completeCourseParts =function(course, courseParts, courseChapters){
  var base_url = "https://openclassrooms.com/courses";
  course.url = base_url+'/'+course.properties.filter(function(value){ return value.property === 'slug'})[0].value
  var course_route = course._id;
  angular.forEach(course.tomes, function(tome) {
    tome.parts_count = 0;
    tome.route =course_route+','+tome._id;
    tome.url = course.url;//+'/'+tome.properties.filter(function(value){ return value.property === 'slug'})[0].value
    angular.forEach(tome.chapters, function(chapter) { 
      chapter.parts_count = 0;
      chapter.route =tome.route+','+chapter._id;
      chapter.url = course.url+'/'+chapter.properties.filter(function(value){ return value.property === 'slug'})[0].value;
      
      angular.forEach(chapter.parts, function(part) {
        part.parent = chapter._id;
        tome.parts_count = tome.parts_count + 1;
        if(tome.parts_count===1) tome.url = chapter.url;
        chapter.parts_count = chapter.parts_count + 1;
        part.route =chapter.route+','+part._id;
        part.url = chapter.url+'/'+'#/id/r-'+part.properties.filter(function(value){ return value.property === 'part_id'})[0].value
        angular.forEach(part.facts,function(fact){
          fact.route =part.route+','+fact._id;
          fact.d3 =[];
          fact.d3 ={'part':part.route, 'chapter':chapter.route,'tome':tome.route};
       //  appendD3Facts(fact,part.id,chapter.route);

        });
        courseParts.push( part );
      });
      courseChapters.push( chapter ); 
    });
  });

  
}



var resolveRoute = function(path){
   
   var regExp = RegXpURL(path); 
  
   var arr = regExp.arr.split(',');  

   if(typeof $scope.course == 'undefined')
      console.log('Error')
  var result = $scope.course;  
   if(arr.length>=2) {
var tome = $.grep($scope.course.tomes, function(e){ return  e._id == arr[1] })[0];
     result = tome
     if(arr.length>=3){
   var chap = $.grep(tome.chapters, function(e){ return  e._id == arr[2] })[0];
        result = chap
     
     if(arr.length>=4){
  var part = $.grep(chap.parts, function(e){ return  e._id == arr[3] })[0];
       result = part
      
       if(arr.length>=5){        
    var fact = $.grep(part.facts, function(e){ return  e._id == arr[4] })[0];          
         result = fact
       }
      }
    }  
  }   
     
    
  var taskId = 0;
   var taskIndicator = 'ALL';
   if(regExp.task!=0){
      taskId = regExp.task;
       if(regExp.indicator!='ALL')
        taskIndicator =regExp.indicator;
      
      
 var todo = $.grep(result.todos, function(e){ return  e._id == taskId })[0];
      result = todo;
         
     }

     return result;
}
var resetPath =function(){     
  $('.chosenPart').removeClass('chosenPart'); 
  $('.data-table').removeClass('highlight-table');
  $('#divOverlay').css('visibility','hidden');
  $('#divHoverOverlay').css('visibility','hidden');
  $('.inspector-item-selected').removeClass('inspector-item-selected');
    for (var i = 0; i < $scope.context.subtasks.length; i++)   
      {$scope.context.subtasks[i].selected = 'notRelevantTask' }


}

var parseTask =function(path, content){

   var regExp = RegXpURL(path);
  
  
  var taskId = regExp.task;
  var indicator = regExp.indicator;

  path = regExp.arr;

  var arr = path.split(','); 
  var courseId = $scope.course._id;
  var tomeId = 0;
  var chapId = 0;
  var partId =0;
  var factId =0;
 
  if(arr.length>=2)   tomeId =  arr[1] ;
  if(arr.length>=3)   chapId =  arr[2] ;
  if(arr.length>=4)   partId =  arr[3] ;
  if(arr.length>=5)   factId =  arr[4] ;


  
 var route = courseId+'/'+tomeId+'/'+chapId+'/'+partId+'/'+factId;
 var todo ={'classof':indicator, 'todo':content,'elementType':'todo'}

  return {'route':route, 'todo':todo}
}
var deparseTask =function(route){
  var regExp = RegXpURL(route);
    var taskId =  regExp.task;  
    var taskIndicator =regExp.indicator;  
    var path = regExp.arr

  var arr = path.split(','); 
  var courseId = $scope.course._id;
  var tomeId = 0;
  var chapId = 0;
  var partId =0;
  var factId =0;
  var result ="#";
 
  if(arr.length>=2)   tomeId =  arr[1] ;
  if(arr.length>=3)   chapId =  arr[2] ;
  if(arr.length>=4)   partId =  arr[3] ;
  if(arr.length>=5)   factId =  arr[4] ;

result ="#"+courseId;
if(tomeId!=0) {
  result = result+','+tomeId;
  if(chapId!=0) {
    result = result+','+chapId;
    if(partId != 0){
      result = result+','+partId;
      if(factId != 0)
        result = result+','+factId;
    }
  }
}
//  result = result + ',' + chapId + ',' + partId + ',' + factId + ',' + taskId;
result = result + ';' + taskId;
  if( taskIndicator!='ALL')    result = result + '@' + taskIndicator;

  return result;

}

var parseRequest =function(path){

  var arr = path.split(','); 
  var courseId = $scope.course._id;
  var tomeId = 0;
  var chapId = 0;
  var partId =0;
  var factId =0;
 
  if(arr.length>=2)   tomeId =  arr[1] ;
  if(arr.length>=3)   chapId =  arr[2] ;
  if(arr.length>=4)   partId =  arr[3] ;
  if(arr.length>=5)   factId =  arr[4] ;
  
 var result = courseId+'/'+tomeId+'/'+chapId+'/'+partId+'/'+factId;
  return result
}

var parseTaskRequest =function(path){ 
var regExp = RegXpURL(path);
var taskId =  regExp.task; 
var taskIndicator =regExp.indicator;

  path =  regExp.arr; 
  
  var arr = path.split(','); 
  var courseId = $scope.course._id;
  var tomeId = 0;
  var chapterId = 0;
  var partId =0;
  var factId =0;
  
  var route = courseId;
  var scope = 'course';
 
  if(arr.length>=2)   tomeId =  arr[1] ;
  if(arr.length>=3)   chapterId =  arr[2] ;
  if(arr.length>=4)   partId =  arr[3] ;
  if(arr.length>=5)   factId =  arr[4] ;

if(tomeId ==0){
route =route+'/0/'+taskId;
}
else
  if(chapterId ==0){
    route =route+'/'+tomeId+'/0/'+taskId;
    scope ='tome';
  }
  else
    if(partId ==0){
      route = route+'/'+tomeId+'/'+chapterId+'/0/'+taskId;
      scope ='chapter';
    }
    else
      {

        if(factId ==0){
          route = route+'/'+tomeId+'/'+chapterId+'/'+partId+'/0/'+taskId;
          scope ='part';
        }
        else{
          route = route+'/'+tomeId+'/'+chapterId+'/'+partId+'/'+factId+'/'+taskId;
          scope ='fact';
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
    },
    'issues':{ 
      'all':$scope.context.d3.stats.filter(function(value){ return value.indicator === 'ALL'})[0].count,
      'readings':$scope.context.d3.stats.filter(function(value){ return value.indicator === 'Readings'})[0].count,
      'rereading':$scope.context.d3.stats.filter(function(value){ return value.indicator === 'Rereading'})[0].count,
      'transition':$scope.context.d3.stats.filter(function(value){ return value.indicator === 'Transition'})[0].count,
      'stop':$scope.context.d3.stats.filter(function(value){ return value.indicator === 'Stop'})[0].count
    },
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
        tasks[i].route =$scope.course._id+',0,0,0,0;'+tasks[i]._id+'@'+tasks[i].classof
        tasks[i].minipath ='Cours'
      } 
angular.forEach($scope.course.tomes, function(tome) { 
    var tomeTasks = angular.copy(tome.todos);
    for (var i = 0; i < tomeTasks.length; i++){
    tomeTasks[i].route =tome.route+',0,0,0;'+tomeTasks[i]._id+'@'+tomeTasks[i].classof
    tomeTasks[i].minipath ='Partie :'+tome.title
    tasks.push(tomeTasks[i]);
  } 

    angular.forEach(tome.chapters, function(chapter) {  
 var chTasks = angular.copy(chapter.todos);
      for (var i = 0; i < chTasks.length; i++){
        chTasks[i].route =chapter.route+',0,0;'+chTasks[i]._id+'@'+chTasks[i].classof
        chTasks[i].minipath ='Chapitre :'+chapter.title
        tasks.push(chTasks[i]);

      } 
            angular.forEach(chapter.parts, function(part) {
           var partTasks = angular.copy(part.todos);
                for (var i = 0; i < partTasks.length; i++){
                  partTasks[i].route =part.route+',0;'+partTasks[i]._id+'@'+partTasks[i].classof
                  partTasks[i].minipath ='Section: '+part.title;
                  tasks.push(partTasks[i]);
                }
                  angular.forEach(part.facts, function(fact){
               var factTasks = angular.copy(fact.todos);
                    for(var i = 0; i<factTasks.length; i++){ 
                  var txt = (fact.classof ==='Readings')?'Lecture':
                            (fact.classof ==='Rereading')?'Relecture':
                               (fact.classof ==='Transition')?'Transition' :'Arrêts';
                      
                      factTasks[i].route =fact.route+';'+factTasks[i]._id+'@'+factTasks[i].classof
                       factTasks[i].minipath ='Section: '+part.title+' - ' +txt; 
                      tasks.push(factTasks[i]);}
                  })
                  })
                                 
            });
});

  for (var i = 0; i < tasks.length; i++)   
    tasks[i].selected = 'relevantTask';

  return tasks

}


var computeSubFacts =function(element, indicator){   
var issuesCode =[] ;
var type = (element.elementType=='chapitre')?'chapter':'part'
var f = $.grep($scope.indicatorsHeader, function(e){ return  e.code ==indicator});
angular.forEach(f, function(ind) {issuesCode.push(ind.issueCode) })
 
  var facts  = $.grep(element.facts, function(e){return ($.inArray(e.issueCode, issuesCode)>-1)}); 
  angular.forEach(facts, function(ind){ind.partId=element.id, ind.partType=type});
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
        if(params.scope =='fact')
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


var findCourseIssues = function(){  
  var allFacts=[];

  $scope.courseChapters.forEach(function(chapter) {
    
      chapter.facts.forEach(function(f){
        allFacts.push(f)
        })   
    
  });

 $scope.context.Facts=allFacts;
 
 
}



var findTomeIssues = function(tomeId){  
  var allFacts=[];
var tomeChaps = $.grep($scope.course.tomes, function(e){ return e._id === tomeId; })[0].chapters;

  tomeChaps.forEach(function(chapter) {
    
      chapter.facts.forEach(function(f){
        allFacts.push(f)
        })   
    
  });

 $scope.context.Facts=allFacts;
 
}

var findChapterIssues = function(chapterId){  
  var allFacts=[];
var chapter = $.grep($scope.courseChapters, function(e){ return e._id === chapterId; })[0]; 

  
    
      chapter.facts.forEach(function(f){
        allFacts.push(f)
  
    
  });

 $scope.context.Facts=allFacts;

}

var findPartIssues = function(partId){  
  var allFacts=[];
var part = $.grep($scope.courseParts, function(e){ return e._id === partId; })[0]; 

 $scope.context.Facts=part.facts;

}

var computeGranuleFacts = function(granularity, id){
var results=[];
switch(granularity){
  case 'course':
    findCourseIssues();
  break;
  case 'tome':
    findTomeIssues(id);
    break;
  case 'chapter':
    findChapterIssues(id);
    break
  case 'part':
    findPartIssues(id);
    break

  }

}

/********************************************/
var loadContext = function(){
  
   var url = location.hash.slice(1);
 
  var element = resolveRoute(url);

   $scope.context.route = url;
   
   $scope.context.Tasks =element.todos; 
   
   var route = url;
   resetPath();
  var regExp = RegXpURL(route);
  
  var task =  regExp.task; 
  var indicator = regExp.indicator;

  var path = regExp.arr; 
  var arr = path.split(',');  
  var course  = $scope.course;
  var tome = -1;
  var chap = -1;
  var part  = -1;
  var partElt = -1;
  var fact  = -1;


  if(arr.length<2) 
    
      {
        
        
        
        $scope.context.taskText ='(nouvelle tâche globale)';

       // window.setTimeout(function() {
         
          
          displayCourseInfos(indicator, task);
          computeGranuleFacts('course');

               //$(':focus').blur();
          
      //  }, 10);
    };

  /********************************hhhhhhhhhhhhhhhh***********/

 if(arr.length ==2) {  
  
  

   tome = $.grep(course.tomes, function(e){ return  e._id == arr[1] })[0]; 
   computeGranuleFacts('tome', tome._id);
   partElt = $('.tome_index[data-part ='+tome.id+']')[0];
   $scope.context.taskText ='(nouvelle tâche pour cette partie)';
   
   
   

   window.setTimeout(function() {
 displayTomeInfos(partElt, task);
 
        }, 10);
   
 }



 if(arr.length ==3  && indicator =="ALL") {  
  
  tome = $.grep(course.tomes, function(e){ return  e._id == arr[1] })[0];   
   chap = $.grep(tome.chapters, function(e){ return  e._id == arr[2] })[0]; 
   computeGranuleFacts('chapter', chap._id);

   partElt = $('.chapter_index[data-part ='+chap.id+']')[0];
   
   
   

   $scope.context.taskText ='(nouvelle tâche pour ce chapitre)';

  
   window.setTimeout(function() {
    
 displayChapterInfos(partElt, task);
 
        }, 10);
   
 }

 if(arr.length ==3  && indicator !="ALL") {  
  $scope.sectionDisplay = false;
  
  tome = $.grep(course.tomes, function(e){ return  e._id == arr[1] })[0];   
   chap = $.grep(tome.chapters, function(e){ return  e._id == arr[2] })[0]; 
   computeGranuleFacts('chapter', chap._id);

   partElt = $('.chapter_index[data-part ='+chap.id+']')[0];
   
   
   

   $scope.context.taskText ='(nouvelle tâche pour ce chapitre)';

  $scope.sectionDisplay = false; 
  
   window.setTimeout(function() {
  
 $scope.inspectorDisplaySrc='issues'
  
 displayChapterIssues(route, task, chap, indicator);

 
  
 
        }, 50);
   
 }


 if(arr.length ==4 && indicator =="ALL") { 
  $scope.sectionDisplay = true;
  tome = $.grep(course.tomes, function(e){ return  e._id == arr[1] })[0]; 
  chap = $.grep(tome.chapters, function(e){ return  e._id == arr[2] })[0]; 
  part = $.grep(chap.parts, function(e){ return  e._id == arr[3] })[0]; 
  partElt = $('.part_index[data-part ='+part.id+']'); 
  
  $scope.context.taskText ='(nouvelle tâche pour cette section)';
  

    window.setTimeout(function() {
 displayPartInfos(partElt, task);
        }, 10);
  
}
if(arr.length ==4 && indicator!="ALL") { 
  tome = $.grep(course.tomes, function(e){ return  e._id == arr[1] })[0]; 
  chap = $.grep(tome.chapters, function(e){ return  e._id == arr[2] })[0]; 
   
  part = $.grep(chap.parts, function(e){ return  e._id == arr[3] })[0]; 
  partElt = $('.part_index[data-part ='+part.id+']'); 

  
  
  $scope.context.taskText ='(nouvelle tâche pour cette section)';
$scope.inspectorDisplaySrc='issues';
 $scope.sectionDisplay = true; 

  window.setTimeout(function() {
 displayPartIssues(route, task, part, indicator);

           
        }, 10);
}


if(arr.length ==5) {  
  tome = $.grep(course.tomes, function(e){ return  e._id == arr[1] })[0]; 
  chap = $.grep(tome.chapters, function(e){ return  e._id == arr[2] })[0]; 
  
  part = $.grep(chap.parts, function(e){ return  e._id == arr[3] })[0];   

  fact = $.grep(part.facts, function(e){ return  e._id == arr[4] })[0]; 
  partElt = $('.part_index[data-part ='+part.id+']'); 

  
   
   $scope.studiedPart = part.id
     
     $scope.context.taskText ='(nouvelle tâche pour cette section)';
     $scope.inspectorDisplaySrc='issues'

     window.setTimeout(function() {
 displayIssue(route, task, part, indicator);
        }, 10);
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


}
var RegXpURL =function(url){
  
  //URL : #course,chapter,part,fact;task@indicator
  
  var taskIndex =  url.indexOf(';'); 
  var indicatorIndex =  url.indexOf('@'); 
  

  var task =  0; 
  var indicator = 'ALL';
  var arr =url;
 
 if((taskIndex ==-1) && (indicatorIndex!=-1)){ 
 indicator =url.split('@'); 
arr = indicator[0];indicator =indicator[1]


 }

if((taskIndex!=-1) && (indicatorIndex ==-1)){
 task =url.split(';'); 
 //if(task.length == 1) task =task[0]  else {
  arr = task[0];task =task[1]
//}


 }

if((taskIndex!=-1) && (indicatorIndex!=-1)){
 
 var taskPos = url.lastIndexOf(';')
 var indicPos =  url.lastIndexOf('@');

 if(taskPos < indicPos){
  task =url.split(';');  
  arr = task[0];
  task =task[1];
  task =task.split('@'); 
  indicator =task[1];
  task =task[0]

 }
  else{
  indicator =url.split('@');  
  arr = indicator[0];
  
  indicator =indicator[1];
  indicator =indicator.split(';'); 
  task =indicator[1];
  indicator =indicator[0]

  }
 //if(task.length == 1) task =task[0]  else {
  
//}


 }

  var result = {'arr': arr, 'task' : task , 'indicator' : indicator};
  return result;
  
}

window.onresize = function(){reloadURL();}

var reloadURL =function(){
  var url = window.location.hash

window.setTimeout(function() {
loadURL(url) 
  
        }, 10);

}
var loadURL =function(url){

  if(url == window.location.hash)
   // $(window).trigger('hashchange')
 {
window.setTimeout(function() {
  goHome();
        }, 10);}
  else 
    {
      window.location.hash = url;
 window.setTimeout(function() {
  //$scope.$emit('content.changed');
  //$scope.$broadcast('content.reload');
  
        }, 10)
}
  ////$(':focus').blur();

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

  $scope.stopHover =  stopHover();
$scope.hoverElements = function(url){

   var currentUrl = location.hash.slice(1);
   if(url===currentUrl) {stopHover();return;}
 
    var element = resolveRoute(url); 
   
 
  var regExp = RegXpURL(url);
  
  var task =  regExp.task; 
  var indicator = regExp.indicator;

  var path = regExp.arr; 
  var arr = path.split(',');  
  var course  = $scope.course;
  var tome = -1;
  var chap = -1;
  var part  = -1;
  var partElt = -1;
  var fact  = -1;

$('#data-table').removeClass('hovered-table');
  if(arr.length<2) 
    
      {
      //  displayCourseInfos(indicator, task);
      $('#divHoverOverlay').css('visibility','hidden');
      $('#data-table').addClass('hovered-table');
     
    };

  /********************************hhhhhhhhhhhhhhhh***********/

 if(arr.length ==2) {  

   var tome = $.grep(course.tomes, function(e){ return  e._id == arr[1] })[0]; 
   var partElt = $('.tome_index[data-part ='+tome.id+']')[0];
   
   var index = $(partElt).index() + 1;

  var rowTop = $('.tomes-header> th:nth-child('+index+')').offset();
  var topTop = rowTop.top;
  var left = rowTop.left;

  var oneWidth = $('.tomes-header> th:nth-child('+index+')').innerWidth();
  var height = $('.data-table').innerHeight() ;


  var rowBottom = $('.data-table tbody tr:last-child > td:nth-child('+index+')').offset();
  var topBottom = rowBottom.top;

  $('#divHoverOverlay').offset({top:topTop - 3 ,left:left - 2});
  $('#divHoverOverlay').height(height);
  $('#divHoverOverlay').width(oneWidth);
  $('#divHoverOverlay').css('visibility','visible');
  $('#divHoverOverlay').delay(500).slideDown('fast');
   
 }


 if(arr.length ==3) {  
  var tome = $.grep(course.tomes, function(e){ return  e._id == arr[1] })[0];   
   var chap = $.grep(tome.chapters, function(e){ return  e._id == arr[2] })[0]; 

   var partElt = $('.chapter_index[data-part ='+chap.id+']')[0];
   
    var index = $(partElt).index() + 1;
      var rowTop = $('.chapters-header> th:nth-child('+index+')').offset();
  var topTop = rowTop.top;
  var left = rowTop.left;

  var oneWidth = $('.chapters-header> th:nth-child('+index+')').innerWidth();
  var height = $('.data-table').innerHeight() - $('.tomes-header th:first').innerHeight();


  var rowBottom = $('.data-table tbody tr:last-child > td:nth-child('+index+')').offset();
  var topBottom = rowBottom.top;

  $('#divHoverOverlay').offset({top:topTop - 3 ,left:left - 2});
  $('#divHoverOverlay').height(height);
  $('#divHoverOverlay').width(oneWidth);
  $('#divHoverOverlay').css('visibility','visible');
  $('#divHoverOverlay').delay(500).slideDown('fast');


   
 }


 if(arr.length ==4 ) { 

  var tome = $.grep(course.tomes, function(e){ return  e._id == arr[1] })[0]; 
  var chap = $.grep(tome.chapters, function(e){ return  e._id == arr[2] })[0]; 
  var part = $.grep(chap.parts, function(e){ return  e._id == arr[3] })[0]; 
  var partElt = $('.part_index[data-part ='+part.id+']'); 
  var index = $(partElt).index() + 1;
   

  var rowTop = $('.parts-header > th:nth-child('+index+')').offset();
var topTop = rowTop.top;
var left = rowTop.left;

var oneWidth = $('.data-table tbody tr:last-child > td:nth-child('+index+')').innerWidth();
var height = $('.data-table').innerHeight() - $('.chapters-header th:first').innerHeight() - 
              $('.tomes-header th:first').innerHeight();


var rowBottom = $('.data-table tbody tr:last-child > td:nth-child('+index+')').offset();
var topBottom = rowBottom.top;

 $('#divHoverOverlay').offset({top:topTop -2 ,left:left - 2});
  $('#divHoverOverlay').height(height);
  $('#divHoverOverlay').width(oneWidth);
  $('#divHoverOverlay').css('visibility','visible');
$('#divHoverOverlay').delay(500).slideDown('fast');
  
  
}



}

var showTasksAndFacts = function(element, indicator, task_id){  
  
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

    if(task_id != 0){
      
 var selection = $.grep($scope.context.subtasks, function(e){ return  e._id == task_id})[0];
selection.selected ='selectedTask';
$('.selectedTask').focus().blur().focus();
        window.setTimeout(function() {
          selection.selected ='selectedTask';
          $('.selectedTask').focus().blur().focus();
        }, 10);        
    }
   

}
var displayIssue =function(url, task, part, indicator){   
  //$(':focus').blur(); 
  resetPath();
  var regExp = RegXpURL(url); 
  url =regExp.arr;
     $scope.context.route = url;     
  var element = resolveRoute(url);

  var nb = $('.td_issue[data-path ="'+url+'"]').find('.display-part-issues').text() ;
     if(nb ==0) nb ="aucune (0) remarque";
     if(nb ==1) nb ="une (1) remarque";
      if(nb>1) nb =nb+" problèmes potentiels";

  var parentUrl = url.substr(0, url.lastIndexOf(','))+'@'+indicator; 
  $('.td_issue[data-path ="'+parentUrl+'"]').addClass('chosenPart');
  $scope.context.Facts =computeSubFacts(resolveRoute(parentUrl), indicator);
  $('.inspector-item[data-fact ="'+element._id+'"]').addClass('inspector-item-selected');

  showTasksAndFacts(element, indicator, task);  
  
    $scope.barchartData = [element.d3];
  
 
$("#inspectorScroller").scrollTop(0);
$("#inspectorScroller").perfectScrollbar('update');



  
  }

var displayChapterIssues =function(url, task, chapter, indicator){  
 
  resetPath();


  var regExp = RegXpURL(url); 
  url =regExp.arr+'@'+regExp.indicator; 

 
      $('.td_issue[data-path ="'+url+'"]').addClass('chosenPart');

      

     
     $scope.context.route = url;     
var element = resolveRoute(url);
     

     $scope.context.Tasks =element.todos; 
     $scope.context.Facts =computeSubFacts(element, indicator);

var nb = $('.td_issue[data-path ="'+url+'"]').find('.display-part-issues').text() ;
     if(nb ==0) nb ="aucune (0) remarque  relative ";
     if(nb ==1) nb ="une (1) remarque relative ";
      if(nb>1) nb =nb+" problèmes potentiels relatifs ";

      
 var txt = $.grep($scope.indicatorsHeader, function(e){ return  e.code ==indicator})[0].inspectorText;
     $scope.context.inspector_title = chapter.title+' - Remarque relative '+ txt ;
     $scope.context.url = chapter.url
  showTasksAndFacts(element, indicator, task);

  
  
    }

var displayPartIssues =function(url, task, part, indicator){   
  
  //$(':focus').blur();
 
  resetPath();


  var regExp = RegXpURL(url); 
  url =regExp.arr+'@'+regExp.indicator; 

 
      $('.td_issue[data-path ="'+url+'"]').addClass('chosenPart');

      

     
     $scope.context.route = url;     
var element = resolveRoute(url);
     

     $scope.context.Tasks =element.todos;
     $scope.context.Facts =computeSubFacts(element, indicator);
     $scope.context.importantFacts = $.grep($scope.context.Facts, function(e){ return  e.issueCode in {'RVminVisit':'','RminDuration':'','RRermax':'','TransProvShiftNext':'','TransDestPast':'','StopRSExit':''} }); 
 $scope.context.otherFacts = $.grep($scope.context.Facts, function(e){ return  !(e.issueCode in {'RVminVisit':'','RminDuration':'','RRermax':'','TransProvShiftNext':'','TransDestPast':'','StopRSExit':''}) }); 

     
     
var nb = $('.td_issue[data-path ="'+url+'"]').find('.display-part-issues').text() ;
     if(nb ==0) nb ="aucune (0) remarque  relative ";
     if(nb ==1) nb ="une (1) remarque relative ";
      if(nb>1) nb =nb+" problèmes potentiels relatifs ";
 var txt = (indicator ==='Readings')?'à la lecture':
                (indicator ==='Rereading')?'à la relecture':
                (indicator ==='Transition')?'à la navigation' :'aux arrêts et reprises de la lecture';
     $scope.context.inspector_title = "Section : "+ part.title+' - '+nb+ txt ;
     $scope.context.url = part.url
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


var selectTome =function(index){  
  var rowTop = $('.tomes-header> th:nth-child('+index+')').offset();
  var topTop = rowTop.top;
  var left = rowTop.left;

  var oneWidth = $('.tomes-header> th:nth-child('+index+')').innerWidth();
  var height = $('.data-table').innerHeight() ;


  var rowBottom = $('.data-table tbody tr:last-child > td:nth-child('+index+')').offset();
  var topBottom = rowBottom.top;

  $('#divOverlay').offset({top:topTop - 3 ,left:left - 2});
  $('#divOverlay').height(height);
  $('#divOverlay').width(oneWidth);
  $('#divOverlay').css('visibility','visible');
  $('#divOverlay').delay(500).slideDown('fast');

}


var selectChapter =function(index){  
  var rowTop = $('.chapters-header> th:nth-child('+index+')').offset();
  var topTop = rowTop.top;
  var left = rowTop.left;

  var oneWidth = $('.chapters-header> th:nth-child('+index+')').innerWidth();
  var height = $('.data-table').innerHeight() - $('.tomes-header th:first').innerHeight();


  var rowBottom = $('.data-table tbody tr:last-child > td:nth-child('+index+')').offset();
  var topBottom = rowBottom.top;

  $('#divOverlay').offset({top:topTop - 3 ,left:left - 2});
  $('#divOverlay').height(height);
  $('#divOverlay').width(oneWidth);
  $('#divOverlay').css('visibility','visible');
  $('#divOverlay').delay(500).slideDown('fast');

}

var selectPart =function(index){
var rowTop = $('.parts-header > th:nth-child('+index+')').offset();
var topTop = rowTop.top;
var left = rowTop.left;

var oneWidth = $('.parts-header > th:nth-child('+index+')').innerWidth();
var height = $('.data-table').innerHeight() - $('.chapters-header th:first').innerHeight() - $('.tomes-header th:first').innerHeight();



 $('#divOverlay').offset({top:topTop -2 ,left:left - 2});
  $('#divOverlay').height(height);
  $('#divOverlay').width(oneWidth);
  $('#divOverlay').css('visibility','visible');
$('#divOverlay').delay(500).slideDown('fast');
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

$scope.inspectorDisplaySrc='section'
  window.setTimeout(function() {
    resetPath();
    //$(':focus').blur();
    selectPart($(partElt).index() + 1);
    
    
  }, 10);
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

var times =[], users =[], rss =[], rereadings_tx =[], stops =[];

angular.forEach(element.chapters, function(chapter){
angular.forEach(chapter.parts, function(part){
  times.push(parseInt(part.properties.filter(function(value){ return value.property === 'mean.duration'})[0].value)); 
  users.push(100*part.properties.filter(function(value){ return value.property === 'Readers_tx'})[0].value);
  rss.push(100*part.properties.filter(function(value){ return value.property === 'RS_tx'})[0].value);
  var reads = parseInt(part.properties.filter(function(value){ return value.property === 'Readings'})[0].value);
  var rereads = parseInt(100*part.properties.filter(function(value){ return value.property === 'rereadings_tx'})[0].value);
  rereadings_tx.push(rereads);
  stops.push(parseInt(100*part.properties.filter(function(value){ return value.property === 'rupture_tx'})[0].value));
  })
});
var nrs = parseInt($scope.course.stats.filter(function(value){ return value.property === 'nRS'})[0].value);

var sec_num = d3.sum(times); 
    var minutes = Math.floor(sec_num  / 60);
    var seconds = sec_num -  (minutes * 60);
    var meanTime    = minutes+' h '+seconds+' min';
    if (minutes == 0) meanTime = seconds+' minutes';

    var nrs = parseInt($scope.course.stats.filter(function(value){ return value.property === 'nRS'})[0].value);
    var stopTx = Math.floor(Math.round(d3.mean(stops),2))+'%';

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

$scope.observedElt ={'type':'tome',
      'id':element.id,
      'typeTxt': 'cette partie',
      'nbUsers':parseInt(100*element.properties.filter(function(value){ return value.property === 'Readers_tx'})[0].value)+'%',
      'nbRS':Math.round(100*element.properties.filter(function(value){ return value.property === 'RS_tx'})[0].value,2)+'%',
      'Actions_tx':Math.round(100*element.properties.filter(function(value){ return value.property === 'Actions_tx'})[0].value,2)+'%',
      'meanTime': meanTime,
      'meanRereads':Math.floor(d3.mean(rereadings_tx),2)+'%',
      'meanStops':parseInt(100*element.properties.filter(function(value){ return value.property === 'rupture_tx'})[0].value)+'%',
      'maxProvPercent':d3.max(provData, function(d) { return d.value; }),
      'maxProvTxt':$.grep(provData, function(e){ return  e.value === d3.max(provData, function(d) { return d.value; })})[0].text,
      'maxDestPercent':d3.max(destData, function(d) { return d.value; }),
      'maxDestTxt':$.grep(destData, function(e){ return  e.value === d3.max(destData, function(d) { return d.value; })})[0].text,
      'provLinearity':provData.filter(function(value){ return value.property === 'precedent'})[0].value+'%',
      'destLinearity':destData.filter(function(value){ return value.property === 'next_p'})[0].value+'%'
    }; 
$scope.context.inspector_title = "Partie : "+element.title

$scope.context.url = element.url
$scope.inspectorDisplaySrc='component'
window.setTimeout(function() {
    resetPath();
    //$(':focus').blur();
    selectTome($(partElt).index() + 1);
    
  }, 10);

    
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
window.setTimeout(function() {
    resetPath();
    //$(':focus').blur();
    selectChapter($(partElt).index() + 1);
    $scope.inspectorDisplaySrc='component'
  }, 10);
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

  var rt = route+';'+task._id;
  if(task.classof!=='ALL') rt = rt + '@'+task.classof
  loadURL(rt);
 
}

$scope.editSuggestion =function($event, suggestion){
  $scope.formData = suggestion;   

  window.setTimeout(function() {
           $("#taskEditor").trigger( "click" );
           $(".editable-input ").fadeIn(100).fadeOut(100).fadeIn().focus().select();
        }, 500);



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
            'color':parseInt(factedPartID) ===parseInt(chapter.id)?'#45348A':'grey'
          })
        angular.forEach(chapter.parts, function(part){
          chartData.push({'part':part.id,
            'title':part.title,
             'elementType':'part',
            'route':part.route,
            'value': parseFloat(part.properties.filter(function(value){ return  value.property === issueCode})[0].value),
            'color':parseInt(factedPartID) ===parseInt(part.id)?'#45348A':'grey'
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
      $(element).slideDown(500, function() {
        done();
      });
    }
  }
});