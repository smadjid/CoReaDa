var app =angular.module('mean.project').controller('ProjectController', ['$scope', '$rootScope',
  '$stateParams', '$location', '$http','Global', 'Project', '$http',
  function($scope, $rootScope, $stateParams, $location, $http, Global, Project) {
    $scope.global = Global;

    $scope.one = 5;
    $scope.sendFeedback = function(){
    	var params={
    		'name':'madjid',
    		'email':'madjid',
    		'message':'hello'
    	}
    	return $http.post('/api/project/feedback',params);

    }

  // end
   
  }
]);


