// This is where I define the behavior for routes
var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();

var pushNotificationHelper = require('../helpers/pushNotification.js');

module.exports = router;

var addEndpointToUserPOST = function(req, res) {
	console.log(req.user);
	console.log(req.body.subscription);
	pushNotificationHelper.addEndpointToUser(req.user,req.body.subscription,function(err, data) {
		if (err) {
			console.log(err)
			return res.send(err)
		}
		res.send(data);
	})
}

var sendNotificationToUserPOST = function(req, res) {
	console.log(req.user);
	pushNotificationHelper.sendNotificationToUser(req.user,req.body.title,req.body.message,function(err, data) {
		if (err) {
			console.log(err)
			return res.send(err)
		}
		res.send(data);
	})
}


module.exports.addEndpointToUserPOST = addEndpointToUserPOST;
module.exports.sendNotificationToUserPOST = sendNotificationToUserPOST;