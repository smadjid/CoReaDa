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
  $scope.dataLoading = true;
  $scope.pageLoaded = false;
  $(window).unbind('hashchange');

  $scope.observedElt={'type':'cours','nbUsers':0,'nbRS':0,'obsels':0}

     $('table').hide();
     $scope.issuesInspectorShow = false;
     $scope.courseInspectorShow = true;
     $scope.indicatorGraphShow = 'readings';;
      $scope.courseParts=[];
      $scope.courseChapters=[];
      $scope.context = {};
      $scope.course={}
      $scope.formData='';
      $scope.textBtnForm='';
      $scope.chartType = 'obsels';
      $scope.chartedElement = {};
      $scope.factChart={};
      $scope.componentChart={};
  
      Courses.get({
        courseId: $stateParams.courseId
      }, function(course) {
     
        $scope.course = course;
        $scope.chartType = 'obsels';
        $scope.chartedElement = course;
  
        completeCourseParts($scope.course, $scope.courseParts, $scope.courseChapters);
            $scope.context = {
              'type':'course',      
              'route':$scope.course._id,
              'id':0,
              '_id':$scope.course._id,
              'title':$scope.course.title,
              'Todos':$scope.course.todos,
              'indicator':'ALL'
            };
    $scope.context.subtasks=computeAllTasks();
     
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
          fact.d3={'options':$scope.options,'data':$scope.data};
          //fact.d3={'part':part.route, 'chapter':chapter.route,'tome':tome.route};
          appendD3Facts(fact,part._id,chapter.route);

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

  $scope.issuesInspectorShow = false;

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
    tomeTasks[i].minipath='Tome :'+tome.title
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
                  partTasks[i].minipath='Partie: '+part.title;
                  tasks.push(partTasks[i]);
                }
                  angular.forEach(part.facts, function(fact){
                    var factTasks = angular.copy(fact.todos);
                    for(var i = 0; i<factTasks.length; i++){ 
                      
                      factTasks[i].route=fact.route+';'+factTasks[i]._id+'@'+factTasks[i].classof
                       factTasks[i].minipath='Partie: '+part.title+' - ' +fact.classof
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

  /******Tome*******/
  if(type=='tome'){    
    for (var i = 0; i < facts.length; i++)   {facts[i].source = element._id; facts[i].sourceTitle = 'This tome';}
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
  $scope.context.inspector_title = "Tome: "+element.title +" - " +facts.length +" remarques";
  }

  /******Chapter*******/
  if(type=='chapter'){    
    for (var i = 0; i < facts.length; i++)   {facts[i].source = element._id; facts[i].sourceTitle = 'This chapter';}
    angular.forEach(element.parts, function(part) {
      var partFacts = angular.copy(part.facts);
                for (var i = 0; i < partFacts.length; i++){
                  partFacts[i].source = part.route;
                  partFacts[i].sourceTitle = 'Part : '+part.title;
                  facts.push(partFacts[i]);
                 }                
    });
  $scope.context.inspector_title = "Chapitre: "+element.title +" - " +facts.length +" remarques";
  }
  /******Part*******/
  if(type=='part'){
    facts=angular.copy(element.facts);
    $scope.context.inspector_title = "Partie: "+element.title +" - " +facts.length +" remarques";
    for (var i = 0; i < facts.length; i++)   {facts[i].source = element.route; facts[i].sourceTitle = 'This part';}
      
  }

  return facts

}

var CountSubFacts=function(element){
  var type = element.elementType;
  var count = element.todos.length;
  var type = 'Partie '

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
        type = "Tome ";
      });
  /******Chapter*******/
   if(type=='chapter'){       
    angular.forEach(element.parts, function(part) { 
      count = count +  part.facts.length;
    });
    type = "Chapitre ";
  }
  

  return {'type':type, 'count':count}

}
var updateDisplay=function(){

    var url = location.hash.slice(1);
 
    var element = resolveRoute(url);
   $scope.context.route= url;
   
   $scope.context.Tasks=element.todos; 
   $scope.context.subfacts=computeAllFacts(element);
   
   
   

    loadContext();
  
        var totalWidth = $('.col-lg-9').width();
        $('.data-table').css('width',totalWidth);
        $('th').css('overflow','hidden');
        $('.indicators-header').css('width','50px');
        var tdW = (totalWidth - 55)/26;
        
        $scope.width=tdW;
        if($('.course_title_top').length<1)
                $('.navbar-brand').after('<a role="button" href="#" ng-click="resetPath();goHome()" class="course_title_top"> <span class="glyphicon glyphicon-book"></span>  <em>'+$scope.course.title+'</em></a>');




      
    
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
        if(params.scope=='tome')
          return $http.delete('/api/tome/tasks/delete/'+params.route);  
        if(params.scope=='chapter')
          return $http.delete('/api/chapter/tasks/delete/'+params.route);  
        if(params.scope=='part')
          return $http.delete('/api/part/tasks/delete/'+params.route);  
      };
var editTask = function(params, task) {        
        if(params.scope=='course')          
          return $http.post('/api/course/tasks/edit/'+params.route, task);  
        if(params.scope=='tome')
          return $http.post('/api/tome/tasks/edit/'+params.route, task);  
        if(params.scope=='chapter')
          return $http.post('/api/chapter/tasks/edit/'+params.route, task);  
        if(params.scope=='part')
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
   $scope.context.subfacts=computeAllFacts(element);
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

        if(indicator==='Readings') elementStatsChart(course);
        if(indicator==='Rereading') indicatorRereadingChart(course);
        if(indicator==='Stop') indicatorStopChart(course);
        if(indicator==='Transition') transitionStopChart(course);
    };

  /********************************hhhhhhhhhhhhhhhh***********/

 if(arr.length==2) {  

   tome = $.grep(course.tomes, function(e){ return  e._id == arr[1] })[0]; 
   partElt = $('.tome_index[data-part='+tome.id+']')[0];
   
   //displayChapterInfos(partElt, task);
   displayTomeInfos(partElt, task);
   elementStatsChart(tome);
 }


 if(arr.length==3) {  
  tome = $.grep(course.tomes, function(e){ return  e._id == arr[1] })[0];   
   chap = $.grep(tome.chapters, function(e){ return  e._id == arr[2] })[0]; 

   partElt = $('.chapter_index[data-part='+chap.id+']')[0];
   
   displayChapterInfos(partElt, task);
   elementStatsChart(chap);
 }


 if(arr.length==4 && indicator=="ALL") { 
  tome = $.grep(course.tomes, function(e){ return  e._id == arr[1] })[0]; 
  chap = $.grep(tome.chapters, function(e){ return  e._id == arr[2] })[0]; 
  part = $.grep(chap.parts, function(e){ return  e._id == arr[3] })[0]; 
  partElt = $('.part_index[data-part='+part.id+']'); 
  displayPartInfos(partElt, task);

  $scope.courseInspectorShow = true;
  
}
if(arr.length==4 && indicator!="ALL") { 
  tome = $.grep(course.tomes, function(e){ return  e._id == arr[1] })[0]; 
  chap = $.grep(tome.chapters, function(e){ return  e._id == arr[2] })[0]; 
  part = $.grep(chap.parts, function(e){ return  e._id == arr[3] })[0]; 
  partElt = $('.part_index[data-part='+part.id+']'); 
  displayPartIssues(route, task, part, indicator);
}


if(arr.length==5) {   
  tome = $.grep(course.tomes, function(e){ return  e._id == arr[1] })[0]; 
  chap = $.grep(tome.chapters, function(e){ return  e._id == arr[2] })[0]; 
  part = $.grep(chap.parts, function(e){ return  e._id == arr[3] })[0];   

  fact = $.grep(part.facts, function(e){ return  e._id == arr[4] })[0]; 
  partElt = $('.part_index[data-part='+part.id+']'); 
   
     displayIssue(route, task, part, indicator);
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

}
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

     

      $scope.issuesInspectorShow = true;

     
     $scope.context.route= url;     
     var element = resolveRoute(url);

  var nb = $('.td_issue[data-path="'+url+'"]').find('.display-part-issues').text() ;
     if(nb==0) nb="aucune (0) remarque";
     if(nb==1) nb="une (1) remarque";
      if(nb>1) nb=nb+" remarques";
     $scope.context.inspector_title = "Partie: "+ part.title+' - '+nb+ " de type "+indicator ;
    
      

  var parentUrl = url.substr(0, url.lastIndexOf(','))+'@'+indicator; 
  $('.td_issue[data-path="'+parentUrl+'"]').addClass('chosenPart');
  $scope.context.Facts=computeSubFacts(resolveRoute(parentUrl), indicator);
  $('.inspector-item[data-fact="'+element._id+'"]').addClass('inspector-item-selected');

  showTasksAndFacts(element, indicator, task);
  
  
    $scope.factoptions = element.d3.options;
    $scope.factdata = element.d3.data;
  
  //$scope.factChart.api.updateWithOptions(element.d3.options);
  //$scope.factChart.api.updateWithData(element.d3.data);
  
  $scope.factChart.api.updateWithTimeout(5);
  $scope.factChart.api.refresh();
  

  
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
     if(nb==0) nb="aucune (0) remarque";
     if(nb==1) nb="une (1) remarque";
      if(nb>1) nb=nb+" remarques";
     $scope.context.inspector_title = "Partie: "+ part.title+' - '+nb+ " de type "+indicator ;
  showTasksAndFacts(element, indicator, task);

  $scope.issuesInspectorShow = true;
  
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



$scope.observedElt={'type':'Cette partie ',
      'nbUsers':parseInt(element.properties.filter(function(value){ return value.property === 'Users_nb'})[0].value),
      'nbRS':parseInt(element.properties.filter(function(value){ return value.property === 'RS_nb'})[0].value),
      'obsels':parseInt(element.properties.filter(function(value){ return value.property === 'Actions_nb'})[0].value) };    


  $scope.issuesInspectorShow = false;
    $scope.componentChart.api.updateWithTimeout(5);
  $scope.componentChart.api.refresh();
}

