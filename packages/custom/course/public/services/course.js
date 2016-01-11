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
      addTask : function(courseId, partId, todoData) {
        if(courseId == partId) partId=0;
        return $http.post('/api/tasks/add/'+courseId+'/'+partId, todoData);
      },
      getTasks : function(courseId, partId, todoData) {  
      if(courseId == partId) partId=0;      
        return $http.get('/api/tasks/get/'+courseId+'/'+partId)
        },
      editTask : function(courseId, partId, taskId, todoData) {  
      if(courseId == partId) partId=0;            
        return $http.post('/api/tasks/edit/'+courseId+'/'+partId+'/'+taskId, todoData);
        },
      deleteTask : function(courseId, partId, taskId) {
         if(courseId == partId) partId=0;            
        return $http.delete('/api/tasks/delete/'+courseId+'/'+partId+'/'+taskId);         
      },
      filterTasks : function(studiedPart) {
        
//       alert(studiedPart.todos)

          return studiedPart.todos;
       
        //return $http.post('/api/tasks/add/'+courseId+'/'+partId, todoData);
      }
    }

  }]);
angular.module('mean.course').directive("fixedFirstColumn", [function () {
  return {
    restrict: "A",
    template: "<div class='table-responsive'><div ng-transclude></div></div>",
    transclude: true,
    link: function ($scope, $element) {
      var interval = setInterval(function () {
        var tr = $element.find("tr");

        angular.forEach(tr, function (i) {
          var columns = angular.element(i).children();

          if (columns.length < 1) {
            // Row with no columns? Ignore it.
            return;
          }

          var column0 = angular.element(columns[0]).children()[0] || columns[0];
          var column1 = columns[1];

          // Calculate heights of each <td>.
          var height0 = (column0).offsetHeight;
          var height1 = column1 ? column1.offsetHeight : 0;

          // Calculate final height.
          var height = Math.max(height0, height1);

          // Set heights of <td> and <tr>.
          columns[0].style.height = height + "px";
          i.style.height = height + "px";

          if (column1) {
            column1.style.height = height + "px";
          }
          
          // If <td> heights have stabilized.
          if (height0 !== 0 && height0 === height1) {
            clearInterval(interval);
          }
        });
      }, 1000);
    }
  };
}]);