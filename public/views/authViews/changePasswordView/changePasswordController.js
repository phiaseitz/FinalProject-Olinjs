angular.module('myApp.changePasswordView', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/changePassword', {
    templateUrl: '/views/authViews/changePasswordView/changePassword.html',
    controller: 'changePasswordController',
    resolve: {
    	authentication: function (AuthService, $route) {
    		return AuthService.ensureAuthenticated();
    	}
    },
  });
}])

.controller('changePasswordController', ['$scope','$location', '$http', '$mdToast', 'AuthService', function($scope, $location, $http, $mdToast, AuthService) {
	console.log("changePasswordController loaded");
	
	console.log(AuthService.authStatus);

	$scope.changePasswordForm = {};

	$scope.changePasswordForm.username = AuthService.authStatus.user.username;
	
	$scope.changePassword = function(formData){
		console.log(formData);

		AuthService.changePassword(formData);
	}

}]);