var gcm = require('node-gcm');
var moment = require('moment-timezone');
var webPush = require('web-push');

var User = require('../models/userModel.js');
var Meal = require('../models/mealModel.js');

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

sendFavoritesNotification = function(users, date, mealType, location, callback) {
	"expects unpopulated user objects"
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
        } else {
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
        	recurseNotifyFavorites(users, foodDict, mealNames[mealType], locationNames[location], callback)
        }
        
    })
	
}

recurseNotifyFavorites = function(users, foodDict, mealName, locationName, callback) {
	console.log('users at recurse: ')
	console.log(users)
	console.log('users length')
	console.log(users.length)
	console.log((users == null))
	console.log((users === null))
	console.log((users === undefined))
	console.log(users)
	if (users.length === 0) {
		console.log('no users left to notify')
		callback(null, 'users notified of favorite foods served for' + mealName + " at " + locationName)
	} else {
		console.log('username: ')
		console.log(users[0].username)
		var favoritesAtMeal = users[0].favorites.filter(function (favorite) {
			return (typeof foodDict[favorite] !== "undefined");
		}).map(function(favorite) {
			return foodDict[favorite];
		})
		console.log(favoritesAtMeal)
		if (favoritesAtMeal.length > 0) {
			var title = "Favorite foods at " +locationName + " for " + mealName;
			var message = favoritesAtMeal.map(function(food) {return food.name}).join(", ");
			sendNotificationToUser(users[0], title, message, function(err, data) {})
			console.log('favorites found and sent!')
		} else {
			sendNotificationToUser(users[0], 'no favorites', '')
		}
		users.shift()
		recurseNotifyFavorites(users, foodDict, mealName, locationName, callback)
	}
}

module.exports.addEndpointToUser = addEndpointToUser;
module.exports.removeEndpointFromUser = removeEndpointFromUser
module.exports.sendNotificationToUser = sendNotificationToUser;
module.exports.sendNotification = sendNotification;
module.exports.sendFavoritesNotification = sendFavoritesNotification;