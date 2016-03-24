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
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model("User", userSchema);