// public/javascripts/services/AuthService.js
// This is the service that we use to handle the communication of authentication from the backend (where we are using passport-spotify for 
// authentication) and the frontend (where we need an auth token to use the spotify API). 

app.service('AuthService', function($http, $q, $rootScope, $location, $mdToast) {

  this.authStatus = {authenticated: false};

  this.errorMessage = {
    Unauthorized: "The email and password combination did not match. Please try again.",
    UserExistsError: "This email is already associated with an account. Please try another one.",
    MissingUsernameError: "This is not a valid email. Please try again.",
    MissingPasswordError: "You did not enter a password. Please enter a password to sign up.",
    WrongPassword: "Wrong Password. Please enter the password currently associated with this email",
    PasswordSetFailed: "Password change failed. Please try again.",
    UserDNE: "There is no account associated with this email",
    Error: "This is a chatchall error message!",
  };

  this.routeForUnauthorizedAccess = '/';



  this.getAuthenticated = function() {
    console.log('getting authenticated')
    return $http.get('/auth/getAuthenticated');
  };

  this.setAuthenticated = function() {
    var service = this;
    return $q(function(resolve){
      service.getAuthenticated()
        .then(function (response) {
          service.authStatus = response.data;
          resolve()
        })
    })
  };

  this.login = function(credentials) {
    console.log('attempting to log in')
    var service = this;
    
    $http.post('/auth/login', credentials)
      .then(function success(response) {
        $location.path('/')
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
  };

  this.signup = function(credentials) {
    var service = this;
    $http.post('/auth/signup', credentials)
      .then(function success(signupStatus){
        $location.path('/');
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
  };

  this.ensureAuthenticated = function() {
    var deferred = $q.defer();
    var service = this;
    service.setAuthenticated().then(function success() {
      if (!service.authStatus.authenticated) {
        $location.path(service.routeForUnauthorizedAccess);
        $rootScope.$on('$locationChangeSuccess', function (next, current) {
            deferred.resolve();
        });
      }
      deferred.resolve();
    });
    return deferred.promise;
  };

  this.changePassword = function(credentials){
    var service = this;
    $http.post('/auth/changePassword', credentials)
      .then(function (response){
        console.log('success');
        $location.path('/');
        $mdToast.show(
          $mdToast.simple()
            .textContent('Password changed successfully!')
            .position("top")
            .hideDelay(3000)
        );
      })
      .catch(function (err){
        console.log(err);
        $mdToast.show(
          $mdToast.simple()
            .textContent(service.errorMessage[err.statusText])
            .position("top")
            .hideDelay(3000)
        );
      })
  };



  this.logout = function() {
    var service = this;
    return $q(function(resolve, reject){
      $http.get('/auth/logout').then(function success(response) {
        service.getAuthenticated().then(function success(response) {
          service.authStatus = response.data;
          resolve(service.authStatus.authenticated)
        })
      });
    })
  };

});