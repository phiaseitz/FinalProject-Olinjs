var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var express = require('express');
var indexRoute = require('./routes/index');
var scrapingRoute = require('./routes/scraping');
var mongoose = require('mongoose');
var favicon = require('serve-favicon');
var session = require('express-session');
var auth = require('./authentication.js')
var app = express();

// if (process.env.NODE_ENV === 'production') {

// } else {
// 	var authKeys = require('./authKeys.js');
// 	process.env['VARIABLE'] = authKeys.VARIABLE;
// }

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
mongoose.connect(mongoURI);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we're connected!")
});

// favicon setup
app.use(favicon(path.join(__dirname,'public','images','burger.png')));



app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

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
app.put('/prefapi/gf', indexRoute.changeGFStatusPUT);
app.put('/prefapi/loc', indexRoute.changeDefaultLocPUT);

app.get('*', indexRoute.home);

var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;
app.listen( port, ipaddress, function() {
    console.log((new Date()) + ' Server is listening on port 3000');
});


module.exports = app;
