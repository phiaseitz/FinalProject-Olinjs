// This is where I define the behavior for routes
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

//MEAL API
var homeGET = function(req, res) {
    //console.log(req.spotifyApi)
	res.sendFile(path.resolve('public/html/main.html'));
}

//Load all this week's foods!
var getWeekMealsGET = function(req, res) {
    /*
    
    Gets all meals for a given day and meal-location. 
    If you want to test: comment out req.query, add in commented line below. 

    Test at /menuapi/getweek
    

    */
    //var mealloc = 'olin'

    var mealloc = req.query.mealloc;

    //get current date
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    //today's day of week (0-6)
    var day = today.getDay();

    //first day of week is... Past Sunday
    var firstday = new Date(today.setDate(today.getDate() - today.getDay()))
    //console.log("First day of this week: " + firstday)

    var weekdates = [];

    //Create a new weekday for every day of the week, add it to weekdates
    //Olin website starts on Monday, ends on coming Sunday, so 1-7.
    for(i=1; i<=7; i++) {   
        weekday = new Date(firstday.getTime());
        weekday.setDate(weekday.getDate() + i)
        weekdates.push(weekday)
        //console.log("Day of week: " + weekday )
    }

    Meal.find({ 'date': { $in: weekdates}, location: mealloc})
        .populate('foods')
        .exec(function(err, meals){
        // for(meal of meals) {
        //     console.log(meal.date)
        // }
            res.send(meals);
    });

}

//Given a date, and a mealtime, return the meal
var getMealGET = function(req, res) {
    /* 

    Given a date, a meal-type, and a meal-location, returns the appropriate meal.

    If you want to test: comment req.query stuff, uncomment the stuff below
    Test at /menuapi/getmeal

    */

    // var now = new Date();
    // var mealdate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // var mealtype = 'brk';
    // var mealloc = 'olin'


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
        if(err) { console.log(err) }

        if(meal.length > 1) {
            console.log("Uh-oh... you got more than one meal...")
        }

        res.send(meal[0]);
    })
}

//Given a date, get all meals from that date.
var getDayMealsGET = function(req, res) {
    /*
    
    Given a date and a meal-location, returns the meals of the day.

    If you want to test: comment req.query stuff, uncomment the stuff below
    Test at /menuapi/getdaymeals

    */
    // var mealloc = 'olin'
    // var now = new Date();
    // var mealdate = new Date(now.getFullYear(), now.getMonth(), now.getDate());


    var mealdate = req.query.mealdate;
    var mealloc = req.query.mealloc;

    Meal.find({date:mealdate, location: mealloc})
    .populate('foods')
    .exec(function(err, meals) {
        if(err) { console.log(err) }

        // for(meal of meals) {
        //     console.log(meal.date + " " + meal.mealType + " " + meal.location)
        // }
        res.send(meals);
    })
}

//USER PREFERENCES

//get favorite foods
var getFavFoodsGET = function(req, res) {
    /*
    Given the username of the authenticated user, returns a populated list of favorite foods.
    */

    //var username = req.query.username;
    // var username = "skumarasena@gmail.com";     //for testing

    var username = req.session.passport.user;

    User.findOne({username:username}, function(err, user){
        if(err) { console.log(err) }

        console.log("Get user ", user)

        res.send(user.favorites);
    })


}

//add favorite food
var addFavFoodPUT = function(req, res) {
    /*
    Given the username of the authenticated user and a food ID, adds the food to the user's list of favorite foods.
    */

    //var username = req.body.username;
    //var foodID = req.body.foodID;

    // var username = "skumarasena@gmail.com";     //for testing


    var foodID = req.query.foodID;
    console.log("foodid", foodID);
    foodID = mongoose.Types.ObjectId(foodID); //turkey sausage patty, for testing

    var username = req.session.passport.user;

    //sourdough french toast
    //56fb118968cdd37417fa4bb3

    //fried eggs
    //56fb118868cdd37417fa4b05

    //homestyle potatoes
    //570415e73111a1bd7222cc33

    //console.log(username)

    User.findOneAndUpdate( {username:username}, { $addToSet: { favorites: foodID }}, {new: true}, function(err, doc){   //addToSet instead of push, no duplicates!
        if(err) { console.log(err) }
        console.log("doc", doc)
        // console.log("Query status ", data)
        // console.log("raw",rawResponse);
        // User.findOne({username:username})
        //     .exec(function(err, user) {
        //         if(err) { console.log(err) }
        //         console.log("Add favorite food to user ", user);
        //         res.send(foodID)
        //     })
        res.send(doc);
    })
}

var removeFavFoodPUT = function(req, res) {
    /*
    Given the username of the authenticated user and a food ID, removes the food from the user's list of favorite foods.
    */

    //var username = req.body.username;
    //var foodID = req.body.foodID;

    var foodID = req.query.foodID;
    console.log("foodid", foodID);
    foodID = mongoose.Types.ObjectId(foodID); //turkey sausage patty, for testing

    var username = req.session.passport.user;  

    console.log("Removing favorite food!")  

    User.findOneAndUpdate( {username:username}, { $pull: { favorites: foodID } }, {new: true}, function(err, doc) {

            if(err) { console.log(err) }
            console.log("doc", doc)
            res.send(foodID)
    })


} //user auth problems! sad... ask Sophia


//remove favorite food

//change vegan status (if setting true, set vegetarian status true as well!)

//change vegetarian status (if setting false, set vegan status false as well!)

//change gluten-free status

//change default location





module.exports.home = homeGET;

module.exports.getWeekMealsGET = getWeekMealsGET;
module.exports.getMealGET = getMealGET;
module.exports.getDayMealsGET = getDayMealsGET;

module.exports.getFavFoodsGET = getFavFoodsGET;
module.exports.addFavFoodPUT = addFavFoodPUT;
module.exports.removeFavFoodPUT = removeFavFoodPUT;