'use strict'; 

/* jshint -W098 */
var courseModule = angular.module('mean.course',  ['xeditable','ui.bootstrap']);

courseModule.run(function(editableOptions, editableThemes) {
  editableThemes.bs3.inputClass = 'input-sm';
  editableThemes.bs3.buttonsClass = 'btn-xs';
  editableOptions.theme = 'bs3';
});

courseModule.controller('courseController', ['$scope', '$http','$uibModal', 'Global', 'Course', 'CoursesDB','Todos',
  function($scope, $uibModal, $http, Global, Course,CoursesDB, Todos) {
    $scope.global = Global;
    $scope.package = {
      name: 'course'
    };

    ;


$scope.formData = {};
$scope.editIndex = false;
$scope.loading = false;
$scope.animationsEnabled = true;
$scope.show = false;

//CoursesDB.seed() 
    CoursesDB.get()
      .success(function(data) {
        $scope.studiedCourse = data[0];        
        $scope.allIssues = [];

        
        $scope.studiedElement = $scope.studiedCourse;
        $scope.studiedIndicators = "All";

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
    

  $scope.hideIssuesDialog = function(){$scope.show=false;}

  $scope.doDisplay=function(obj, type){
    
    var _currentPart = -1;
    var _currentIndicator = -1;
   if(typeof obj.part != "undefined") _currentPart = obj.part.id;
    prepareIssuesDlg(_currentPart , type - 1);
    updateContexte(_currentPart , type - 1);
    $scope.show = true;
  };

  

$scope.$watch('show', function(newValue, oldValue) {
        if (!newValue) {
                $('.highlighted').removeClass('highlighted');
                $('.overlayed').removeClass('overlayed');
                updateContexte(0,0);
        }
    });

$scope.$watch('studiedElement', function(newValue, oldValue) {
        $scope.Tasks = Todos.filterTasks($scope.studiedElement,$scope.studiedIndicator)
        $scope.loading = false;
        $scope.formData = {};

        
    });
$scope.$watch('studiedIndicator', function(newValue, oldValue) {
       $scope.Tasks = Todos.filterTasks($scope.studiedElement,$scope.studiedIndicator)
        $scope.loading = false;
        $scope.formData = {};
        
    });


/////////////////////////////// TODOS ////////////////////////


$scope.addTask = function () {
    
    if( $scope.editIndex === false){    
      // validate the formData to make sure that something is there
      // if form is empty, nothing will happen
      if ($scope.formData.text != undefined) {
        $scope.loading = true;

        Todos.addTask($scope.studiedCourse._id,$scope.studiedElement._id, {type:'edition', todo:$scope.formData.text})
        .success(function(data) {
                $scope.studiedCourse = data; // assign our new list of todos
                 $scope.Tasks = Todos.filterTasks($scope.studiedElement,$scope.studiedIndicator)
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
var updateContexte   = function(part_index , indicator_index){  
    if(part_index>0) $scope.studiedElement = $scope.studiedCourse.parts[part_index - 1]
        else $scope.studiedElement = $scope.studiedCourse;
};

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

var pos_left = $('.part_index:first').offset().left; // HERE

var modal_top = pos_top + $('thead').outerHeight();
var modal_left = pos_left ;
$("#issues-dialog").css('position','absolute');
$("#issues-dialog").css('top',modal_top);
$("#issues-dialog").css('left',modal_left);
$("#issues-dialog").css('width',width);
$("#issues-dialog").css('height',height);

$scope.show = false;
}
}
]);

