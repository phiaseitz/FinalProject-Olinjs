var mongoose = require('mongoose');

// Create a Schema
var foodSchema = mongoose.Schema({
    name: String
    //info: how do we want to store nutritional information?
});

module.exports = mongoose.model("Food", foodSchema);