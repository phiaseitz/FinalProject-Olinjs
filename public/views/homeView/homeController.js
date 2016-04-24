angular.module('myApp.homeView', ['ngRoute'])

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
	
    $scope.userAuthenticated = AuthService.authStatus.authenticated;
    $scope.userFavoriteFoods = $scope.userAuthenticated? AuthService.authStatus.user.favorites : [];
    $scope.daymeals = [];
    $scope.filteredDayMeals = [];
    $scope.foodTypes = ['mindful', 'vegan', 'vegetarian'];
    $scope.allergens = ['milk', 'eggs', 'wheat', 'soy', 'gluten', 
        'tree nuts', 'fish', 'shellfish', 'peanuts', 'mustard'];
    

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

    $scope.formData = {
        myDate: new Date(),
        myLocation: $scope.userAuthenticated? AuthService.authStatus.user.defaultloc : "olin",
        mySelectedFoodTypes: $scope.getUserFoodTypes(), 
        mySelectedAllergens: $scope.userAuthenticated? AuthService.authStatus.user.allergens : [],
    };
    $scope.mealTypeToDisplay = {
        brk: "Breakfast",
        lun: "Lunch",
        din: "Dinner",
    }
    $scope.currentlySelected = {
        meal: "",
        dish: {}
    };

    $scope.stations = {
        brk: [],
        lun: [],
        din: [],
    };

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
                //console.log($scope.daymeals);
                $scope.filterFoods();
                //console.log($scope.filteredDayMeals);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            })
    }

    $scope.setDateToday = function (){
        $scope.formData.myDate = new Date();
        $scope.getDayMeals($scope.formData);
    }

    $scope.getDayMeals($scope.formData);

    $scope.setAllFoodType = function(){
        $scope.formData.myFoodTypes.all = !$scope.formData.myFoodTypes.all;
        var value = $scope.formData.myFoodTypes.all;
        //console.log($scope.formData);
        $scope.foodTypes.forEach(function (foodType){
            $scope.formData.myFoodTypes[foodType] = value;
        });
        $scope.filterFoods();
    }

    $scope.toggleFoodType = function(foodType){
        $scope.formData.myFoodTypes[foodType] = !$scope.formData.myFoodTypes[foodType];
        
        var areAllFoodTypeChecked = $scope.formData.myFoodTypes[foodType];
        var newSelectAllVal = areAllFoodTypeChecked;

        if (areAllFoodTypeChecked){
            $scope.foodTypes.forEach(function (foodType){
            if (!$scope.formData.myFoodTypes[foodType]){
                newSelectAllVal = false;
            }
        });
        }
        
        $scope.formData.myFoodTypes.all = newSelectAllVal;
        $scope.filterFoods();
    }

    $scope.filterFoods = function(){
        $scope.stations = {
            brk: [],
            lun: [],
            din: [],
        };
        $scope.filteredDayMeals = [];
        $scope.daymeals.forEach(function (meal){
            var filteredMeal = {
                _id: meal._id,
                date: meal.date,
                lastUpdated: meal.lastUpdated,
                location: meal.location,
                mealType: meal.mealType,
                foods: []
            };
            meal.foods.forEach(function (dish){
                var include = true;
                
                $scope.formData.mySelectedFoodTypes.forEach(function (foodType){
                    if (!dish[foodType]){
                        include = false
                    }
                });
                var dishAllergens = dish.nutritionInformation[0].allergens;
                $scope.formData.mySelectedAllergens.forEach(function (allergen){
                    if (dishAllergens.indexOf(allergen) !== -1){
                        include = false;
                    }
                });

                if (include){
                    filteredMeal.foods.push(dish);
                }
                if ($scope.stations[meal.mealType].indexOf(dish.station[$scope.formData.myLocation]) === -1){
                    $scope.stations[meal.mealType].push(dish.station[$scope.formData.myLocation]);
                }
            });
            $scope.filteredDayMeals.push(filteredMeal)
        });
    }

    $scope.selectDish = function(meal, dish){
        $scope.currentlySelected.meal = meal.mealType;
        $scope.currentlySelected.dish = dish;
        console.log($scope.currentlySelected);
        console.log(dish._id === $scope.currentlySelected.dish._id) && (dish.mealType === $scope.currentlySelected.meal)
    }
    $scope.unselectDish = function(){
        $scope.currentlySelected = {
            meal: "",
            dish: {},
        };
    }

    $scope.getFavs = function() { 
        $http.get('/prefapi/getfavs')
            .success(function(foods){
                console.log(foods)
                $scope.userFavoriteFoods = foods;
                console.log ($scope.userFavoriteFoods);
            })
    }

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


	$scope.loginRedirect = function(){
		$location.path("/login");
	}

	$scope.signupRedirect = function(){
		$location.path("/signup");
	}

	$scope.changePasswordRedirect = function(){
		$location.path("/changePassword");
	}

    $scope.accountSettingsRedirect = function(){
        $location.path("/accountsettings");
    }    

	$scope.logout = function() {
		AuthService.logout().then(function(authStatus){
			$scope.userAuthenticated = authStatus;
		});
        $location.path("/")
        location.reload();
	}
}]);