/*
Sets up an account-settings page, containing dietary restrictions, allergies, preferred-location, and favorite foods.
*/

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
    $scope.myDate = new Date();
    $scope.allergens = ['milk', 'eggs', 'wheat', 'soy', 'gluten', 
        'tree nuts', 'fish', 'shellfish', 'peanuts', 'mustard'];
    $scope.preferences = {};
    $scope.preferences.vegetarian = AuthService.authStatus.user.vegetarian;
    $scope.preferences.vegan = AuthService.authStatus.user.vegan;
    $scope.preferences.allergens = {
        selected: AuthService.authStatus.user.allergens,
    };
    // Set up whether each allergen is switched "on"
    $scope.preferences.allergens.selected.forEach(function(allergen){
        $scope.preferences.allergens[allergen] = true;
    })

    $scope.preferences.defaultloc = AuthService.authStatus.user.defaultloc;
    $scope.preferences.mindful = AuthService.authStatus.user.mindful;

    $scope.changePasswordForm = {};
    $scope.changePasswordForm.username = AuthService.authStatus.user.username;
    
    $scope.favorites = AuthService.authStatus.user.favorites;

    //changes user password
    $scope.changePassword = function(formData){
        AuthService.changePassword(formData);
    }

    //redirects to home page with menu
    $scope.homeRedirect = function(){
        $location.path("/");
        location.reload();
    }

    //logs user out, reloads page
    $scope.logout = function() {
        AuthService.logout().then(function(authStatus){
            $scope.userAuthenticated = authStatus;
        });
        $location.path("/")
        location.reload();
    }

    
    $scope.getFavs = function() { 
        $http.get('/prefapi/getfavs')
            .success(function(foods){
                console.log(foods)
                $scope.favorites = foods;
            })
    }

    $scope.getFavs();

    $scope.rmFav = function(id) { 
        favparams = {
            foodID: id,
        }

        $http.put('/prefapi/rmfav', {}, {params: favparams})
            .success(function(food){
                console.log('Removed food ', food)
                console.log("Favorites", $scope.favorites)

                var index;
                for(index=0; index < $scope.favorites.length; index++) {
                    if(food._id == $scope.favorites[index]._id) {
                        $scope.favorites.splice(index, 1);
                        break;
                    }
                }
                // var index = $scope.favorites.indexOf(food.id);
                // console.log("Index", index)
                // if (index > -1) {
                //     console.log("Before splice", $scope.favorites);
                //     $scope.favorites.splice(index, 1);
                //     console.log("After splice", $scope.favorites)
                // }
            })
    }


    $scope.submit = function() {
        $scope.changeVegan($scope.preferences.vegan);
        $scope.changeVegetarian($scope.preferences.vegetarian);
        $scope.changeAllergens($scope.preferences.allergens.selected);
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

    $scope.changeMindful = function(ismindful) { 
        mindfulparams = {
            mindful: ismindful,
        }

        $http.put('/prefapi/mindful', {}, {params: mindfulparams})
            .success(function(user){
                console.log('Mindful status ', user.mindful)
            })
    }

    $scope.updateSelectedAllergens = function(allergen){
        if ($scope.preferences.allergens[allergen]){
            $scope.preferences.allergens.selected.push(allergen)
        } else {
            var index = $scope.preferences.allergens.selected.indexOf(allergen);
            if (index > -1) {
                $scope.preferences.allergens.selected.splice(index, 1);
            }
        }

        console.log($scope.preferences.allergens.selected);
        
    }


    $scope.changeAllergens = function(allergens) { 
        allergenparams = {
            allergens: allergens,
        }

        $http.put('/prefapi/allergens', {}, {params: allergenparams})
            .success(function(user){
                console.log('Allergen Status', user.allergens)
            })
    }     

    $scope.changeDefaultLoc = function(loc) { 
        var locparams = {};
        // if(loc === false) {
        //     locparams = { defaultloc: "olin" }
        // } else {
        //     locparams = { defaultloc: "trim" }
        // }
        locparams = {defaultloc: loc};
        $http.put('/prefapi/loc', {}, {params: locparams})
            .success(function(user){
                console.log('Default loc status ', user.defaultloc)
            })
    }             

}]);