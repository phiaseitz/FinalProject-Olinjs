angular.module('myApp.homeView', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: '/views/homeView/home.html',
    controller: 'homeController'
  });
}])

.controller('homeController', ['$scope','$window', '$http', '$mdToast', function($scope,$window, $http, $mdToast) {
	console.log("homeController loaded");

}]);