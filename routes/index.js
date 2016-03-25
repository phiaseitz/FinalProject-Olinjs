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

//Given a date, find the appropriate meal

//should meals be encoded differently? as in, assign a date in d/m/y, then assign a mealtime (breakfast, lunch, dinner) for a given meal. Look up a meal given both a date and a mealtime? Otherwise times of day are gonna get weird.

//imagining a drop-down menu: user chooses a day of the week, and a mealtime. The site displays the appropriate meal.

//This would make a lot of things easier: getting all of a given day's meals, getting all meals of a given mealtime...

var getMealGET = function(req, res) {
    var mealdate = req.query.mealdate;

    Meal.find({date: mealdate}, function(err, meal) {
        res.send(meal);
    })
}

//given a food ID, get the food
var getFoodGET = function(req, res) {
    var foodid = req.query.id;

    Food.find({_id: foodid}, function(err, food) {
        res.send(food);
    })
}


module.exports.home = homeGET;
module.exports.getMealGET = getMealGET;
module.exports.getFoodGET = getFoodGET;