var mongoose = require('mongoose');

// Create a Schema
var mealSchema = mongoose.Schema({
    date:  {type: Date},
    foods: [{ type : mongoose.Types.ObjectId, ref: 'Food' }]
});

module.exports = mongoose.model("Meal", mealSchema);