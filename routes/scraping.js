// This file contains function for initiating and testing scraping, none are enabled in production
var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();

var scrapingHelper = require('../helpers/scrapingMenu.js');

module.exports = router;

/* 	
	Description: Scrapes the dining website to get the URL to the menu
    Inputs: request object, response object
    Outputs: none
*/
var menuUrlGET = function(req, res) {
    scrapingHelper.getMenuURL('olin', function(menuLink) {
        res.send(menuLink);
    })
}

/* 	
	Description: Scrapes the menu from the specified location
    Inputs: request object, response object
    Outputs: none
*/
var menuDataGET = function(req, res) {
    scrapingHelper.getMenuData('olin', function(data) {
        res.send(data);
    })
}

/* 	
	Description: Scrapes the menu from the specified location and saves it to the database
    Inputs: request object, response object
    Outputs: none
*/
var menuDataSaveGET = function(req, res) {
    scrapingHelper.scrapeMenuAndSave(req.params.location, function(data) {
        res.send(data);
    })
}

module.exports.menuUrl = menuUrlGET;
module.exports.menuData = menuDataGET;
module.exports.menuDataSave = menuDataSaveGET;
