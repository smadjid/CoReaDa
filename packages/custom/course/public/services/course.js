'use strict'; 

angular.module('mean.course').factory('Course', [
  function() {
    return {
      name: 'course'
    };
  }
]);


angular.module('mean.course').factory('selectEntity', [
  function() {
    return {
      name: 'course'
    };
  }
]);


angular.module('mean.course').filter('incomplete', function() {
    return function (input){
        var result = [];
        
        for (var i = 0; i < input.length; i++) {
            if (!input[i].complete) {
                result.push(input[i]);
            }
        }
        return result;
    }
})
angular.module('mean.course').filter('complete', function() {
    return function (input){
        var result = [];
        
        for (var i = 0; i < input.length; i++) {
            if (input[i].complete) {
                result.push(input[i]);
            }
        }
        return result;
    }
});
angular.module('mean.course').factory('CoursesDB', ['$http',function($http) {
    return {
      /*get : function(id) {
        return $http.get('/api/courses/'+id);
      },*/
      get : function() {
        return $http.get('/api/course/node');
      },
      seed : function() {
        return $http.get('/api/courses/seed');
      }
    }
  }]);

angular.module('mean.course').factory('Todos', ['$http',function($http,id) {
    return {
      addTask : function(courseId, partId, todoData) {
        console.log('HERE')
        if(courseId == partId) partId=0;
        return $http.post('/api/tasks/add/'+courseId+'/'+partId, todoData);
      },
      getTasks : function(courseId, partId, todoData) {  
      if(courseId == partId) partId=0;      
        return $http.get('/api/tasks/get/'+courseId+'/'+partId)
        },
      deleteTask : function(elt_id, fact_id) {
         
      },
      filterTasks : function(studiedPart, studiedIndicator) {
        
       //alert(studiedPart.id)
          return studiedPart.todos
       
        //return $http.post('/api/tasks/add/'+courseId+'/'+partId, todoData);
      }
    }
  }]);