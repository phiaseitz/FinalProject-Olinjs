angular.module('myApp.homeView', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: '/views/homeView/home.html',
    controller: 'homeController',
    // Know whether or not we are authenticated before we render the page
    resolve: {
    	authentication: function (AuthService, $route) {
    		return AuthService.setAuthenticated();
    	}
    }
  });
}])

.controller('homeController', ['$scope','$window', '$http', '$mdToast', '$q', 'AuthService', function($scope,$window, $http, $mdToast, $q, AuthService) {
	console.log("homeController loaded");
	
	$scope.userAuthenticated = AuthService.authenticated;

	$scope.loginRedirect = function(){
		AuthService.getLoginPage();
	}

	$scope.signupRedirect = function(){
		AuthService.getSignupPage();
	}

	$scope.logout = function() {
		AuthService.logout().then(function(authStatus){
			$scope.userAuthenticated = authStatus;
		});
	}
}]);