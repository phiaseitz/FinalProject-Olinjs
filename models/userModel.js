var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var passportLocalMongoose = require('passport-local-mongoose');


// Create a Schema
var userSchema = mongoose.Schema({
    username: String,
    password: String,
    favorites: [{ type : mongoose.Schema.Types.ObjectId, ref: 'Food' }],
    vegan: { type: Boolean, default: false }, 
    vegetarian: { type: Boolean, default: false }, 
    mindful: { type: Boolean, default: false },
    defaultloc: { type: String, default: 'olin' },
    notificationSubscriptions: [{
    	endpoint: String,
    	p256dh: String,
    	auth: String
    }],
    allergens: [String], 
    defaultloc: { type: String, default: 'olin' }
});

userSchema.plugin(passportLocalMongoose);


// methods ======================

module.exports = mongoose.model("User", userSchema);