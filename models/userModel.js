var mongoose = require('mongoose');

// Create a Schema
var userSchema = mongoose.Schema({
    username: String
});

module.exports = mongoose.model("User", userSchema);