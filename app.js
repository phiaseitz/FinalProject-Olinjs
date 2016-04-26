var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var express = require('express');
var mongoose = require('mongoose');
var favicon = require('serve-favicon');
var session = require('express-session');
var fork = require('child_process').fork;
var indexRoute = require('./routes/index');
var scrapingRoute = require('./routes/scraping');
var scrapingHelper = require('./helpers/scrapingMenu.js');
var auth = require('./authentication.js')
var pushNotificationRoute = require('./routes/pushNotifications');

var app = express();

if (process.env.NODE_ENV === 'production') {

} else {
	var authKeys = require('./authKeys.json');
	process.env['GCM_API_KEY'] = authKeys.GCM_API_KEY;
}

var passport = auth.configure();

//PASSPORT
app.use(session({ secret: 'this is not a secret ;)',
  resave: false,
  saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());


// mongo setup
var mongoURI = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/diningApp';
console.log(mongoURI)
var options = {
  server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
  replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
};
mongoose.connect(mongoURI, options);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log("we're connected!");
	var child = fork('./helpers/scrapingSchedule'); //create child process because scraping is slow and blocking
	var child = fork('./helpers/notificationSchedule');
});

// favicon setup
app.use(favicon(path.join(__dirname,'public','images','burger.png')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

function redirectSec(req, res, next) {
  if (req.headers['x-forwarded-proto'] == 'http') {
      res.redirect('https://' + req.headers.host + req.path);
  } else {
      return next();
  }
}

app.get('*', redirectSec);

app.get('/sw.js', function(req, res){
  res.sendfile('sw.js');
});

app.get('/auth/getAuthenticated', auth.getAuthenticated);
app.get('/auth/logout', auth.logout);
app.post('/auth/login', auth.login);
app.post('/auth/signup', auth.signup);
app.post('/auth/changePassword', auth.changePassword);

app.get('/scraping/menuUrl', scrapingRoute.menuUrl);
app.get('/scraping/menuData', scrapingRoute.menuData);
app.get('/scraping/menuDataSave/:location', scrapingRoute.menuDataSave);

app.get('/menuapi/getweek', indexRoute.getWeekMealsGET);
app.get('/menuapi/getmeal', indexRoute.getMealGET);
app.get('/menuapi/getdaymeals', indexRoute.getDayMealsGET);

app.get('/prefapi/getfavs',  indexRoute.getFavFoodsGET);
app.put('/prefapi/addfav', indexRoute.addFavFoodPUT);
app.put('/prefapi/rmfav', indexRoute.removeFavFoodPUT);

app.put('/prefapi/vegan', indexRoute.changeVeganStatusPUT);
app.put('/prefapi/vegetarian', indexRoute.changeVegetarianStatusPUT);
app.put('/prefapi/allergens', indexRoute.changeAllergenStatusPUT);
app.put('/prefapi/loc', indexRoute.changeDefaultLocPUT);
app.put('/prefapi/mindful', indexRoute.changeMindfulStatusPUT);

app.post('/notifictionAPI/addSubscription', pushNotificationRoute.addEndpointToUserPOST);
app.post('/notifictionAPI/addSubscriptionAndConfirm', pushNotificationRoute.addEndpointToUserAndConfirmPOST);
app.post('/notifictionAPI/removeSubscription', pushNotificationRoute.removeEndpointFromUserPOST);
app.post('/notifictionAPI/testNotifications', pushNotificationRoute.sendNotificationToUserPOST);
app.post('/notifictionAPI/sendFavoritesNotification', pushNotificationRoute.sendFavoritesNotificationPOST);

app.get('*', indexRoute.home);

var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;
app.listen( port, ipaddress, function() {
    console.log((new Date()) + ' Server is listening on port 3000');
});

module.exports = app;
