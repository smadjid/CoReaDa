angular.module('mean.courses')
.directive('customOnChange', [
  function () {

  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
    	console.log(attrs)
      var onChangeHandler = scope.$eval(attrs.customOnChange);
      element.bind('change', onChangeHandler);
    }
  };
}]);