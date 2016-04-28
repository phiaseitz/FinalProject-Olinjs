// public/views/authViews/loginView/loginController.js
// the controller for our login page
angular.module('myApp.loginView', ['ngRoute'])
// Load the template and controller
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
	
	/* login()
    	Inputs: formData (email, password)
    	Outputs: None

    	Wrapper for authservice login.
  	*/
	$scope.login = function(formData){
		AuthService.login(formData);
	}

	
	/* homeRedirect()
    	Inputs: None
    	Outputs: None

		Redirect home
  	*/
	$scope.homeRedirect = function(){
        $location.path("/");
    }


    /* signupRedirect()
    	Inputs: None
    	Outputs: None

		Redirect to the signup page
  	*/
    $scope.signupRedirect = function(){
        $location.path("/signup");
    }


}]);