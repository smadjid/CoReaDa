'use strict';

angular.module('mean.courses').controller('CoursesListController', ['$scope',  '$location', 'Global', 
  'Courses',  
  function($scope,  $location,  Global, Courses) {
    $scope.global = Global;

    if($('.course_title_top').length>0) $('.course_title_top').remove();



    $scope.availableCircles = [];

  

    $scope.find = function() {
      Courses.query(function(courses) {
        $scope.courses = courses;

        if($('.course_title_top').length>0) $('.course_title_top').remove();
        

      });
    };

   
  }
]);
