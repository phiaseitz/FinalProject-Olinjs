var gcm = require('node-gcm');
// var webpush = require('web-push-encryption');
var webPush = require('web-push');

var User = require('../models/userModel.js');

addEndpointToUser = function(user, subscription, callback) {
	console.log('addEndpointToUser helper called');

	User.findByIdAndUpdate(user._id, { $addToSet: { notificationSubscriptions:  subscription } }, function (err, user) {
		if (err) return callback(err)
		callback(null,subscription)
	});
}

removeEndpointFromUser = function(user, endpoint, callback) {
	User.findByIdAndUpdate(user._id, { $pull: { notificationSubscriptions:  {endpoint: endpoint} } }, function (err, user) {
		if (err) return callback(err)
		callback(null,user)
	});
}

sendNotificationToUser = function(user, title, message, callback) {
	for (subscription of user.notificationSubscriptions) {
		sendNotification(subscription, title, message)
	}
	callback(null,'notifications sent')
}

sendNotification = function(subscription, title, message, callback) {
	var notificationContent = {title: title,
						   message: message}
	webPush.setGCMAPIKey(process.env.GCM_API_KEY);
	webPush.sendNotification(subscription.endpoint, {
        TTL: (3*60*60),
        payload: JSON.stringify(notificationContent),
        userPublicKey: subscription.p256dh,
        userAuth: subscription.auth,
      })
      .then(function() {
      	console.log('sent notification without error')
        callback(null, 'success')
      }).catch(function(err){
		console.log('error sending notification')
		callback(err)
	  });
}

module.exports.addEndpointToUser = addEndpointToUser;
module.exports.removeEndpointFromUser = removeEndpointFromUser
module.exports.sendNotificationToUser = sendNotificationToUser;
module.exports.sendNotification = sendNotification;