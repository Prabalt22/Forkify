import * as model from './model.js';
import { MODEL_CLOSE_SEC } from './config.js';
import recipeView from './view/recipeView.js';
import searchView from './view/searchView.js';
import resultView from './view/resultView.js';
import bookmarkView from './view/bookmarkView.js';
import paginationView from './view/paginationView.js';
import AddRecipeView from './view/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import addRecipeView from './view/addRecipeView.js';

const recipeContainer = document.querySelector('.recipe');

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////
// if (module.hot) {
//   module.hot.accept();
// }

const constrolRecipe = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner(recipeContainer);

    // 0) update result view to mark select search result
    resultView.update(model.getSerachResultPage());

    // 1) update result
    bookmarkView.update(model.state.bookmark);

    // 2) Loading Recipe
    await model.loadRecipe(id);

    // 3) Rendering Recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    // console.error(`${err} 🔥🔥🔥`);
  }
};

const constrolSearchResult = async function () {
  try {
    resultView.renderSpinner();

    // 1) get Search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) load serach result
    await model.loadSearchResult(query);

    // 3) render result
    // resultView.render(model.state.search.result);
    resultView.render(model.getSerachResultPage());

    // render initial pagination buttion
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (pageGoto) {
  // 3) render NEW result
  resultView.render(model.getSerachResultPage(pageGoto));

  // render NEW pagination buttion
  paginationView.render(model.state.search);
};

const controlServing = function (newServing) {
  // upadte the recipe serving (in state)
  model.updateServing(newServing);

  // update recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const constrolAddBookmark = function () {
  // add and remove recipe
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deletBookmark(model.state.recipe.id);

  // update recipe view
  recipeView.update(model.state.recipe);

  // render bookmark
  bookmarkView.render(model.state.bookmark);
};

const constrolBookmarks = function () {
  bookmarkView.render(model.state.bookmark);
};

const constrolAddRecipe = async function (newRecipe) {
  try {
    //Show Loading Spinner
    addRecipeView.renderSpinner();

    // upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //Render recipe
    recipeView.render(model.state.recipe);

    //Success message
    addRecipeView.renderMessage();

    //Render bookmark View
    bookmarkView.render(model.state.bookmark);

    // change id in url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODEL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(' 🔥 ', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarkView.addHandlerRender(constrolBookmarks);
  recipeView.addHandlerRender(constrolRecipe);
  recipeView.addHandlerUpdateSearch(controlServing);
  recipeView.addHandlerAddBookmark(constrolAddBookmark);
  searchView.addHandlerSearch(constrolSearchResult);
  paginationView.addHandleClick(controlPagination);
  AddRecipeView.addHandlerUpload(constrolAddRecipe);
  console.log('Welcome');
};
init();
