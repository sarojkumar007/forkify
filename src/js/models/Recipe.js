import axios from 'axios';
import { key } from '../config';

export default class Recipe {
	constructor(id) {
		this.id = id;
	}

	async getRecipe() {
		try {
			const res = await axios(`https://api.spoonacular.com/recipes/${this.id}/information?includeNutrition=false&apiKey=${key}`);
			this.title = res.data.title;
			this.author = res.data.sourceName;
			this.img = res.data.image;
			this.url = res.data.sourceUrl;
			this.ingredients = res.data.extendedIngredients;
			this.vegan = res.data.vegan;
			this.servings = res.data.servings;
			this.time = res.data.readyInMinutes;
			this.price = res.data.pricePerServing;
		}
		catch (err) {
			console.error("ERR : ", err);
			alert('Something went wrong');
		}
	}

	calcTime() {
		// assuming that we have 15 mins for each 3 ingredients
		const numIng = this.ingredients.length;
		const period = Math.ciel(numIng / 3);
		this.time = period * 15;
	}

	parseIngredients() {
		const unitLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoon', 'teaspoons', 'cups', 'pounds'];
		const unitShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound']
		const newIngedients = this.ingredients.map(e => {

			let unitOld = e.unit.toLowerCase();
			unitLong.forEach((unit, i) => {
				unitOld = unitOld.replace(unit, unitShort[i]);
			});

			return {
				count: e.amount,
				unit: unitOld,
				ingredient: `${e.meta} ${e.name}`
			}

			// uniform unit
			// let ingredient = e.original.toLowerCase();
			// unitLong.forEach((unit, i) => {
			// 	ingredient = ingredient.replace(unit, unitShort[i]);
			// });

			// // separate count, unit and ingredients
			// const arrIng = ingredient.split(' ');
			// const unitIndex = arrIng.findIndex(el => unitShort.includes(el));

			// let ingObj;
			// if (unitIndex > -1) {
			// 	let count;
			// 	const arrCount = arrIng.slice(0, unitIndex);
			// 	if (arrCount.length === 1) {
			// 		count = parseInt(arrIng[0]);
			// 	}
			// 	else {
			// 		count = eval(arrIng.slice(0, unitIndex).join('+'));
			// 	}
			// 	// unit exist
			// 	ingObj = {
			// 		count,
			// 		unit: arrIng[unitIndex],
			// 		ingredients: arrIng.slice(unitIndex + 1).join(' ')
			// 	}
			// }
			// else if (parseInt(arrIng[0])) {
			// 	// unit: ''
			// 	ingObj = {
			// 		count: parseInt(arrIng[0]),
			// 		unit: '',
			// 		ingredients: arrIng.slice(1).join(' ')
			// 	}
			// }
			// else if (unitIndex === -1) {
			// 	// unit 404 and no num in first place
			// 	ingObj = {
			// 		count: 1,
			// 		unit: '',
			// 		ingredients: ingredient
			// 	}
			// }

			// return ingObj;
		});
		this.ingredients = newIngedients;
	}

	updateServings(type) {
		const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

		// Ingredients
		this.ingredients.forEach(ing => {
			ing.count *= (newServings / this.servings);
		})

		this.servings = newServings;
	}
}