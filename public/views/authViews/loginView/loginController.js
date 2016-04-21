angular.module('myApp.loginView', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    templateUrl: '/views/authViews/loginView/login.html',
    controller: 'loginController'
  });
}])

.controller('loginController', ['$scope','$location', '$http', '$mdToast', 'AuthService', function($scope, $location, $http, $mdToast, AuthService) {
	console.log("loginController loaded");
	$scope.loginForm = {};
	$scope.loginError = "";
	
	$scope.login = function(formData){
		console.log(formData);
		AuthService.login(formData);
	}

	$scope.homeRedirect = function(){
        $location.path("/");
    }

    $scope.signupRedirect = function(){
        $location.path("/signup");
    }


}]);