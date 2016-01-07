
'use strict'; 

/* jshint -W098 */
var courseModule = angular.module('mean.course',  ['xeditable','ui.bootstrap','ngScrollbars']);

courseModule.run(function(editableOptions, editableThemes) {
  editableThemes.bs3.inputClass = 'input-sm';
  editableThemes.bs3.buttonsClass = 'btn-xs';
  editableOptions.theme = 'bs3';
});

courseModule.controller('courseController', ['$scope', '$http','$uibModal', 'Global', 'Course', 'CoursesDB','focusStudyManager','Todos',
  function($scope, $uibModal, $http, Global, Course,CoursesDB,focusStudyManager,Todos) {
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
$scope.editIndex = false;
$scope.loading = false;
$scope.animationsEnabled = true;
$scope.issuesInspectorShow = false;





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


//CoursesDB.seed() 
    CoursesDB.get()
      .success(function(data) {

        $scope.studiedCourse = data[0];               
        $scope.allIssues = [];

        $scope.focusStudy = focusStudyManager.initialize($scope.studiedCourse);
        $scope.inspector={'type':'Course', 'title':$scope.studiedCourse.title, 'nIssues':0, 'nWarn':0,'nTasks':0,'description':''};
        
        var scale = chroma.scale('OrRd');
        $scope.computeBgColor=function(val){
          return scale(val/5).hex();
        }
        
        $scope.computeTextColor=function(val){
          if(val==0) return 'green';
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

        
      })
        .error(function(data) {
            console.log('Error: ' + data);
        });
    

  $scope.hideIssuesDialog = function(){
    $scope.studiedElt = $scope.studiedCourse;
    $scope.issuesInspectorShow=false;
  }

$scope.displayIssue=function($event){
$(':focus').blur();


if(($($event.currentTarget).parent().hasClass('chosenPart'))){  
  $('.overlayed').removeClass('overlayed');
  $('.chosenPart').removeClass('chosenPart');
  $scope.focusStudy = focusStudyManager.update(angular.copy($scope.studiedCourse), angular.copy($scope.focusStudy),-1, 'ALL');
   $scope.issuesInspectorShow = false;
  return;
}
$('.chosenPart').removeClass('chosenPart');
$($event.currentTarget).parent().toggleClass('chosenPart');

    var indicator = $($event.currentTarget).attr('data-indicator');
    var part = $($event.currentTarget).attr('data-part');
    var fact = $($event.currentTarget).attr('data-fact');    
  
   
    
    $scope.focusStudy = focusStudyManager.update(angular.copy($scope.studiedCourse), angular.copy($scope.focusStudy), part , indicator);


    $scope.issuesInspectorShow = true;
 //   $('#erros-list-group').show();

  };

var selectPart=function(index){
   $('table tr > td:nth-child(4), .parts-header > th:nth-child(4)').addClass('highlight-left highlight-right');

     $('.parts-header  > th:nth-child(4)').addClass('highlight-top');

    $('table tr:last-child > td:nth-child(4)').addClass('highlight-bottom');
}

  $scope.displayPartInfos=function($event){
   selectPart(6);
$(':focus').blur();
$('.highlighted').removeClass('highlighted');

$scope.issuesInspectorShow = false;

if(($($event.currentTarget).parent().hasClass('chosenPart'))){  
  $('.overlayed').removeClass('overlayed');
  $('.chosenPart').removeClass('chosenPart');
  $scope.focusStudy = focusStudyManager.update(angular.copy($scope.studiedCourse), angular.copy($scope.focusStudy),-1, 'ALL');
  return;
}
$('.chosenPart').removeClass('chosenPart');
$($event.currentTarget).parent().toggleClass('chosenPart');

    var part = $($event.currentTarget).attr('data-part');
    if(indicator!='ALL') {
      $('.indicators_group[data-indicator!='+indicator+']').removeClass('highlighted').addClass('overlayed');
      $('.indicators_group[data-indicator='+indicator+']').addClass('highlighted').removeClass('overlayed');    
    
    }
  
    //$scope.focusStudy = focusStudyManager.update(angular.copy($scope.studiedCourse), angular.copy($scope.focusStudy), part , indicator);

    $scope.issuesInspectorShow = true;
 //   $('#erros-list-group').show();

  };

  $scope.displayChapterInfos=function($event){
$(':focus').blur();
$('.highlighted').removeClass('highlighted');

$scope.issuesInspectorShow = false;

if(($($event.currentTarget).parent().hasClass('chosenPart'))){  
  $('.overlayed').removeClass('overlayed');
  $('.chosenPart').removeClass('chosenPart');
  $scope.focusStudy = focusStudyManager.update(angular.copy($scope.studiedCourse), angular.copy($scope.focusStudy),-1, 'ALL');
  return;
}
$('.chosenPart').removeClass('chosenPart');
$($event.currentTarget).parent().toggleClass('chosenPart');

    var part = $($event.currentTarget).attr('data-part');
    if(indicator!='ALL') {
      $('.indicators_group[data-indicator!='+indicator+']').removeClass('highlighted').addClass('overlayed');
      $('.indicators_group[data-indicator='+indicator+']').addClass('highlighted').removeClass('overlayed');    
    
    }
  
    //$scope.focusStudy = focusStudyManager.update(angular.copy($scope.studiedCourse), angular.copy($scope.focusStudy), part , indicator);

    
 
 //   $('#erros-list-group').show();

  };

  $scope.displayIndicatorInfos=function($event){
$(':focus').blur();
$('.highlighted').removeClass('highlighted');


$scope.issuesInspectorShow = false;

if(($($event.currentTarget).hasClass('chosenPart'))){  
  $('.chosenPart').removeClass('chosenPart');  
  $scope.focusStudy = focusStudyManager.update(angular.copy($scope.studiedCourse), angular.copy($scope.focusStudy),-1, 'ALL');
  return;
}
$('.chosenPart').removeClass('chosenPart');  
$($event.currentTarget).toggleClass('chosenPart');

    var part = $($event.currentTarget).attr('data-part');
    if(indicator!='ALL') {
      $('.indicators_group[data-indicator!='+indicator+']').removeClass('highlighted').addClass('overlayed');
      $('.indicators_group[data-indicator='+indicator+']').addClass('highlighted').removeClass('overlayed');    
    
    }
  
    //$scope.focusStudy = focusStudyManager.update(angular.copy($scope.studiedCourse), angular.copy($scope.focusStudy), part , indicator);

    
 
 //   $('#erros-list-group').show();

  };

$scope.$watch('issuesInspectorShow', function(value) {   
        if (!value) {
                $('.highlighted').removeClass('highlighted');
                $('.overlayed').removeClass('overlayed');
                $scope.focusStudy = focusStudyManager.update(angular.copy($scope.studiedCourse), angular.copy($scope.focusStudy),-1, 'ALL');
                $('.display-issues-btn').show();
        }
    });
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

$scope.$watch('focusStudy.studiedElt', function() {
        $scope.Tasks = Todos.filterTasks($scope.focusStudy.studiedElt);
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
        

        
    });


/////////////////////////////// TODOS ////////////////////////


$scope.addTask = function () {
    
    if( $scope.editIndex === false){    

      if ($scope.formData.text != undefined) {
        $scope.loading = true;
        var addedTask = $scope.formData.text;

        Todos.addTask($scope.studiedCourse._id,$scope.focusStudy.studiedElt._id, {type:'edition', todo:addedTask})
        .success(function(data) {
                $scope.studiedCourse = data; 
                $scope.Taks = Todos.filterTasks($scope.focusStudy.studiedElt);
                $scope.focusStudy = focusStudyManager.update(angular.copy($scope.studiedCourse), 
                  angular.copy($scope.focusStudy), $scope.focusStudy.studiedPart , $scope.focusStudy.studiedIndicator);
             //   $scope.Tasks.unshift({'type':'edition','todo':addedTask}); 
                 $scope.loading = false;
                 $scope.formData = {};
                
              });
      }


    } 
    else {
      $scope.tasks[$scope.editIndex].task = $scope.task;
    }
    $scope.editIndex = false;
    $scope.task = '';
  }

$scope.editTask = function (todoId, data) {
    
  
        Todos.editTask($scope.studiedCourse._id,$scope.focusStudy.studiedElt._id, todoId, {type:'edition', todo:data})
        .success(function(res) {
           //  alert('ok')
            $scope.studiedCourse = res; 
           return res;
                
              });
      


    
  }
    
 $scope.doneTask = function (index) {
    $scope.tasks[index].done = true;
  }
  $scope.unDoneTask = function (index) {
    $scope.tasks[index].done = false;
  }
  $scope.deleteTask = function (todoId, index) {
   Todos.deleteTask($scope.studiedCourse._id,$scope.focusStudy.studiedElt._id, todoId)
        .success(function(res) {
           $scope.Tasks.splice(index, 1);
          $scope.studiedCourse = res; 
          return res;
                
              });

  }

}
]);
