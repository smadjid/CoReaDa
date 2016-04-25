'use strict';

//Setting up route
angular.module('mean.courses').config(['$stateProvider',
  function($stateProvider) {

    // states for my app
    $stateProvider
      .state('all courses', {
        url: '/courses',
        templateUrl: '/courses/views/list.html',
        requiredCircles : {
          circles: ['authenticated'],
          denyState: 'auth.login'
        }
      })
      .state('create course', {
        url: '/courses/create',
        templateUrl: '/courses/views/create.html',
        requiredCircles : {
          circles: ['can create content']
        }
      })
      .state('edit course', {
        url: '/courses/:courseId/edit',
        templateUrl: '/courses/views/edit.html',
        requiredCircles : {
          circles: ['can edit content']
        }
      })
      .state('course by id', {
        url: '/courses/:courseId',
        templateUrl: '/courses/views/view.html',
        requiredCircles : {
          circles: ['anonymous'],
          denyState: 'auth.login'
        }
      });
  }
]);
