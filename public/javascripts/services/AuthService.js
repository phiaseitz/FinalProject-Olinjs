// public/javascripts/services/AuthService.js
// This is the service that we use to handle the communication of authentication from the backend (where we are using passport-spotify for 
// authentication) and the frontend (where we need an auth token to use the spotify API). 

app.service('AuthService', function($http, $q, $rootScope, $location, $mdToast) {

  this.authenticated = false;

  this.errorMessage = {
    Unauthorized: "The username and password combination did not match. Please try again.",
    UserExistsError: "A user with that username already exists. Please try another one."
  }


  this.getAuthenticated = function() {
    console.log('getting authenticated')
    return $http.get('/auth/getAuthenticated');
  };

  this.getLoginPage = function(){
    $location.path("/login");
  }

  this.getSignupPage = function(){
    $location.path("/signup");
  }

  this.login = function(credentials) {
    console.log('attempting to log in')
    var service = this;
    
    //Returns a promise that resolves with the authentication status, if login is successful, 
    //and rejects with the error if login is unsuccessful
    
    $http.post('/auth/login', credentials)
      .then(function success(response) {
        service.getAuthenticated()
          .then(function (authStatus) {
            console.log(authStatus);
            service.authenticated = authStatus.data.authenticated;
            $location.path('/')
          })
      })
      .catch(function(err){
        console.log('Error logging in! ', err)
        $mdToast.show(
          $mdToast.simple()
            .textContent(service.errorMessage[err.data])
            .position("top")
            .hideDelay(3000)
        );
      });
  },

  this.signup = function(credentials) {
    var service = this;
    $http.post('/auth/signup', credentials)
      .then(function success(signupStatus){
        service.getAuthenticated().then(function (authStatus) {
          console.log(authStatus);
          service.authenticated = authStatus.data.authenticated;
          $location.path('/');
        })
      })
    .catch(function(err){
      console.log('Error signing up! ', err)
      //Clean up the error text
      var errorText = err.data.split(":")[0]
      $mdToast.show(
        $mdToast.simple()
          .textContent(service.errorMessage[errorText])
          .position("top")
          .hideDelay(3000)
      );
    })
  }

  this.logout = function() {
    var service = this;
    return $q(function(resolve, reject){
      $http.get('/auth/logout').then(function success(response) {
        service.getAuthenticated().then(function success(authStatus) {
          service.authenticated = authStatus.data.authenticated;
          resolve(service.authenticated)
        })
      });
    })
  };

});