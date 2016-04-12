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
    $scope.preferences.vegetarian = false;
    $scope.preferences.vegan = false;
    $scope.preferences.gf = false;
    $scope.preferences.defaultloc = "olin";

    // $scope.getDayMeals = function(myDate) {
    //     mealparams = {
    //         mealloc: 'olin', 
    //         mealdate: new Date(myDate.getFullYear(), myDate.getMonth(), myDate.getDate())
    //     }
    //     // $location.path("/menuapi/getdaymeals", {params: mealparams})


    //     $http.get('/menuapi/getdaymeals', {params: mealparams})
    //         .success(function(meals) {
    //             $scope.daymeals = meals;
    //             console.log(meals[0]);
    //         })
    //         .error(function(data) {
    //             console.log('Error: ' + data);
    //         })
    // }

    // $scope.getDayMeals($scope.myDate)
    $scope.homeRedirect = function(){
        $location.path("/");
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
    }

    // $scope.addFav = function() { 
    //     favparams = {
    //         foodID: '56fb118868cdd37417fa4b05',
    //     }


    //     $http.put('/prefapi/addfav', {}, {params: favparams})
    //         .success(function(food){
    //             console.log('Added food ', food)
    //         })
    // }

    // $scope.getFavs = function() { 
    //     $http.get('/prefapi/getfavs')
    //         .success(function(foods){
    //             console.log(foods)
    //         })
    // }

    // $scope.rmFav = function() { 
    //     favparams = {
    //         foodID: '56fb118868cdd37417fa4b05',
    //     }

    //     $http.put('/prefapi/rmfav', {}, {params: favparams})
    //         .success(function(food){
    //             console.log('Removed food ', food)
    //         })
    // }

    $scope.submit = function() {
        $scope.changeVegan($scope.preferences.vegan);
        $scope.changeVegetarian($scope.preferences.vegetarian);
        $scope.changeGF($scope.preferences.gf);
        $scope.changeDefaultLoc($scope.preferences.defaultloc)

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