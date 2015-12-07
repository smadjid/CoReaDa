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
