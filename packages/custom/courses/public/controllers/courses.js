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
    
  $scope.issuesInspectorShow = false;
  $scope.courseParts=[];
   $scope.context = {};
$scope.formData='';
$scope.textBtnForm='';

    // construct hierarchy, routes and paths
var completeCourseParts=function(course, courseParts){
  var course_route = course._id;
  angular.forEach(course.chapters, function(chapter) { 
            chapter.route=course_route+','+chapter._id
            angular.forEach(chapter.parts, function(part) {
              part.parent = chapter._id;
              part.route=chapter.route+','+part._id;
              angular.forEach(part.facts,function(fact){
                  fact.route=part.route+','+fact._id
              });
                courseParts.push(
                    part
                );
                
            });
        
        });
  

}

var resolveRoute=function(path){
   
   var regExp = RegXpURL(path); 
  
   var arr = regExp.arr.split(',');  
      
   if(typeof $scope.course == 'undefined')
      console.log($scope.course);
  var result = $scope.course;  
   if(arr.length>=2) {
     var chap = $.grep($scope.course.chapters, function(e){ return  e._id == arr[1] })[0];
     result = chap
     if(arr.length==3){
       var part = $.grep(chap.parts, function(e){ return  e._id == arr[2] })[0];
       result = part
     }
     else
       if(arr.length>=4){
        var part = $.grep(chap.parts, function(e){ return  e._id == arr[2] })[0];
         var fact = $.grep(part.facts, function(e){ return  e._id == arr[3] })[0];        
         
         result = fact
       }
     }     
     
    
  var taskId = 0;
   var taskIndicator = 0;
   if(regExp.task!=0){
      taskId = regExp.task;
       if(regExp.indicator!=0)
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
  
  $scope.issuesInspectorShow = false;

}

var parseTask=function(path, content){

   var regExp = RegXpURL(path);
  
  
  var taskId = regExp.task;
  var indicator = regExp.indicator;

  path = regExp.arr;

  var arr = path.split(','); 
  var courseId = $scope.course._id;
  var chapId = 0;
  var partId=0;
  var factId=0;
 
  if(arr.length>=2)   chapId =  arr[1] ;
  if(arr.length>=3)   partId =  arr[2] ;
  if(arr.length>=4)   factId =  arr[3] ;
  
 var route = courseId+'/'+chapId+'/'+partId+'/'+factId;
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
  var chapId = 0;
  var partId=0;
  var factId=0;
  var result ="#";
 
  if(arr.length>=2)   chapId =  arr[1] ;
  if(arr.length>=3)   partId =  arr[2] ;
  if(arr.length>=4)   factId =  arr[3] ;

result ="#"+courseId;
  if(chapId!=0) {
    result = result+','+chapId;
    if(partId != 0){
      result = result+','+partId;
      if(factId != 0)
        result = result+','+factId;
    }
  }

//  result = result + ',' + chapId + ',' + partId + ',' + factId + ',' + taskId;
result = result + ';' + taskId;
  if( taskIndicator!=0)    result = result + '@' + taskIndicator;

  return result;

}

var parseRequest=function(path){

  var arr = path.split(','); 
  var courseId = $scope.course._id;
  var chapId = 0;
  var partId=0;
  var factId=0;
 
  if(arr.length>=2)   chapId =  arr[1] ;
  if(arr.length>=3)   partId =  arr[2] ;
  if(arr.length>=4)   factId =  arr[3] ;
  
 var result = courseId+'/'+chapId+'/'+partId+'/'+factId;
  return result
}

var parseTaskRequest=function(path){
var regExp = RegXpURL(path);
var taskId =  regExp.task; 
var taskIndicator=regExp.indicator;

  path =  regExp.arr; 
  
  var arr = path.split(','); 
  var courseId = $scope.course._id;
  var chapterId = 0;
  var partId=0;
  var factId=0;
  
  var route = courseId;
  var scope = 'course';
 
  if(arr.length>=2)   chapterId =  arr[1] ;
  if(arr.length>=3)   partId =  arr[2] ;
  if(arr.length>=4)   factId =  arr[3] ;


  if(chapterId==0){
    route=route+'/'+factId+'/'+taskId;
  }
  else
    if(partId==0){
      route = route+'/'+chapterId+'/'+factId+'/'+taskId;
      scope='chapter';
    }
    else
      {
        route = route+'/'+chapterId+'/'+partId+'/'+factId+'/'+taskId;
        scope='part';
      }
  
  return {'route':route, 'scope':scope}
}



var computeAllTasks=function(){ 
 var tasks=angular.copy($scope.course.todos);
 for (var i = 0; i < tasks.length; i++)   
      {
        tasks[i].selected = 1 
        tasks[i].route=$scope.course._id+',0,0,0;'+tasks[i]._id+'@'+tasks[i].classof
      } 

    angular.forEach($scope.course.chapters, function(chapter) {  
      var chTasks = angular.copy(chapter.todos);
      for (var i = 0; i < chTasks.length; i++){
        chTasks[i].route=chapter.route+',0,0;'+chTasks[i]._id+'@'+chTasks[i].classof
        tasks.push(chTasks[i]);
      } 
            angular.forEach(chapter.parts, function(part) {
                var partTasks = angular.copy(part.todos);
                for (var i = 0; i < partTasks.length; i++){
                  partTasks[i].route=part.route+',0;'+partTasks[i]._id+'@'+partTasks[i].classof
                  tasks.push(partTasks[i]);
                }
                  angular.forEach(part.facts, function(fact){
                    var factTasks = angular.copy(fact.todos);
                    for(var i = 0; i<factTasks.length; i++){ 
                      factTasks[i].route=fact.route+';'+factTasks[i]._id+'@'+factTasks[i].classof
                      tasks.push(factTasks[i]);}
                  })
                  })
                                 
            });
  for (var i = 0; i < tasks.length; i++)   
      {
        tasks[i].selected = 1 
      } 

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
    angular.forEach(element.chapters, function(chapter) { 
      count = count +  chapter.facts.length;
      angular.forEach(chapter.parts, function(part) {
        count = count + part.facts.length
      });
    });
    type = "Cours ";
  }
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
   for (var i = 0; i < $scope.context.subtasks.length; i++)   
      {$scope.context.subtasks[i].selected = 0 }
   

    loadContext();
  
        var totalWidth = $('.col-lg-9').width();
        $('.data-table').css('width',totalWidth);
        $('th').css('overflow','hidden');
        $('.indicators_group').css('width','50px');
        var tdW = (totalWidth - 55)/26;
        
        $scope.width=tdW;
        if($('.course_title_top').length<1)
                $('.navbar-brand').after('<span class="course_title_top"> <span class="glyphicon glyphicon-book"></span>  <em>'+$scope.course.title+'</em></span>');

      
    
}
var goHome=function(){ 

  window.location.hash = '';
  
}
$scope.goHome=function(){
  goHome();
}

