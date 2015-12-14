'use strict';

/* jshint -W098 */
var courseModule = angular.module('mean.course',  ['xeditable','ui.bootstrap']);

courseModule.run(function(editableOptions, editableThemes) {
  editableThemes.bs3.inputClass = 'input-sm';
  editableThemes.bs3.buttonsClass = 'btn-xs';
  editableOptions.theme = 'bs3';
});

courseModule.controller('courseController', ['$scope', '$http','$uibModal', 'Global', 'Course', 'CoursesDB',
  function($scope, $uibModal, $http, Global, Course,CoursesDB) {
    $scope.global = Global;
    $scope.package = {
      name: 'course'
    };

    ;

//CoursesDB.seed()
    CoursesDB.get()
      .success(function(data) {
        $scope.studiedCourse = data;
        console.log(data);
        //var part_data = data;
        $scope.apart = data[0].parts;
        $scope.allIssues = [];
        angular.forEach(data[0].parts, function(part) {
            angular.forEach(part.facts, function(fact) {
                $scope.allIssues.push(
                    fact
                );
                
            });
        });

        //alert(data[0].parts)
      })
        .error(function(data) {
            console.log('Error: ' + data);
        });
    
    $scope.partdata=[
    {id:1, total_error:56, total_warning:63, reading_error:1, reading_warning:4,rereading_error:1, rereading_warning:4,transition_error:1, transition_warning:4,stop_error:1, stop_warning:4},
    {id:2, total_error:56, total_warning:63,reading_error:9, reading_warning:5,rereading_error:1, rereading_warning:4,transition_error:1, transition_warning:4,stop_error:1, stop_warning:4},
    {id:3, total_error:56, total_warning:63,reading_error:12, reading_warning:7,rereading_error:1, rereading_warning:4,transition_error:1, transition_warning:4,stop_error:1, stop_warning:4},
    {id:4, total_error:56, total_warning:63, reading_error:12, reading_warning:7,rereading_error:1, rereading_warning:4,transition_error:1, transition_warning:4,stop_error:1, stop_warning:4}
    ];



  $scope.animationsEnabled = true;

    
   $scope.show = false;
  $scope.hideIssuesDialog = function(){$scope.show=false;}

  $scope.doDisplay=function(obj, type){
    
    var _currentPart = -1;
    var _currentIndicator = -1;
   if(typeof obj.part != "undefined") _currentPart = obj.part.id;
    prepareIssuesDlg(_currentPart , type - 1);
    $scope.show = true;
  };

  

$scope.$watch('show', function(newValue, oldValue) {
        if (!newValue) {
                $('.highlighted').removeClass('highlighted');
                $('.overlayed').removeClass('overlayed');
        }
    });

$scope.seedData=function(){

  };  
  ///////////////////////ROUTINE FUNCTIONS///////////////////////////////////////
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
/*************************************************************************************/
courseModule.controller('appCtrl', function ($scope, $http) {
    $scope.edit = false;
    $scope.items = '';
    
        $scope.items = [
    {
        "name"      : "Tent",
        "complete"  : false
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

