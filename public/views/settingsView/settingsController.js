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
            navigator.serviceWorker.register('sw.js');
            navigator.serviceWorker.ready.then(function(reg) {
                console.log(':^)', reg);
                reg.pushManager.subscribe({
                    userVisibleOnly: true
                }).then(function(subscription) {
                    var rawKey = subscription.getKey ? subscription.getKey('p256dh') : '';
                    key = rawKey ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawKey))) : '';
                    var rawAuthSecret = subscription.getKey ? subscription.getKey('auth') : '';
                    authSecret = rawAuthSecret ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawAuthSecret))) :'';

                    var data = {
                        subscription: {
                            endpoint: subscription.endpoint,
                            p256dh: key,
                            auth: authSecret,
                        }
                    }
                    console.log(data)

                    $http.post('/notifictionAPI/addSubscriptionAndConfirm', data)
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
                });
            }).catch(function(error) {
                console.log(':^(', error);
            });
        }
    }

    $scope.removePushSubsrciption = function(){
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(function(reg) {
                reg.pushManager.getSubscription().then(function(subscription) {
                    console.log(subscription.endpoint)
                        var data = {endpoint: subscription.endpoint}

                        $http.post('/notifictionAPI/removeSubscription', data)
                        .success(function(data) {
                            subscription.unsubscribe()
                            console.log("push notifications endpoint unsubscribed");
                            console.log(data);
                            $mdToast.show($mdToast.simple()
                                .textContent('Successfully unsubscribed this device from push notifications')
                                .hideDelay(3000)
                            );
                        })
                        .error(function(data) {
                            console.log('Error: ' + data);
                            $mdToast.show($mdToast.simple()
                                .textContent('Failed to unsubscribe from push notifications')
                                .hideDelay(3000)
                            );
                        });
                })
            })
        }
    }

    $scope.testNotifications = function(){
        data = {title: "testTitle" + Math.random().toString(36),
                message: "testMessage2"}
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