$scope.clicked=function(){
  alert('yes')
}

$scope.taskContexter= function(task) {
 //alert(task.route);
        var element = deparseTask(task.route);
        
 
 loadURL(element);
};

var addTask = function(route,params) {
        return $http.post('/api/tasks/add/'+route,params);
      };
var  deleteTask = function(params) {
        if(params.scope=='course')
          return $http.delete('/api/course/tasks/delete/'+params.route);  
        if(params.scope=='chapter')
          return $http.delete('/api/chapter/tasks/delete/'+params.route);  
        if(params.scope=='part')
          return $http.delete('/api/part/tasks/delete/'+params.route);  
      };
var editTask = function(params, task) {        
        if(params.scope=='course')          
          return $http.post('/api/course/tasks/edit/'+params.route, task);  
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
/********  Update on @ change ****************/
$(window).on('hashchange',function(){ 
  loadContext();
});
/********************************************/
var loadContext=function(){
   var url = location.hash.slice(1);
 
    var element = resolveRoute(url);
   $scope.context.route= url;
   
   $scope.context.Tasks=element.todos; 
   $scope.context.subfacts=computeAllFacts(element);
   for (var i = 0; i < $scope.context.subtasks.length; i++)   
      {$scope.context.subtasks[i].selected = 0 }


/******************************************/
var route = url;

  resetPath();
  var regExp = RegXpURL(route);

  //console.log(regExp);
  var task =  regExp.task; 
  var indicator = regExp.indicator;
  if(indicator==0) indicator="ALL";
  $scope.context.selectedIndicator=="ALL";

  var path = regExp.arr; 
  var arr = path.split(',');  
  var course  = $scope.course;
  var chap = -1;
  var part  = -1;
  var partElt = -1;
  var fact  = -1;


  if(arr.length<2) { 
    displayCourseInfos();
    $scope.context.selectedElement=course._id;
  }

  if(arr.length==2) {  

   chap = $.grep(course.chapters, function(e){ return  e._id == arr[1] })[0]; 
   partElt = $('.chapter_index[data-part='+chap.id+']')[0];
   
   if($scope.context.selectedElement==chap._id)     {goHome()}
    else    {displayChapterInfos(partElt);$scope.context.selectedElement=chap._id}
}

if(arr.length==3 && indicator=="ALL") { 
  chap = $.grep(course.chapters, function(e){ return  e._id == arr[1] })[0]; 
  part = $.grep(chap.parts, function(e){ return  e._id == arr[2] })[0]; 
  partElt = $('.part_index[data-part='+part.id+']'); 
  if($scope.context.selectedElement==part._id)     goHome()
    else    {displayPartInfos(partElt);$scope.context.selectedElement=part._id}
}
if(arr.length==3 && indicator!="ALL") { 
  
  chap = $.grep(course.chapters, function(e){ return  e._id == arr[1] })[0]; 
  part = $.grep(chap.parts, function(e){ return  e._id == arr[2] })[0]; 
  partElt = $('.part_index[data-part='+part.id+']'); 
  
   if($scope.context.selectedElement==part._id+'/'+indicator)     goHome()
     else{
    displayPartIssues(route, part, indicator);
    $scope.context.selectedElement=part._id+'/'+indicator;
    $scope.context.selectedIndicator=indicator;
  }
}

if(arr.length==4 /*&& indicator!="ALL"*/) { 
  
  chap = $.grep(course.chapters, function(e){ return  e._id == arr[1] })[0]; 
  part = $.grep(chap.parts, function(e){ return  e._id == arr[2] })[0];   

  fact = $.grep(part.facts, function(e){ return  e._id == arr[3] })[0]; 
  partElt = $('.part_index[data-part='+part.id+']'); 
  
  
 
  
   if($scope.context.selectedElement==fact._id)     goHome()
     else{
     displayIssue(route, part, indicator);
    $scope.context.selectedElement=fact._id;
    $scope.context.selectedIndicator=indicator;
  }
}
/*************************************************/
  var totalWidth = $('.col-lg-9').width();
        $('.data-table').css('width',totalWidth);
        $('th').css('overflow','hidden');
        $('.indicators_group').css('width','50px');
        var tdW = (totalWidth - 55)/26;
        
        $scope.width=tdW;
        if($('.course_title_top').length<1)
                $('.navbar-brand').after('<span class="course_title_top"> <span class="glyphicon glyphicon-book"></span>  <em>'+$scope.course.title+'</em></span>');


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
  //console.log(url);
  //URL : #course,chapter,part,fact;task@indicator
  var taskIndex =  url.indexOf(';'); 
  var indicatorIndex =  url.indexOf('@'); 
  

  var task =  0; 
  var indicator = 0;
  var arr=url;

 if((taskIndex==-1) && (indicatorIndex!=-1)){  
 indicator=url.split('@'); 
 if(indicator.length == 1) indicator=indicator[0]
  else {arr = indicator[0];indicator=indicator[1]}
 }

if((taskIndex!=-1) && (indicatorIndex==-1)){
 task=url.split(';'); 
 if(task.length == 1) task=task[0]
  else {arr = task[0];task=task[1]}
 }
if((taskIndex!=-1) && (indicatorIndex!=-1)){
  
 task=url.split(';'); 
 if(task.length == 1) task=task[0]
  else {arr = task[0];task=task[1]}

 task=task.split('@'); 
indicator=task[1];
task=task[0]
 }

  var result = {'arr': arr, 'task' : task , 'indicator' : indicator};
  //console.log(result);
  return result;
  
}
var loadURL =function(url){

  if(url == window.location.hash)
    $(window).trigger('hashchange')
  else 
    window.location.hash = url;
 
  $scope.$emit('content.changed');
  //$scope.$broadcast('content.reload');
  $(':focus').blur();

  return false;

}
$scope.triggerClick=function($event){  
  var url = $($event.currentTarget).find('a:first').attr('href');
  loadURL(url); 
  
 }
 $scope.triggerFactClick=function($event){  
  var url = $($event.currentTarget).attr('data-path');
  loadURL(url); 
  
 }


var displayIssue=function(url, part, indicator){   
  $(':focus').blur();
 
  resetPath();
//alert(url);
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
    
      
    angular.forEach(element.todos, function(todo){
      var results= $.grep($scope.context.subtasks, function(e){ return  e._id == todo._id && e.classof==indicator})[0]
      if(typeof results !== 'undefined') results.selected=1;
    });


  var parentUrl = url.substr(0, url.lastIndexOf(','))+'@'+indicator; 
  $('.td_issue[data-path="'+parentUrl+'"]').addClass('chosenPart');
  $scope.context.Facts=computeSubFacts(resolveRoute(parentUrl), indicator);
  $('.inspector-item[data-fact="'+element._id+'"]').addClass('inspector-item-selected');

  }

var displayPartIssues=function(url, part, indicator){   
  $(':focus').blur();
 
  resetPath();

  var regExp = RegXpURL(url); 
  url=regExp.arr+'@'+regExp.indicator;

 
      $('.td_issue[data-path="'+url+'"]').addClass('chosenPart');

      $scope.issuesInspectorShow = true;

     
     $scope.context.route= url;     
     var element = resolveRoute(url);
     

     $scope.context.Tasks=element.todos;
     $scope.context.Facts=computeSubFacts(element, indicator);
     
     
     var nb = $('.td_issue[data-path="'+url+'"]').find('.display-part-issues').text() ;
     if(nb==0) nb="aucune (0) remarque";
     if(nb==1) nb="une (1) remarque";
      if(nb>1) nb=nb+" remarques";
     $scope.context.inspector_title = "Partie: "+ part.title+' - '+nb+ " de type "+indicator ;

    
      
    angular.forEach(element.todos, function(todo){
      var results= $.grep($scope.context.subtasks, function(e){ return  e._id == todo._id && e.classof==indicator})[0]
      if(typeof results !== 'undefined') results.selected=1;
    });
    angular.forEach(element.facts, function(fact){
      angular.forEach(fact.todos, function(todo){
      var results= $.grep($scope.context.subtasks, function(e){ return  e._id == todo._id && e.classof==indicator})[0];
      if(typeof results !== 'undefined') results.selected=1;
    })
    });

    }

var selectChapter=function(index){

  
  var rowTop = $('.chapters-header> th:nth-child('+index+')').offset();
  var topTop = rowTop.top;
  var left = rowTop.left;

  var oneWidth = $('.chapters-header> th:nth-child('+index+')').innerWidth();
  var height = $('.data-table').innerHeight() ;


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
var height = $('.data-table').innerHeight() - $('.chapters-header th:first').innerHeight();


var rowBottom = $('.data-table tbody tr:last-child > td:nth-child('+index+')').offset();
var topBottom = rowBottom.top;

 $('#divOverlay').offset({top:topTop -2 ,left:left - 2});
  $('#divOverlay').height(height);
  $('#divOverlay').width(oneWidth);
  $('#divOverlay').css('visibility','visible');
$('#divOverlay').delay(500).slideDown('fast');
}
var displayPartInfos=function(partElt){
    resetPath();
    selectPart($(partElt).index() + 1);
    $(':focus').blur();
    
    
     var part = $(partElt).attr('data-part');

    var route = $(partElt).attr('data-path');
    for (var i = 0; i < $scope.context.subtasks.length; i++)   
      {$scope.context.subtasks[i].selected = 0 }

    var element=resolveRoute(route);
    angular.forEach(element.todos, function(todo){
      var results = $.grep($scope.context.subtasks, function(e){ return  e._id == todo._id })[0];
      if(typeof results !== 'undefined') results.selected=1;
    });
    angular.forEach(element.facts, function(fact){
      angular.forEach(fact.todos, function(todo){
      var results = $.grep($scope.context.subtasks, function(e){ return  e._id == todo._id })[0];
      if(typeof results !== 'undefined') results.selected=1;
    })
    });

        $scope.issuesInspectorShow = false;
}

var displayCourseInfos=function(){  
  resetPath(); 
  $scope.issuesInspectorShow = false;  
  $scope.context.inspector_title = "Cours: "+$scope.course.title +" - " +$scope.context.subfacts.length +" remarques";
  for (var i = 0; i < $scope.context.subtasks.length; i++)   
  {$scope.context.subtasks[i].selected = 1 }

$('#data-table').addClass('highlight-table');

}

var displayChapterInfos=function(partElt){ 
  resetPath();
  $scope.issuesInspectorShow = false;
  selectChapter($(partElt).index() + 1);
  $(':focus').blur();

  var route = $(partElt).attr('data-path');
  for (var i = 0; i < $scope.context.subtasks.length; i++)   
      {$scope.context.subtasks[i].selected = 0 }

  var element=resolveRoute(route);
  angular.forEach(element.todos, function(todo){
    var results = $.grep($scope.context.subtasks, function(e){ return  e._id == todo._id })[0];
    if(typeof results !== 'undefined') results.selected=1;
  });
  angular.forEach(element.facts, function(fact){
    angular.forEach(fact.todos, function(todo){
    var results = $.grep($scope.context.subtasks, function(e){ return  e._id == todo._id })[0];
    if(typeof results !== 'undefined') results.selected=1;
  })
  });

  angular.forEach(element.parts, function(part){

   angular.forEach(part.todos, function(todo){
    var results = $.grep($scope.context.subtasks, function(e){ return  e._id == todo._id })[0];
    if(typeof results !== 'undefined') results.selected=1;
  });
  angular.forEach(part.facts, function(fact){
    angular.forEach(fact.todos, function(todo){
    var results = $.grep($scope.context.subtasks, function(e){ return  e._id == todo._id })[0];
    if(typeof results !== 'undefined') results.selected=1;
  })
  });

  });
    
}

var displayIndicatorInfos=function(partElt){
$(':focus').blur();
$scope.issuesInspectorShow = false;
resetPath();
$(partElt).toggleClass('chosenPart');
  
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
 
}

$scope.editSuggestion=function($event){
  var suggestion = $($event.currentTarget).text(); 

  $scope.formData = suggestion;

}
$scope.createTask=function($event){
  var suggestion = "Nouvelle tâche"; 
$('#taskInput').focus();
  $scope.formData = suggestion;
  $scope.context.route = $($event.currentTarget).attr('href');
  
window.setTimeout(function() {
             $("#taskInput").fadeIn(100).fadeOut(100).fadeIn().focus().select();
        }, 50);

}

$scope.addTask = function (data) {
      if (data != undefined) {
        var addedTask = data;          
        var route = $scope.context.route;
        var query = parseTask(route, addedTask); alert(query.route); 
        addTask(query.route,query.todo)
        .success(function(data) {
          insertLocalTask(route, data);
          $scope.context.subtasks=computeAllTasks();
           $scope.formData = undefined;
            swal({   title: "Nouvelle tâche ajoutée!",   
            text: "Une nouvelle tâche a été ajoutée avec succès pour l'élément sélectionné.", 
             animation: "slide-from-top",
             type:"info"  ,
            timer: 1500,   showConfirmButton: false });
        });        
        
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
      title: "Delete the task?", 
      text: "Are you sure that you want to delete this task?", 
      type: "warning",
      showCancelButton: true,
      closeOnConfirm: false,
      confirmButtonText: "Yes, delete it!",
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

    $scope.findOne = function() {
     
      Courses.get({
        courseId: $stateParams.courseId
      }, function(course) {
     
        $scope.course = course;
        completeCourseParts($scope.course, $scope.courseParts);
    $scope.context = {
      'type':'course',      
      'route':$scope.course._id,
      'id':0,
      '_id':$scope.course._id,
      'title':$scope.course.title,
      'Todos':$scope.course.todos,
      'indicator':'ALL',
      'selectedElement':$scope.course._id
    };
    $scope.context.subtasks=computeAllTasks();
      

    if($('.course_title_top').length<1)
        $('.navbar-brand').after('<span class="course_title_top"> <span class="glyphicon glyphicon-book"></span>  <em>'+$scope.course.title+'</em></span>');

      loadContext();

  


      });
    };
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