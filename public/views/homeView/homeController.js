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
    $scope.myDate = new Date();

    $scope.getDayMeals = function(myDate) {
        mealparams = {
            mealloc: 'olin', 
            mealdate: new Date(myDate.getFullYear(), myDate.getMonth(), myDate.getDate())
        }
        // $location.path("/menuapi/getdaymeals", {params: mealparams})


        $http.get('/menuapi/getdaymeals', {params: mealparams})
            .success(function(meals) {
                $scope.daymeals = meals;
                console.log(meals[0]);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            })
    }

    $scope.getDayMeals($scope.myDate)

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

    $scope.addFav = function() { 
        favparams = {
            foodID: '56fb118868cdd37417fa4b05',
        }


        $http.put('/prefapi/addfav', {}, {params: favparams})
            .success(function(food){
                console.log('Added food ' + food + '!')
            })
    }

    $scope.getFavs = function() { 
        $http.get('/prefapi/getfavs')
            .success(function(foods){
                console.log(foods)
            })
    }

    $scope.rmFav = function() { 
        favparams = {
            foodID: '4edd40c86762e0fb12000003',
        }

        $http.put('/prefapi/rmfav', {}, {params: favparams})
            .success(function(foods){
                console.log(foods)
            })
    }         
}]);