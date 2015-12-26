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
                    studiedIndicator:'ALL',
                    studiedElt : elt
                }; 
                return result;

        
      },
      update : function(course, focusElt, part_index , indicator) {

        var elt = focusElt;
        elt.type = focus;
        
        if((part_index==-1) && (indicator=='ALL'))
          {
            elt.studiedElt = course; 
            return(elt);
          }

        if(indicator=='ALL') 
          {
            elt.studiedElt = course.parts[part_index - 1]; 
            return elt;
          }
          if(part_index==-1) 
          {
            // TODO
            // elt.studiedElt.facts = $.grep(elt.studiedElt.facts, function(e){ return  e.classof == indicator }); return elt;
            return elt;
          }
        
  
          var result = course.parts[part_index - 1]; 
//          console.log(result);
          result.facts = $.grep(result.facts, function(e){ return  e.classof == indicator });
console.log(result.facts)      ;
          
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
      filterTasks : function(studiedPart) {
        
       //alert(studiedPart.id)

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