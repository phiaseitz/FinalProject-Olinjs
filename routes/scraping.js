// This is where I define the behavior for routes
var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();

var scrapingHelper = require('../helpers/scrapingMenu.js');

module.exports = router;

var menuUrlGET = function(req, res) {
	scrapingHelper.getMenuURL(function(menuLink) {
		res.send(menuLink);
	})
	
}

var menuDataGET = function(req, res) {
	scrapingHelper.getMenuData(function(data) {
		res.send(data);
	})
}

var menuDataSaveGET = function(req, res) {
	scrapingHelper.scrapeMenuAndSave(function(data) {
		res.send(data);
	})
}

module.exports.menuUrl = menuUrlGET;
module.exports.menuData = menuDataGET;
module.exports.menuDataSave = menuDataSaveGET;