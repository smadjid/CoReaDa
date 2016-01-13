
'use strict'; 

/* jshint -W098 */
var courseModule = angular.module('mean.course',  ['xeditable','ui.bootstrap','ngScrollbars','vAccordion']);

courseModule.run(function(editableOptions, editableThemes) {
  editableThemes.bs3.inputClass = 'input-sm';
  editableThemes.bs3.buttonsClass = 'btn-xs';
  editableOptions.theme = 'bs3';
});

courseModule.controller('courseController', ['$scope', '$document','$location', '$http','$uibModal', 'Global', 'Course', 'CoursesDB','focusStudyManager','Todos',
  function($scope, $document,$uibModal, $http,$location, Global, Course,CoursesDB,focusStudyManager,Todos) {
    $scope.global = Global;
    $scope.package = {
      name: 'course'
    };

   



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
    scrollButtons:{enable:true,scrollType:"stepped"},
    advanced:{
        updateOnContentResize: true,
                autoExpandHorizontalScroll: true,
                autoExpandVerticalScroll: true,
                updateOnSelectorChange: true
    },
        setHeight: 200,
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
  var courseId = arr[0] ;
  var chapId = 0;
  var partId=0;
  var factId=0;
 
  if(arr.length>=2)   chapId =  arr[1] ;
  if(arr.length>=3)   partId =  arr[2] ;
  if(arr.length>=4)   factId =  arr[3] ;

  
 var result = courseId+'/'+chapId+'/'+partId+'/'+factId;


  return result
};

var updateDisplay=function(){
    var url = location.hash.slice(1);
   $scope.context.route= url;
   $scope.context.path=compilePath(url);
   $scope.context.Tasks=resolveRoute(url).todos;
    loadContext(url);
    
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

        //$('.td_issue').css()
       

        
      })
        .error(function(data) {
            console.log('Error: ' + data);
        });
    

 

$scope.displayIssue=function($event){
$(':focus').blur();
if(($($event.currentTarget).parent().hasClass('chosenPart'))){    
    resetPath();
  return;
}
resetPath();
$($event.currentTarget).parent().toggleClass('chosenPart');

    var indicator = $($event.currentTarget).attr('data-indicator');
    var part = $($event.currentTarget).attr('data-part');
    var fact = $($event.currentTarget).attr('data-fact');  
   
    
  
   
    
    $scope.focusStudy = focusStudyManager.update(angular.copy($scope.studiedCourse), angular.copy($scope.focusStudy), part , indicator);

    $scope.issuesInspectorShow = true;
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
    

 //  $('.parts-header> th:nth-child('+index+')').addClass('highlight-top');    
  //  $('table tr:last-child > td:nth-child('+index+')').addClass('highlight-bottom');
}


   var displayPartInfos=function(partElt){
  
    if($(partElt).parent().hasClass('highlight-top'))
       return resetPath();

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

if(($(partElt).parent().hasClass('chosenPart'))){  
  resetPath();
  return;
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

/*
$scope.$watch('issuesInspectorShow', function(value) {   
        if (!value) {
                $('.highlighted').removeClass('highlighted');
                $('.overlayed').removeClass('overlayed');
                $scope.focusStudy = focusStudyManager.update(angular.copy($scope.studiedCourse), angular.copy($scope.focusStudy),-1, 'ALL');
                $('.display-issues-btn').show();
        }
    });*/
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
/*
$scope.$watch('focusStudy.studiedElt', function() {
      //  $scope.Tasks = Todos.filterTasks($scope.focusStudy.studiedElt);
        $scope.loading = false;
        $scope.formData = {};

       
        if($scope.focusStudy.studiedElt.id)  {          
          $scope.inspector={'type':'Partie', 'title':$scope.focusStudy.studiedElt.title, 
        
        'description':computeInspectorPartProperties($scope.focusStudy.studiedElt.properties)}
        }        
        else {$scope.inspector={'type':'Course', 'title':$scope.focusStudy.studiedElt.title, 
               
                'description':computeInspectorCourseProperties($scope.focusStudy.studiedElt.properties)}
        }   ;

        //console.log(computeInspectorCourseProperties($scope.focusStudy.studiedElt.properties));
        //$scope.inspector = {'cours' = $scope.studiedCourse.title;
        //scope.focusStudy.facts.length
        

        
    });*/


/////////////////////////////// TODOS ////////////////////////
/*var resolveRoute=function(route){
    var arr = route.split(','); 
    var result = $scope.studiedCourse;  
    if(arr.length>1) {
      result = $.grep($scope.studiedCourse.chapters, function(e){ return  e._id == arr[1] })[0];
     
      if(arr.length>2){
        result = $.grep(result.parts, function(e){ return  e._id == arr[2] })[0];
        if(arr.length>3){
          var fact = $.grep(result.facts, function(e){ return  e._id == arr[3] })[0];
          if(arr.length>4){
            result = $.grep(result.todos, function(e){ return  e._id == arr[3] })[0];            
          }
        }
      }
    }
     alert(result.title);
    return result;  
  }*/
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

$scope.addTask = function () {
      if ($scope.formData.text != undefined) {
        $scope.loading = true;
        var addedTask = $scope.formData.text;  
        Todos.addTask(parseRequest($scope.context.route),  {type:'edition', todo:addedTask})
        .success(function(data) {
          insertLocalTask($scope.context.route, data);
           $scope.formData.text = undefined;    
        });
             
      }       
  }

var updateLocalTasks=function(route, data){
  var element = resolveRoute(route);
  element.todos = data;
 updateDisplay(); 

}

$scope.deleteTask = function (todoId, index) {
    Todos.deleteTask(parseRequest($scope.context.route)+'/'+todoId)
        .success(function(data) {
          updateLocalTasks($scope.context.route, data)          
              });

  }

$scope.editTask = function (todoId, data) {       
  alert(parseRequest($scope.context.route)+'/'+todoId);
        Todos.editTask(parseRequest($scope.context.route)+'/'+todoId,  {type:'edition', todo:data})
        .success(function(data) {
          updateLocalTasks($scope.context.route, data)  
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
