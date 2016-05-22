'use strict';

angular.module('mean.project').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('project example page', {
      url: '/project/example',
      templateUrl: 'project/views/index.html'
    });
  }
]);
