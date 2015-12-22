
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

$scope.indicators=['Reading','Rereading','Transition','Stop'];


$scope.formData = {};
$scope.editIndex = false;
$scope.loading = false;
$scope.animationsEnabled = true;
$scope.factspanel = false;





// scrollbar config
$scope.scrollconfig = {
    autoHideScrollbar: false,
    theme: 'light',
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

$scope.table_scrollconfig = {
            
            theme: "minimal",
            live: true,
            advanced:{
                updateOnContentResize: true,
                autoExpandHorizontalScroll: true,
                autoExpandVerticalScroll: true,
                updateOnSelectorChange: true
            },
            scrollButtons: {
                enable: true,
                scrollAmount: 'auto'
            },
            axis: 'yx',
            autoHideScrollbar: false
        };
//CoursesDB.seed() 
    CoursesDB.get()
      .success(function(data) {
        $scope.studiedCourse = data[0];        
        $scope.allIssues = [];

        $scope.focusStudy = focusStudyManager.initialize($scope.studiedCourse);
/* $scope.focusStudy =  {
                    type:'course',
                    studiedIndicator:'ALL',
                    studiedElt : $scope.studiedCourse 
                }; 
*/
        
        
        angular.forEach(data[0].parts, function(part) {
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
    

  $scope.hideIssuesDialog = function(){$scope.factspanel=false;}

  $scope.doDisplay=function(focus, obj, type){
    
    var _currentPart = -1;
    var _currentIndicator = -1;
    var indicator = 'ALL';
    if(type!=0) indicator = $scope.indicators[type - 1]
   //if(typeof obj.part != "undefined") _currentPart = obj.part.id;
   if(typeof obj.part != "undefined") _currentPart = obj.part.id;
    prepareIssuesDlg(_currentPart , type - 1); 
    
    $scope.focusStudy = focusStudyManager.update(angular.copy($scope.studiedCourse), angular.copy($scope.focusStudy), focus,_currentPart , indicator);


    $scope.factspanel = true;
  };

  

$scope.$watch('factspanel', function(value) {   
        if (!value) {
                $('.highlighted').removeClass('highlighted');
                $('.overlayed').removeClass('overlayed');
                $scope.focusStudy = focusStudyManager.update(angular.copy($scope.studiedCourse), angular.copy($scope.focusStudy),'course',0, 'ALL');
        }
    });

$scope.$watch('focusStudy.studiedElt', function() {
        $scope.Tasks = Todos.filterTasks($scope.focusStudy.studiedElt);
        $scope.loading = false;
        $scope.formData = {};

        $scope.inspectorcours = $scope.studiedCourse.title;
        $scope.inspectorelement = $scope.focusStudy.studiedElt.title;
        $scope.inspectorerrors = $scope.focusStudy.studiedElt.facts.filter(function(value) { return value.type === 'issue' }).length;
        $scope.inspectorwarnings = $scope.focusStudy.studiedElt.facts.filter(function(value) { return value.type === 'warning' }).length;
        $scope.inspectortasks = $scope.focusStudy.studiedElt.todos.length;
        //scope.focusStudy.facts.length
        

        
    });


/////////////////////////////// TODOS ////////////////////////


$scope.addTask = function () {
    
    if( $scope.editIndex === false){    
      // validate the formData to make sure that something is there
      // if form is empty, nothing will happen
      if ($scope.formData.text != undefined) {
        $scope.loading = true;

        Todos.addTask($scope.studiedCourse._id,$scope.focusStudy.studiedElt._id, {type:'edition', todo:$scope.formData.text})
        .success(function(data) {
                $scope.studiedCourse = data; // assign our new list of todos
                 $scope.Tasks = Todos.filterTasks($scope.focusStudy.studiedElt,$scope.studiedIndicator)
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
    
  $scope.editTask = function (index) {
    $scope.task = $scope.tasks[index].task;
    $scope.editIndex = index;
  }
  $scope.doneTask = function (index) {
    $scope.tasks[index].done = true;
  }
  $scope.unDoneTask = function (index) {
    $scope.tasks[index].done = false;
  }
  $scope.deleteTask = function (index) {
    //$scope.tasks.splice(index, 1);
    Todos.delete(index)
          .success(function(data) {
            $scope.loading = false;
            $scope.formData = {}; // clear the form so our user is ready to enter another
            $scope.tasks = data; // assign our new list of todos
          });



  }


  ///////////////////////ROUTINE FUNCTIONS///////////////////////////////////////
/*var updateContexte   = function(focus, part_index , indicator_index){  
    if(part_index>0)
      $scope.focusStudy =  {
                    type:'part',
                    studiedIndicator:'ALL',
                    studiedElt :$scope.studiedCourse.parts[part_index - 1]
                }
    else      
      $scope.focusStudy =  {
                    type:'course',
                    studiedIndicator:'ALL',
                    studiedElt :$scope.studiedCourse
                }; 
                console.log(part_index);
    
};

var updateContexte   = function(focus, part_index , indicator_index){  
  
 
    $scope.focusStudy.type = focus;
    if(focus=='course') 
      {$scope.focusStudy.studiedElt = $scope.studiedCourse; }

    if(focus=='part-head') 
      {$scope.focusStudy.studiedElt = $scope.studiedCourse.parts[part_index - 1]; }
    
    if(focus=='indicator-head') 
      {$scope.focusStudy.studiedIndicator = indicator_index; }

    if(focus=='cell') 
      {
        $scope.focusStudy.studiedElt = $scope.studiedCourse.parts[part_index - 1]; 
        $scope.focusStudy.studiedIndicator = indicator_index;
      }
    
};
*/
var prepareIssuesDlg  = function(part_index , indicator_index){  
  
  $(document).scrollTop(0);
 $(document).scrollTop(0);
  $('td').addClass('overlayed');
  $('th').addClass('overlayed');
  $('.indicators_group').addClass('overlayed');

   
    if(indicator_index!=-1) {
    
    $('.indicators_group').not(indicator_index).removeClass('highlighted');
    $('.indicators_group').eq(indicator_index).addClass('highlighted');

    
  }

    if(part_index!=-1) {
    $('thead th').not(part_index).removeClass('highlighted');
    $('thead th').eq(part_index).addClass('highlighted');

  }

    var pos_top = $('thead').offset().top;
    var height = 0;  
    $('.indicators_group').each(function(index) {
        height += parseInt($(this).outerHeight(), 10);

    });


var bottom = $('table').height + $('table').offset().top;
var width = 0;
$('.part_index').each(function(index) {
    width += parseInt($(this).outerWidth(), 10);
});

var pos_left = $('.part_index:first').position().left; // HERE

var modal_top = $('thead').outerHeight();
var modal_left = pos_left ;
$("#issues-dialog").css('position','absolute');
$("#issues-dialog").css('top',modal_top);
$("#issues-dialog").css('left',modal_left);
$("#issues-dialog").css('bottom',0);
$("#issues-dialog").css('right',0);



}
}
]);
