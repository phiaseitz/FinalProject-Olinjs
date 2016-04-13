angular.module('myApp.accountSettingsView', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/accountsettings', {
    templateUrl: '/views/accountSettingsView/accountSettings.html',
    controller: 'accountSettingsController',
    // Know whether or not we are authenticated before we render the page
    resolve: {
        authentication: function (AuthService, $route) {
            return AuthService.ensureAuthenticated();
        }
    }
  });
}])

.controller('accountSettingsController', ['$scope','$window', '$http', '$mdToast', '$q', '$location', 'AuthService', function($scope,$window, $http, $mdToast, $q, $location, AuthService) {
    console.log("accountSettingsController loaded");
    
    $scope.userAuthenticated = AuthService.authStatus.authenticated;
    $scope.daymeals = []
    $scope.myDate = new Date();

    $scope.preferences = {};
    $scope.preferences.vegetarian = AuthService.authStatus.user.vegetarian;
    $scope.preferences.vegan = AuthService.authStatus.user.vegan;
    $scope.preferences.gf = AuthService.authStatus.user.gf;
    $scope.preferences.defaultloc = AuthService.authStatus.user.defaultloc;
    $scope.preferences.mindful = AuthService.authStatus.user.mindful;

    $scope.changePasswordForm = {};

    $scope.changePasswordForm.username = AuthService.authStatus.user.username;
    
    $scope.changePassword = function(formData){
        console.log(formData);

        AuthService.changePassword(formData);
    }

    // $scope.getDayMeals($scope.myDate)
    $scope.homeRedirect = function(){
        $location.path("/");
        $location.reload();
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
        $location.path("/")
        location.reload();
    }

    $scope.submit = function() {
        $scope.changeVegan($scope.preferences.vegan);
        $scope.changeVegetarian($scope.preferences.vegetarian);
        $scope.changeGF($scope.preferences.gf);
        $scope.changeDefaultLoc($scope.preferences.defaultloc)
        $scope.changeMindful($scope.preferences.mindful)

    }

    $scope.changeVegan = function(isvegan) { 
        veganparams = {
            vegan: isvegan,
        }

        $http.put('/prefapi/vegan', {}, {params: veganparams})
            .success(function(user){
                console.log('Vegan status ', user.vegan)
            })
    }  

    $scope.changeVegetarian = function(isveg) { 
        vegparams = {
            vegetarian: isveg,
        }

        $http.put('/prefapi/vegetarian', {}, {params: vegparams})
            .success(function(user){
                console.log('Vegetarian status ', user.vegetarian)
            })
    } 

    $scope.changeGF = function(isgf) { 
        gfparams = {
            glutenfree: isgf,
        }

        $http.put('/prefapi/gf', {}, {params: gfparams})
            .success(function(user){
                console.log('Gluten free status ', user.gf)
            })
    } 

    $scope.changeMindful = function(ismindful) { 
        mindfulparams = {
            mindful: ismindful,
        }

        $http.put('/prefapi/mindful', {}, {params: mindfulparams})
            .success(function(user){
                console.log('Mindful status ', user.mindful)
            })
    }    

    $scope.changeDefaultLoc = function(loc) { 
        var locparams = {};
        if(loc === false) {
            locparams = { defaultloc: "olin" }
        } else {
            locparams = { defaultloc: "trim" }
        }

        $http.put('/prefapi/loc', {}, {params: locparams})
            .success(function(user){
                console.log('Default loc status ', user.defaultloc)
            })
    }             

}]);