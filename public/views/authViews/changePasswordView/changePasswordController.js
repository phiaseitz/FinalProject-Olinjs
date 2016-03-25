angular.module('myApp.changePasswordView', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/changePassword', {
    templateUrl: '/views/authViews/changePasswordView/changePassword.html',
    controller: 'changePasswordController'
  });
}])

.controller('changePasswordController', ['$scope','$location', '$http', '$mdToast', 'AuthService', function($scope, $location, $http, $mdToast, AuthService) {
	console.log("changePasswordController loaded");
	$scope.changePasswordForm = {};
	$scope.changePasswordError = "";
	
	$scope.changePassword = function(formData){
		console.log(formData);
		AuthService.changePassword(formData);
	}

}]);