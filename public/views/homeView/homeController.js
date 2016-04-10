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
    $scope.daymeals = []
    $scope.formData = {
        myDate: new Date(),
        myLocation: 'olin',
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

    $scope.getDayMeals = function(formData) {
        mealparams = {
            mealloc: formData.myLocation, 
            mealdate: new Date(formData.myDate.getFullYear(), formData.myDate.getMonth(), formData.myDate.getDate())
        }
        // $location.path("/menuapi/getdaymeals", {params: mealparams})
        console.log(mealparams);
        $http.get('/menuapi/getdaymeals', {params: mealparams})
            .success(function(meals) {
                $scope.daymeals = meals;
                console.log(meals[0]);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            })
    }

    $scope.getDayMeals($scope.formData)

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
}]);