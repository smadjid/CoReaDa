'use strict';

angular.module('mean.course').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('course study', {
      url: '/course',
      templateUrl: 'course/views/index.html'
    });
  }
]);
