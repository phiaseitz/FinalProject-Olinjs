/*
This file contains the API functions for accessing meal information and preferences (favorite foods and dietary restrictions). 
*/


var express = require('express');
var passport = require('passport');
var path = require('path');
var router = express.Router();
var request = require('request');
var fs = require('fs');
var bodyParser = require('body-parser');
var url = require("url");
var mongoose = require('mongoose');

var User = require('../models/userModel.js');
var Food = require('../models/foodModel.js');
var Meal = require('../models/mealModel.js');


module.exports = router;


var homeGET = function(req, res) {
    /*
    Loads home page.
    */
    res.sendFile(path.resolve('public/html/main.html'));
}

//MEAL API
var getWeekMealsGET = function(req, res) {
    /*
    Gets all meals for a given day and meal-location. 
    If you want to test: comment out req.query, add in commented line below. 

    Test at /menuapi/getweek
    */

    var mealloc = req.query.mealloc;

    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var day = today.getDay(); //obtain day of week

    //first day of week is... Past Sunday
    var firstday = new Date(today.setDate(today.getDate() - today.getDay()))

    var weekdates = [];

    //Create a new weekday for every day of the week, add it to weekdates
    //Olin website starts on Monday, ends on coming Sunday, so 1-7.
    for (i = 1; i <= 7; i++) {
        weekday = new Date(firstday.getTime());
        weekday.setDate(weekday.getDate() + i)
        weekdates.push(weekday)
    }

    Meal.find({ 'date': { $in: weekdates }, location: mealloc })
        .populate('foods')
        .exec(function(err, meals) {
            res.send(meals);
        });
}

var getMealGET = function(req, res) {
    /* 
    Given a date, a meal-type, and a meal-location, returns the appropriate meal.

    Test at /menuapi/getmeal
    */

    var mealdate = req.query.mealdate;
    var mealtype = req.query.mealtype;
    var mealloc = req.query.mealloc;

    Meal.find({
            date: mealdate,
            mealType: mealtype,
            location: mealloc
        })
        .populate('foods')
        .exec(function(err, meal) {
            if (err) { console.log(err) }

            if (meal.length > 1) {
                console.log("Uh-oh... you got more than one meal...")
            }
            res.send(meal[0]);
        })
}

var getDayMealsGET = function(req, res) {
    /*
    Given a date and a meal-location, returns the meals of the day.

    Test at /menuapi/getdaymeals
    */

    var mealdate = req.query.mealdate;
    var mealloc = req.query.mealloc;

    Meal.find({ date: mealdate, location: mealloc })
        .populate('foods')
        .exec(function(err, meals) {
            if (err) { console.log(err) }
            res.send(meals);
        })
}

//USER FAVORITES
var getFavFoodsGET = function(req, res) {
    /*
    Given the username of the authenticated user, returns a populated list of favorite foods.
    */

    var username = req.session.passport.user;

    User.findOne({ username: username })
        .populate('favorites')
        .exec(function(err, user) {
            if (err) { console.log(err) }
            res.send(user.favorites);
        })


}

var addFavFoodPUT = function(req, res) {
    /*
    Given the username of the authenticated user and a food ID, adds the food to the user's list of favorite foods.
    */

    var foodID = req.query.foodID;
    foodID = mongoose.Types.ObjectId(foodID);

    var username = req.session.passport.user;

    User.findOneAndUpdate({ username: username }, { $addToSet: { favorites: foodID } }, { new: true })
        .populate('favorites')
        .exec(function(err, user) { //addToSet instead of push, no duplicates!
            if (err) { console.log(err) }
            Food.findOne({ _id: foodID }, function(err, food) {
                res.send(food);
            })
        })
}


var removeFavFoodPUT = function(req, res) {
    /*
    Given the username of the authenticated user and a food ID, removes the food from the user's list of favorite foods.
    */

    var foodID = req.query.foodID;
    foodID = mongoose.Types.ObjectId(foodID);

    var username = req.session.passport.user;

    User.findOneAndUpdate({ username: username }, { $pull: { favorites: foodID } }, { new: true })
        .populate('favorites')
        .exec(function(err, user) {
            if (err) { console.log(err) }
            Food.findOne({ _id: foodID }, function(err, food) {
                res.send(food)
            })

        })


}

//USER PREFERENCES
var changeVeganStatusPUT = function(req, res) {
    /*
    Given the username of the authenticated user and their vegan status, changes that user's "vegan" preference. 

    Note that this function can also change vegetarian status if vegan status is being set to true (as a vegan is also vegetarian).
    */

    var vegan = req.query.vegan;
    var username = req.session.passport.user;

    if (vegan === 'true') { //if vegan, the user must also be vegetarian
        User.findOneAndUpdate({ username: username }, { vegan: true, vegetarian: true }, { new: true }, function(err, user) {
            res.send(user)
        })
    } else {
        User.findOneAndUpdate({ username: username }, { vegan: false }, { new: true }, function(err, user) {
            res.send(user)
        })
    }
}

var changeVegetarianStatusPUT = function(req, res) {
    /*
    Given the username of the authenticated user and their vegan status, changes that user's "vegetarian" preference.

    Note that this function can also change vegan status if vegetarian status is being set to false (as a non-vegetarian can't be vegan).
    */

    var vegetarian = req.query.vegetarian;
    var username = req.session.passport.user;

    if (vegetarian === 'true') {
        User.findOneAndUpdate({ username: username }, { vegetarian: true }, { new: true }, function(err, user) {
            res.send(user)
        })
    } else { //if not vegetarian, user also cannot be vegan
        User.findOneAndUpdate({ username: username }, { vegetarian: false, vegan: false }, { new: true }, function(err, user) {
            res.send(user)
        })
    }
}


var changeAllergenStatusPUT = function(req, res) {
    /*
    Given the username of the authenticated user and their allergies, changes that user's list of allergens. 
    */

    var allergens = req.query.allergens;
    var username = req.session.passport.user;

    User.findOneAndUpdate({ username: username }, { allergens: allergens }, { new: true }, function(err, user) {
        res.send(user)
    })
}

var changeDefaultLocPUT = function(req, res) {
    /*
    Given the username of the authenticated user and their preferred location ('olin' or 'trim'), sets the user's default location.
    */

    var defaultloc = req.query.defaultloc;
    var username = req.session.passport.user;

    User.findOneAndUpdate({ username: username }, { defaultloc: defaultloc }, { new: true }, function(err, user) {
        res.send(user)
    })


}

var changeMindfulStatusPUT = function(req, res) {
    /*
    Given the username of the authenticated user and whether they want to view "Mindful" foods only, sets the user's "mindful" status.
    */

    var mindful = req.query.mindful;
    var username = req.session.passport.user;

    User.findOneAndUpdate({ username: username }, { mindful: mindful }, { new: true }, function(err, user) {
        res.send(user)
    })


}




module.exports.home = homeGET;

module.exports.getWeekMealsGET = getWeekMealsGET;
module.exports.getMealGET = getMealGET;
module.exports.getDayMealsGET = getDayMealsGET;

module.exports.getFavFoodsGET = getFavFoodsGET;
module.exports.addFavFoodPUT = addFavFoodPUT;
module.exports.removeFavFoodPUT = removeFavFoodPUT;

module.exports.changeVeganStatusPUT = changeVeganStatusPUT;
module.exports.changeVegetarianStatusPUT = changeVegetarianStatusPUT;
module.exports.changeAllergenStatusPUT = changeAllergenStatusPUT;
module.exports.changeDefaultLocPUT = changeDefaultLocPUT;
module.exports.changeMindfulStatusPUT = changeMindfulStatusPUT;
