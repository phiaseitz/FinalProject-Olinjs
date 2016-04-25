// This is where I define the behavior for routes
var express = require('express');
var bodyParser = require('body-parser');
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


module.exports.addEndpointToUserPOST = addEndpointToUserPOST;
module.exports.removeEndpointFromUserPOST = removeEndpointFromUserPOST;
module.exports.sendNotificationToUserPOST = sendNotificationToUserPOST;
module.exports.addEndpointToUserAndConfirmPOST = addEndpointToUserAndConfirmPOST;
