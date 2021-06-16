/* exported data */
var data = {
  currentDB: 'Meals',
  currentPage: 'searched',
  currentRecipe: {},
  searchedMeals: [],
  bookmarkedMeals: [],
  lovedMeals: [],
  searchedDrinks: [],
  bookmarkedDrinks: [],
  lovedDrinks: []
};

var oldDataJSON = localStorage.getItem('cookItUpData');
if (oldDataJSON !== null) {
  data = JSON.parse(oldDataJSON);
}

window.addEventListener('beforeunload', function (event) {
  var dataJSON = JSON.stringify(data);
  localStorage.setItem('cookItUpData', dataJSON);
});
