'use strict'; 
/// set up the very simple jQuery plugin
(function($){
  $.fn.domChange = function( whenChanged ){
     /// we want to store our setInterval statically so that we
     /// only use one for all the listeners we might create in a page
     var _static = $.fn.domChange;
     _static.calls = [];
     _static.iid = setInterval( function(){
       var i = _static.calls.length;
       while ( i-- ) {
         if ( _static.calls[i] ) {
           _static.calls[i]();
         }
       }
     }, 500 );
     /// step each element in the jQuery collection and apply a
     /// logic block that checks for the change in html
     this.each (function(){
       var target = $(this), html = target.html();
       /// by adding the function to a list we can easily switch
       /// in extra checks to the main setInterval function
       _static.calls.push (function(){
         if ( html != target.html() ) {
           html = target.html();
           whenChanged();
         }
       });
     });
  }
})(typeof jQuery != undefined && jQuery);
/* jshint -W098 */
var courseModule = angular.module('mean.course',  ['xeditable','ui.bootstrap','ngScrollbars','perfect_scrollbar','angularSpinner']);

/* Global configurations */
courseModule.run(function(editableOptions, editableThemes) {
  editableThemes.bs3.inputClass = 'input-sm';
  editableThemes.bs3.buttonsClass = 'btn-xs';
  editableOptions.theme = 'bs3';
});


