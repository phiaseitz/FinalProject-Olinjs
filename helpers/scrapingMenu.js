var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

var Food = require('../models/foodModel.js');
var Meal = require('../models/mealModel.js');

var meals = ['brk', 'lun', 'din'];

getMenuURL = function(location, callback) {
	//location = 'trim'
	if (location === 'olin') {
		var url = 'http://olindining.sodexomyway.com/dining-choices/index.html'
		var urlBase = 'http://olindining.sodexomyway.com'
	} else if (location === 'trim') {
		var url = 'http://babsondining.sodexomyway.com/dining-choices/index.html'
		var urlBase = 'http://babsondining.sodexomyway.com'
	}

	request(url, function(error, response, html) {
		if (!error) {
			var $ = cheerio.load(html);
			$('#accordion_3543').children().eq(1).children().first().children().each(function(i, elem) {
			    var menuUrl = urlBase + $(elem).children().first().attr('href')
			    // console.log(menuUrl)
			    callback(menuUrl)
			});
		}
	})
}

getMenuData = function(location, callback) {
	getMenuURL(location, function(url) {
		console.log(url)
		request(url, function(error, response, html) {
			// First we'll check to make sure no errors occurred when making the request
			if (!error) {
				// Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality

				var $ = cheerio.load(html);

				$.prototype.logHtml = function() {
					console.log(this.html());
				};



				var startDateInfo = html.match('(.*(?:var dstart=new).*)')[0].slice(20, -2).split(",")
				var startDate = new Date(startDateInfo[0], startDateInfo[1], startDateInfo[2]);

				var menu = [];

				var daysOfWeek = {
					'monday': 0,
					'tuesday': 1,
					'wednesday': 2,
					'thursday': 3,
					'friday': 4,
					'saturday': 5,
					'sunday': 6
				}

				$('.dayouter').each(function(i, elem) {
					var dayMenu = {}
					dayMenu.dayOfWeek = $(elem).attr('id');
					var dayDate = new Date(startDate.getTime());
					dayDate.setDate(dayDate.getDate() + daysOfWeek[dayMenu.dayOfWeek]);
					dayMenu.date = dayDate;

					var currentCategory = null;
					for (meal of meals) {
						var foods = [];
						$(elem).find('.' + meal).filter(function(i, elem) {
							return $(elem).find('.menuitem').length != 0;
						}).each(function(i, elem) {
							
							var station = $(elem).find('.station').first().text();
							// console.log(station)
							// console.log(station.length)
							if (station.length > 1) {
								currentCategory = station.substring(1)
							}
							var menuItem = $(elem).find('.menuitem').first();

							if (menuItem.find('.chk').length !== 0) {

								var item = {
									name: null,
									foodId: null,
									nutritionId: null,
									station: null,
									'vegan': false,
									'vegetarian': false,
									'mindful': false
								}

								item.name = menuItem.find('span').first().text().replace(/(\r\n|\n|\r)/gm,"").replace(/^\s+|\s+$/g, "");;

								var itemId =  menuItem.find('.chk').first().attr('id');
								item.foodId = itemId.substring(9, 19);
								item.nutritionId = itemId.substring(20);

								item.station = currentCategory;
							
								item.vegan = (menuItem.find('img[alt="Vegan"]').length != 0)
								item.vegetarian = item.vegan || (menuItem.find('img[alt="Vegetarian"]').length != 0)
								item.mindful = (menuItem.find('img[alt="Mindful Item"]').length != 0)

								var regSearchString = "aData\\['"+ itemId.substring(9) +"'\\]";
								var nutritionString = html.match("(.*(?:"+regSearchString+").*)")[0];
								var nutritionArray = nutritionString.slice(37, -3).replace(/(\r\n|\n|\r)/gm,"").split("','")
								
								var nutritionObject = {
									nutritionId: item.nutritionId,
									serving: nutritionArray[0],
									calories: Number(nutritionArray[1]),
									fatCalories: Number(nutritionArray[2]),
									fat: Number(nutritionArray[3]),
									fatPercent: Number(nutritionArray[4]),
									saturatedFat: Number(nutritionArray[5]),
									saturatedFatPercent: Number(nutritionArray[6]),
									transFat: Number(nutritionArray[7]),
									cholesterol: Number(nutritionArray[8]),
									cholesterolPercent: Number(nutritionArray[9]),
									sodium: Number(nutritionArray[10]),
									sodiumPercent: Number(nutritionArray[11]),
									carbohydrates: Number(nutritionArray[12]),
									carbohydratesPercent: Number(nutritionArray[13]),
									dietaryFiber: Number(nutritionArray[14]),
									dietaryFiberPercent: Number(nutritionArray[15]),
									sugar: Number(nutritionArray[16]),
									protein: Number(nutritionArray[17]),
									vitAPercent: Number(nutritionArray[18]),
									vitCPercent: Number(nutritionArray[19]),
									calciumPercent:Number(nutritionArray[20]),
									ironPercent:Number(nutritionArray[21]),
									name: nutritionArray[22],
									description: nutritionArray[23],
									allergens: nutritionArray[24].substring(9).split(',').filter(function(x) { return (x !== '')}).map(function (x){ return x.trim()}),
									vitA: Number(nutritionArray[25]),
									vitC: Number(nutritionArray[26]),
									calcium: Number(nutritionArray[27]),
									iron: Number(nutritionArray[28]),
								}
								item.nutrition = nutritionObject
								// console.log(item)
								foods.push(item)
							}
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

saveFoodsAndAddToMenu = function(foods, mealId, location) {
	var stationLocation = "station." + location ;
	for (food of foods) {
		var station = {};
		station["station." + location] = food.station;
		Food.findOneAndUpdate({
				sodexoId: food.foodId
			}, {
				name: food.name,
				vegan: food.vegan,
				$set: station,
				vegetarian: food.vegetarian,
				mindful: food.mindful,
				$addToSet: {"nutritionInformation": food.nutrition},
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
			        {$addToSet: {"foods": food._id}},
			        {},
			        function(err, meal) {
						if (err) return console.error(err)
			        }
			    );
			})
	}
}

scrapeMenuAndSave = function(location, callback) {
	getMenuData(location, function(weekMenu) {
		for (dayMenu of weekMenu) {
			for (mealType of meals) {
				var currentMeal = dayMenu[mealType];
				if (currentMeal.length != 0) {
					(function(currentMeal){
						Meal.findOneAndUpdate({
								date: dayMenu.date,
								mealType: mealType,
								location: location
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
								saveFoodsAndAddToMenu(currentMeal, meal._id, location)
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