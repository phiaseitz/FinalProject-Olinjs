// This is the file where we have all of our authentication-based logic. We're using passport-spotify to handle all of our authentication. 
var passport        = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/userModel');


var authentication = {
  configure: function() {
    passport.serializeUser(User.serializeUser());

    passport.deserializeUser(User.deserializeUser()); 

    passport.use(new LocalStrategy(User.authenticate()));

    return passport;

  },

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

  login: function(req, res, next) {
    console.log('logging in...')
    passport.authenticate('local') (req, res, function () {
      res.redirect('/')
    })
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
    console.log(req.user);
    console.log(req.isAuthenticated())
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