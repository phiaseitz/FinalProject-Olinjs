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
var getMealGET = function(req, res) {
    var mealdate = req.query.mealdate;
    var mealtime = req.query.mealtime

    Meal.find({date: mealdate, mealtime: mealtime}, function(err, meal) {
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