angular.module('myApp.signupView', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/signup', {
    templateUrl: '/views/signupView/signup.html',
    controller: 'signupController'
  });
}])

.controller('signupController', ['$scope','$window', '$http', '$mdToast', function($scope,$window, $http, $mdToast) {
	console.log("signupController loaded");
	$scope.signupForm = {}
	$scope.signup = function(){
		console.log($scope.signupForm)
		$http.post('/auth/signup',$scope.signupForm)
			.success(function(data){
				console.log('success');
			})
			.error(function(data){
				console.log('error');
			})
	}

}]);