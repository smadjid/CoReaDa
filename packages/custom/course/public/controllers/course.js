'use strict';

/* jshint -W098 */
var courseModule = angular.module('mean.course', ['xeditable','ui.bootstrap']);

courseModule.controller('courseController', ['$scope', '$uibModal', 'Global', 'Course',
  function($scope, $uibModal, Global, Course) {
    $scope.global = Global;
    $scope.test = "test";
    $scope.package = {
      name: 'course'
    };
    
    $scope.partdata=[
    {id:1, total_error:56, total_warning:63, reading_error:1, reading_warning:4,rereading_error:1, rereading_warning:4,transition_error:1, transition_warning:4,stop_error:1, stop_warning:4},
    {id:2, total_error:56, total_warning:63,reading_error:9, reading_warning:5,rereading_error:1, rereading_warning:4,transition_error:1, transition_warning:4,stop_error:1, stop_warning:4},
    {id:3, total_error:56, total_warning:63,reading_error:12, reading_warning:7,rereading_error:1, rereading_warning:4,transition_error:1, transition_warning:4,stop_error:1, stop_warning:4},
    {id:4, total_error:56, total_warning:63, reading_error:12, reading_warning:7,rereading_error:1, rereading_warning:4,transition_error:1, transition_warning:4,stop_error:1, stop_warning:4}
    ];



  $scope.animationsEnabled = true;
    $scope.open = function () {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl'      
    });

  
  };

 

  }
]);

courseModule.controller('appCtrl', function ($scope, $http) {
    $scope.edit = false;
    $scope.items = '';
    
        $scope.items = [
    {
        "name"      : "Tent",
        "complete"  : false
    },
    {
        "name": "Rainfly",
        "complete"  : false
    },
    {
        "name": "Stakes",
        "complete"  : false
    },
    {
        "name": "Hammer",
        "complete"  : false
    },
    {
        "name": "Tarp",
        "complete"  : false
    },
    {
        "name": "Cooler",
        "complete"  : false
    },
    {
        "name": "Foldable Dish Bucket With Soap",
        "complete"  : false
    },
    {
        "name": "Swim Suit",
        "complete"  : true
    },
    {
        "name": "Ketchup",
        "complete"  : true
    }
];
    
    $scope.toggleEdit = function(){
        if($scope.edit){
            $scope.edit = false;
        } else {
            $scope.edit = true;
        }
    }
    $scope.itemClicked = function(clicked){
        
        for ( var i = 0; i < $scope.items.length; i++ ) {
            if ( clicked.name === $scope.items[i].name ) {
                if ( $scope.items[i].complete === false ){
                    $scope.items[i].complete = true;
                } else {
                    $scope.items[i].complete = false;
                }
            }
        }
    }
    $scope.addItem = function(item){
        var newItem = { "name" : item, "complete" : false };
        console.log();
            if ( item != undefined && /[A-Za-z]/g.test(item) ){
                $scope.items.unshift(newItem);
            }
        //document.getElementById('addItemInput').value = '';
        $scope.newItem = '';
    }
    $scope.keyboardHandler = function(keyEvent, item){
        if(keyEvent.which === 13){
            $scope.addItem(item);
        }
    }
    $scope.deleteItem = function(clicked){
        for ( var i = 0; i < $scope.items.length; i++ ) {
            if ( clicked.name === $scope.items[i].name ) {
                $scope.items.splice(i, 1);
            }
        }
    }
    $scope.clean = function(){
        for ( var i = 0; i < $scope.items.length; i++ ) {
            $scope.items[i].complete = false;
        }
    }
});

courseModule.controller('ToDoController', ['$scope', function ($scope) {
  $scope.tasks = [];
  $scope.editIndex = false;
  $scope.addTask = function () {
    if( $scope.editIndex === false){
      $scope.tasks.push({task: $scope.task, done: false})
    } else {
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
    $scope.tasks.splice(index, 1);
  }
  }]);

courseModule.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance) {
 
 $(document).scrollTop(0);
  $('td').addClass('overlayed');
  $('th').addClass('overlayed');
  $('.indicators_group').addClass('overlayed');

   var part_index =($('th').eq($(this).closest('td').index()) ).index();
    var indicator_index =$(this).closest('tr').index() ;

    if(indicator_index!=-1) $('.indicators_group').eq(indicator_index).addClass('highlighted');
    if(part_index!=-1) $('thead th').eq(part_index).addClass('highlighted');

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

modal_top = pos_top + $('thead').outerHeight();
modal_left = pos_left ;

$("#issues-dialog").css('top',modal_top);
$("#issues-dialog").css('left',modal_left);
$(".modal-content").css('width',width);
$(".modal-content").css('height',height);

  $scope.ok = function () {
    $uibModalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };







  
});





