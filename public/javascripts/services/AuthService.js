// public/javascripts/services/AuthService.js
// This is the service that we use to handle the communication of authentication from the backend (where we are using passport-spotify for 
// authentication) and the frontend (where we need an auth token to use the spotify API). 

app.service('AuthService', function($http, $q, $rootScope, $location) {

  this.authenticated = false;

  this.getAuthenticated = function() {
    console.log('getting authenticated')
    return $http.get('/auth/getAuthenticated');
  };

  this.getLoginPage = function(){
    $location.path("/login");
  }

  this.login = function(credentials) {
    console.log('hello')
    var service = this;
    $http.post('/auth/login', credentials).then(function success(response) {
      service.getAuthenticated().then(function success(authStatus) {
        console.log(authStatus);
        service.authenticated = authStatus.data.authenticated;
        $location.path('/');
      })
    });
  };

  this.logout = function() {
    var service = this;
    $http.get('/auth/logout').then(function success(response) {
      service.getAuthenticated().then(function success(authStatus) {
        service.authenticated = authStatus.data.authenticated;
        console.log(service.authenticated)
        //Feel meh about this... 
        location.reload();
        // return service.authenticated;
      })
    });
  };

});