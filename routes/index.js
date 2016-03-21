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

module.exports = router;

var homeGET = function(req, res) {
    //console.log(req.spotifyApi)
	res.sendFile(path.resolve('public/html/main.html'));
}

module.exports.home = homeGET;