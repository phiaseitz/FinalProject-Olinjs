// This is where I define the behavior for routes
var express = require('express');
var passport = require('passport');
var path = require('path');
var router = express.Router();
var request = require('request');
var fs = require('fs');
var bodyParser = require('body-parser');
var url = require("url");

var User = require('../models/userModel.js');
var Food = require('../models/foodModel.js');
var Meal = require('../models/mealModel.js');


module.exports = router;

var homeGET = function(req, res) {
    //console.log(req.spotifyApi)
	res.sendFile(path.resolve('public/html/main.html'));
}

//Load all this week's foods!
var getWeekMealsGET = function(req, res) {
    //get current date
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    //console.log(today);

    //today's day of week (0-6)
    var day = today.getDay();
    //console.log('Day of the week: ' + day)

    //first day of week is... Past Sunday
    var firstday = new Date(today.setDate(today.getDate() - today.getDay()))
    //console.log("First day of this week: " + firstday)

    var weekdates = [];

    //Create a new weekday for every day of the week, add it to weekdates
    for(i=0; i<=6; i++) {
        weekday = new Date(firstday.getTime());
        weekday.setDate(weekday.getDate() + i)
        weekdates.push(weekday)
        console.log("Day of week: " + weekday )
    }
    //console.log(weekdates)

    //need callback after loop is done!
    Meal.find({ 'date': { $in: weekdates} }, function(err, meals){
        console.log(meals);
        res.send(meals);
    });
    // }).sort({date: 1}).exec(function(err, meals) {  //sort by ascending date
    //     console.log(meals);     //but what about meal sorting? b, l, d order...
    //     res.send(meals);
    // });

}

//Given a date, and a mealtime, return the meal
var getMealGET = function(req, res) {
    var mealdate = req.query.mealdate;
    var mealtime = req.query.mealtime;

    Meal.find({date: mealdate, mealtime: mealtime}, function(err, meal) {
        if(err) { console.log(err) }
        console.log("Meal: " + meal)
        res.send(meal);
    })
}

//Given a date, get all meals from that date.
var getDayMealsGET = function(req, res) {
    var mealdate = req.query.mealdate;

    Meal.find({date:mealdate}, function(err, meals) {
        if(err) { console.log(err) }
        console.log("Meals: " + mealdate + " " + meals)
        res.send(meals);
    })
}

//given a food ID, get the food
var getFoodGET = function(req, res) {
    var foodid = req.query.id;

    Food.find({_id: foodid}, function(err, food) {
        if(err) { console.log(err) }
        res.send(food);
    })
}

//getVegetarian, getVegan, getGlutenFree, getHelathy

//For a given meal, find all vegetarian foods.
var getVegetarianFoodsGET = function(req, res) {
    var mealdate = req.query.mealdate;
    var mealtime = req.query.mealtime;


}


module.exports.home = homeGET;

module.exports.getWeekMealsGET = getWeekMealsGET;
module.exports.getMealGET = getMealGET;
module.exports.getDayMealsGET = getDayMealsGET;

module.exports.getFoodGET = getFoodGET;