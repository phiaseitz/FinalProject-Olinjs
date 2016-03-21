// load all the things we need
var SpotifyStrategy = require('passport-spotify').Strategy;

var User = require('../models/userModel.js');

module.exports = function(passport) {

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.spotify.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.find( {'spotify.id' : id }, function(err, user) {
            done(err, user);
        });
    });

    passport.use(new SpotifyStrategy({
        clientID: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        callbackURL: process.env.SPOTIFY_CALLBACK_URL
      },
      function(accessToken, refreshToken, params , profile, done) {
        console.log('accessTokenPassport')
        console.log(accessToken)
        User.findOne({ 'spotify.id' : profile.id }, function(err, user) {
                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    console.log("existing User")
                    user.spotify.accessToken = accessToken; // we will save the token that facebook provides to the user                    
                    user.spotify.refreshToken = refreshToken;
                    d = new Date();
                    d.setSeconds(d.getSeconds() + params.expires_in);//params.expires_in
                    user.spotify.accessTokenExpiresTime = d;
                    user.save(function(err) {
                        if (err)
                            throw err;

                        // if successful, return the user
                        return done(null, user);
                    });
                } else {
                    console.log("new User")
                    // if there is no user found with that facebook id, create them
                    var newUser            = new User();

                    // set all of the facebook information in our user model

                    newUser.spotify.id    = profile.id; // set the users facebook id                   
                    newUser.spotify.accessToken = accessToken; // we will save the token that facebook provides to the user                    
                    newUser.spotify.refreshToken = refreshToken;
                    d = new Date();
                    d.setSeconds(d.getSeconds() + params.expires_in);
                    newUser.spotify.accessTokenExpiresTime = d;
                    // save our user to the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        // if successful, return the new user
                        return done(null, newUser);
                    });
                }

            });
      }
    ));

};