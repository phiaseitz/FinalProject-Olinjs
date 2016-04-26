var gcm = require('node-gcm');
var moment = require('moment-timezone');
var webPush = require('web-push');

var User = require('../models/userModel.js');
var Meal = require('../models/mealModel.js');
var Food = require('../models/foodModel.js');

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
		sendNotification(subscription, title, message, function(err,data) {return})
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
        callback(null, 'success')
      }).catch(function(err){
		console.log('error sending notification')
		console.log(err)
		callback(err)
	  });
}



sendFavoritesNotifications = function(date, mealType, callback) {
	try {
		User.find({notificationSubscriptions: { $exists: true, $not: {$size: 0} }}, function (err, users) {
			for (location of ['olin', 'trim']) {
				(function(location) {
					Meal.find({
				        date: date, 
				        mealType: mealType, 
				        location: location
				    })
				    .populate('foods')
				    .exec(function(err, meals) {
				        if(err) { 
				        	console.log(err) 
				        	callback(err)
				        }
				        if(meals.length > 1) {
				            console.log("Uh-oh... you got more than one meal...")
				        } else if (meals.length === 0) {
				        	console.log("tried to send notifications for " + location + ", but no meal found of type: " + mealType + ", on " + date.format("dddd, MMMM Do YYYY, h:mm:ss a"))
				        }
				        else {
				        	foodDict = {}
				        	for (food of meals[0].foods) {
				        		foodDict[food.id] = food
				        	}
				        	locationNames = {
				        		olin: "Olin",
				        		trim: "Trim"
				        	}
				        	mealNames = {
				        		brk: "breakfast",
				        		lun: "lunch",
				        		din: "dinner"
				        	}
				        	recurseNotifyFavorites(users, foodDict, mealNames[mealType], locationNames[location], function (err, data) {return})
				        } 
				    })
				}) (location);
		        
			}
	    });
	} catch (err) {
		return callback(err)
	}
	return callback(null, 'success')
}

recurseNotifyFavorites = function(users, foodDict, mealName, locationName, callback) {
	if (users.length === 0) {
		// console.log('no users left to notify')
		callback(null, 'users notified of favorite foods served for' + mealName + " at " + locationName)
	} else {
		// console.log('username: ')
		// console.log(users[0].username)
		var favoritesAtMeal = users[0].favorites.filter(function (favorite) {
			return (typeof foodDict[favorite] !== "undefined");
		}).map(function(favorite) {
			return foodDict[favorite];
		})
		// console.log(favoritesAtMeal)
		if (favoritesAtMeal.length > 0) {
			var title = "Favorite foods at " +locationName + " for " + mealName;
			var message = favoritesAtMeal.map(function(food) {return food.name}).join(", ");
			sendNotificationToUser(users[0], title, message, function(err, data) { return})
			// console.log('favorites found and sent!')
		} else {
			// console.log('No favorites for: ', users[0].username)
			var title = "No favorite foods at " +locationName + " for " + mealName;
			var message = ":("
			sendNotificationToUser(users[0], title, message, function(err, data) { return})
		}
		users.shift()
		recurseNotifyFavorites(users, foodDict, mealName, locationName, callback)
	}
}

module.exports.addEndpointToUser = addEndpointToUser;
module.exports.removeEndpointFromUser = removeEndpointFromUser
module.exports.sendNotificationToUser = sendNotificationToUser;
module.exports.sendNotification = sendNotification;
module.exports.sendFavoritesNotifications = sendFavoritesNotifications;