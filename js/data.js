/* exported data */
var data = {
  currentDB: 'Meals',
  currentPage: 'searched',
  currentRecipe: {},
  searchedMeals: [],
  searchedDrinks: [],
  bookmarkedMeals: [],
  bookMealThumbs: [],
  lovedMeals: [],
  lovedMealThumbs: [],
  bookmarkedDrinks: [],
  bookDrinkThumbs: [],
  lovedDrinks: [],
  lovedDrinkThumbs: []
};

var oldDataJSON = localStorage.getItem('cookItUpData');
if (oldDataJSON !== null) {
  data = JSON.parse(oldDataJSON);
}

window.addEventListener('beforeunload', function (event) {
  var dataJSON = JSON.stringify(data);
  localStorage.setItem('cookItUpData', dataJSON);
});
