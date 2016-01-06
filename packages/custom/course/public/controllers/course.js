
'use strict'; 

/* jshint -W098 */
var courseModule = angular.module('mean.course',  ['xeditable','ui.bootstrap','ngScrollbars']);

courseModule.run(function(editableOptions, editableThemes) {
  editableThemes.bs3.inputClass = 'input-sm';
  editableThemes.bs3.buttonsClass = 'btn-xs';
  editableOptions.theme = 'bs3';
});

courseModule.controller('courseController', ['$scope', '$http','$uibModal', 'Global', 'Course', 'CoursesDB','focusStudyManager','Todos',
  function($scope, $uibModal, $http, Global, Course,CoursesDB,focusStudyManager,Todos) {
    $scope.global = Global;
    $scope.package = {
      name: 'course'
    };

var hsv2rgb = function(h, s, v) {
  // adapted from http://schinckel.net/2012/01/10/hsv-to-rgb-in-javascript/
  var rgb, i, data = [];
  if (s === 0) {
    rgb = [v,v,v];
  } else {
    h = h / 60;
    i = Math.floor(h);
    data = [v*(1-s), v*(1-s*(h-i)), v*(1-s*(1-(h-i)))];
    switch(i) {
      case 0:
        rgb = [v, data[2], data[0]];
        break;
      case 1:
        rgb = [data[1], v, data[0]];
        break;
      case 2:
        rgb = [data[0], v, data[2]];
        break;
      case 3:
        rgb = [data[0], data[1], v];
        break;
      case 4:
        rgb = [data[2], data[0], v];
        break;
      default:
        rgb = [v, data[0], data[1]];
        break;
    }
  }
  return '#' + rgb.map(function(x){
    return ("0" + Math.round(x*255).toString(16)).slice(-2);
  }).join('');
};

$scope.indicators=['Readings','Rereading','Transition','Stop'];


$scope.formData = {};
$scope.editIndex = false;
$scope.loading = false;
$scope.animationsEnabled = true;
$scope.factspanel = false;





// scrollbar config
$scope.scrollconfig = {
    autoHideScrollbar: false,
    theme: 'light',
    live: true,
    scrollButtons:{enable:true,scrollType:"stepped"},
    advanced:{
        updateOnContentResize: true,
                autoExpandHorizontalScroll: true,
                autoExpandVerticalScroll: true,
                updateOnSelectorChange: true
    },
        setHeight: 200,
        scrollInertia: 0
    }
;

$scope.table_scrollconfig = {
            
            theme: "minimal",
            live: true,
            advanced:{
                updateOnContentResize: true,
                autoExpandHorizontalScroll: true,
                autoExpandVerticalScroll: true,
                updateOnSelectorChange: true
            },
            scrollButtons: {
                enable: true,
                scrollAmount: 'auto'
            },
            axis: 'yx',
            autoHideScrollbar: false
        };
//CoursesDB.seed() 
    CoursesDB.get()
      .success(function(data) {

        $scope.studiedCourse = data[0];  
        console.log($scope.studiedCourse);      
        $scope.allIssues = [];

        $scope.focusStudy = focusStudyManager.initialize($scope.studiedCourse);
        $scope.inspector={'type':'Course', 'title':$scope.studiedCourse.title, 'nIssues':0, 'nWarn':0,'nTasks':0,'description':''};
        
        var scale = chroma.scale('OrRd');
        $scope.computeBgColor=function(val){
          return scale(val/5).hex();
        }
        
        $scope.computeTextColor=function(val){
          if(val==0) return 'green';
          if(val==1) return '#354831';
          if(val==2) return '#716F6F';
          if(val==3) return '#F5F5F5';
          if(val>=4) return 'white';
        }
        angular.forEach($scope.studiedCourse.parts, function(part) {        
     /*     part.color={
          'reading':scale(part.facts.filter(function(value) { return value.classof === 'Readings' }).length /5).hex(),
          'rereading':scale(part.facts.filter(function(value) { return value.classof === 'Rerading' }).length / 5).hex(),
          'transition':scale(part.facts.filter(function(value) { return value.classof === 'Transition' }).length / 5).hex(),
          'stop':scale(part.facts.filter(function(value) { return value.classof === 'Stop' }).length / 5).hex()
        };*/

        part.color={
          'reading':part.facts.filter(function(value) { return value.classof == 'Readings' }).length,
          'rereading':part.facts.filter(function(value) { return value.classof == 'Rereading' }).length,
          'transition':part.facts.filter(function(value) { return value.classof == 'Transition' }).length,
          'stop':part.facts.filter(function(value) { return value.classof == 'Stop' }).length
        };
        console.log(part.color);
          
            angular.forEach(part.facts, function(fact) {
                $scope.allIssues.push(
                    fact
                );
                
            });
        
        });

        
      })
        .error(function(data) {
            console.log('Error: ' + data);
        });
    

  $scope.hideIssuesDialog = function(){
    $scope.studiedElt = $scope.studiedCourse;
    $scope.factspanel=false;
  }

  $scope.doDisplay=function($event){
$(':focus').blur();

//$('.display-issues-btn').hide();



if(($($event.currentTarget).hasClass('chosenPart'))){
  $('.highlighted').removeClass('highlighted');
  $('.overlayed').removeClass('overlayed');
  $('.chosenPart').removeClass('chosenPart');
  $scope.focusStudy = focusStudyManager.update(angular.copy($scope.studiedCourse), angular.copy($scope.focusStudy),-1, 'ALL');
  return;
}
$('.chosenPart').removeClass('chosenPart');
$($event.currentTarget).toggleClass('chosenPart');

    var indicator = $($event.currentTarget).find('span').attr('data-indicator');
    var part = $($event.currentTarget).find('span').attr('data-part');
    var fact = $($event.currentTarget).find('span').attr('data-fact');
   
    if(indicator!='ALL') {
    $('.indicators_group[data-indicator!='+indicator+']').removeClass('highlighted').addClass('overlayed');
    $('.indicators_group[data-indicator='+indicator+']').addClass('highlighted').removeClass('overlayed');
    
    
  }
  
   
    
    $scope.focusStudy = focusStudyManager.update(angular.copy($scope.studiedCourse), angular.copy($scope.focusStudy), part , indicator);


    $scope.factspanel = true;
 //   $('#erros-list-group').show();

  };

  

$scope.$watch('factspanel', function(value) {   
        if (!value) {
                $('.highlighted').removeClass('highlighted');
                $('.overlayed').removeClass('overlayed');
                $scope.focusStudy = focusStudyManager.update(angular.copy($scope.studiedCourse), angular.copy($scope.focusStudy),-1, 'ALL');
                $('.display-issues-btn').show();
        }
    });
var tabsFn = (function() {
  
  function init() {
    setHeight();
  }
  
  function setHeight() {
    var $tabPane = $('.tab-pane'),
        tabsHeight = $('.nav-tabs').height();
    
    $tabPane.css({
      height: tabsHeight
    });
  }
    
  $(init);
})();

var computeInspectorCourseProperties = function(properties){
  var prop = {'property':'', 'value':''};
  console.log(properties);
   return ({
   'overview':[
      {'property':'Nombre de parties', 
        'value':$scope.studiedCourse.parts.length},
        {'property':'Nombre de jours d\'observation', 
        'value':'72 jours'},
        {'property':'Nombre de lecteurs distincts', 
        'value':1230}
    ],
  'readings':[
      {'property':'Nombre moyen de lecteurs distincts par partie', 
        'value':properties.filter(function(value) { return value.property === 'mean.readers'})[0].value}
   ],
   'rereading':[
      {'property':'Nombre moyen de lecteurs distincts par partie', 
        'value':properties.filter(function(value) { return value.property === 'mean.readers'})[0].value}
   ],
   'transitions':[
      {'property':'Nombre moyen de lecteurs distincts par partie', 
        'value':properties.filter(function(value) { return value.property === 'mean.readers'})[0].value}
   ],
   'stops':[
      {'property':'Nombre moyen de lecteurs distincts par partie', 
        'value':properties.filter(function(value) { return value.property === 'mean.readers'})[0].value}
   ]

  })

};

var computeInspectorPartProperties = function(properties){
  var prop = {'property':'', 'value':''};  
   return ({
   'overview':[
      {'property':'Nombre de lecteurs distinct', 
        'value':properties.filter(function(value) { return value.property === 'Readers'})[0].value},
        {'property':'Durée médiane de lecture (s)', 
        'value':properties.filter(function(value) { return value.property === 'median.duration'})[0].value},
        {'property':'Nombre de lectures', 
        'value':properties.filter(function(value) { return value.property === 'Readings'})[0].value}
    ]

  })

};

$scope.$watch('focusStudy.studiedElt', function() {
        $scope.Tasks = Todos.filterTasks($scope.focusStudy.studiedElt);
        $scope.loading = false;
        $scope.formData = {};

       
        if($scope.focusStudy.studiedElt.id)  {
          $scope.inspector={'type':'Partie', 'title':$scope.focusStudy.studiedElt.title, 
        'nIssues':$scope.focusStudy.studiedElt.facts.filter(function(value) { return value.type === 'issue' }).length, 
        'nWarn':$scope.focusStudy.studiedElt.facts.filter(function(value) { return value.type === 'warning' }).length,
        'nTasks':$scope.focusStudy.studiedElt.todos.length,
        'description':computeInspectorPartProperties($scope.focusStudy.studiedElt.properties)}
        }        
        else {$scope.inspector={'type':'Course', 'title':$scope.focusStudy.studiedElt.title, 
                'nIssues':$scope.focusStudy.studiedElt.facts.filter(function(value) { return value.type === 'issue' }).length, 
                'nWarn':$scope.focusStudy.studiedElt.facts.filter(function(value) { return value.type === 'warning' }).length,
                'nTasks':$scope.focusStudy.studiedElt.todos.length,
                'description':computeInspectorCourseProperties($scope.focusStudy.studiedElt.properties)}
        }   ;

        //console.log(computeInspectorCourseProperties($scope.focusStudy.studiedElt.properties));
        //$scope.inspector = {'cours' = $scope.studiedCourse.title;
        //scope.focusStudy.facts.length
        

        
    });


/////////////////////////////// TODOS ////////////////////////


$scope.addTask = function () {
    
    if( $scope.editIndex === false){    

      if ($scope.formData.text != undefined) {
        $scope.loading = true;
        var addedTask = $scope.formData.text;

        Todos.addTask($scope.studiedCourse._id,$scope.focusStudy.studiedElt._id, {type:'edition', todo:addedTask})
        .success(function(data) {
                $scope.studiedCourse = data; 
                $scope.Taks = Todos.filterTasks($scope.focusStudy.studiedElt);
                $scope.focusStudy = focusStudyManager.update(angular.copy($scope.studiedCourse), 
                  angular.copy($scope.focusStudy), $scope.focusStudy.studiedPart , $scope.focusStudy.studiedIndicator);
             //   $scope.Tasks.unshift({'type':'edition','todo':addedTask}); 
                 $scope.loading = false;
                 $scope.formData = {};
                
              });
      }


    } 
    else {
      $scope.tasks[$scope.editIndex].task = $scope.task;
    }
    $scope.editIndex = false;
    $scope.task = '';
  }

$scope.editTask = function (todoId, data) {
    
  
        Todos.editTask($scope.studiedCourse._id,$scope.focusStudy.studiedElt._id, todoId, {type:'edition', todo:data})
        .success(function(res) {
           //  alert('ok')
            $scope.studiedCourse = res; 
           return res;
                
              });
      


    
  }
    
 $scope.doneTask = function (index) {
    $scope.tasks[index].done = true;
  }
  $scope.unDoneTask = function (index) {
    $scope.tasks[index].done = false;
  }
  $scope.deleteTask = function (todoId, index) {
   Todos.deleteTask($scope.studiedCourse._id,$scope.focusStudy.studiedElt._id, todoId)
        .success(function(res) {
           $scope.Tasks.splice(index, 1);
          $scope.studiedCourse = res; 
          return res;
                
              });

  }


  ///////////////////////ROUTINE FUNCTIONS///////////////////////////////////////
/*var updateContexte   = function(focus, part_index , indicator_index){  
    if(part_index>0)
      $scope.focusStudy =  {
                    type:'part',
                    studiedIndicator:'ALL',
                    studiedElt :$scope.studiedCourse.parts[part_index - 1]
                }
    else      
      $scope.focusStudy =  {
                    type:'course',
                    studiedIndicator:'ALL',
                    studiedElt :$scope.studiedCourse
                }; 
                console.log(part_index);
    
};

var updateContexte   = function(focus, part_index , indicator_index){  
  
 
    $scope.focusStudy.type = focus;
    if(focus=='course') 
      {$scope.focusStudy.studiedElt = $scope.studiedCourse; }

    if(focus=='part-head') 
      {$scope.focusStudy.studiedElt = $scope.studiedCourse.parts[part_index - 1]; }
    
    if(focus=='indicator-head') 
      {$scope.focusStudy.studiedIndicator = indicator_index; }

    if(focus=='cell') 
      {
        $scope.focusStudy.studiedElt = $scope.studiedCourse.parts[part_index - 1]; 
        $scope.focusStudy.studiedIndicator = indicator_index;
      }
    
};
*/

}
]);
