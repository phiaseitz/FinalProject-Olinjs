var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

var Food = require('../models/foodModel.js');
var Meal = require('../models/mealModel.js');

var meals = ['brk', 'lun', 'din'];

getMenuURL = function(location, callback) {
	//location = 'trim'
	if (location === 'olin') {
		url = 'https://olindining.sodexomyway.com/dining-choices/index.html'
		urlBase = 'https://olindining.sodexomyway.com'
	} else if (location === 'trim') {
		url = 'https://babsondining.sodexomyway.com/dining-choices/index.html'
		urlBase = 'https://babsondining.sodexomyway.com'
	}
	request(url, function(error, response, html) {
		if (!error) {
			var $ = cheerio.load(html);
			menuURL = urlBase + $('#accordion_3543').children().eq(1).children().first().children().first().children().first().attr('href')
			callback(menuURL)
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

								item = {
									name: null,
									foodId: null,
									nutritionId: null,
									station: null,
									'vegan': false,
									'vegetarian': false,
									'mindful': false
								}

								item.name = menuItem.find('span').first().text()

								var itemId =  menuItem.find('.chk').first().attr('id');
								item.foodId = itemId.substring(9, 19);
								item.nutritionId = itemId.substring(20);

								item.station = currentCategory;
							
								item.vegan = (menuItem.find('img[alt="Vegan"]').length != 0)
								item.vegetarian = item.vegan || (menuItem.find('img[alt="Vegetarian"]').length != 0)
								item.mindful = (menuItem.find('img[alt="Mindful Item"]').length != 0)

								var regSearchString = "aData\\['"+ itemId.substring(9) +"'\\]"
								// console.log(regSearchString)
								var nutritionString = html.match("(.*(?:"+regSearchString+").*)")[0];
								// var nutritionArray = nutritionString.slice(36, -2).replace(/'/g, "").split(",");
								console.log(nutritionString.slice(36, -2).replace(/\\/g, ""))
								// var nutritionArray = new Array(nutritionString.slice(36, -2).replace(/\\/g, ""));
								// (?=((?<=')(?:[^']*)(?=')))(?=[^,]) (work with pcre)
								var re = /'([^']*)'/g;
								var nutritionArray = nutritionString.slice(36, -2).match(re).map(function(x) {
									return x.slice(1,-1)
								});
								console.log(nutritionArray)
								nutritionObject = {
									serving: nutritionArray[0],
									calories: nutritionArray[1],
									fatCalories: nutritionArray[2],
									fat: nutritionArray[3],
									fatPercent: nutritionArray[4],
									saturatedFat: nutritionArray[5],
									saturatedFatPercent: nutritionArray[6],
									transFat: nutritionArray[7],
									cholesterol: nutritionArray[8],
									cholesterolPercent: nutritionArray[9],
									sodium: nutritionArray[10],
									sodiumPercent: nutritionArray[11],
									carbohydrates: nutritionArray[12],
									carbohydratesPercent: nutritionArray[13],
									dietaryFiber: nutritionArray[14],
									dietaryFiberPercent: nutritionArray[15],
									sugar: nutritionArray[16],
									protein: nutritionArray[17],
									vitAPercent: nutritionArray[18],
									vitCPercent: nutritionArray[19],
									calciumPercent: nutritionArray[20],
									ironPercent: nutritionArray[21],
									name: nutritionArray[22],
									description: nutritionArray[23],
									allergens: nutritionArray[24],
									vitA: nutritionArray[25],
									vitC: nutritionArray[26],
									calcium: nutritionArray[27],
									iron: nutritionArray[28],
								}
								item.nutrition = nutritionObject
								console.log(item)
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

saveFoodsAndAddToMenu = function(foods, mealId) {
	for (food of foods) {
		Food.findOneAndUpdate({
				sodexoId: food.foodId
			}, {
				name: food.name,
				vegan: food.vegan,
				station: food.station,
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