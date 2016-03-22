// This is the file where we have all of our authentication-based logic. We're using passport-spotify to handle all of our authentication. 
var passport        = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/userModel');


var authentication = {
  configure: function() {
    passport.serializeUser(function(user, done) {
      console.log('serializeUser: ' + user._id);
      done(null, user._id);
    });
    passport.deserializeUser(function(id, done) {
      User.findById(id, function(err, user){
        console.log(user);
          if(!err) done(null, user);
          else done(err, null);
        });
    });

    passport.use('local-signup', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true,
      },
      function(req, username, password, done) {
        // asynchronous verification, for effect...
          // To keep the example simple, the user's spotify profile is returned to
          // represent the logged-in user. In a typical application, you would want
          // to associate the spotify account with a user record in your database,
          // and return that user instead.
          User.findOne({ 'username' :  username }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                return done('That email is already taken.', false);
            } else {
                // if there is no user with that email
                // create the user
                var newUser = new User();

                // set the user's local credentials
                newUser.username    = username;
                newUser.password = newUser.generateHash(password);

                // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }

        });         
    }));  

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) { // callback with username and password from our form
        // find a user whose username is the same as the forms username
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'username' :  username }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done("no user found", false); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done("wrong password", false); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
        });

    }));

    return passport;

  },

  signup: function(req, res, next) {
    passport.authenticate('local-signup', { failureRedirect: '/signup', successRedirect: '/' })(req, res, next)
  },

  login: function(req, res, next) {
    passport.authenticate('local-login', { failureRedirect: '/login', successRedirect: '/' })(req, res, next)
  }, 

  ensureAuthenticated: function(req, res, next){
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login');
  },

  logout: function(req, res, next) {
      req.logout();
      next();
  },

  getAuthenticated: function(req, res, next){
    console.log("getting authentication status");
    // res.json({'authenticated': true});
    if (req.isAuthenticated()){
      console.log('authenticated');
      res.json({
        authenticated: true, 
      });
    } else {
      console.log('notauthenticated');
      res.json({
        authenticated: false,
      });
    }
  },
}

module.exports = authentication;