var displayCourseInfos=function(indicator, task){ 
  resetPath(); 
  $scope.issuesInspectorShow = false;  
  $scope.context.inspector_title = "Cours: "+$scope.course.title +" - " +$scope.context.subfacts.length +" remarques";
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

if(indicator==='ALL') $scope.courseInspectorShow = true
  else  $scope.courseInspectorShow = false

var nbUsers = 0;
var nbRS = 0;
var obsels=0;

$scope.observedElt={'type':'Ce cours',
      'nbUsers':$scope.course.properties.filter(function(value){ return value.property === 'Users_nb'})[0].value,
      'nbRS':$scope.course.properties.filter(function(value){ return value.property === 'RS_nb'})[0].value,
      'obsels':$scope.course.properties.filter(function(value){ return value.property === 'Actions_nb'})[0].value};

  $scope.componentChart.api.update();
  $scope.componentChart.api.refresh();

}


var displayTomeInfos=function(partElt, task){ 
  resetPath();
  $scope.issuesInspectorShow = false;
  selectTome($(partElt).index() + 1);
  $(':focus').blur();

  var route = $(partElt).attr('data-path');
  var element=resolveRoute(route);  
  var nbUsers = 0;
  var nbRS = 0;
  var obsels = 0;
  showTasksAndFacts(element, 'ALL', task);
  
  angular.forEach(element.chapters, function(chapitre){
  angular.forEach(chapitre.parts, function(part){
  showTasksAndFacts(part, 'ALL',task);
    nbUsers = nbUsers + parseInt(part.properties.filter(function(value){ return value.property === 'Users_nb'})[0].value);
    nbRS = nbUsers + parseInt(part.properties.filter(function(value){ return value.property === 'RS_nb'})[0].value);
    obsels = nbUsers + parseInt(part.properties.filter(function(value){ return value.property === 'Actions_nb'})[0].value);
  })

  });


$scope.observedElt={'type':'Ce tome',
      'nbUsers':nbUsers,
      'nbRS':nbRS,
      'obsels':obsels };
$scope.courseInspectorShow = true



    $scope.componentChart.api.updateWithTimeout(5);
  $scope.componentChart.api.refresh();
    
}

