var mongoose = require('mongoose');

// Create a Schema
var foodSchema = mongoose.Schema({
    name: String,
    sodexoId: String,
    vegan: { type: Boolean, default: false },
	vegetarian: { type: Boolean, default: false },
	mindful: { type: Boolean, default: false },
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Food", foodSchema);