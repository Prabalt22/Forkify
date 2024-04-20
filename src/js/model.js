import { API_URL, RES_PER_PAGE, KEY } from './config.js';
// import { getJSON, sendJSON, AJEX } from './helper.js';
import { AJEX } from './helper.js';
import { async } from 'regenerator-runtime';

export const state = {
  recipe: {},
  search: {
    query: '',
    result: [],
    page: 1,
    resultPerPage: RES_PER_PAGE,
  },
  bookmark: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    ingredients: recipe.ingredients,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async function (id) {
  try {
    const data = await AJEX(`${API_URL}${id}?key=${KEY}`);

    state.recipe = createRecipeObject(data);
    if (state.bookmark.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (err) {
    console.error(`${err} 🔥🔥🔥`);
    throw err;
  }
};

export const loadSearchResult = async function (query) {
  try {
    const data = await AJEX(`${API_URL}?search=${query}&key=${KEY}`);
    state.search.result = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    state.search.page = 1;
  } catch (err) {
    console.error(`${err} 🔥🔥🔥`);
    throw err;
  }
};

export const getSerachResultPage = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultPerPage; //0;
  const end = page * state.search.resultPerPage; //9;
  return state.search.result.slice(start, end);
};

export const updateServing = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });
  state.recipe.servings = newServings;
};

const persistBookmarks = function () {
  localStorage.setItem('bookmark', JSON.stringify(state.bookmark));
};

export const addBookmark = function (recipe) {
  // add bookmark
  state.bookmark.push(recipe);

  //Mark current recipe as bookmark
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  persistBookmarks();
};

export const deletBookmark = function (id) {
  // delet bookmark
  const index = state.bookmark.findIndex(el => el.id === id);
  state.bookmark.splice(index, 1);

  //Mark current recipe as Not bookmark
  if (id === state.recipe.id) state.recipe.bookmarked = false;
};

const init = function () {
  const storage = localStorage.getItem('bookmark');
  if (storage) state.bookmark = JSON.parse(storage);
  // console.log(storage);
};
init();

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());
        // const ingArr = ing[1].replaceAll(' ', '').split(',');

        if (ingArr.length !== 3) {
          throw new Error(
            'Wrong ingredient formate ! Please use correct formate :)'
          );
        }

        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };
    const data = await AJEX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);

    // console.log(recipe);
  } catch (err) {
    throw err;
  }
};

const clearBookmarks = function () {
  localStorage.clear('bookmark');
};

// clearBookmarks();
