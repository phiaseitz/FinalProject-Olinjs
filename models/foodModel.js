var mongoose = require('mongoose');

var nutritionSchema = new mongoose.Schema({
    nutritionId: Number,
    serving: String,
    calories: Number,
    fatCalories: Number,
    fat: Number,
    fatPercent: Number,
    saturatedFat: Number,
    saturatedFatPercent: Number,
    transFat: Number,
    cholesterol: Number,
    cholesterolPercent: Number,
    sodium: Number,
    sodiumPercent: Number,
    carbohydrates: Number,
    carbohydratesPercent: Number,
    dietaryFiber: Number,
    dietaryFiberPercent: Number,
    sugar: Number,
    protein: Number,
    vitAPercent: Number,
    vitCPercent: Number,
    calciumPercent: Number,
    ironPercent: Number,
    name: String,
    description: String,
    allergens: [String],
    vitA: Number,
    vitC: Number,
    calcium: Number,
    iron: Number
}, { _id: false });

// Create a Schema
var foodSchema = mongoose.Schema({
    name: String,
    sodexoId: String,
    station: {},
    vegan: { type: Boolean, default: false },
    vegetarian: { type: Boolean, default: false },
    mindful: { type: Boolean, default: false },
    nutritionInformation: [nutritionSchema],
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Food", foodSchema);
