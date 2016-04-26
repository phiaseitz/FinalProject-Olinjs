var mongoose = require('mongoose');
var schedule = require('node-schedule');
var moment = require('moment-timezone');

var pushNotificationHelper = require('./pushNotification.js');

// mongo setup
var mongoURI = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/diningApp';
var options = {
  server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
  replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
};
mongoose.connect(mongoURI, options);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log("notification child process connected to mongoose");

	var ruleWeekDayBreakfast = new schedule.RecurrenceRule();
	ruleWeekDayBreakfast.dayOfWeek = [new schedule.Range(1, 5)];
	ruleWeekDayBreakfast.hour = 7;
	ruleWeekDayBreakfast.minute = 30;

	schedule.scheduleJob(ruleWeekDayBreakfast, function(){
		console.log('Send Weekday Breakfast Notifications');
		var today = moment().tz('America/New_York');
		var todayDay = moment(today).startOf('day');
		var mealType = 'brk'

		pushNotificationHelper.sendFavoritesNotifications(todayDay, mealType,function(err, data) {
			if (err) {
				console.log(err)
				return res.send(err)
			}
		})
	});

	var ruleWeekDayLunch = new schedule.RecurrenceRule();
	ruleWeekDayLunch.dayOfWeek = [new schedule.Range(1, 5)];
	ruleWeekDayLunch.hour = 11;
	ruleWeekDayLunch.minute = 30;

	schedule.scheduleJob(ruleWeekDayLunch, function(){
		console.log('Send Weekday Lunch Notifications');
		var today = moment().tz('America/New_York');
		var todayDay = moment(today).startOf('day');
		var mealType = 'lun'

		pushNotificationHelper.sendFavoritesNotifications(todayDay, mealType,function(err, data) {
			if (err) {
				console.log(err)
				return res.send(err)
			}
		})
	});

	var ruleWeekDayDinner = new schedule.RecurrenceRule();
	ruleWeekDayDinner.dayOfWeek = [new schedule.Range(1, 5)];
	ruleWeekDayDinner.hour = 17;
	ruleWeekDayDinner.minute = 0;

	var j = schedule.scheduleJob(ruleWeekDayDinner, function(){
		console.log('Send Weekday Dinner Notifications');
		var today = moment().tz('America/New_York');
		var todayDay = moment(today).startOf('day');
		var mealType = 'din'

		pushNotificationHelper.sendFavoritesNotifications(todayDay, mealType,function(err, data) {
			if (err) {
				console.log(err)
				return res.send(err)
			}
		})
	});


	var ruleWeekendLunch = new schedule.RecurrenceRule();
	ruleWeekendLunch.dayOfWeek = [0,6];
	ruleWeekendLunch.hour = 11;
	ruleWeekendLunch.minute = 00;

	var j = schedule.scheduleJob(ruleWeekendLunch, function(){
		console.log('Send Weekend Lunch Notifications');
		var today = moment().tz('America/New_York');
		var todayDay = moment(today).startOf('day');
		var mealType = 'lun'

		pushNotificationHelper.sendFavoritesNotifications(todayDay, mealType,function(err, data) {
			if (err) {
				console.log(err)
				return res.send(err)
			}
		})
	});

	var ruleWeekendDinner = new schedule.RecurrenceRule();
	ruleWeekendDinner.dayOfWeek = [0,6];
	ruleWeekendDinner.hour = 17;
	ruleWeekendDinner.minute = 00;

	var j = schedule.scheduleJob(ruleWeekendDinner, function(){
		console.log('Send Weekend Dinner Notifications');
		var today = moment().tz('America/New_York');
		var todayDay = moment(today).startOf('day');
		var mealType = 'din'

		pushNotificationHelper.sendFavoritesNotifications(todayDay, mealType,function(err, data) {
			if (err) {
				console.log(err)
				return res.send(err)
			}
		})
	});

});
