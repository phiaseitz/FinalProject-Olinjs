angular.module('myApp.signupView', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/signup', {
    templateUrl: '/views/authViews/signupView/signup.html',
    controller: 'signupController'
  });
}])

.controller('signupController', ['$scope','$window', '$http', '$mdToast', 'AuthService', '$location', function($scope,$window, $http, $mdToast, AuthService, $location) {
	console.log("signupController loaded");
	$scope.signupForm = {}
	$scope.signup = function(formData){
		console.log(formData)
		AuthService.signup(formData)
		
	}

	$scope.homeRedirect = function(){
        $location.path("/");
    }

    $scope.loginRedirect = function(){
    	console.log('login')
        $location.path("/login");
    }

}]);