var displayChapterInfos=function(partElt, task){ 
  resetPath();
  $scope.issuesInspectorShow = false;
  selectChapter($(partElt).index() + 1);
  $(':focus').blur();

  var route = $(partElt).attr('data-path');
  var element=resolveRoute(route);  
  showTasksAndFacts(element, 'ALL', task);
  angular.forEach(element.parts, function(part){
  showTasksAndFacts(part, 'ALL',task);
  });

    $scope.componentChart.api.updateWithTimeout(5);
  $scope.componentChart.api.refresh();
  var nbUsers = 0;
  var nbRS = 0;
  var obsels = 0;


  angular.forEach(element.parts, function(part){
  showTasksAndFacts(part, 'ALL',task);
    nbUsers = nbUsers + parseInt(part.properties.filter(function(value){ return value.property === 'Users_nb'})[0].value);
    nbRS = nbUsers + parseInt(part.properties.filter(function(value){ return value.property === 'RS_nb'})[0].value);
    obsels = nbUsers + parseInt(part.properties.filter(function(value){ return value.property === 'Actions_nb'})[0].value);
  })

$scope.courseInspectorShow = true;

$scope.observedElt={'type':'Ce chapitre',
      'nbUsers':nbUsers,
      'nbRS':nbRS,
      'obsels':obsels };    
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
      {'property':'Nombre de parties', 
        'value':$scope.course.parts.length},
        {'property':'Nombre de jours d\'observation', 
        'value':'72 jours'},
        {'property':'Nombre de lecteurs distincts', 
        'value':1230}
    ],
  'readings':[
      {'property':'Nombre moyen de lecteurs distincts par partie', 
        'value':properties.filter(function(value) { return value.property === 'mean.readers'})[0].value}
   ],
   'rereading':[
      {'property':'Nombre moyen de lecteurs distincts par partie', 
        'value':properties.filter(function(value) { return value.property === 'mean.readers'})[0].value}
   ],
   'transitions':[
      {'property':'Nombre moyen de lecteurs distincts par partie', 
        'value':properties.filter(function(value) { return value.property === 'mean.readers'})[0].value}
   ],
   'stops':[
      {'property':'Nombre moyen de lecteurs distincts par partie', 
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


  /**********************NVD3 CHARTS****************************/
var appendD3Facts=function(fact, factedPartID, contextElement){
 
  if(fact.classof==='Readings')
    {
     
    if(fact.issueCode in {'RVminVisit':'','RminVisit':'','RVmaxVisit':'','RmaxVisit':''}) 
      fact.d3 = factReadingChart(resolveRoute(contextElement),factedPartID,'obsels', fact.norm_value)
    if(fact.issueCode in {'RVminDuration':'','RminDuration':'','RmaxDuration':''}) 
      fact.d3 = factReadingChart(resolveRoute(contextElement),factedPartID,'q3.duration' , fact.norm_value)
    }


  

}

var factReadingChart = function(element, factedPartID, attr, meanValue){
  if(typeof $scope.course=='undefined') return;
    
    var chartData=[];
    var meanData=[];
    var dataEntries=[];
    var colorsEntries=[];

    var type = element.elementType;   
    var elementChart={};
    var issueCode=element.issueCode

   
   
   var cpt = 0;
    
        angular.forEach(element.parts, function(part){
        
        var valueEntry=0    ; 
                
          valueEntry = parseInt(part.properties.filter(function(value){ return  value.property === attr})[0].value);
        
        chartData.push({'x':cpt, 'y':valueEntry,  'series':0});
         meanData.push({'x':cpt, 'y':meanValue,  'series':1});
        dataEntries.push(part.title);
        if(part._id===factedPartID) colorsEntries.push('red')
          else colorsEntries.push('grey')
        cpt = cpt + 1;
      })

       
     elementChart.options =  {
            chart: {
                type: 'multiChart',               
                margin : {
                    top: 30,
                    right: 60,
                    bottom: 50,
                    left: 70
                },
                color: d3.scale.category10().range(),                
                duration: 500,
                xAxis: {
                    tickFormat: function(d){
                        return null//dataEntries[d];
                    }
                },
                yAxis1: {
                    tickFormat: function(d){
                        return d3.format(',.1f')(d);
                    }
                },
                yAxis2: {
                    tickFormat: function(d){
                        return d3.format(',.1f')(d);
                    }
                },
                tooltip: {
                contentGenerator: function (e) {
                  var series = e.series[0];
                  if (series.value === null) return;
                  
                  console.log(dataEntries[e.point.x]);
                    
                  return "<strong>"+dataEntries[parseInt(e.point.x)]+"</strong>";
                } 
              }
            }
        };

        elementChart.data = [{
          "key": "Data",
          "type": "bar",
          'yAxis':1,
          "values": chartData
        },
        {
          "key": "Mean",
          "type": "line",
          'yAxis':1,
          "values": meanData
        }]
      
//console.log(elementChart.data);








    elementChart.options1 = {
            chart: {
                type: 'discreteBarChart',
                height: 200,
                width:300,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 50,
                    left: 55
                },
                x: function(d){return d.label;},
                y: function(d){return d.value;},                
                showValues: true,
                valueFormat: function(d){
                    return d3.format('')(d);
                },
                duration: 500,
                xAxis: {
                    axisLabel: 'Chapitres du cours',
                    staggerLabels: true
                },
                yAxis: {
                    axisLabel: attr,
                    axisLabelDistance: -10
                },
                discretebar:{
                    dispatch: {
                      elementClick: function(e){ 
                        loadURL(e.data.url); 
                      }
                      
                  }

                }
                
                
            }
        };

        elementChart.data1 = [{
          key: "Cumulative Return",
          values: chartData
        }] ;





       
       
        return elementChart;

}

 var indicatorRereadingChart = function(element){
  $scope.indicatorGraphShow='rereading';

  if(typeof $scope.course=='undefined') return;
    var chartData=[
                {'key':'Readings', 'values':[]},
                {'key':'Rereadings', 'values':[]},
                {'key':'Sequential_rereadings', 'values':[]},
                {'key':'Decaled_rereadings', 'values':[]}
              ];
    
    var type = element.elementType;
    if(type=='course'){  
      angular.forEach(chartData, function(r){
        angular.forEach(element.tomes, function(tome){
          angular.forEach(tome.chapters, function(chapter){
          var part = chapter.parts;  
          var valueEntry=0    
          part.map(function(item){        
            valueEntry = valueEntry + parseInt(item.properties.filter(function(value){ return value.property === r.key})[0].value);
          });
          r.values.push({'x':chapter.title, 'y':valueEntry})
        });
      });

    });
      
    };
    if(type=='subchapter'){  
      angular.forEach(chartData, function(r){
          angular.forEach(element.parts, function(part){
          var valueEntry=0    
          
            valueEntry = valueEntry + parseInt(part.properties.filter(function(value){ return value.property === r.key})[0].value);
          
          r.values.push({'x':part.title, 'y':valueEntry})
        });

      });
      
    }

   
 $scope.options =  {
          "chart": {
            "type": "multiBarChart",
            "height": 300,
            "margin": {
              "top": 20,
              "right": 20,
              "bottom": 45,
              "left": 45
            },
            "clipEdge": true,
            "duration": 500,
            "stacked": true,
            'showXAxis':false,
            "xAxis": {
              "axisLabel": "Count",
              "showMaxMin": false,
            },
            "yAxis": {
              "axisLabel": "Chapitres",
              "axisLabelDistance": -20
            }
          }
        };
        $scope.data = chartData;
        console.log($scope.data);

    
    }


  $scope.readingChartSelect = function (chart) {
    var element = $scope.chartedElement ;
    $scope.chartType= chart;
    elementStatsChart(element);
        };

        var elementStatsChart = function(element){
  $scope.indicatorGraphShow='readings';
  
  $scope.chartedElement = element;
  var xlabel='Tomes du cours';
    
    var chartData=[];
    var type = element.elementType;
    if(type=='course'){  
      xlabel='Tomes du cours';
      angular.forEach(element.tomes, function(tome){
          angular.forEach(tome.chapters, function(chapter){
          var part = chapter.parts;  
          var valueEntry=0    
          part.map(function(item){        
            valueEntry = valueEntry + parseInt(item.properties.filter(function(value){ return value.property === $scope.chartType})[0].value);
          });
          chartData.push({'label':chapter.title, 'value':valueEntry,'url':chapter.route})
        })
      })
    }

    if(type=='tome'){  
      xlabel='Chapitres du tome';
        angular.forEach(element.chapters, function(chapter){
        var part = chapter.parts;  
        var valueEntry=0    
        part.map(function(item){        
          valueEntry = valueEntry + parseInt(item.properties.filter(function(value){ return value.property === $scope.chartType})[0].value);
        });
        chartData.push({'label':chapter.title, 'value':valueEntry,'url':chapter.route})
      })
    }

    if(type=='chapter'){  
      xlabel='Sous-chapitres du chapitre';
        angular.forEach(element.parts, function(part){
        
        var valueEntry=0    ; 
               
          valueEntry = parseInt(part.properties.filter(function(value){ return value.property === $scope.chartType})[0].value);
        
        chartData.push({'label':part.title, 'value':valueEntry,'url':part.route})
      })
    }
      
    $scope.options = {
            chart: {
                type: 'discreteBarChart',
                height: 300,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 50,
                    left: 55
                },
                x: function(d){return d.label;},
                y: function(d){return d.value;},                
                showValues: true,
                valueFormat: function(d){
                    return d3.format('')(d);
                },
                duration: 500,
                'showXAxis':false,
                xAxis: {
                    axisLabel: xlabel,
                    staggerLabels: true
                },
                
                discretebar:{
                    dispatch: {
                      elementClick: function(e){ 
                        loadURL(e.data.url); 
                      }
                      
                  }

                }
                
                
            }
        };

        $scope.data = [{
          key: "Cumulative Return",
          values: chartData
        }] ;

        $scope.factoptions=$scope.options;
        $scope.factdata = [{
          key: "Cumulative Return",
          values: chartData
        }] ;

      

      }


    $scope.stopChartSelect = function (chart) {
      indicatorStopChart($scope.course, chart);
        };

 var indicatorStopChart = function(element, type){
   $scope.indicatorGraphShow='stop';

  if(typeof $scope.course=='undefined') return;
    var chartData=[];
    if(type==='stop')
      chartData=[ {'key':'rupture', 'values':[]},
                {'key':'recovery', 'values':[]},
                {'key':'norecovery', 'values':[]}
              ]
    else
      chartData=[ {'key':'shifted_recovery', 'values':[]},
                {'key':'back_recovery', 'values':[]},
                {'key':'next_recovery', 'values':[]},
                {'key':'direct_recovery', 'values':[]}
              ]
    
    var type = element.elementType;
    if(type=='course'){  
      angular.forEach(chartData, function(r){
        angular.forEach(element.tomes, function(tome){
          angular.forEach(tome.chapters, function(chapter){
          var part = chapter.parts;  
          var valueEntry=0    
          part.map(function(item){        
            valueEntry = valueEntry + parseInt(item.properties.filter(function(value){ return value.property === r.key})[0].value);
          });
          r.values.push({'x':chapter.title, 'y':valueEntry})
        });
      });

    });
      
    };
    if(type=='subchapter'){  
      angular.forEach(chartData, function(r){
          angular.forEach(element.parts, function(part){
          var valueEntry=0    
          
            valueEntry = valueEntry + parseInt(part.properties.filter(function(value){ return value.property === r.key})[0].value);
          
          r.values.push({'x':part.title, 'y':valueEntry})
        });

      });
      
    }

   
 $scope.options =  {
          "chart": {
            "type": "multiBarChart",
            "height": 300,
            "margin": {
              "top": 20,
              "right": 20,
              "bottom": 45,
              "left": 45
            },
            "clipEdge": true,
            "duration": 500,
            "stacked": true,
            'showXAxis':false,
            "xAxis": {
              "axisLabel": "Count",
              "showMaxMin": false,
            },
            "yAxis": {
              "axisLabel": "Chapitres",
              "axisLabelDistance": -20
            }
          }
        };
        $scope.data = chartData;
        console.log($scope.data);

      

      };


      $scope.transitionChartSelect = function (chart) {
      transitionStopChart($scope.course, chart);
        };

 var transitionStopChart = function(element, type){
   $scope.indicatorGraphShow='transition';

  if(typeof $scope.course=='undefined') return;
    var chartData=[];
    if(type==='provenance')
      chartData=[ {'key':'provenance_precedent', 'values':[]},
                {'key':'provenance_shifted_past', 'values':[]},
                {'key':'provenance_identity', 'values':[]},
                {'key':'provenance_next_p', 'values':[]},
                {'key':'provenance_shifted_next', 'values':[]}
              ]
    else
      chartData=[ {'key':'destination_precedent', 'values':[]},
                {'key':'destination_shifted_past', 'values':[]},
                {'key':'destination_identity', 'values':[]},
                {'key':'destination_next_p', 'values':[]},
                {'key':'destination_shifted_next', 'values':[]}
              ]
    
    var type = element.elementType;
    if(type=='course'){  
      angular.forEach(chartData, function(r){
        angular.forEach(element.tomes, function(tome){
          angular.forEach(tome.chapters, function(chapter){
          var part = chapter.parts;  
          var valueEntry=0    
          part.map(function(item){        
            valueEntry = valueEntry + parseInt(item.properties.filter(function(value){ return value.property === r.key})[0].value);
          });
          r.values.push({'x':chapter.title, 'y':valueEntry})
        });
      });

    });
      
    };
    if(type=='subchapter'){  
      angular.forEach(chartData, function(r){
          angular.forEach(element.parts, function(part){
          var valueEntry=0    
          
            valueEntry = valueEntry + parseInt(part.properties.filter(function(value){ return value.property === r.key})[0].value);
          
          r.values.push({'x':part.title, 'y':valueEntry})
        });

      });
      
    }

   
 $scope.options =  {
          "chart": {
            "type": "multiBarChart",
            "height": 300,
            "margin": {
              "top": 20,
              "right": 20,
              "bottom": 45,
              "left": 45
            },
            "clipEdge": true,
            "duration": 500,
            "stacked": true,
            'showXAxis':false,
            "xAxis": {
              "axisLabel": "Count",
              "showMaxMin": false,
            },
            "yAxis": {
              "axisLabel": "Chapitres",
              "axisLabelDistance": -20
            }
          }
        };
        $scope.data = chartData;
        console.log($scope.data);

      

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