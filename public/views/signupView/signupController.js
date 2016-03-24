angular.module('myApp.signupView', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/signup', {
    templateUrl: '/views/signupView/signup.html',
    controller: 'signupController'
  });
}])

.controller('signupController', ['$scope','$window', '$http', '$mdToast', 'AuthService', function($scope,$window, $http, $mdToast, AuthService) {
	console.log("signupController loaded");
	$scope.signupForm = {}
	$scope.signup = function(formData){
		console.log(formData)
		AuthService.signup(formData)
		
	}

}]);