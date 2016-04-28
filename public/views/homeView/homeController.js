// public/views/homeView/homeController.js
// This is the file that contains the controller for the home page of our app

angular.module('myApp.homeView', ['ngRoute'])
// Load the template and controller for the home page
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: '/views/homeView/home.html',
    controller: 'homeController',
    // Know whether or not we are authenticated before we render the page
    resolve: {
    	authentication: function (AuthService, $route) {
    		return AuthService.setAuthenticated();
    	}
    }
  });
}])

.controller('homeController', ['$scope','$window', '$http', '$mdToast', '$q', '$location', 'AuthService', function($scope,$window, $http, $mdToast, $q, $location, AuthService) {
	console.log("homeController loaded");
	// boolean for whether or not the user is authenticated
    $scope.userAuthenticated = AuthService.authStatus.authenticated;
    // the user's favorite foods
    $scope.userFavoriteFoods = $scope.userAuthenticated? AuthService.authStatus.user.favorites : [];
    // the variable that will contain the menu for the day
    $scope.daymeals = [];
    // the variable that will contain the filtered menu for the day
    $scope.filteredDayMeals = [];
    // the food types and allergens
    $scope.foodTypes = ['mindful', 'vegan', 'vegetarian'];
    $scope.allergens = ['milk', 'eggs', 'wheat', 'soy', 'gluten', 
        'tree nuts', 'fish', 'shellfish', 'peanuts', 'mustard'];
    

    /* getUserFoodTypes()
        Inputs: None
        Outputs: userFoodTypes

        Returns the food types and allergens that a user has identfied
    */

    $scope.getUserFoodTypes = function(){
        if (!$scope.userAuthenticated){
            return []
        }

        var userFoodTypes = []
        $scope.foodTypes.forEach(function (foodType){
            if (AuthService.authStatus.user[foodType]){
                userFoodTypes.push(foodType);
            }
        });
        $scope.allergens.forEach(function (allergen){
            if (AuthService.authStatus.user[allergen]){
                userFoodTypes.push(allergen);
            }
        });

        return userFoodTypes
    }

    // The form data for adjusting the menu
    $scope.formData = {
        myDate: new Date(),
        myLocation: $scope.userAuthenticated? AuthService.authStatus.user.defaultloc : "olin",
        mySelectedFoodTypes: $scope.getUserFoodTypes(), 
        mySelectedAllergens: $scope.userAuthenticated? AuthService.authStatus.user.allergens : [],
    };

    // Display text for breakfast, lunch, and dinner
    $scope.mealTypeToDisplay = {
        brk: "Breakfast",
        lun: "Lunch",
        din: "Dinner",
    }

    // The currently selected (expanded) dish
    $scope.currentlySelected = {
        meal: "",
        dish: {}
    };

    // the stations for each meal
    $scope.stations = {
        brk: [],
        lun: [],
        din: [],
    };

    /* getDayMeals()
        Inputs: formData (date, location, foodtypes, allergens)
        Outputs: None

        get the meals being served on the selected date
    */
    $scope.getDayMeals = function(formData) {
        mealparams = {
            mealloc: formData.myLocation, 
            mealdate: new Date(formData.myDate.getFullYear(), formData.myDate.getMonth(), formData.myDate.getDate())
        };
        $http.get('/menuapi/getdaymeals', {params: mealparams})
            .success(function(meals) {
                $scope.daymeals = meals.sort(function(meal1, meal2){
                    // I'm sure there's a better way to do this!
                    if (meal1.mealType === meal2.mealType){
                        return 0
                    } else if (meal1.mealType === 'brk'){
                        return -1
                    } else if (meal2.mealType === 'brk'){
                        return 1 
                    } else if (meal1.mealType === 'lun'){
                        return -1
                    } else {
                        return 1
                    }
                });
                // filter the menu according to the user's preferences
                $scope.filterFoods();
            })
            .error(function(data) {
                console.log('Error: ' + data);
            })
    }

    // get the meals being served, now that we've declared the function
    $scope.getDayMeals($scope.formData);

    /* setDateToday()
        Inputs: None
        Outputs: None

        set the date of the date picker to today, and get the new meals from the backend
    */
    $scope.setDateToday = function (){
        $scope.formData.myDate = new Date();
        $scope.getDayMeals($scope.formData);
    }

    

    /* filterFoods()
        Inputs: None
        Outputs: None

        Filter the foods and set the $scope.filteredDayMeals variable. Also, find all the stations that exist for the food. 
    */
    $scope.filterFoods = function(){
        // Clear the stations
        $scope.stations = {
            brk: [],
            lun: [],
            din: [],
        };
        // Clear the previously filtered meals
        $scope.filteredDayMeals = [];
        // Loop over all of the meals
        $scope.daymeals.forEach(function (meal){
            // create a filtered meal object
            var filteredMeal = {
                _id: meal._id,
                date: meal.date,
                lastUpdated: meal.lastUpdated,
                location: meal.location,
                mealType: meal.mealType,
                foods: []
            };
            // loop over all the dishes in the meal
            meal.foods.forEach(function (dish){
                // assume we're including
                var include = true;
                
                // Loop over all of the selected food types could be: (mindful, vegan, vegetarian)
                $scope.formData.mySelectedFoodTypes.forEach(function (foodType){
                    // if the meal type is selected, and the dish is not that mealtype, don't include it
                    if (!dish[foodType]){
                        include = false
                    }
                });
                // Do pretty much the same thing: filter out dishes that contain allergens we've selected to filter out
                // Get the allergens of the current dish
                var dishAllergens = dish.nutritionInformation[0].allergens;
                // Loop over all the selected allergens
                $scope.formData.mySelectedAllergens.forEach(function (allergen){
                    // if our current allergen is in the list of allergens, don't include it
                    if (dishAllergens.indexOf(allergen) !== -1){
                        include = false;
                    }
                });
                // If we should still be including this dish, push it to the filtered meal list. 
                if (include){
                    filteredMeal.foods.push(dish);
                }
                // If the station of this current dish,meal combination is not in the list of stations for that meal, 
                // push it to the list of staitons
                if ($scope.stations[meal.mealType].indexOf(dish.station[$scope.formData.myLocation]) === -1){
                    $scope.stations[meal.mealType].push(dish.station[$scope.formData.myLocation]);
                }
            });
            $scope.filteredDayMeals.push(filteredMeal)
        });
    }

    /* selectDish()
        Inputs: meal (which meal?), dish object
        Outputs: None

        After a user presses the button to select (expand) a dish, this is the function that gets called. Here we 
        set the meal (so we don't expand all instances of the dish, if it's served in multiple meals) and save the
        dish as our currently selected. 
    */
    $scope.selectDish = function(meal, dish){
        $scope.currentlySelected.meal = meal.mealType;
        $scope.currentlySelected.dish = dish;
    }

    /* unselectDish()
        Inputs: None
        Outputs: None

        If a user presses the collapse button, this is the function that gets called. Here, we just set the variable
        for the currently selected dish back to empty
    */
    $scope.unselectDish = function(){
        $scope.currentlySelected = {
            meal: "",
            dish: {},
        };
    }


    /* getFavs()
        Inputs: None
        Outputs: None

        This function gets the user's favorite foods from the backend
    */
    $scope.getFavs = function() { 
        $http.get('/prefapi/getfavs')
            .success(function(foods){
                console.log(foods)
                $scope.userFavoriteFoods = foods;
                console.log ($scope.userFavoriteFoods);
            })
    }

    /* addFav()
        Inputs: id
        Outputs: None

        After a user presses the favorite button, this is the function that gets called. Here we add the food id 
        to a list of the user's favorite foods (and also the list we have on the frontend)
    */
    $scope.addFav = function(id) { 
        favparams = {
            foodID: id,
        }


        $http.put('/prefapi/addfav', {}, {params: favparams})
            .success(function(food){
                console.log('Added food ', food)
                $scope.userFavoriteFoods.push(id);
            })
    }


    /* rmFav()
        Inputs: id
        Outputs: None

        After a user presses the unfavorite button, this is the function that gets called. Here we remove the 
        food id from a list of the user's favorite foods on the backend, and the list we've stored on the frontend
    */
    $scope.rmFav = function(id) { 
        favparams = {
            foodID: id,
        }

        $http.put('/prefapi/rmfav', {}, {params: favparams})
            .success(function(food){
                console.log('Removed food ', food)
                var index = $scope.userFavoriteFoods.indexOf(id);
                if (index > -1) {
                    $scope.userFavoriteFoods.splice(index, 1);
                }
            })
    }        


    /* loginRedirect()
        Inputs: None
        Outputs: None

        Redirects to the login page
    */
	$scope.loginRedirect = function(){
		$location.path("/login");
	}

    /* signupRedirect()
        Inputs: None
        Outputs: None

        Redirects to the signup page
    */
	$scope.signupRedirect = function(){
		$location.path("/signup");
	}

    /* accountSettingsRedirect()
        Inputs: None
        Outputs: None

        Redirects to the account settings page page
    */
    $scope.accountSettingsRedirect = function(){
        $location.path("/accountsettings");
    }    

    /* logout()
        Inputs: None
        Outputs: None

        wrapper for the auth service logout page. Reloads the page after logging out
    */
	$scope.logout = function() {
		AuthService.logout().then(function(authStatus){
			$scope.userAuthenticated = authStatus;
		});
        $location.path("/")
        location.reload();
	}
}]);