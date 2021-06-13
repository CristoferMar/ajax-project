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

var oldDataJSON = localStorage.getItem('data');
if (oldDataJSON !== null) {
  data = JSON.parse(oldDataJSON);
}

window.addEventListener('beforeunload', function (event) {
  var dataJSON = JSON.stringify(data);
  localStorage.setItem('data', dataJSON);
});
