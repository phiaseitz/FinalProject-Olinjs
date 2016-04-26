// This is where I define the behavior for routes
var express = require('express');
var bodyParser = require('body-parser');
var moment = require('moment-timezone');
var router = express.Router();


var pushNotificationHelper = require('../helpers/pushNotification.js');

module.exports = router;

var addEndpointToUserPOST = function(req, res) {
	// console.log(req.user);
	// console.log(req.body.subscription);
	pushNotificationHelper.addEndpointToUser(req.user,req.body.subscription,function(err, data) {
		if (err) {
			console.log(err)
			return res.send(err)
		}
		res.send(data);
	})
}

var addEndpointToUserAndConfirmPOST = function(req, res) {
	pushNotificationHelper.addEndpointToUser(req.user,req.body.subscription,function(err, subscription) {
		if (err) {
			console.log(err)
			return res.send(err)
		}
		pushNotificationHelper.sendNotification(subscription, 'Successfully Subscribed to Notifications!', ':)')
		res.send(subscription);
	})
}

var removeEndpointFromUserPOST = function(req, res) {
	// console.log(req.user);
	// console.log(req.body.subscription);
	pushNotificationHelper.removeEndpointFromUser(req.user,req.body.endpoint,function(err, data) {
		if (err) {
			console.log(err)
			return res.send(err)
		}
		res.send(data);
	})
}

var sendNotificationToUserPOST = function(req, res) {
	// console.log(req.user);
	pushNotificationHelper.sendNotificationToUser(req.user,req.body.title,req.body.message,function(err, data) {
		if (err) {
			console.log(err)
			return res.send(err)
		}
		res.send(data);
	})
}

var sendFavoritesNotificationPOST = function(req, res) {

	var today = moment().tz('America/New_York');

	var todayDay = moment(today).startOf('day')
	var tomorrowDay = moment(todayDay).add(1, 'days');

	var currentHours = today.hours() + today.minutes()/60.0
	var todayWeekend = (todayDay.day() == 6) || (todayDay.day() == 0)
	var tomorrowWeekend = (tomorrowDay.day() == 6) || (tomorrowDay.day() == 0)
	// console.log(currentHours)
	if (currentHours < 10.5 & !todayWeekend) {
		var meal = 'brk'
		var mealDate = todayDay
	} else if (currentHours > 20.5 & !tomorrowWeekend) {
		var meal = 'brk'
		var mealDate = tomorrowDay
	} else if (currentHours > 20.5 & tomorrowWeekend) {
		var meal = 'lun'
		var mealDate = tomorrowDay
	}else if (currentHours<14) {
		var meal = 'lun'
		var mealDate = todayDay
	} else {
		var meal = 'din'
		var mealDate = todayDay
	}
	// console.log(meal)
	// console.log(mealDate.format("dddd, MMMM Do YYYY, h:mm:ss a"))

	pushNotificationHelper.sendFavoritesNotifications(mealDate, meal,function(err, data) {
		if (err) {
			console.log(err)
			return res.send(err)
		}
		res.send(data);
	})
}

module.exports.addEndpointToUserPOST = addEndpointToUserPOST;
module.exports.removeEndpointFromUserPOST = removeEndpointFromUserPOST;
module.exports.sendNotificationToUserPOST = sendNotificationToUserPOST;
module.exports.addEndpointToUserAndConfirmPOST = addEndpointToUserAndConfirmPOST;
module.exports.sendFavoritesNotificationPOST = sendFavoritesNotificationPOST;