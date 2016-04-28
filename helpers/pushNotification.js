var gcm = require('node-gcm');
var moment = require('moment-timezone');
var webPush = require('web-push');

var User = require('../models/userModel.js');
var Meal = require('../models/mealModel.js');
var Food = require('../models/foodModel.js');

/* 	
	Description: Adds a notification subscription to the logged in user's document
    Inputs: user object, subscription object, callback
    Outputs: none
*/
addEndpointToUser = function(user, subscription, callback) {
    console.log('addEndpointToUser helper called');

    User.findByIdAndUpdate(user._id, { $addToSet: { notificationSubscriptions: subscription } }, function(err, user) {
        if (err) return callback(err)
        callback(null, subscription)
    });
}

/* 	
	Description: Accepts request from a logged in user that contains a notifiaction endpoint. 
		It then removes this endpoint from the user's subscription
    Inputs: user object, endpoint (String), callback
    Outputs: none
*/
removeEndpointFromUser = function(user, endpoint, callback) {
    User.findByIdAndUpdate(user._id, { $pull: { notificationSubscriptions: { endpoint: endpoint } } }, function(err, user) {
        if (err) return callback(err)
        callback(null, user)
    });
}

/* 	
	Description: Sends a notification to each of a user's subscription endpoints
    Inputs: user object, title (String), message (String), callback
    Outputs: none
*/
sendNotificationToUser = function(user, title, message, callback) {
    for (subscription of user.notificationSubscriptions) {
        sendNotification(subscription, title, message, function(err, data) {
            return })
    }
    callback(null, 'notifications sent')
}

/* 	
	Description: Sends a notification to a subscription
    Inputs: subscription object, title (String), message (String), callback
    Outputs: none
*/
sendNotification = function(subscription, title, message, callback) {
    console.log('notification sent:', subscription, message)
    var notificationContent = {
        title: title,
        message: message
    }
    webPush.setGCMAPIKey(process.env.GCM_API_KEY);
    webPush.sendNotification(subscription.endpoint, {
            TTL: (3 * 60 * 60),
            payload: JSON.stringify(notificationContent),
            userPublicKey: subscription.p256dh,
            userAuth: subscription.auth,
        })
        .then(function() {
            callback(null, 'success')
        }).catch(function(err) {
            console.log('error sending notification')
            console.log(err)
            callback(err)
        });
}

/* 	
	Description: Sends a notification containing a users favorite foods on a given date for the inputted meal type
    Inputs: date, mealType ('brk','lun', or 'din'), callback
    Outputs: none
*/
sendFavoritesNotifications = function(date, mealType, callback) {
    try {
        User.find({ notificationSubscriptions: { $exists: true, $not: { $size: 0 } } }, function(err, users) {
            for (location of['olin', 'trim']) {
                (function(location) {
                    Meal.find({
                            date: date,
                            mealType: mealType,
                            location: location
                        })
                        .populate('foods')
                        .exec(function(err, meals) {
                            if (err) {
                                console.log(err)
                                callback(err)
                            }
                            if (meals.length > 1) {
                                console.log("Uh-oh... you got more than one meal...")
                            } else if (meals.length === 0) {
                                console.log("tried to send notifications for " + location + ", but no meal found of type: " + mealType + ", on " + date.format("dddd, MMMM Do YYYY, h:mm:ss a"))
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
                                recurseNotifyFavorites(users, foodDict, mealNames[mealType], locationNames[location], function(err, data) {
                                    return })
                            }
                        })
                })(location);

            }
        });
    } catch (err) {
        return callback(err)
    }
    return callback(null, 'success')
}

/* 	
	Description: Helper for sendFavoritesNotifications, recursively iterates through a list of users and 
		sends favorite foor notifications
    Inputs: users (List of user objects), foodDict (dictionary where an objectId points to the full food 
    	object), name of meal (String), locationName (String),callback
    Outputs: none
*/
recurseNotifyFavorites = function(users, foodDict, mealName, locationName, callback) {
    if (users.length === 0) {
        callback(null, 'users notified of favorite foods served for' + mealName + " at " + locationName)
    } else {
        var favoritesAtMeal = users[0].favorites.filter(function(favorite) {
            return (typeof foodDict[favorite] !== "undefined");
        }).map(function(favorite) {
            return foodDict[favorite];
        })
        if (favoritesAtMeal.length > 0) {
            var title = "Favorite foods at " + locationName + " for " + mealName;
            var message = favoritesAtMeal.map(function(food) {
                return food.name }).join(", ");
            sendNotificationToUser(users[0], title, message, function(err, data) {
                return })
        } else {
            var title = "No favorite foods at " + locationName + " for " + mealName;
            var message = ":("
            sendNotificationToUser(users[0], title, message, function(err, data) {
                return })
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
