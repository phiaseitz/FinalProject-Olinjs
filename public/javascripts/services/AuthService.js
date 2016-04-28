// public/javascripts/services/AuthService.js
// This is the service that we use to handle the communication of authentication from the backend (where we are using passport-spotify for 
// authentication) and the frontend (where we need an auth token to use the spotify API). 

app.service('AuthService', function($http, $q, $rootScope, $location, $mdToast) {

  // Default authentication status to false
  this.authStatus = {authenticated: false};

  // Error message dictionary for auth-based error message
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

  // If the user tries to access a page they need to be logged in 
  // for, send them back home
  this.routeForUnauthorizedAccess = '/';



  /* AuthService.getAuthenticated()
      Inputs: None
      Outputs: A promise object returned from the get request
  */
  this.getAuthenticated = function() {
    return $http.get('/auth/getAuthenticated');
  };

  /* AuthService.setAuthenticated()
      Inputs: None
      Outputs: None (This function sets the authStatus variable)
                using getAuthenticated()*/
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

  /* AuthService.login()
      Inputs: credentials (email and password)
      Outputs: None

      This function handles the logging in, redirecting on success,
      and displays an error if we were unable to log the user in. 
  */ 
  this.login = function(credentials) {
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

  /* AuthService.signup()
      Inputs: credentials (email and password)
      Outpus: None

      This function handles signing up for our app. It performs
      the same function as login but creates a user account.
  */ 
  this.signup = function(credentials) {
    var service = this;
    $http.post('/auth/signup', credentials)
      .then(function success(signupStatus){
        $location.path('/accountsettings');
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

  /* AuthService.ensureAuthenticated()
      Inputs: None
      Outputs: None

      This function checks whether the user is authenticated. If so, 
      it just resolves the promise, otherwise we redirect to the 
      route for unauthorized access and then resolve
  */ 

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

  /* AuthService.changePassword()
      Inputs: credentials (username, old password, new password)
      Outputs: None

      This function changes the password. 
  */ 

  this.changePassword = function(credentials){
    var service = this;
    $http.post('/auth/changePassword', credentials)
      .then(function (response){
        console.log('success');
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

  /* AuthService.logout()
      Inputs: None
      Outputs: None

      This function logs the user out!
  */ 

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