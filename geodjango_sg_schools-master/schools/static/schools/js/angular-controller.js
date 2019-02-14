  var customInterpolationApp = angular.module('customInterpolationApp', []);
 
  customInterpolationApp.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('//');
    $interpolateProvider.endSymbol('//');
  });
 
 
  customInterpolationApp.controller('DemoController', function($scope) {
      $scope.label = "This binding is brought you by // interpolation symbols.";
  });
