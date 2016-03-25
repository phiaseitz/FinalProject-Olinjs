var mongoose = require('mongoose');

// Create a Schema
var foodSchema = mongoose.Schema({
    name: String, 
});

module.exports = mongoose.model("Food", foodSchema);