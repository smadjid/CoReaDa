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

angular.module('mean.courses').factory('Todos', ['$http',function($http,id) {
    return {
      
      addTask : function(route,params) {
        return $http.post('/api/tasks/add/'+route,params);
      },
      deleteTask : function(params) {
        if(params.scope=='course')
          return $http.delete('/api/course/tasks/delete/'+params.route);  
        if(params.scope=='chapter')
          return $http.delete('/api/chapter/tasks/delete/'+params.route);  
        if(params.scope=='part')
          return $http.delete('/api/part/tasks/delete/'+params.route);  
      },
      editTask : function(params, task) {        
        if(params.scope=='course')          
          return $http.post('/api/course/tasks/edit/'+params.route, task);  
        if(params.scope=='chapter')
          return $http.post('/api/chapter/tasks/edit/'+params.route, task);  
        if(params.scope=='part')
          return $http.post('/api/part/tasks/edit/'+params.route, task);  
      },
      getTasks : function(courseId, partId, todoData) {  
      if(courseId == partId) partId=0;      
        return $http.get('/api/tasks/get/'+courseId+'/'+partId)
        },
      
      filterTasks : function(studiedPart) {
          return studiedPart.todos;
      }
    }

  }]);
