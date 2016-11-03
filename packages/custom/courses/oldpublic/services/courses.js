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

angular.module('mean.courses').filter('pagination', function()
{
  return function(input, start) {
  	if(typeof input=='undefined') return;
    return input.slice(start);
  };
});

