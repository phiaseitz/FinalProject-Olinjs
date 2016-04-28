var mongoose = require('mongoose');

// Create a Schema
var mealSchema = mongoose.Schema({
    date: Date,
    mealType: String,
    foods: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }],
    location: String,
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Meal", mealSchema);
