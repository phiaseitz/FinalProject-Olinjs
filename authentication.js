// authentication.js
// This file contains all the backend auth code!

// Imports
var passport        = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/userModel');

// Functions
var authentication = {
  /* authentication.configure()
      Inputs: None
      Outputs: Passport object

      This function configures the passport object and returns the
      configured passport object
  */
  configure: function() {
    passport.serializeUser(User.serializeUser());

    passport.deserializeUser(User.deserializeUser()); 

    passport.use(new LocalStrategy(User.authenticate()));

    return passport;

  },


  /* authentication.signup()
      Inputs: req, res, next
      Outputs: None

      This function handles signing up the user. Since we're using
      passport local mongoose, this is super straight-forward. 

      If we're successful, we redirect to home after authenticating. 
  */
  signup: function(req, res, next) {
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
      console.log(err);
      if (err) {
        console.log('error while user register!', err);
        return next(err);
      }

      console.log('user registered!');

      passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });

      
    });
  },


  /* authentication.login()
      Inputs: req, res, next
      Outputs: None

      Log in the user using passport.authenticate
  */
  login: function(req, res, next) {
    passport.authenticate('local') (req, res, function () {
      res.redirect('/')
    })
  },

  /* authentication.changePassword()
      Inputs: req, res, next
      Outputs: None

      Change the password
  */
  changePassword: function(req, res, next) {
    // Find the username object
    User.findByUsername(req.body.username).then(function(sanitizedUser){
      if (sanitizedUser){
        // Check whether the old password and the username match
        sanitizedUser.authenticate(req.body.oldPassword, function (err, user, message){
          if(err || message){
            res.status(401).json({status: 0, msg: "WrongPassword"})
          } else {
            // Set the password 
            user.setPassword(req.body.newPassword, function(err, userWithNewPassword){
              console.log(err);
              console.log(userWithNewPassword);
              user.save();
              if (err){
                res.status(401).json({status: 0, msg: "PasswordSetFailed"})
              } else {
                res.status(200).json({status: 0, msg: "PasswordChanged"})
              }
            })
          }
        })
      // If we were unable to find the user
      } else {}
        res.status(401).json({status: 0, msg: 'UserDNE'});
      }
    })
    .catch(function(err){
      // Something else went wrong
      console.log(err);
      res.status(401).json({status: 0, msg: 'Error'});
    })
  },

  /* authentication.ensureAuthenticated()
      Inputs: req, res, next
      Outputs: None

      Go to the next route if we are authenticated, othewise go home.
  */
  ensureAuthenticated: function(req, res, next){
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
  },


  /* authentication.login()
      Inputs: req, res, next
      Outputs: None

      Logout the user.
  */
  logout: function(req, res, next) {
      req.logout();
      next();
  },


  /* authentication.getAuthenticated()
      Inputs: req, res, next
      Outputs: None

      Get the authentication status of the user
  */
  getAuthenticated: function(req, res, next){
    // res.json({'authenticated': true});
    console.log(req.user);
    console.log(req.isAuthenticated())
    if (req.isAuthenticated()){
      res.json({
        user: req.user,
        authenticated: true, 
      });
    } else {
      res.json({
        authenticated: false,
      });
    }
  },
}

module.exports = authentication;