/* Main Course Controller */
courseModule.controller('courseController', ['$scope', '$document','$location', '$http','$uibModal', 'Global', 'Course', 'CoursesDB','focusStudyManager','Todos','usSpinnerService',
  function($scope, $document,$uibModal, $http,$location, Global, Course,CoursesDB,focusStudyManager,Todos,usSpinnerService) {

/* App functions  */
var startSpin = function(){
        usSpinnerService.spin('spinner');
}
var stopSpin = function(){
        usSpinnerService.stop('spinner');
}



$('.data-table').domChange( function(){
      alert('I was changed!');
    } );
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

var resolveRoute=function(route){
   var arr = route.split(',');        
   if(arr.length>1) {
     var chap = $.grep($scope.studiedCourse.chapters, function(e){ return  e._id == arr[1] })[0];
     if(arr.length>2){
       var part = $.grep(chap.parts, function(e){ return  e._id == arr[2] })[0];
       if(arr.length>3){
         var fact = $.grep(part.facts, function(e){ return  e._id == arr[3] })[0];
         if(arr.length>4){
           var todo = $.grep(fact.todos, function(e){ return  e._id == arr[3] })[0];
           return todo;
         }
         return fact
       }
       return part
     }     
     return chap
    }
  return $scope.studiedCourse;  
}
var resetPath=function(){    
  $('.chosenPart').removeClass('chosenPart'); 
  $('.data-table').removeClass('highlight-table');
  $('#divOverlay').css('visibility','hidden');
  
  $scope.issuesInspectorShow = false;
  $scope.focusStudy = focusStudyManager.update(angular.copy($scope.studiedCourse), angular.copy($scope.focusStudy),-1, 'ALL');

}
var compilePath=function(path){
  var arr = path.split(','); 
  var result ="<a class='glyphicon glyphicon-home' href=\"#"+arr[0]+"\"></a>" ;

  if(arr.length>=2) {
  var chap = $.grep($scope.studiedCourse.chapters, function(e){ return  e._id == arr[1] })[0];
  result = result+" \/ <a href='#"+arr[0]+"'>"+chap.title+"</a>"; 
  }  
  
  if(arr.length>=3) {
    var part = $.grep(chap.parts, function(e){ return  e._id == arr[2] })[0];    
    result = result+" \/ <a href='#"+arr[0]+","+arr[1]+"'>"+part.title+"</a>"; 
    
    if(arr.length>=4) {
      var fact = $.grep(part.facts, function(e){ return  e._id == arr[3] })[0];      
      result = result+" \/ <a href='#"+arr[0]+","+arr[1]+","+arr[2]+"'>"+fact.name+"</a>"; 
    }
  }
 
  return result;
}


var parseRequest=function(path){
  var arr = path.split(','); 
  var courseId = $scope.studiedCourse._id;
  var chapId = 0;
  var partId=0;
  var factId=0;
 
  if(arr.length>=2)   chapId =  arr[1] ;
  if(arr.length>=3)   partId =  arr[2] ;
  if(arr.length>=4)   factId =  arr[3] ;
  
 var result = courseId+'/'+chapId+'/'+partId+'/'+factId;
  return result
}

var computeSubTasks=function(){ 
 var tasks=angular.copy($scope.studiedCourse.todos);
  for (var i = 0; i < tasks.length; i++)   
      {tasks[i].selected = 1 }
    angular.forEach($scope.studiedCourse.chapters, function(chapter) {  
      var chTasks = angular.copy(chapter.todos);
      for (var i = 0; i < chTasks.length; i++){
        chTasks[i].selected = 1;
        tasks.push(chTasks[i]);
      } 
            angular.forEach(chapter.parts, function(part) {
                var partTasks = angular.copy(part.todos);
                for (var i = 0; i < partTasks.length; i++){
                  partTasks[i].selected = 1;
                  tasks.push(partTasks[i]);}
                  angular.forEach(part.facts, function(fact){
                    var factTasks = angular.copy(fact.todos);
                    for(var i = 0; i<factTasks; i++){
                      factTasks[i].selected = 1;
                      tasks.push(factTasks[i]);}
                  })
                  })
                                 
            });
  return tasks

}


var computeSubFacts=function(element){
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

    
/* Scope configuration and variables*/
$scope.global = Global;
$scope.package = {
      name: 'course'
}

$scope.formData = {}
$scope.issuesInspectorShow = false;
$scope.courseParts=[];


// scrollbar config
$scope.scrollconfig = {
    autoHideScrollbar: true,
    scrollbarPosition: 'outside',
    theme: 'dark',
    live: true,
    scrollX:'none',
    scrollY:'left',
    scrollButtons:{enable:true,scrollType:"stepped"},
    advanced:{
        updateOnContentResize: true,
                autoExpandHorizontalScroll: true,
                autoExpandVerticalScroll: true,
                updateOnSelectorChange: true
    },
     
        scrollInertia: 0
}
;



/* Scope functions */
var updateDisplay=function(){
  startSpin();

    var url = location.hash.slice(1);
   $scope.context.route= url;
   $scope.context.path=compilePath(url);
   $scope.context.Tasks=resolveRoute(url).todos;
   $scope.context.subfacts=computeSubFacts(resolveRoute(url));
   

    loadContext(url);
  
        var totalWidth = $('.col-lg-9').width();
        $('.data-table').css('width',totalWidth);
        $('th').css('overflow','hidden');
        $('.indicators_group').css('width','50px');
        var tdW = (totalWidth - 55)/26;
        
        $scope.width=tdW;

      stopSpin();
    
}
var goHome=function(){ 
  window.location.href = "course#"+$scope.studiedCourse._id; 
  
}
$scope.goHome=function(){
  goHome();
}


/********  Update on @ change ****************/
$(window).on('hashchange',function(){ 
  updateDisplay();
});
/********************************************/

var loadContext=function(path){
  resetPath();
  var arr = path.split(',');  
  var course  = $scope.studiedCourse;
  var chap = -1;
  var part  = -1;
  var partElt = -1;


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

if(arr.length>=3) {
  chap = $.grep(course.chapters, function(e){ return  e._id == arr[1] })[0]; 
  part = $.grep(chap.parts, function(e){ return  e._id == arr[2] })[0]; 
  partElt = $('.part_index[data-part='+part.id+']'); 
  if($scope.context.selectedElement==part._id)     goHome()
    else    {displayPartInfos(partElt);$scope.context.selectedElement=part._id}
}


}

var scale = chroma.scale('OrRd');
$scope.computeBgColor=function(val){
  return scale(val/5).hex();
}

$scope.computeTextColor=function(val){
  if(val==0) return 'rgb(34, 34, 34)';
  if(val==1) return '#354831';
  if(val==2) return '#716F6F';
  if(val==3) return '#F5F5F5';
  if(val>=4) return 'white';
}

$scope.triggerClick=function($event){  
  var url = $($event.currentTarget).find('a:first').attr('href');
  
  
  //console.log(window.location.hash ==)
  if(url == window.location.hash)
    $(window).trigger('hashchange')
  else 
    window.location.href = "course"+url;
 
  $scope.$emit('content.changed');
  //$scope.$broadcast('content.reload');
  $(':focus').blur();
  
 }

$scope.displayIssue=function($event){  
  $(':focus').blur();
  if(($($event.currentTarget).hasClass('chosenPart'))){    
      resetPath();
      goHome();
    return;
  }
  resetPath();

  $($event.currentTarget).toggleClass('chosenPart');

      var indicator = $($event.currentTarget).attr('data-indicator');
      var part = $($event.currentTarget).attr('data-part');
      var fact = $($event.currentTarget).attr('data-fact');  
      
      $scope.focusStudy = focusStudyManager.update(angular.copy($scope.studiedCourse), angular.copy($scope.focusStudy), part , indicator);

      $scope.issuesInspectorShow = true;

     var url =  $($event.currentTarget).attr('data-path');
     $scope.context.route= url;
     $scope.context.path=compilePath(url);
     $scope.context.Tasks=resolveRoute(url).todos;
     
     
     $scope.context.inspector_title = "Parte: "+ $.grep($scope.studiedCourse.parts, function(e){ return  e.id == part })[0].title+' - '+
   $($event.currentTarget).find('.display-part-issues').text() +  " remarques de type "+ $($event.currentTarget).attr('data-indicator') ;

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

    $scope.focusStudy = focusStudyManager.update(
        angular.copy($scope.studiedCourse), angular.copy($scope.focusStudy), part , 'ALL');
    var route = $(partElt).attr('data-path');
    for (var i = 0; i < $scope.context.subtasks.length; i++)   
      {$scope.context.subtasks[i].selected = 0 }

    var element=resolveRoute(route);
    angular.forEach(element.todos, function(todo){
      $.grep($scope.context.subtasks, function(e){ return  e._id == todo._id })[0].selected=1;
    });
    angular.forEach(element.facts, function(fact){
      angular.forEach(fact.todos, function(todo){
      $.grep($scope.context.subtasks, function(e){ return  e._id == todo._id })[0].selected=1;
    })
    });

        $scope.issuesInspectorShow = false;
}

var displayCourseInfos=function(){  
  resetPath(); 
  $scope.issuesInspectorShow = false;  
  $scope.context.inspector_title = "Cours: "+$scope.studiedCourse.title +" - " +$scope.context.subfacts.length +" remarques";
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
    $.grep($scope.context.subtasks, function(e){ return  e._id == todo._id })[0].selected=1;
  });
  angular.forEach(element.facts, function(fact){
    angular.forEach(fact.todos, function(todo){
    $.grep($scope.context.subtasks, function(e){ return  e._id == todo._id })[0].selected=1;
  })
  });

  angular.forEach(element.parts, function(part){

   angular.forEach(part.todos, function(todo){

    $.grep($scope.context.subtasks, function(e){ return  e._id == todo._id })[0].selected=1;
  });
  angular.forEach(part.facts, function(fact){
    angular.forEach(fact.todos, function(todo){
    $.grep($scope.context.subtasks, function(e){ return  e._id == todo._id })[0].selected=1;
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
        'value':$scope.studiedCourse.parts.length},
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

var insertLocalTask=function(route, task){
  var element = resolveRoute(route);
  element.todos.unshift(task);
 //updateDisplay();
}

$scope.editSuggestion=function($event){
  var suggestion = $($event.currentTarget).text(); 

  $scope.formData.text = suggestion;
  
  //$("#taskInput").fadeIn(500).fadeOut(500).fadeIn(500);
window.setTimeout(function() {
             $("#taskInput").fadeIn(200).fadeOut(200).fadeIn().focus().select();
        }, 50);
 


}
$scope.createSuggestion=function($event){
  var suggestion = "Nouvelle tâche"; 
$('#taskInput').focus();
  $scope.formData.text = suggestion;
window.setTimeout(function() {
             $("#taskInput").fadeIn(100).fadeOut(100).fadeIn().focus().select();
        }, 50);

}
$scope.forwardSuggestion=function($event, route){  
  var suggestion = $($event.currentTarget).text();  
  Todos.addTask(parseRequest($scope.context.route),  {type:'edition', todo:suggestion})
        .success(function(data) {
          insertLocalTask(route, data);
          $scope.context.alltasks=computeSubTasks();
          swal({   title: "Nouvelle tâche ajoutée à l'élément concerné!",   
            text: "La suggestion a été ajoutée comme tâche avec succès.", 
             animation: "slide-from-top",
             type:"info"  ,
            timer: 1500,   showConfirmButton: false });
        });
}
$scope.addTask = function () {
      if ($scope.formData.text != undefined) {
        var addedTask = $scope.formData.text;          
        var route = $scope.context.route;
        Todos.addTask(parseRequest(route),  {type:'edition', todo:addedTask})
        .success(function(data) {
          insertLocalTask(route, data);
          $scope.context.alltasks=computeSubTasks();
           $scope.formData.text = undefined;
            swal({   title: "Nouvelle tâche ajoutée!",   
            text: "Une nouvelle tâche a été ajoutée avec succès pour l'élément sélectionné.", 
             animation: "slide-from-top",
             type:"info"  ,
            timer: 1500,   showConfirmButton: false });    
        });
             
      }       
  }

var updateLocalTasks=function(route, data){
  var element = resolveRoute(route);
  element.todos = data;
 updateDisplay();

}

$scope.deleteTask = function (todoId, index) {
swal({
      title: "Delete the task?", 
      text: "Are you sure that you want to delete this task?", 
      type: "warning",
      showCancelButton: true,
      closeOnConfirm: false,
      confirmButtonText: "Yes, delete it!",
      confirmButtonColor: "#ec6c62"
    }, function() {
       Todos.deleteTask(parseRequest($scope.context.route)+'/'+todoId)
        .success(function(data) {
          updateLocalTasks($scope.context.route, data)     ;
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

$scope.editTask = function (todoId, data) {       
  parseRequest($scope.context.route)+'/'+todoId;
        Todos.editTask(parseRequest($scope.context.route)+'/'+todoId,  {type:'edition', todo:data})
        .success(function(data) {
          updateLocalTasks($scope.context.route, data)  ;
          swal({   title: "Tâche modifiée!",   
            text: "La tâche a été modifiée avec succès.", 
             animation: "slide-from-top",
             type:"info"  ,
            timer: 1500,   showConfirmButton: false });
        });
  }
/*  MAIN FUNCTION */
startSpin();

CoursesDB.get()
  .success(function(data) {
    $scope.studiedCourse = data[0];
    completeCourseParts($scope.studiedCourse, $scope.courseParts);
    $scope.context = {
      'type':'course',
      'path':compilePath($scope.studiedCourse._id),
      'route':$scope.studiedCourse._id,
      'id':0,
      '_id':$scope.studiedCourse._id,
      'title':$scope.studiedCourse.title,
      'Todos':$scope.studiedCourse.todos,
      'indicator':'ALL',
      'selectedElement':$scope.studiedCourse._id
    }

    $scope.focusStudy = focusStudyManager.initialize($scope.studiedCourse);
    $scope.context.subtasks=computeSubTasks();
        window.location.href = "course#"+$scope.studiedCourse._id;
    updateDisplay();
     displayCourseInfos();
        
  })
  .error(function(data) {
    console.log('Error: ' + data);
  });

stopSpin();

}
]);
