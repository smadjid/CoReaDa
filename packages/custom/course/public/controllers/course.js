'use strict';

/* jshint -W098 */
angular.module('mean.course').controller('courseController', ['$scope', 'Global', 'Course',
  function($scope, Global, Course) {
    $scope.global = Global;
    $scope.package = {
      name: 'course'
    };
    
    $scope.partdata=[
    {id:1, total_error:56, total_warning:63, reading_error:1, reading_warning:4,rereading_error:1, rereading_warning:4,transition_error:1, transition_warning:4,stop_error:1, stop_warning:4},
    {id:2, total_error:56, total_warning:63,reading_error:9, reading_warning:5,rereading_error:1, rereading_warning:4,transition_error:1, transition_warning:4,stop_error:1, stop_warning:4},
    {id:3, total_error:56, total_warning:63,reading_error:12, reading_warning:7,rereading_error:1, rereading_warning:4,transition_error:1, transition_warning:4,stop_error:1, stop_warning:4},
    {id:4, total_error:56, total_warning:63, reading_error:12, reading_warning:7,rereading_error:1, rereading_warning:4,transition_error:1, transition_warning:4,stop_error:1, stop_warning:4}
    ];
  }
]);

angular.module('mean.course').controller('appCtrl', function ($scope, $http) {
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

angular.module('mean.course').controller('ToDoController', ['$scope', function ($scope) {
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
  }])
