var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

var Food = require('../models/foodModel.js');
var Meal = require('../models/mealModel.js');

var meals = ['brk', 'lun', 'din'];

getMenuURL = function(callback) {
	url = 'https://olindining.sodexomyway.com/dining-choices/index.html'
	request(url, function(error, response, html) {
		if (!error) {
			var $ = cheerio.load(html);
			menuURL = 'https://olindining.sodexomyway.com' + $('#accordion_3543').children().eq(1).children().first().children().first().children().first().attr('href')
			callback(menuURL)
		}
	})

}

getMenuData = function(callback) {
	getMenuURL(function(url) {
		console.log(url)
		request(url, function(error, response, html) {
			// First we'll check to make sure no errors occurred when making the request
			if (!error) {
				// Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality

				var $ = cheerio.load(html);

				var startDateInfo = html.match('(.*(?:var dstart=new).*)')[0].slice(20, -2).split(",")
				var startDate = new Date(startDateInfo[0], startDateInfo[1], startDateInfo[2]);
				console.log(startDate)

				var menu = [];

				daysOfWeek = {
					'monday': 0,
					'tuesday': 1,
					'wednesday': 2,
					'thursday': 3,
					'friday': 4,
					'saturday': 5,
					'sunday': 6
				}

				$('.dayouter').each(function(i, elem) {
					dayMenu = {}
					dayMenu.dayOfWeek = $(elem).attr('id');
					var dayDate = new Date(startDate.getTime());
					dayDate.setDate(dayDate.getDate() + daysOfWeek[dayMenu.dayOfWeek]);
					dayMenu.date = dayDate;


					for (meal of meals) {
						var foods = [];
						$(elem).find('.' + meal).filter(function(i, elem) {
							return $(elem).find('.menuitem').length != 0;
						}).each(function(i, elem) {
							var menuItem = $(elem).find('.menuitem').first();

							item = {
								name: null,
								foodId: null,
								nutritionId: null,
								'vegan': false,
								'vegetarian': false,
								'mindful': false
							}
							item.name = menuItem.find('span').first().text()
							item.foodId = menuItem.find('.chk').first().attr('id').substring(9, 19);
							item.nutritionId = menuItem.find('.chk').first().attr('id').substring(20);
							item.vegan = (menuItem.find('img[alt="Vegan"]').length != 0)
							item.vegetarian = item.vegan || (menuItem.find('img[alt="Vegetarian"]').length != 0)
							item.mindful = (menuItem.find('img[alt="Mindful Item"]').length != 0)

							foods.push(item)
						})
						dayMenu[meal] = foods
					}
					menu.push(dayMenu)
				});
				callback(menu);
			}
		})
	})

}

saveFoodsAndAddToMenu = function(foods, mealId) {
	for (food of foods) {
		Food.findOneAndUpdate({
				sodexoId: food.foodId
			}, {
				name: food.name,
				vegan: food.vegan,
				vegetarian: food.vegetarian,
				mindful: food.mindful,
				lastUpdated: Date.now()
			}, {
				upsert: true,
				setDefaultsOnInsert: true,
				new: true
			},
			function(err, food) {
				if (err) return console.error(err)
				Meal.findByIdAndUpdate(
			        mealId,
			        {$push: {"foods": food._id}},
			        {},
			        function(err, meal) {
						if (err) return console.error(err)
			        }
			    );
			})
	}
}

scrapeMenuAndSave = function(callback) {
	getMenuData(function(weekMenu) {
		for (dayMenu of weekMenu) {
			for (mealType of meals) {
				var currentMeal = dayMenu[mealType];
				if (currentMeal.length != 0) {
					(function(currentMeal){
						Meal.findOneAndUpdate({
								date: dayMenu.date,
								mealType: mealType
							}, {
								lastUpdated: Date.now(),
								foods: []
							}, {
								upsert: true,
								setDefaultsOnInsert: true,
								new: true
							},
							function(err, meal) {
								if (err) return console.error(err)
								saveFoodsAndAddToMenu(currentMeal, meal._id)
							})
					}(currentMeal))
				}
			}
		}
		callback(weekMenu)
	})
}

module.exports.getMenuURL = getMenuURL;
module.exports.getMenuData = getMenuData;
module.exports.scrapeMenuAndSave = scrapeMenuAndSave;