import Search from './models/Search';
import { elements, renderLoader, clearLoader } from './views/base'
import * as searchView from './views/searchView'
import * as recipeView from './views/recipeView'
import * as listView from './views/listView'
import * as likesView from './views/likesView'
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';

// Global state of the App
/*
 * Search Object
 * Current Recipe Object
 * Shopping list object
 * Liked recipes
*/
const state = {};

const controlSearch = async () => {
	// get query from view
	const query = searchView.getInput();
	if (query) {
		state.search = new Search(query);
	}

	// prepare the UI for Results
	searchView.clearInput();
	searchView.clearResults();
	renderLoader(elements.searchRes);

	try {
		// search for recipes
		await state.search.getResults();
		// render results on UI
		clearLoader();
		searchView.renderResults(state.search.result);
	}
	catch (err) {
		console.error('ERR in Search', err);
		clearLoader();
	}
}

elements.searchForm.addEventListener('submit', e => {
	e.preventDefault();
	controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
	const btn = e.target.closest('.btn-inline');
	if (btn) {
		const goto = parseInt(btn.dataset.goto, 10);
		searchView.clearResults();
		searchView.renderResults(state.search.result, goto);
	}
})

// Recipe CONTROLLER


const controlRecipe = async () => {
	// get id from url
	if (location.hash) {
		const id = window.location.hash.replace('#', '');

		if (id) {
			// prepare the UI for changes
			recipeView.clearRecipe();
			renderLoader(elements.recipe)

			// Highlight Selected Search Item
			// if (state.search) searchView.highlightSelected(id);

			// create recipe object
			state.recipe = new Recipe(id);

			try {
				// get recipe data
				await state.recipe.getRecipe();

				// get and parse ingredients
				// calc time and servings (we have it don't do it)
				state.recipe.parseIngredients();
				// render recipe to UI
				clearLoader()
				recipeView.renderRecipe(
					state.recipe,
					state.likes.isLiked(id));
			}
			catch (err) {
				console.error('ERR', err);
				alert('Error processing Recipe');
			}
		}
	}
}

// List CONTROLLER

const controlList = () => {
	// create a new list if there is no list
	if (!state.list) state.list = new List();

	// add each ingredients to list and UI
	state.recipe.ingredients.forEach(el => {
		const item = state.list.addItem(el.count, el.unit, el.ingredient);
		listView.renderItem(item);
	});
}

['hashchange', 'load'].forEach(action => window.addEventListener(action, controlRecipe));

// handle delete add update list item
elements.shoppingList.addEventListener('click', e => {
	const id = e.target.closest('.shopping__item').dataset.itemid;

	// Handle Delete
	if (e.target.matches('.shopping__delete, .shopping__delete *')) {
		// delete from state and UI
		state.list.deleteItem(id);
		listView.deleteItem(id);
	}
	else if (e.target.matches('.shopping__count-value')) {
		const val = parseFloat(e.target.value, 10);
		state.list.updateCount(id, val);
	}
})

// Likes CONTROLLER


const controlLike = () => {
	if (!state.likes) state.likes = new Likes();
	const currId = state.recipe.id;
	if (!state.likes.isLiked(currId)) {
		// add like to state
		// add id, title, author, image
		const newLike = state.likes.addLike(
			currId,
			state.recipe.title,
			state.recipe.author,
			state.recipe.img
		);

		// toggle the like btn
		likesView.toggleLikeBtn(true);

		likesView.renderLike(newLike);
	}
	else {
		// remove like from state
		state.likes.deleteLike(currId);

		// toggle like btn
		likesView.toggleLikeBtn(false);

		// remove like from UI
		likesView.deleteLike(currId);
	}
	likesView.toggleLikesMenu(state.likes.getNumLikes());
}


// Restore liked recipe on page load
window.addEventListener('load', () => {
	state.likes = new Likes();
	// get likes if any
	state.likes.readStorage();
	// toggle btn in UI
	likesView.toggleLikesMenu(state.likes.getNumLikes());

	// render existing likes
	state.likes.likes.forEach(el => likesView.renderLike(el));
});

// handle recipe servings
elements.recipe.addEventListener('click', event => {
	if (event.target.matches('.btn-dec, .btn-dec *')) {
		if (state.recipe.servings > 1) {
			state.recipe.updateServings('dec');
			recipeView.updateServingsIngredients(state.recipe);
		}
	}
	else if (event.target.matches('.btn-inc, .btn-inc *')) {
		state.recipe.updateServings('inc');
		recipeView.updateServingsIngredients(state.recipe);
	}
	else if (event.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
		controlList();
	}
	else if (event.target.matches('.recipe__love, .recipe__love *')) {
		// call the like controller
		controlLike()
	}
})
