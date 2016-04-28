// Signup Controller -- the controller for our signup page
angular.module('myApp.signupView', ['ngRoute'])

//  Load the template and controller
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/signup', {
    templateUrl: '/views/authViews/signupView/signup.html',
    controller: 'signupController'
  });
}])

.controller('signupController', ['$scope','$window', '$http', '$mdToast', 'AuthService', '$location', function($scope,$window, $http, $mdToast, AuthService, $location) {
	console.log("signupController loaded");
	$scope.signupForm = {}
	
    /* signup()
        Inputs: formData (email, password)
        Outputs: None

        Wrapper for authservice signup.
    */
    $scope.signup = function(formData){
		console.log(formData)
		AuthService.signup(formData)
		
	}


    /* homeRedirect()
        Inputs: None
        Outputs: None

        Redirect home
    */
	$scope.homeRedirect = function(){
        $location.path("/");
    }

    /* loginRedirect()
        Inputs: None
        Outputs: None

        Redirect to the login page
    */
    $scope.loginRedirect = function(){
    	console.log('login')
        $location.path("/login");
    }

}]);