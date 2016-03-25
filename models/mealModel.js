var mongoose = require('mongoose');

// Create a Schema
var mealSchema = mongoose.Schema({
    date:  {type: Date},
    mealtime: String, //breakfast, lunch, or dinner?
    foods: [{ type : mongoose.Types.ObjectId, ref: 'Food' }]
});

module.exports = mongoose.model("Meal", mealSchema);