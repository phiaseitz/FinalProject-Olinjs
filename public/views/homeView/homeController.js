angular.module('myApp.homeView', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: '/views/homeView/home.html',
    controller: 'homeController'
  });
}])

.controller('homeController', ['$scope','$window', '$http', '$mdToast', '$q', 'AuthService', function($scope,$window, $http, $mdToast, $q, AuthService) {
	console.log("homeController loaded");
	
	$scope.userAuthenticated = AuthService.authenticated;

	$scope.loginRedirect = function(){
		AuthService.getLoginPage();
	}

	$scope.logout = function() {
		AuthService.logout();
		//I don't like the way that this is handled. It feels 
		//bad to just be setting this variable this way. 
	}
}]);