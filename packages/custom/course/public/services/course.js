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

angular.module('mean.course').factory('focusStudyManager', [function() { 
    return {
      initialize : function(elt) {
        var result = 
          {
                    type:'course',
                    studiedPart:-1,
                    studiedIndicator:'ALL',
                    studiedElt : elt
                }; 
                return result;

        
      },
      update : function(course, focusElt, part_index , indicator) {
        var elt = focusElt;
        elt.type = focus;
        elt.studiedPart = part_index;
        
        if((part_index==-1) && (indicator=='ALL'))
          {
            elt.studiedElt = course; 
            return(elt);
          }

        if(indicator=='ALL') 
          {
            elt.studiedElt =  $.grep(course.parts, function(e){                 
                return  e.id == part_index
              });
            return elt;
          }
          if(part_index==-1) 
          {
            // TODO
            // elt.studiedElt.facts 
            //var res= $.grep(course.parts, function(e){ return  e.classof == indicator }); alert(res);
            var res=[];
            for (var i = 0; i < course.parts.length; i++) {
              var p_res = $.grep(course.parts[i].facts, function(e){ 
                e.part_id=course.parts[i].id;
                return  e.classof == indicator
              }
                );
              
             // console.log(p_res);
             angular.forEach(p_res, function (i) {
              //if(p_res.length>0)
                res.push(i);  
              })

        }

      //  console.log(res);
        elt.studiedElt.facts= res;
            return elt;
          }
        
  
        //  var result = course.parts[part_index - 1]; 
          var result =  $.grep(course.parts, function(e){                 
                return  e.id == part_index
              });
          result=result[0];
          
          result.facts = $.grep(result.facts, function(e){ return  e.classof == indicator });
          elt.studiedIndicator=indicator;
          elt.studiedElt = result;


                return(elt);
          //return result;

        
        
        
      }
    }
  }]);

angular.module('mean.course').factory('Todos', ['$http',function($http,id) {
    return {
      
      addTask : function(path, todoData) {
        return $http.post('/api/tasks/add/'+path, todoData);
      },
      deleteTask : function(path) {
        return $http.delete('/api/tasks/delete/'+path);  
      },
      getTasks : function(courseId, partId, todoData) {  
      if(courseId == partId) partId=0;      
        return $http.get('/api/tasks/get/'+courseId+'/'+partId)
        },
      editTask : function(path, todoData) {               
        return $http.post('/api/tasks/edit/'+path, todoData);
        },      
      filterTasks : function(studiedPart) {
          return studiedPart.todos;
      }
    }

  }]);