// Declare app level module which depends on views, and components
var app = angular.module('myApp', [
  'ngRoute',
  'ngMaterial',
  'myApp.homeView',
  'myApp.loginView',
  'myApp.signupView',
  'myApp.accountSettingsView',
  'myApp.changePasswordView',
  'myApp.settingsView',
])

.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider.otherwise({redirectTo: '/'});

  $locationProvider.html5Mode({ enabled: true, requireBase: false });
}]);