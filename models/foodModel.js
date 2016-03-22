var mongoose = require('mongoose');

// Create a Schema
var userSchema = mongoose.Schema({
    name: String
});

module.exports = mongoose.model("Food", foodSchema);