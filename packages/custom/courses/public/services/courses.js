'use strict';

//Courses service used for courses REST endpoint
angular.module('mean.courses').factory('Courses', ['$resource',
  function($resource) {
    return $resource('api/courses/:courseId', {
      courseId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

