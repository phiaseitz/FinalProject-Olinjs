var gcm = require('node-gcm');
var webpush = require('web-push-encryption');

var User = require('../models/userModel.js');

addEndpointToUser = function(user, subscription, callback) {
	console.log('addEndpointToUser helper called');

	User.findByIdAndUpdate(user._id, { $addToSet: { notificationSubscriptions:  subscription } }, function (err, user) {
		  if (err) return callback(err)
		  callback(null,user)
	});
}

sendNotificationToUser = function(user, title, message, callback) {
	var notificationContent = {title: title,
							   message: message}
	for (subscription of user.notificationSubscriptions) {
		console.log('subscription: ',JSON.parse(subscription));
		webpush.sendWebPush(JSON.stringify(notificationContent), JSON.parse(subscription), process.env.GCM_API_KEY).then(function(message) {
			console.log('sent notification without error')
		}).catch(function(err){
			console.log('error sending notification')
		})
	}
	callback(null,'notifications sent')
}

sendNotificationToUser2 = function(user, title, message, callback) {
	regTokens = [];
	for (endpoint of user.notificationEndpoints) {
		console.log(endpoint);
		regTokens.push(endpoint.split("/").pop());
	}
	console.log(regTokens)

	var message = new gcm.Message({notification: {
		title: "Hello, World",
		icon: "images/burger.png",
		body: "This is a notification that will be displayed ASAP."
	}});

	var sender = new gcm.Sender(process.env.GCM_API_KEY);

	sender.send(message, { registrationTokens: regTokens }, 3, function (err, response) {
		if(err) {
			console.error(err);
			callback(err)
		}
		else {
			console.log(response);
			callback(null,response)
		}
	});

}

module.exports.addEndpointToUser = addEndpointToUser;
module.exports.sendNotificationToUser = sendNotificationToUser;