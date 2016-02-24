'use strict';

angular.module('mean.courses')
  .config(['$viewPathProvider',
   function($viewPathProvider) {
    $viewPathProvider.override('system/views/index.html', 'courses/views/index.html');
   }
]);




var app=angular.module('mean.courses').controller('CoursesController', ['$scope', '$rootScope','$stateParams', '$location', '$http','Global', 'Courses', 'MeanUser', 'Circles','$http','$uibModal',
  function($scope, $rootScope, $stateParams, $location, $http, Global, Courses, MeanUser, Circles) {
    $scope.global = Global;


 $scope.findOne = function() {

  $scope.d3opts = [];
  $scope.dataLoading = true;
  $scope.pageLoaded = false;
  $(window).unbind('hashchange');


  $scope.observedElt={}

     $('table').hide();
     $scope.inspectorShow = 'course';
     $scope.indicatorInspectorShow = 'course';;
      $scope.courseParts=[];
      $scope.courseChapters=[];
      $scope.context = {};
      $scope.course={}
      $scope.formData='';
      $scope.textBtnForm='';
      $scope.chartType = 'Actions_nb';
      $scope.chartedElement = {};
      $scope.factChart={};
      $scope.componentChart={};

      $scope.readingChartSelector = 'Actions_nb';
      $scope.rereadingChartSelector = 'Rereadings';
      $scope.stopChartSelector = 'rupture';
      $scope.achievementSelector = 'mean.achievement';
      $scope.rsSelector = 'nparts';
      $scope.topSelector = 'Actions_nb';
      $scope.sectionPstatSelector = 'Actions_nb';
  
      Courses.get({
        courseId: $stateParams.courseId
      }, function(course) {
     
        $scope.course = course;
        $scope.chartType = 'Actions_nb';
        $scope.chartedElement = course;
  
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
              'd3':[],
              'achievement':{'mean.achievement':course.stats.filter(function(value){ return value.property === 'mean.achievement'})[0].value,
                             'median.achievement':course.stats.filter(function(value){ return value.property === 'median.achievement'})[0].value,
                              }
            };

    
    $scope.context.subtasks=computeAllTasks();
    $scope.context.d3 = ComputeGlobalVisuData();
    $scope.context.d3.stats =courseFactsStat();
    $scope.context.Tops = computeTopParts();

   

    
     
    /********  Update on @ change ****************/
$(window).bind('hashchange',function(){ 
  loadContext();
});
      

    if($('.course_title_top').length<1)
        $('.navbar-brand').after('<a role="button" href="#" ng-click="resetPath();goHome()" class="course_title_top"> <span class="glyphicon glyphicon-book"></span>  <em>'+$scope.course.title+'</em></a>');

       window.setTimeout(function() {
          loadContext(); 
          $('table').show();
          reloadURL(); 

        }, 50);


       
$scope.dataLoading = false;
$scope.pageLoaded = true;
    
      });
    };


var courseFactsStat = function(){
  

var facts=[];


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



  
var completeCourseParts=function(course, courseParts, courseChapters){
  var course_route = course._id;
  angular.forEach(course.tomes, function(tome) {
    tome.parts_count = 0;
    tome.route=course_route+','+tome._id
    angular.forEach(tome.chapters, function(chapter) { 
      chapter.parts_count = 0;
      chapter.route=tome.route+','+chapter._id
      angular.forEach(chapter.parts, function(part) {
        part.parent = chapter._id;
        tome.parts_count = tome.parts_count + 1;
        chapter.parts_count = chapter.parts_count + 1;
        part.route=chapter.route+','+part._id;
        angular.forEach(part.facts,function(fact){
          fact.route=part.route+','+fact._id;
          fact.d3=[];
          //fact.d3={'part':part.route, 'chapter':chapter.route,'tome':tome.route};
          appendD3Facts(fact,part.id,chapter.route);

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
        taskIndicator=regExp.indicator;
      
      
 var todo = $.grep(result.todos, function(e){ return  e._id == taskId })[0];
      result = todo;
         
     }

     return result;
}
var resetPath=function(){    
  $('.chosenPart').removeClass('chosenPart'); 
  $('.data-table').removeClass('highlight-table');
  $('#divOverlay').css('visibility','hidden');
  $('.inspector-item-selected').removeClass('inspector-item-selected');
    for (var i = 0; i < $scope.context.subtasks.length; i++)   
      {$scope.context.subtasks[i].selected = 'notRelevantTask' }


}

var parseTask=function(path, content){

   var regExp = RegXpURL(path);
  
  
  var taskId = regExp.task;
  var indicator = regExp.indicator;

  path = regExp.arr;

  var arr = path.split(','); 
  var courseId = $scope.course._id;
  var tomeId = 0;
  var chapId = 0;
  var partId=0;
  var factId=0;
 
  if(arr.length>=2)   tomeId =  arr[1] ;
  if(arr.length>=3)   chapId =  arr[2] ;
  if(arr.length>=4)   partId =  arr[3] ;
  if(arr.length>=5)   factId =  arr[4] ;


  
 var route = courseId+'/'+tomeId+'/'+chapId+'/'+partId+'/'+factId;
 var todo ={'classof':indicator, 'todo':content,'elementType':'todo'}

  return {'route':route, 'todo':todo}
}
var deparseTask=function(route){
  var regExp = RegXpURL(route);
    var taskId =  regExp.task;  
    var taskIndicator=regExp.indicator;  
    var path = regExp.arr

  var arr = path.split(','); 
  var courseId = $scope.course._id;
  var tomeId = 0;
  var chapId = 0;
  var partId=0;
  var factId=0;
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

var parseRequest=function(path){

  var arr = path.split(','); 
  var courseId = $scope.course._id;
  var tomeId = 0;
  var chapId = 0;
  var partId=0;
  var factId=0;
 
  if(arr.length>=2)   tomeId =  arr[1] ;
  if(arr.length>=3)   chapId =  arr[2] ;
  if(arr.length>=4)   partId =  arr[3] ;
  if(arr.length>=5)   factId =  arr[4] ;
  
 var result = courseId+'/'+tomeId+'/'+chapId+'/'+partId+'/'+factId;
  return result
}

var parseTaskRequest=function(path){
var regExp = RegXpURL(path);
var taskId =  regExp.task; 
var taskIndicator=regExp.indicator;

  path =  regExp.arr; 
  
  var arr = path.split(','); 
  var courseId = $scope.course._id;
  var tomeId = 0;
  var chapterId = 0;
  var partId=0;
  var factId=0;
  
  var route = courseId;
  var scope = 'course';
 
  if(arr.length>=2)   tomeId =  arr[1] ;
  if(arr.length>=3)   chapterId =  arr[2] ;
  if(arr.length>=4)   partId =  arr[3] ;
  if(arr.length>=5)   factId =  arr[4] ;

if(tomeId==0){
route=route+'/'+taskId;
}
else
  if(chapterId==0){
    route=route+'/'+tomeId+'/'+taskId;
  }
  else
    if(partId==0){
      route = route+'/'+tomeId+'/'+chapterId+'/'+taskId;
      scope='chapter';
    }
    else
      {
        if(factId==0){
          route = route+'/'+tomeId+'/'+chapterId+'/'+partId+'/'+taskId;
          scope='part';
        }
        else{
          route = route+'/'+tomeId+'/'+chapterId+'/'+partId+'/'+factId+'/'+taskId;
          scope='fact';
        }
      }
  
  return {'route':route, 'scope':scope}
}


var computeTopParts=function(){ 
 
var partsData=[]
angular.forEach($scope.course.tomes, function(tome) {  
  angular.forEach(tome.chapters, function(chapter) {  
    angular.forEach(chapter.parts, function(part) {
      part.properties.filter(function(value){ return value.property === 'Actions_nb'})[0].value
      partsData.push({
                        'title':part.title+' (Section '+part.id+' )',
                        'Actions_nb':parseInt(part.properties.filter(function(value){ return value.property === 'Actions_nb'})[0].value),
                        'Readers':parseInt(part.properties.filter(function(value){ return value.property === 'Readers'})[0].value),
                        'RS_nb':parseInt(part.properties.filter(function(value){ return value.property === 'RS_nb'})[0].value)
                      })
          
                
              
    })                                 
  })
})

partsData= partsData.sort(function(x, y){
   return d3.descending(x.Actions_nb, y.Actions_nb);
})
var Actions_nb = partsData.slice(0,3);
var topActions_nb=Actions_nb.map(function(o){return o.title;})

partsData= partsData.sort(function(x, y){
   return d3.descending(x.Readers, y.Readers);
})
var Readers = partsData.slice(0,3);
var topReaders=Readers.map(function(o){return o.title;})


partsData= partsData.sort(function(x, y){
   return d3.descending(x.RS_nb, y.RS_nb);
})
var RS_nb = partsData.slice(0,3);
var topRS_nb=RS_nb.map(function(o){return o.title;})

return{'Actions_nb':topActions_nb, 'Readers':topReaders,'RS_nb':topRS_nb}

}
var computeAllTasks=function(){ 
 var tasks=angular.copy($scope.course.todos);
 for (var i = 0; i < tasks.length; i++)   
      {
        tasks[i].selected = 'relevantTask' 
        tasks[i].route=$scope.course._id+',0,0,0,0;'+tasks[i]._id+'@'+tasks[i].classof
        tasks[i].minipath='Cours'
      } 
angular.forEach($scope.course.tomes, function(tome) { 
    var tomeTasks = angular.copy(tome.todos);
    for (var i = 0; i < tomeTasks.length; i++){
    tomeTasks[i].route=tome.route+',0,0,0;'+tomeTasks[i]._id+'@'+tomeTasks[i].classof
    tomeTasks[i].minipath='Partie :'+tome.title
    tasks.push(tomeTasks[i]);
  } 

    angular.forEach(tome.chapters, function(chapter) {  
 var chTasks = angular.copy(chapter.todos);
      for (var i = 0; i < chTasks.length; i++){
        chTasks[i].route=chapter.route+',0,0;'+chTasks[i]._id+'@'+chTasks[i].classof
        chTasks[i].minipath='Chapitre :'+chapter.title
        tasks.push(chTasks[i]);

      } 
            angular.forEach(chapter.parts, function(part) {
           var partTasks = angular.copy(part.todos);
                for (var i = 0; i < partTasks.length; i++){
                  partTasks[i].route=part.route+',0;'+partTasks[i]._id+'@'+partTasks[i].classof
                  partTasks[i].minipath='Section: '+part.title;
                  tasks.push(partTasks[i]);
                }
                  angular.forEach(part.facts, function(fact){
               var factTasks = angular.copy(fact.todos);
                    for(var i = 0; i<factTasks.length; i++){ 
                  var txt = (fact.classof==='Readings')?'Lecture':
                            (fact.classof==='Rereading')?'Relecture':
                               (fact.classof==='Transition')?'Transition' :'Arrêts';
                      
                      factTasks[i].route=fact.route+';'+factTasks[i]._id+'@'+factTasks[i].classof
                       factTasks[i].minipath='Section: '+part.title+' - ' +txt; 
                      tasks.push(factTasks[i]);}
                  })
                  })
                                 
            });
});

  for (var i = 0; i < tasks.length; i++)   
    tasks[i].selected = 'relevantTask';

  return tasks

}


var computeSubFacts=function(element, indicator){  
  
  
  var facts  = $.grep(element.facts, function(e){ return  e.classof==indicator}); 
 
  return facts

}



var computeAllFacts=function(element, indicator){
  var type = element.elementType;
  var facts=[];

  /*******Course******/
 if(type=='course'){     
  for (var i = 0; i < facts.length; i++)   
      {facts[i].source = element.route; facts[i].sourceTitle = 'Course'; }
    angular.forEach(element.chapters, function(chapter) {  
 var chFacts = angular.copy(chapter.facts);
      for (var i = 0; i < chFacts.length; i++){
        chFacts[i].source = chapter.route;
        chFacts[i].sourceTitle = 'Chapter :'+chapter.title;
        facts.push(chFacts[i]);
      } 
            angular.forEach(chapter.parts, function(part) {
           var partFacts = angular.copy(part.facts);
                for (var i = 0; i < partFacts.length; i++){
                  partFacts[i].source = part.route;
                  partFacts[i].sourceTitle = 'Part  : '+part.title;
                  facts.push(partFacts[i]);
                 }                
            });
        
        });
    
  }

  /******Grande Partie*******/
  if(type=='partie'){    
    for (var i = 0; i < facts.length; i++)   {facts[i].source = element._id; facts[i].sourceTitle = 'This Part';}
    angular.forEach(element.chapters, function(chapter) {
      angular.forEach(chapter.parts, function(part) {
   var partFacts = angular.copy(part.facts);
                  for (var i = 0; i < partFacts.length; i++){
                    partFacts[i].source = part.route;
                    partFacts[i].sourceTitle = 'Part : '+part.title;
                    facts.push(partFacts[i]);
                   }                
            });
    });
  $scope.context.inspector_title = "Partie: "+element.title +" - " +facts.length +" problèmes potentiels";
  }

  /******Chapter*******/
  if(type=='chapitre'){    
    for (var i = 0; i < facts.length; i++)   {facts[i].source = element._id; facts[i].sourceTitle = 'This chapter';}
    angular.forEach(element.parts, function(part) {
 var partFacts = angular.copy(part.facts);
                for (var i = 0; i < partFacts.length; i++){
                  partFacts[i].source = part.route;
                  partFacts[i].sourceTitle = 'Part : '+part.title;
                  facts.push(partFacts[i]);
                 }                
    });
  $scope.context.inspector_title = "Chapitre: "+element.title +" - " +facts.length +" problèmes potentiels";
  }
  /******Part*******/
  if(type=='section'){
    facts=angular.copy(element.facts);
    $scope.context.inspector_title = "Section: "+element.title +" - " +facts.length +" problèmes potentiels";
    for (var i = 0; i < facts.length; i++)   {facts[i].source = element.route; facts[i].sourceTitle = 'This part';}
      
  }

  return facts

}

var CountSubFacts=function(element){
  var type = element.elementType;
  var count = element.todos.length;
  var type = 'Section '

  /*******Course******/
 if(type=='course'){       
  angular.forEach(element.tomes, function(tome) { 
      count = count +  tome.facts.length;
      angular.forEach(tome.chapters, function(chapter) { 
        count = count +  chapter.facts.length;
        angular.forEach(chapter.parts, function(part) {
          count = count + part.facts.length
        });
      });
    });
    type = "Cours ";
  }

  /******Tome*******/
  angular.forEach(element.chapters, function(chapter) { 
        count = count +  chapter.facts.length;
        angular.forEach(chapter.parts, function(part) {
          count = count + part.facts.length
        });
        type = "Partie ";
      });
  /******Chapter*******/
   if(type=='chapitre'){       
    angular.forEach(element.parts, function(part) { 
      count = count +  part.facts.length;
    });
    type = "Chapitre ";
  }
  

  return {'type':type, 'count':count}

}

var goHome=function(){ 

  window.location.hash = '#';
  
}
$scope.goHome=function(){
  goHome();
}


$scope.taskContexter= function(task,$event) {
  var element = deparseTask(task.route);
  loadURL(element);

  $($event.currentTarget).parent().blur();
  $($event.currentTarget).parent().focus();

};

var addTask = function(route,params) {
        return $http.post('/api/tasks/add/'+route,params);
      };
var  deleteTask = function(params) {
        if(params.scope=='course')
          return $http.delete('/api/course/tasks/delete/'+params.route);  
        if(params.scope=='partie')
          return $http.delete('/api/tome/tasks/delete/'+params.route);  
        if(params.scope=='chapitre')
          return $http.delete('/api/chapter/tasks/delete/'+params.route);  
        if(params.scope=='section')
          return $http.delete('/api/part/tasks/delete/'+params.route);  
      };
var editTask = function(params, task) {        
        if(params.scope=='course')          
          return $http.post('/api/course/tasks/edit/'+params.route, task);  
        if(params.scope=='partie')
          return $http.post('/api/tome/tasks/edit/'+params.route, task);  
        if(params.scope=='chapitre')
          return $http.post('/api/chapter/tasks/edit/'+params.route, task);  
        if(params.scope=='section')
          return $http.post('/api/part/tasks/edit/'+params.route, task);  
      };
var getTasks = function(courseId, partId, todoData) {  
      if(courseId == partId) partId=0;      
        return $http.get('/api/tasks/get/'+courseId+'/'+partId)
        };
      
var filterTasks = function(studiedPart) {
          return studiedPart.todos;
      };

/********************************************/
var loadContext = function(){
   var url = location.hash.slice(1);
 
    var element = resolveRoute(url);

   $scope.context.route= url;
   
   $scope.context.Tasks=element.todos; 
   
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
        displayCourseInfos(indicator, task);
        $scope.context.taskText='(nouvelle tâche globale)';
/*
        if(indicator==='Readings') elementStatsChart(course);
        if(indicator==='Rereading') indicatorRereadingChart(course);
        if(indicator==='Stop') indicatorStopChart(course);
        if(indicator==='Transition') transitionStopChart(course);*/
    };

  /********************************hhhhhhhhhhhhhhhh***********/

 if(arr.length==2) {  

   tome = $.grep(course.tomes, function(e){ return  e._id == arr[1] })[0]; 
   partElt = $('.tome_index[data-part='+tome.id+']')[0];
   $scope.context.taskText='(nouvelle tâche pour cette partie)';
   
   //displayChapterInfos(partElt, task);
   displayTomeInfos(partElt, task);
   
 }


 if(arr.length==3) {  
  tome = $.grep(course.tomes, function(e){ return  e._id == arr[1] })[0];   
   chap = $.grep(tome.chapters, function(e){ return  e._id == arr[2] })[0]; 

   partElt = $('.chapter_index[data-part='+chap.id+']')[0];
   
   displayChapterInfos(partElt, task);
   $scope.context.taskText='(nouvelle tâche pour ce chapitre)';
   
 }


 if(arr.length==4 && indicator=="ALL") { 
  tome = $.grep(course.tomes, function(e){ return  e._id == arr[1] })[0]; 
  chap = $.grep(tome.chapters, function(e){ return  e._id == arr[2] })[0]; 
  part = $.grep(chap.parts, function(e){ return  e._id == arr[3] })[0]; 
  partElt = $('.part_index[data-part='+part.id+']'); 
  displayPartInfos(partElt, task);
  $scope.context.taskText='(nouvelle tâche pour cette section)';
  
}
if(arr.length==4 && indicator!="ALL") { 
  tome = $.grep(course.tomes, function(e){ return  e._id == arr[1] })[0]; 
  chap = $.grep(tome.chapters, function(e){ return  e._id == arr[2] })[0]; 
  part = $.grep(chap.parts, function(e){ return  e._id == arr[3] })[0]; 
  partElt = $('.part_index[data-part='+part.id+']'); 
  displayPartIssues(route, task, part, indicator);
  $scope.context.taskText='(nouvelle tâche pour cette section)';
}


if(arr.length==5) {   
  tome = $.grep(course.tomes, function(e){ return  e._id == arr[1] })[0]; 
  chap = $.grep(tome.chapters, function(e){ return  e._id == arr[2] })[0]; 
  part = $.grep(chap.parts, function(e){ return  e._id == arr[3] })[0];   

  fact = $.grep(part.facts, function(e){ return  e._id == arr[4] })[0]; 
  partElt = $('.part_index[data-part='+part.id+']'); 
   
     displayIssue(route, task, part, indicator);
     $scope.context.taskText='(nouvelle tâche pour cette section)';
}
/*************************************************/
  var totalWidth = $('.col-lg-9').width();
        $('.data-table').css('width',totalWidth);
        $('th').css('overflow','hidden');
        $('.indicators-header').css('width','50px');
   var nbP = $scope.course.parts.length;
        if (nbP<=0) nbP = 1;
        if (nbP>40) nbP=40;
   var tdW = (totalWidth - 50)/nbP; 
        
        
        $('.data-table td').each(function() {
   
    $(this).css('min-width', 20);     // css attribute of your <td> width:15px; i.e.
    $(this).css('max-width', 20);     // css attribute of your <td> width:15px; i.e.
});
       // $scope.width=tdW;
        //$('.data-table td').css('width',tdW+'px!important');
        //$('.data-table td').css('display','table');
      //  $('.data-table td').attr('width',tdW)
        
        if($('.course_title_top').length<1)
                $('.navbar-brand').after('<a role="button" href="#" ng-click="resetPath();goHome()" class="course_title_top"> <span class="glyphicon glyphicon-book"></span>  <em>'+$scope.course.title+'</em></a>');
  
  $('.tableScroller').scroll();

}

var scale = chroma.scale('OrRd');
$scope.computeBgColor=function(val){

  return   scale(val/5).hex();
}

$scope.computeTextColor=function(val){
  if(val==0) return 'rgb(34, 34, 34)';
  if(val==1) return '#354831';
  if(val==2) return '#716F6F';
  if(val==3) return '#F5F5F5';
  if(val>=4) return 'white';
}

var RegXpURL =function(url){
  
  //URL : #course,chapter,part,fact;task@indicator
  
  var taskIndex =  url.indexOf(';'); 
  var indicatorIndex =  url.indexOf('@'); 
  

  var task =  0; 
  var indicator = 'ALL';
  var arr=url;
 
 if((taskIndex==-1) && (indicatorIndex!=-1)){ 
 indicator=url.split('@'); 
arr = indicator[0];indicator=indicator[1]


 }

if((taskIndex!=-1) && (indicatorIndex==-1)){
 task=url.split(';'); 
 //if(task.length == 1) task=task[0]  else {
  arr = task[0];task=task[1]
//}


 }

if((taskIndex!=-1) && (indicatorIndex!=-1)){
 
 var taskPos = url.lastIndexOf(';')
 var indicPos =  url.lastIndexOf('@');

 if(taskPos < indicPos){
  task=url.split(';');  
  arr = task[0];
  task=task[1];
  task=task.split('@'); 
  indicator=task[1];
  task=task[0]

 }
  else{
  indicator=url.split('@');  
  arr = indicator[0];
  
  indicator=indicator[1];
  indicator=indicator.split(';'); 
  task=indicator[1];
  indicator=indicator[0]

  }
 //if(task.length == 1) task=task[0]  else {
  
//}


 }

  var result = {'arr': arr, 'task' : task , 'indicator' : indicator};
  return result;
  
}

window.onresize = function(){reloadURL();}

var reloadURL =function(){
  var url = window.location.hash
window.setTimeout(function() {
goHome();
        }, 20);

window.setTimeout(function() {
loadURL(url) 
  
        }, 50);

}
var loadURL =function(url){

  if(url == window.location.hash)
   // $(window).trigger('hashchange')
 {
window.setTimeout(function() {
  goHome();
        }, 50);}
  else 
    {
      window.location.hash = url;
 window.setTimeout(function() {
  $scope.$emit('content.changed');
  $scope.$broadcast('content.reload');
  
        }, 50)
}
  $(':focus').blur();

  return false;

};

$scope.loadURL = loadURL;

$scope.triggerClick=function($event){ 

  var url = '#'+$($event.currentTarget).attr('data-path');
  
  loadURL(url); 
  
 }
 $scope.triggerFactClick=function($event){  
  var url = $($event.currentTarget).attr('data-path');
  loadURL(url); 
  
 }

var showTasksAndFacts = function(element, indicator, task_id){  
  
  if(indicator==='ALL'){
       angular.forEach(element.todos, function(todo){
   var results= $.grep($scope.context.subtasks, function(e){ return  e._id == todo._id})[0]
        if(typeof results !== 'undefined') results.selected='relevantTask';
      });
      angular.forEach(element.facts, function(fact){
        angular.forEach(fact.todos, function(todo){
   var results= $.grep($scope.context.subtasks, function(e){ return  e._id == todo._id})[0];
        if(typeof results !== 'undefined') results.selected='relevantTask';
      })
      });
    }
    else{
       angular.forEach(element.todos, function(todo){
 var results= $.grep($scope.context.subtasks, function(e){ return  e._id == todo._id && e.classof==indicator})[0]
      if(typeof results !== 'undefined') results.selected='relevantTask';
        });
        angular.forEach(element.facts, function(fact){
          angular.forEach(fact.todos, function(todo){
     var results= $.grep($scope.context.subtasks, function(e){ return  e._id == todo._id && e.classof==indicator})[0];
          if(typeof results !== 'undefined') results.selected='relevantTask';
        })
        });
    };

    if(task_id != 0){
      
 var selection = $.grep($scope.context.subtasks, function(e){ return  e._id == task_id})[0];
selection.selected='selectedTask';
$('.selectedTask').focus().blur().focus();
        window.setTimeout(function() {
          selection.selected='selectedTask';
          $('.selectedTask').focus().blur().focus();
        }, 300);        
    }
   

}
var displayIssue=function(url, task, part, indicator){   

  $(':focus').blur();
 
  resetPath();

  var regExp = RegXpURL(url); 
  url=regExp.arr;

     

$scope.inspectorShow = 'issue';

     
     $scope.context.route= url;     
var element = resolveRoute(url);

  var nb = $('.td_issue[data-path="'+url+'"]').find('.display-part-issues').text() ;
     if(nb==0) nb="aucune (0) remarque";
     if(nb==1) nb="une (1) remarque";
      if(nb>1) nb=nb+" problèmes potentiels";
     //$scope.context.inspector_title = "Section: "+ part.title+' - '+nb+ " de type "+indicator ;
    
      

  var parentUrl = url.substr(0, url.lastIndexOf(','))+'@'+indicator; 
  $('.td_issue[data-path="'+parentUrl+'"]').addClass('chosenPart');
  $scope.context.Facts=computeSubFacts(resolveRoute(parentUrl), indicator);
  $('.inspector-item[data-fact="'+element._id+'"]').addClass('inspector-item-selected');

  showTasksAndFacts(element, indicator, task);
  
  
    $scope.barchartData = [element.d3];
  
 
  

  
  }

var displayPartIssues=function(url, task, part, indicator){   
  
  $(':focus').blur();
 
  resetPath();


  var regExp = RegXpURL(url); 
  url=regExp.arr+'@'+regExp.indicator; 

 
      $('.td_issue[data-path="'+url+'"]').addClass('chosenPart');

      

     
     $scope.context.route= url;     
var element = resolveRoute(url);
     

     $scope.context.Tasks=element.todos;
     $scope.context.Facts=computeSubFacts(element, indicator);
     
     
var nb = $('.td_issue[data-path="'+url+'"]').find('.display-part-issues').text() ;
     if(nb==0) nb="aucune (0) remarque  relative ";
     if(nb==1) nb="une (1) remarque relative ";
      if(nb>1) nb=nb+" problèmes potentiels relatifs ";
 var txt = (indicator==='Readings')?'à la lecture':
                (indicator==='Rereading')?'à la relecture':
                (indicator==='Transition')?'à la navigation' :'aux arrêts et reprises de la lecture';
     $scope.context.inspector_title = "Section: "+ part.title+' - '+nb+ txt ;
  showTasksAndFacts(element, indicator, task);

  $scope.inspectorShow = 'issue';
    }

var selectIndictor=function(indicator){
  if(indicator==='ALL') 
    $('#data-table').addClass('highlight-table');
  else{
    var rowTop = $('.indicators-header[data-indicator="'+indicator+'"]').parent().offset();
    var topTop = rowTop.top;
    var left = rowTop.left;

    var width = $('.data-table').innerWidth() ;
    var height =  $('.indicators-header[data-indicator="'+indicator+'"]').innerHeight();


    var rowBottom = $('.data-table tbody tr:last-child').offset();
    var topBottom = rowBottom.top;

    $('#divOverlay').offset({top:topTop - 2 ,left:left - 2});
    $('#divOverlay').height(height);
    $('#divOverlay').width(width);
    $('#divOverlay').css('visibility','visible');
    $('#divOverlay').delay(500).slideDown('fast');    
  }  

}


var selectTome=function(index){  
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


var selectChapter=function(index){  
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

var selectPart=function(index){
var rowTop = $('.parts-header > th:nth-child('+index+')').offset();
var topTop = rowTop.top;
var left = rowTop.left;

var oneWidth = $('.data-table tbody tr:last-child > td:nth-child('+index+')').innerWidth();
var height = $('.data-table').innerHeight() - $('.chapters-header th:first').innerHeight() - $('.tomes-header th:first').innerHeight();


var rowBottom = $('.data-table tbody tr:last-child > td:nth-child('+index+')').offset();
var topBottom = rowBottom.top;

 $('#divOverlay').offset({top:topTop -2 ,left:left - 2});
  $('#divOverlay').height(height);
  $('#divOverlay').width(oneWidth);
  $('#divOverlay').css('visibility','visible');
$('#divOverlay').delay(500).slideDown('fast');
}
var displayPartInfos=function(partElt, task){
    resetPath();
    selectPart($(partElt).index() + 1);
    $(':focus').blur();
    
    
var part = $(partElt).attr('data-part');

    var route = $(partElt).attr('data-path');

    var element=resolveRoute(route);
    showTasksAndFacts(element, 'ALL', task);


var sec_num = parseInt(element.properties.filter(function(value){ return value.property === 'mean.duration'})[0].value, 10); 
    var minutes = Math.floor(sec_num  / 60);
    var seconds = sec_num -  (minutes * 60);
    var meanTime    = minutes+' min '+seconds+' s';
    if (minutes == 0) meanTime = seconds+' s';

    var reads = parseInt(element.properties.filter(function(value){ return value.property === 'Readings'})[0].value);
    var rereads = parseInt(element.properties.filter(function(value){ return value.property === 'Rereadings'})[0].value)
    var rereadTx = (rereads==0)?0:rereads/reads;    
    rereadTx = Math.floor(rereadTx * 100)+'%';

    var stop = parseInt(element.properties.filter(function(value){ return value.property === 'rupture'})[0].value);
    var nrs = parseInt($scope.course.stats.filter(function(value){ return value.property === 'nRS'})[0].value);
    var stopTx = Math.floor(100 * stop / nrs)+'%';
    

$scope.observedElt={'type':'Cette section ',
      'nbUsers':Math.round(100*element.properties.filter(function(value){ return value.property === 'Readers_tx'})[0].value,2)+'%',
      'nbRS':Math.round(100*element.properties.filter(function(value){ return value.property === 'RS_tx'})[0].value,2)+'%',
      'Actions_nb':parseInt(element.properties.filter(function(value){ return value.property === 'Actions_nb'})[0].value),
      'meanTime': meanTime,
      'meanRereads':rereadTx,
      'meanStops':stopTx
    };    

$scope.inspectorShow = 'section';
$scope.context.inspector_title = "Section: "+element.title
}

var displayCourseInfos=function(indicator, task){ 
  $scope.indicatorInspectorShow = indicator;
  resetPath(); 
  
  $scope.context.inspector_title = "Cours: "+$scope.course.title;// +" - " +$scope.context.subfacts.length +" problèmes potentiels";
    selectIndictor(indicator); 

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
var Actions_nb=0;

$scope.observedElt={'type':'Ce cours',
      'nbUsers':0,//$scope.course.properties.filter(function(value){ return value.property === 'Users_nb'})[0].value,
      'nbRS':$scope.course.properties.filter(function(value){ return value.property === 'RS_nb'})[0].value,
      'Actions_nb':$scope.course.properties.filter(function(value){ return value.property === 'Actions_nb'})[0].value
    };
  $scope.inspectorShow = 'course';

}


var displayTomeInfos=function(partElt, task){ 
  resetPath();
  
  selectTome($(partElt).index() + 1);
  $(':focus').blur();

  var route = $(partElt).attr('data-path');
  var element=resolveRoute(route);  
  var nbUsers = 0;
  var nbRS = 0;
  var Actions_nb = 0;
  showTasksAndFacts(element, 'ALL', task);
  
  angular.forEach(element.chapters, function(chapitre){
  angular.forEach(chapitre.parts, function(part){
  showTasksAndFacts(part, 'ALL',task);
    nbUsers = 0;//nbUsers + parseInt(part.properties.filter(function(value){ return value.property === 'Users_nb'})[0].value);
    nbRS = nbUsers + parseInt(part.properties.filter(function(value){ return value.property === 'RS_nb'})[0].value);
    Actions_nb = nbUsers + parseInt(part.properties.filter(function(value){ return value.property === 'Actions_nb'})[0].value);
  })

  });

var times=[], users=[], rss=[], rereadings=[], stops=[];

angular.forEach(element.chapters, function(chapter){
angular.forEach(chapter.parts, function(part){
  times.push(parseInt(part.properties.filter(function(value){ return value.property === 'mean.duration'})[0].value)); 
  users.push(100*part.properties.filter(function(value){ return value.property === 'Readers_tx'})[0].value);
  rss.push(100*part.properties.filter(function(value){ return value.property === 'RS_tx'})[0].value);
  var reads = parseInt(part.properties.filter(function(value){ return value.property === 'Readings'})[0].value);
  var rereads = parseInt(part.properties.filter(function(value){ return value.property === 'Rereadings'})[0].value);
  rereadings.push((rereads==0)?0:rereads/reads);
  stops.push(parseInt(part.properties.filter(function(value){ return value.property === 'rupture'})[0].value));
  })
});
var nrs = parseInt($scope.course.stats.filter(function(value){ return value.property === 'nRS'})[0].value);

var sec_num = Math.round(d3.mean(times),2); 
    var minutes = Math.floor(sec_num  / 60);
    var seconds = sec_num -  (minutes * 60);
    var meanTime    = minutes+' min '+seconds+' s';
    if (minutes == 0) meanTime = seconds+' s';

    var nrs = parseInt($scope.course.stats.filter(function(value){ return value.property === 'nRS'})[0].value);
    var stopTx = Math.floor(100 * Math.round(d3.mean(stops),2) / nrs)+'%';


$scope.observedElt={'type':'cette partie',
      'nbUsers':Math.round(d3.mean(users),2)+'%',
      'nbRS':Math.round(d3.mean(rss),2)+'%',
      'Actions_nb':0,
      'meanTime': meanTime,
      'meanRereads':Math.floor(100*d3.mean(rereadings),2)+'%',
      'meanStops':stopTx
    }; 
$scope.context.inspector_title = "Partie: "+element.title
$scope.inspectorShow = 'component';


    
}

var displayChapterInfos=function(partElt, task){ 
  resetPath();
  
  selectChapter($(partElt).index() + 1);
  $(':focus').blur();

  var route = $(partElt).attr('data-path');
  var element=resolveRoute(route);  
  showTasksAndFacts(element, 'ALL', task);
  angular.forEach(element.parts, function(part){
  showTasksAndFacts(part, 'ALL',task);
  });

  var nbUsers = 0;
  var nbRS = 0;
  var Actions_nb = 0;


  angular.forEach(element.parts, function(part){
  showTasksAndFacts(part, 'ALL',task);
    // nbUsers = nbUsers + parseInt(part.properties.filter(function(value){ return value.property === 'Users_nb'})[0].value);
    nbRS = nbRS + parseInt(part.properties.filter(function(value){ return value.property === 'RS_nb'})[0].value);
    Actions_nb = nbUsers + parseInt(part.properties.filter(function(value){ return value.property === 'Actions_nb'})[0].value);
  })

$scope.inspectorShow = 'component';
$scope.context.inspector_title = "Chapitre: "+element.title


var times=[], users=[], rss=[], rereadings=[], stops=[];

angular.forEach(element.parts, function(part){
  times.push(parseInt(part.properties.filter(function(value){ return value.property === 'mean.duration'})[0].value)); 
  users.push(100*part.properties.filter(function(value){ return value.property === 'Readers_tx'})[0].value);
  rss.push(100*part.properties.filter(function(value){ return value.property === 'RS_tx'})[0].value);
  var reads = parseInt(part.properties.filter(function(value){ return value.property === 'Readings'})[0].value);
  var rereads = parseInt(part.properties.filter(function(value){ return value.property === 'Rereadings'})[0].value);
  rereadings.push((rereads==0)?0:rereads/reads);
  stops.push(parseInt(part.properties.filter(function(value){ return value.property === 'rupture'})[0].value));
});

var nrs = parseInt($scope.course.stats.filter(function(value){ return value.property === 'nRS'})[0].value);

var sec_num = Math.round(d3.mean(times),2); 
    var minutes = Math.floor(sec_num  / 60);
    var seconds = sec_num -  (minutes * 60);
    var meanTime    = minutes+' min '+seconds+' s';
    if (minutes == 0) meanTime = seconds+' s';

    var nrs = parseInt($scope.course.stats.filter(function(value){ return value.property === 'nRS'})[0].value);
    var stopTx = Math.floor(100 * Math.round(d3.mean(stops),2) / nrs)+'%';

console.log(users);console.log(d3.mean(users));
$scope.observedElt={'type':'ce chapitre ',
      'nbUsers':Math.round(d3.mean(users),2)+'%',
      'nbRS':Math.round(d3.mean(rss),2)+'%',
      'Actions_nb':0,
      'meanTime': meanTime,
      'meanRereads':Math.floor(100*d3.mean(rereadings),2)+'%',
      'meanStops':stopTx
    }; 
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

$scope.clearEditingTask=function(){
  $scope.formData='';return false;
}
var insertLocalTask=function(route, task){
  var element = resolveRoute(route);
  
  element.todos.unshift(task);


  $scope.context.subtasks=computeAllTasks();

  //reloadURL();
  loadURL(route+';'+task._id);
 
}

$scope.editSuggestion=function($event, suggestion){

  $scope.formData = suggestion; 
  $('#taskInput').focus();
  $scope.context.route = $($event.currentTarget).attr('href');
  
window.setTimeout(function() {
             $(".editable-input ").fadeIn(100).fadeOut(100).fadeIn().focus().select();
        }, 50);

}
$scope.createTask=function($event){
  $scope.formData =  "Nouvelle tâche"; 
$('#taskInput').focus();  
  $scope.context.route = $($event.currentTarget).attr('href');
  
window.setTimeout(function() {
             $(".editable-input ").fadeIn(100).fadeOut(100).fadeIn().focus().select();
        }, 50);

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
      $scope.formData='';return false;   
  }
$scope.editTask = function (route, todo, index) {   
  var task={'todo':todo, 'updated':Date.now};
        editTask(parseTaskRequest(route), task)
        .success(function(data) {
          swal({   title: "Tâche modifiée!",   
            text: "La tâche a été modifiée avec succès.", 
             animation: "slide-from-top",
             type:"info"  ,
            timer: 1500,   showConfirmButton: false });
        });
  }

var updateLocalTasks=function(route, data){
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










    $scope.hasAuthorization = function(course) {
      if (!course || !course.user) return false;
      return MeanUser.isAdmin || course.user._id === MeanUser.user._id;
    };

    $scope.availableCircles = [];

    Circles.mine(function(acl) {
        $scope.availableCircles = acl.allowed;
        $scope.allDescendants = acl.descendants;
    });

    $scope.showDescendants = function(permission) {
   var temp = $('.ui-select-container .btn-primary').text().split(' ');
        temp.shift(); //remove close icon
   var selected = temp.join(' ');
        $scope.descendants = $scope.allDescendants[selected];
    };

    $scope.selectPermission = function() {
        $scope.descendants = [];
    };

    $scope.create = function(isValid) {
      if (isValid) {
        // $scope.course.permissions.push('test test');
   var course = new Courses($scope.course);

        course.$save(function(response) {
          $location.path('courses/' + response._id);
        });

        $scope.course = {};

      } else {
        $scope.submitted = true;
      }
    };

    $scope.remove = function(course) {
      if (course) {
        course.$remove(function(response) {
          for (var i in $scope.courses) {
            if ($scope.courses[i] === course) {
              $scope.courses.splice(i, 1);
            }
          }
          $location.path('courses');
        });
      } else {
        $scope.course.$remove(function(response) {
          $location.path('courses');
        });
      }
    };

    $scope.update = function(isValid) {
      if (isValid) {
   var course = $scope.course;
        if (!course.updated) {
          course.updated = [];
        }
        course.updated.push(new Date().getTime());

        course.$update(function() {
          $location.path('courses/' + course._id);
        });
      } else {
        $scope.submitted = true;
      }
    };

    $scope.find = function() {
      Courses.query(function(courses) {
        $scope.courses = courses;
      });
    };


  /**********************D3 CHARTS****************************/
var ComputeGlobalVisuData=function(){
  var visuData = []
  
  visuData.push({type:'Actions_nb',data:factChart(-1,'Actions_nb')});  
   visuData.push({type:'RS_nb',data:factChart(-1,'RS_nb')});  
  visuData.push({type:'mean.duration',data:factChart(-1,'mean.duration')});
  visuData.push({type:'Rereadings',data:factChart(-1,'Rereadings')});  
  visuData.push({type:'Sequential_rereadings',data:factChart(-1,'Sequential_rereadings')});  
  visuData.push({type:'Decaled_rereadings',data:factChart(-1,'Decaled_rereadings')});  
  visuData.push({type:'rupture',data:factChart(-1,'rupture')});  
  visuData.push({type:'norecovery',data:factChart(-1,'norecovery')});    
  visuData.push({type:'next_recovery',data:factChart(-1,'next_recovery')});    
  visuData.push({type:'back_recovery',data:factChart(-1,'back_recovery')});    
  visuData.push({type:'shifted_recovery',data:factChart(-1,'shifted_recovery')});    
  

visuData.push({type:'provenance',data:globalTransitionsProvenance('provenance')});    
visuData.push({type:'destination',data:globalTransitionsProvenance('destination')});    

  

  return visuData;
}
var appendD3Facts=function(fact, factedPartID, contextElement){ 
 
    if(fact.issueCode in {'RVminVisit':'','RminVisit':'','RVmaxVisit':'','RmaxVisit':''}) 
      fact.d3 = factChart(factedPartID,'Actions_nb');
    
    if(fact.issueCode in {'RVminDuration':'','RminDuration':'','RmaxDuration':''}) 
      fact.d3 = factChart(factedPartID,'q3.duration' );

    if(fact.issueCode in {'RRmax':''}) 
      fact.d3 = factChart(factedPartID,'Rereadings' );

    if(fact.issueCode in {'RRmaxS':'','RRVmaxS':''}) 
      fact.d3 = factChart(factedPartID,'Sequential_rereadings');

    if(fact.issueCode in {'RRVmaxD':'','RRmaxD':''}) 
      fact.d3 = factChart(factedPartID,'Decaled_rereadings');


    if(fact.issueCode ==='StopRSEnd')
      fact.d3 = factChart(factedPartID,'rupture' );
    if(fact.issueCode === 'StopRSExit')
      fact.d3 = factChart(factedPartID,'norecovery');
    if(fact.issueCode === 'StopRecNext')
      fact.d3 = factChart(factedPartID,'next_recovery' );
    if(fact.issueCode === 'StopRecback')
      fact.d3 = factChart(factedPartID,'back_recovery' );
    if(fact.issueCode === 'StopRecShift')
      fact.d3 = factChart(factedPartID,'shifted_recovery' );


    if(fact.issueCode in{'TransProvPrec':'', 'TransProvPrecV':''})       
      {fact.d3 = transitionFactChart(factedPartID,'provenance_precedent' );}

    if(fact.issueCode in{'TransProvNext':'', 'TransProvNextV':''})       
      {fact.d3 = transitionFactChart(factedPartID,'provenance_next_p' );}

    if(fact.issueCode in{'TransProvShiftNext':'', 'TransProvShiftNextV':''})       
      {fact.d3 = transitionFactChart(factedPartID,'provenance_shifted_next' );}

    if(fact.issueCode in{'TransProvShiftPast':'', 'TransProvShiftPastV':''})       
      {fact.d3 = transitionFactChart(factedPartID,'provenance_shifted_past' );}


    if(fact.issueCode in{'TransDestNext':'', 'TransDestNextV':''})       
      {fact.d3 = transitionFactChart(factedPartID,'destination_next_p' );}
    if(fact.issueCode in{'TransDestPrev':'', 'TransDestPrevV':''})       
      {fact.d3 = transitionFactChart(factedPartID,'destination_precedent' );}
    if(fact.issueCode in{'TransDestPast':'', 'TransDestPastV':''})       
      {fact.d3 = transitionFactChart(factedPartID,'destination_shifted_past' );}
    if(fact.issueCode in{'TransDestShiftNext':'', 'TransDestShiftNextV':''})       
      {fact.d3 = transitionFactChart(factedPartID,'destination_shifted_next' );}
 

}

var transitionFactChart = function(factedPartID, issueCode){
  var classe='provenance'
  if(typeof $scope.course=='undefined') return;
    
    var chartData=[];
    var meanData=[];
    var dataEntries=[];
    var colorsEntries=[];
   
   var cpt = 0;
   var transitions=[]

  angular.forEach($scope.course.tomes, function(tome){
      angular.forEach(tome.chapters, function(chapter){
        angular.forEach(chapter.parts, function(part){
          if(parseInt(factedPartID)===parseInt(part.id)){
            chartData.push(part.properties.filter(function(value){ 
              return value.property.split('_')[0]===classe    
          }))
        }
      })
    })
  });
   return {'partIndex':factedPartID,'issueCode':issueCode ,'transition':chartData[0]};
 
}

var mean=function(numbers) {
    // mean of [3, 5, 4, 4, 1, 1, 2, 3] is 2.875
    var total = 0,
        i;
    for (i = 0; i < numbers.length; i += 1) {
        total += numbers[i];
    }
    return total / numbers.length;
}
var median=function(numbers) {
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
var globalTransitionsProvenance=function(classe){
  var chartData = [];
  
   angular.forEach($scope.course.tomes, function(tome){
          angular.forEach(tome.chapters, function(chapter){
        angular.forEach(chapter.parts, function(part){
          
            chartData=chartData.concat(part.properties.filter(function(value){ 
              return value.property.split('_')[0]===classe    
            }))
         
        })
      })
    });
  
  
var identity= mean(($.grep(chartData, function(e){ return  e.property === classe+"_identity" }))
  .map(function(d) { return parseInt(d.value); }));
var precedent= mean(($.grep(chartData, function(e){ return  e.property === classe+"_precedent" }))
      .map(function(d) { return parseInt(d.value); }));
var next_p= mean(($.grep(chartData, function(e){ return  e.property === classe+"_next_p" }))
      .map(function(d) { return parseInt(d.value); }));
var shifted_past= mean(($.grep(chartData, function(e){ return  e.property === classe+"_shifted_past" }))
      .map(function(d) { return parseInt(d.value); }));
var shifted_next= mean(($.grep(chartData, function(e){ return  e.property === classe+"_shifted_next" }))
      .map(function(d) { return parseInt(d.value); }));
var somme = identity + precedent + next_p + shifted_past + shifted_next;
var chartData=[
      {'classe':chartData, "property":"identity", value: identity * 100 / somme},
      {'classe':chartData, "property":"precedent", value: precedent * 100 / somme},
      {'classe':chartData, "property":"next_p", value: next_p * 100 / somme},
      {'classe':chartData, "property":"shifted_past", value: shifted_past * 100 / somme},
      {'classe':chartData, "property":"shifted_next", value: shifted_next * 100 / somme}]

return(chartData)

}
var factChart = function(factedPartID, issueCode){
  if(typeof $scope.course=='undefined') return;
    
    var chartData=[];
    var meanData=[];
    var dataEntries=[];
    var colorsEntries=[];
   
   var cpt = 0;

   angular.forEach($scope.course.tomes, function(tome){
          angular.forEach(tome.chapters, function(chapter){
        angular.forEach(chapter.parts, function(part){
          chartData.push({'part':part.id,
            'title':part.title,
            'route':part.route,
            'value': parseInt(part.properties.filter(function(value){ return  value.property === issueCode})[0].value),
            'color':parseInt(factedPartID)===parseInt(part.id)?'#45348A':'grey'
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
  editableThemes['bs3'].submitTpl =  '<button type="submit" class="btn btn-info"><span></span></button><br/>',
  editableThemes['bs3'].cancelTpl =  '<button type="button" class="btn btn-warning" ng-click="$form.$cancel()">'+
                     '<span></span>'

  editableThemes.bs3.inputClass = 'input-xs';
  editableThemes.bs3.buttonsClass = 'btn-xs';
});