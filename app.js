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
var passport = require('passport');
var app = express();

if (process.env.NODE_ENV === 'production') {

} else {
	var authKeys = require('./authKeys.js');
	process.env['VARIABLE'] = authKeys.VARIABLE;
}

//PASSPORT
// require('./config/passportConfig')(passport);
// app.use(session({ secret: 'this is not a secret ;)',
//   resave: false,
//   saveUninitialized: false }));
// app.use(passport.initialize());
// app.use(passport.session());


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

app.get('/', indexRoute.home);

app.get('/scraping/menuUrl', scrapingRoute.menuUrl);
app.get('/scraping/menuData', scrapingRoute.menuData);
app.get('/scraping/menuDataSave/:location', scrapingRoute.menuDataSave);


var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;
app.listen( port, ipaddress, function() {
    console.log((new Date()) + ' Server is listening on port 3000');
});


module.exports = app;
