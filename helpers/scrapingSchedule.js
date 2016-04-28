//This file is initated as a child process on app start up. It causes the menus at olin and trim to be scrpaed every 30 minutes.

var mongoose = require('mongoose');

var scrapingHelper = require('./scrapingMenu.js');

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
    console.log("scraping child process connected to mongoose");

    (function foo() {
        console.log('scraping menu');
        scrapingHelper.scrapeMenuAndSave('olin', function(data) {
            console.log("scraped olin menu");
        });
        scrapingHelper.scrapeMenuAndSave('trim', function(data) {
            console.log("scraped trim menu");
        });
        setTimeout(foo, 30 * 60 * 1000);
    })();
});
