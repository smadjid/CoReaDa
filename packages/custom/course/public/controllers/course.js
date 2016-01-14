
'use strict'; 

/* jshint -W098 */
var courseModule = angular.module('mean.course',  ['xeditable','ui.bootstrap','ngScrollbars','vAccordion','angularSpinner']);

courseModule.run(function(editableOptions, editableThemes) {
  editableThemes.bs3.inputClass = 'input-sm';
  editableThemes.bs3.buttonsClass = 'btn-xs';
  editableOptions.theme = 'bs3';
});

courseModule.controller('courseController', ['$scope', '$document','$location', '$http','$uibModal', 'Global', 'Course', 'CoursesDB','focusStudyManager','Todos','usSpinnerService',
  function($scope, $document,$uibModal, $http,$location, Global, Course,CoursesDB,focusStudyManager,Todos,usSpinnerService) {
    $scope.global = Global;
    $scope.package = {
      name: 'course'
    };

   
 var startSpin = function(){
        usSpinnerService.spin('spinner');
    }
var stopSpin = function(){
        usSpinnerService.stop('spinner');
   }


$scope.indicators=['Readings','Rereading','Transition','Stop'];

$scope.dynamicPopover = {
    content: '',
    templateUrl: 'myPopoverTemplate.html',
    title: 'Title'
  };


$scope.formData = {};
$scope.loading = false;
$scope.animationsEnabled = true;
$scope.issuesInspectorShow = false;
$scope.courseParts=[];




// scrollbar config
$scope.scrollconfig = {
    autoHideScrollbar: false,
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
        setHeight: 250,
        scrollInertia: 0
    }
;


var completeCourseParts=function(){
  var course_route = $scope.studiedCourse._id;
  angular.forEach($scope.studiedCourse.chapters, function(chapter) { 
            chapter.route=course_route+','+chapter._id
            angular.forEach(chapter.parts, function(part) {
              part.parent = chapter._id;
              part.route=chapter.route+','+part._id;
              angular.forEach(part.facts,function(fact){
                  fact.route=part.route+','+fact._id
              });
                $scope.courseParts.push(
                    part
                );
                
            });
        
        });
  

};

var resetPath=function(){
  $('.overlayed').removeClass('overlayed');
  $('.chosenPart').removeClass('chosenPart');
  
   $scope.issuesInspectorShow = false;

   $('.highlight-left').removeClass('highlight-left');
  $('.highlight-right').removeClass('highlight-right');
  $('.highlight-top').removeClass('highlight-top');
  $('.highlight-bottom').removeClass('highlight-bottom');
  $('.overlayed').removeClass('overlayed');
  $('.chosenPart').removeClass('chosenPart');

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
};
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
};


var computeSubFacts=function(element){
  var type = element.elementType;
  var facts=angular.copy(element.facts);

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
                  partFacts[i].sourceTitle = 'Part '+part.id+': '+part.title;
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
                  partFacts[i].sourceTitle = 'Part '+part.id+': '+part.title;
                  facts.push(partFacts[i]);
                 }                
    });
  }
  /******Part*******/
  if(type=='part'){
    for (var i = 0; i < facts.length; i++)   {facts[i].source = element.route; facts[i].sourceTitle = 'This part';}
  }

  return facts

};


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

/********  Update on @ change ****************/
$(window).on('hashchange',function(){ 
  updateDisplay();
});
/********************************************/

var loadContext=function(path){
   if(!path) resetPath();
  var arr = path.split(',');  
  var course  = $scope.studiedCourse;
  var chap = -1;
  var part  = -1;
  if(arr.length>=2) {  
     chap = $.grep(course.chapters, function(e){ return  e._id == arr[1] })[0]; 
    displayChapterInfos($('.chapter_index[data-part='+chap.id+'] > a')[0]);
  }

  if(arr.length>=3) {

    part = $.grep(chap.parts, function(e){ return  e._id == arr[2] })[0];  
    displayPartInfos($('.part_index[data-part='+part.id+'] > a')[0]);
  }

  
};

//CoursesDB.seed() 
stopSpin();
    CoursesDB.get()
      .success(function(data) {

        
        $scope.studiedCourse = data[0];
        completeCourseParts();
        $scope.context = {
          'type':'course',
          'path':compilePath($scope.studiedCourse._id),
          'route':$scope.studiedCourse._id,
          'id':0,
          '_id':$scope.studiedCourse._id,
          'title':$scope.studiedCourse.title,
          'Todos':$scope.studiedCourse.todos,
          'indicator':'ALL'
        }

      

                       
        $scope.allIssues = [];

        $scope.focusStudy = focusStudyManager.initialize($scope.studiedCourse);
        $scope.inspector={'type':'Course', 'title':$scope.studiedCourse.title, 'nIssues':0, 'nWarn':0,'nTasks':0,'description':''};
        
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
        angular.forEach($scope.studiedCourse.parts, function(part) {        
            angular.forEach(part.facts, function(fact) {
                $scope.allIssues.push(
                    fact
                );
                
            });
        
        });

        window.location.href = "course#"+$scope.studiedCourse._id;
        
      })
        .error(function(data) {
            console.log('Error: ' + data);
        });
    
stopSpin();

 $scope.triggerClick=function($event){
  var url = $($event.currentTarget).find('a:first').attr('href');
  window.location.href = "course"+url;
  
 }

