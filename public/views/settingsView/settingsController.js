angular.module('myApp.settingsView', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/settings', {
    templateUrl: '/views/settingsView/settings.html',
    controller: 'settingsController',
    // Know whether or not we are authenticated before we render the page
    resolve: {
    	authentication: function (AuthService, $route) {
    		return AuthService.setAuthenticated();
    	}
    }
  });
}])

.controller('settingsController', ['$scope','$window', '$http', '$mdToast', '$q', '$location', 'AuthService', function($scope,$window, $http, $mdToast, $q, $location, AuthService) {
	console.log("settingsController loaded");
	
    $scope.userAuthenticated = AuthService.authStatus.authenticated;

    $scope.registerServiceWorker = function(){
        if ('serviceWorker' in navigator) {
            console.log('Service Worker is supported');
            navigator.serviceWorker.register('javascripts/sw.js').then(function(reg) {
                console.log(':^)', reg);
                reg.pushManager.subscribe({
                    userVisibleOnly: true
                }).then(function(sub) {
                    var key = sub.getKey('p256dh');
                    var auth = sub.getKey('auth');
                    console.log(key);
                    console.log(auth);
                    var data = {subscription: JSON.stringify(sub)}
                    $http.post('/notifictionAPI/addSubscription', data)
                        .success(function(data) {
                            console.log("push notifications endpoint save successfull");
                            console.log(data);
                            $mdToast.show($mdToast.simple()
                                .textContent('Successfully subscribed to push notifications')
                                .hideDelay(3000)
                            );
                        })
                        .error(function(data) {
                            console.log('Error: ' + data);
                            $mdToast.show($mdToast.simple()
                                .textContent('Failed to subscribe to push notifications')
                                .hideDelay(3000)
                            );
                        });
                    console.log('subscription:', JSON.stringify(sub));
                });
            }).catch(function(error) {
                console.log(':^(', error);
            });
        }
    }

    $scope.testNotifications = function(){
        data = {title: "testTitle",
                message: "testMessage"}
        $http.post('/notifictionAPI/testNotifications', data)
                        .success(function(data) {
                            console.log("notifications sent successfully");
                            console.log(data);
                            $mdToast.show($mdToast.simple()
                                .textContent('Successfully sent notification')
                                .hideDelay(3000)
                            );
                        })
                        .error(function(data) {
                            console.log('Error: ' + data);
                            $mdToast.show($mdToast.simple()
                                .textContent('Failed to send notification')
                                .hideDelay(3000)
                            );
                        });
    }

	$scope.loginRedirect = function(){
		$location.path("/login");
	}

	$scope.signupRedirect = function(){
		$location.path("/signup");
	}

	$scope.changePasswordRedirect = function(){
		$location.path("/changePassword");
	}

	$scope.logout = function() {
		AuthService.logout().then(function(authStatus){
			$scope.userAuthenticated = authStatus;
		});
	}
}]);