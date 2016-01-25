'use strict';

angular.module('mean.courses').controller('CoursesListController', ['$scope', '$rootScope','$stateParams', '$location', '$http','Global', 'Courses', 'MeanUser', 'Circles','$http','$uibModal',
  function($scope, $rootScope, $stateParams, $location, $http, Global, Courses, MeanUser, Circles) {
    $scope.global = Global;

    if($('.course_title_top').length>0) $('.course_title_top').remove();



    $scope.hasAuthorization = function(course) {
      if (!course || !course.user) return false;
      return MeanUser.isAdmin || course.user._id === MeanUser.user._id;
    };

    $scope.availableCircles = [];

    Circles.mine(function(acl) {
        $scope.availableCircles = acl.allowed;
        $scope.allDescendants = acl.descendants;
    });

    $scope.showDescendants = function(permission) {
        var temp = $('.ui-select-container .btn-primary').text().split(' ');
        temp.shift(); //remove close icon
        var selected = temp.join(' ');
        $scope.descendants = $scope.allDescendants[selected];
    };

    $scope.selectPermission = function() {
        $scope.descendants = [];
    };

    $scope.create = function(isValid) {
      if (isValid) {
        // $scope.course.permissions.push('test test');
        var course = new Courses($scope.course);

        course.$save(function(response) {
          $location.path('courses/' + response._id);
        });

        $scope.course = {};

      } else {
        $scope.submitted = true;
      }
    };

    $scope.remove = function(course) {
      if (course) {
        course.$remove(function(response) {
          for (var i in $scope.courses) {
            if ($scope.courses[i] === course) {
              $scope.courses.splice(i, 1);
            }
          }
          $location.path('courses');
        });
      } else {
        $scope.course.$remove(function(response) {
          $location.path('courses');
        });
      }
    };

    $scope.update = function(isValid) {
      if (isValid) {
        var course = $scope.course;
        if (!course.updated) {
          course.updated = [];
        }
        course.updated.push(new Date().getTime());

        course.$update(function() {
          $location.path('courses/' + course._id);
        });
      } else {
        $scope.submitted = true;
      }
    };

    $scope.find = function() {
      Courses.query(function(courses) {
        $scope.courses = courses;

        if($('.course_title_top').length>0) $('.course_title_top').remove();
        

      });
    };

   
  }
]);
