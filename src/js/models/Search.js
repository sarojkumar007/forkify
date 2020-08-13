import axios from 'axios';
import { key } from '../config'

export default class Search {
	constructor(query) {
		this.query = query;
	}

	async getResults() {
		try {
			const res = await axios(`https://api.spoonacular.com/recipes/search?query=${this.query}&number=30&apiKey=${key}`);
			this.result = res.data.results;
		}
		catch (e) {
			alert(e);
		}
	}
}