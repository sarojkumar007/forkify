import { elements } from './base'
import { recipeImageURL } from '../config';

export const getInput = () => elements.searchInput.value;

export const clearInput = () => {
	elements.searchInput.value = '';
}

export const clearResults = () => {
	elements.searchResList.innerHTML = '';
	elements.searchResPages.innerHTML = '';
}

export const highlightSelected = id => {
	const resArr = Array.from(document.querySelectorAll('.results__link'))
	resArr.forEach(e => {
		e.classList.remove('results__link--active');
	})
	document.querySelector(`.results__link[href="#${id}"`).classList.add('results__link--active');
}

export const limitRecipeTitle = (title, limit = 17) => {
	const newTitle = [];
	if (title.length > limit) {
		title.split(' ').reduce((acc, cur) => {
			if (acc + cur.length <= 17) {
				newTitle.push(cur);
			}
			return acc + cur.length;
		}, 0);
		return `${newTitle.join(' ')} ...`;
	}
	return title;
}

const renderRecipe = (recipe) => {
	const markup = `
	<li>
      <a class="results__link" href="#${recipe.id}" title="${recipe.title}">
          <figure class="results__fig">
              <img src="${recipeImageURL}${recipe.image}" alt="${recipe.title}">
          </figure>
          <div class="results__data">
              <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
              <p class="results__author">Ready In: ${recipe.readyInMinutes} mins.</p>
          </div>
      </a>
	</li>`;
	elements.searchResList.insertAdjacentHTML('beforeend', markup);
}

const createBtn = (page, type) =>
	`<button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
	<span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
	<svg class="search__icon">
		<use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
	</svg>
</button>`;

const renderButtons = (page, numResults, resPerPage) => {
	const pages = Math.ceil(numResults / resPerPage);
	let button;
	if (page === 1 && pages > 1) {
		// only show next btn
		button = createBtn(page, 'next');
	}
	else if (page < pages) {
		// show both btns
		button =
			`${createBtn(page, 'prev')}
			${createBtn(page, 'next')}`;
	}
	else if (page === pages && pages > 1) {
		// only show prev btn
		button = createBtn(page, 'prev')
	}
	// insert to DOM
	elements.searchResPages.insertAdjacentHTML('afterbegin', button);
}

export const renderResults = (recipes, page = 1, resPerPage = 10) => {
	// render result of current page
	const start = (page - 1) * resPerPage;
	const end = page * resPerPage;
	recipes.slice(start, end).forEach(renderRecipe);

	// render pagination btns
	renderButtons(page, recipes.length, resPerPage);
}