angular.module('myApp.loginView', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    templateUrl: '/views/loginView/login.html',
    controller: 'loginController'
  });
}])

.controller('loginController', ['$scope','$window', '$http', '$mdToast', 'AuthService', function($scope,$window, $http, $mdToast, AuthService) {
	console.log("loginController loaded");
	$scope.loginForm = {};
	
	$scope.login = function(formData){
		console.log(formData);
		AuthService.login(formData);
		// $http.post('/auth/login',$scope.loginForm)
		// 	.success(function(data){
		// 		console.log('success');
		// 	})
		// 	.error(function(data){
		// 		console.log('error');
		// 	})
	}

}]);