$scope.displayIssue=function($event){  
$(':focus').blur();
if(($($event.currentTarget).hasClass('chosenPart'))){    
    resetPath();
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
 
 //   $('#erros-list-group').show();

  };

var selectPart=function(index){
   $('table tr > td:nth-child('+index+'), .parts-header > th:nth-child('+index+')').addClass('highlight-left highlight-right');
   $('.parts-header> th:nth-child('+index+')').addClass('highlight-top');    
   
    $('tbody tr:last-child > td:nth-child('+index+')').addClass('highlight-bottom');
};
var selectChapter=function(index){
  var begin = 0;
  var end = 0;
  $('.chapters-header> th:nth-child('+index+')').addClass('highlight-top highlight-right highlight-left');
  $('.chapters-header> th').slice(0, index-1).each(function(){
    begin = begin + this.colSpan;
  });
  $('.chapters-header> th').slice(0, index).each(function(){
    end = end + this.colSpan;
  });

   $('table tr > td:nth-child('+begin+'), .parts-header > th:nth-child('+begin+')').addClass('highlight-right');
   $('table tr > td:nth-child('+end+'), .parts-header > th:nth-child('+end+')').addClass('highlight-right');
   $('table tr:last-child > td').slice(begin-1,end-1).each(function()
   {
    $(this).addClass('highlight-bottom');
   });
    

}


   var displayPartInfos=function(partElt){
  
    if($(partElt).parent().hasClass('highlight-top')){
      window.location.href = "course#"+$scope.studiedCourse._id;
      return;
    }
       

    resetPath();
    selectPart($(partElt).parent().index() + 1);
   
    $(':focus').blur();
    $('.highlighted').removeClass('highlighted');
    $('.chosenPart').removeClass('chosenPart');

var part = $(partElt).parent().attr('data-part');
$scope.focusStudy = focusStudyManager.update(angular.copy($scope.studiedCourse), angular.copy($scope.focusStudy), part , 'ALL');

    $scope.issuesInspectorShow = false;
 //   $('#erros-list-group').show();

  };

  var displayChapterInfos=function(partElt){ 

$('.highlighted').removeClass('highlighted');

$scope.issuesInspectorShow = false;

if(($(partElt).parent().hasClass('highlight-top'))){  
  
      window.location.href = "course#"+$scope.studiedCourse._id;
  
    }

resetPath();
selectChapter($(partElt).parent().index() + 1);

    $(':focus').blur();
  
  };

  var displayIndicatorInfos=function(partElt){
$(':focus').blur();
$('.highlighted').removeClass('highlighted');


$scope.issuesInspectorShow = false;

if(($(partElt).hasClass('chosenPart'))){  
  resetPath();
  return;
}
resetPath();
$(partElt).toggleClass('chosenPart');

    var part = $($event.currentTarget).attr('data-part');
    

    if(indicator!='ALL') {
      $('.indicators_group[data-indicator!='+indicator+']').removeClass('highlighted').addClass('overlayed');
      $('.indicators_group[data-indicator='+indicator+']').addClass('highlighted').removeClass('overlayed');    
    
    }
  
  };
var tabsFn = (function() {
  
  function init() {
    setHeight();
  }
  
  function setHeight() {
    var $tabPane = $('.tab-pane'),
        tabsHeight = $('.nav-tabs').height();
    
    $tabPane.css({
      height: tabsHeight
    });
  }
    
  $(init);
})();

var computeInspectorCourseProperties = function(properties){
  var prop = {'property':'', 'value':''};
  
   
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

};

var computeInspectorPartProperties = function(properties){
  var prop = {'property':'', 'value':''};  
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

};

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
  
  
var insertLocalTask=function(route, task){
  var element = resolveRoute(route);
  element.todos.unshift(task);
 updateDisplay();
}

$scope.acceptSuggestion=function($event){
  var suggestion = $($event.currentTarget).text();
  Todos.addTask(parseRequest($scope.context.route),  {type:'edition', todo:suggestion})
        .success(function(data) {
          insertLocalTask($scope.context.route, data);
          swal({   title: "Nouvelle tâche ajoutée!",   
            text: "La suggestion a été ajoutée comme tâche avec succès.", 
             animation: "slide-from-top",
             type:"info"  ,
            timer: 1500,   showConfirmButton: false });
        });
}
$scope.forwardSuggestion=function($event, route){
  
  var suggestion = $($event.currentTarget).text();  
  Todos.addTask(parseRequest($scope.context.route),  {type:'edition', todo:suggestion})
        .success(function(data) {
          insertLocalTask(route, data);
          swal({   title: "Nouvelle tâche ajoutée à l'élément concerné!",   
            text: "La suggestion a été ajoutée comme tâche avec succès.", 
             animation: "slide-from-top",
             type:"info"  ,
            timer: 1500,   showConfirmButton: false });
        });
}
$scope.addTask = function () {
      if ($scope.formData.text != undefined) {
        $scope.loading = true;
        var addedTask = $scope.formData.text;  
        var route = $scope.context.route;
        Todos.addTask(parseRequest(route),  {type:'edition', todo:addedTask})
        .success(function(data) {
          insertLocalTask(route, data);
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
          swal("Deleted!", "The task was successfully deleted!", "success");     
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


    
 $scope.doneTask = function (index) {
    $scope.tasks[index].done = true;
  }
  $scope.unDoneTask = function (index) {
    $scope.tasks[index].done = false;
  }


}
]);
