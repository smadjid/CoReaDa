'use strict';

angular.module('mean.course').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('course example page', {
      url: '/course/example',
      templateUrl: 'course/views/index.html'
    });
  }
]);
