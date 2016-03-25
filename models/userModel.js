var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var passportLocalMongoose = require('passport-local-mongoose');


// Create a Schema
var userSchema = mongoose.Schema({
    username: String,
    password: String,

});

userSchema.plugin(passportLocalMongoose);


// methods ======================

module.exports = mongoose.model("User", userSchema);