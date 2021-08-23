var $toggleBtn = document.querySelector('#toggle-Page');
var gallery = document.querySelector('#recipe-gallery');
var $lovedMeals = document.querySelector('#lovedMeals');
var $bookmarkedMeals = document.querySelector('#bookmarkedMeals');
var $lovedDrinks = document.querySelector('#lovedDrinks');
var $bookmarkedDrinks = document.querySelector('#bookmarkedDrinks');

var $navBar = document.querySelector('.nav-container');
var $uniformColor = document.querySelectorAll('.green');
var $body = document.querySelector('body');
var $searchBar = document.querySelector('.search-form');
var searchCount = 0;
var $searchImg = document.querySelector('.spy');
var $start = document.querySelector('#start-page');
var $pageTitle = document.querySelector('#title');
$start.className = data.currentDB.substr(0, data.currentDB.length - 1).toLowerCase() + '-border justify-center full-center flex';
var $navSwappers = document.querySelectorAll('.nav-direct');
var allViews = document.querySelectorAll('.view');
var $select = document.querySelector('select');
var userDisplay = document.querySelector('.user-display');
const pageTitle = document.querySelector('#page-title');

var recipeImg = document.querySelector('#recipe-img');
var recipeInfo = document.querySelector('#recipe-info');
var ingredients = document.querySelector('#ingredients');
var instructions = document.querySelector('#instructions');
var allRecipeBubbles = document.querySelectorAll('.recipe-bubbles');

window.addEventListener('DOMContentLoaded', function (event) {
  if (data.currentDB === 'Meals') {
    loadInList(data.bookMealThumbs, $bookmarkedMeals);
    loadInList(data.lovedMealThumbs, $lovedMeals);
    data.currentDB = 'Drinks';
    loadInList(data.bookDrinkThumbs, $bookmarkedDrinks);
    loadInList(data.lovedDrinkThumbs, $lovedDrinks);
    data.currentDB = 'Meals';
  } else {
    loadInList(data.bookDrinkThumbs, $bookmarkedDrinks);
    loadInList(data.lovedDrinkThumbs, $lovedDrinks);
    data.currentDB = 'Meals';
    loadInList(data.bookMealThumbs, $bookmarkedMeals);
    loadInList(data.lovedMealThumbs, $lovedMeals);
    data.currentDB = 'Drinks';
  }
  toggleDB(data.currentDB);
  viewSwap(data.currentPage);
  if (data.currentPage === 'fullRecipe') recipeDataInject(data.currentRecipe);
});

$select.addEventListener('change', function (event) {
  viewSwap(event.target.value);
});

$navBar.addEventListener('click', function (event) {
  event.preventDefault();

  if (event.target.matches('.large-btn')) {
    clearGallery();
    if (data.currentDB === 'Meals') {
      data.currentDB = 'Drinks';
    } else {
      data.currentDB = 'Meals';
    }
    toggleDB(data.currentDB);
  }

  if (event.target.matches('.randomize')) {
    viewSwap('searched');
    clearGallery();
    data['searched' + data.currentDB] = [];
    searchCount = 6;
    $searchBar.reset();
    for (var i = 0; i < 6; i++) {
      responseGET(getRecipeIDs, 'random.php');
    }
  }

  if (event.target.matches('.swap')) {
    viewSwap(event.target.getAttribute('data-view'));
  }

});

$searchBar.addEventListener('submit', function (event) {
  event.preventDefault();
  clearGallery();
  data['searched' + data.currentDB] = [];
  var searched = $searchBar.elements.search.value.toLowerCase();
  if (searched.includes('non') && searched.includes('alcoholic')) { searched = 'non alcoholic'; }

  if (searched.length < 1) {
    return;
  } else if (searched.length < 2) {
    searchCount = 1;
    responseGET(getRecipeIDs, 'search.php?f=' + searched);
    return;
  }
  searchCount = 4;
  responseGET(getRecipeIDs, 'search.php?s=' + searched); // name
  responseGET(getRecipeIDs, 'filter.php?i=' + searched); // ingredient
  responseGET(getRecipeIDs, 'filter.php?a=' + searched); // area
  responseGET(getRecipeIDs, 'filter.php?c=' + searched); // category
});

userDisplay.addEventListener('click', function (event) {
  if (event.target.matches('.bookmark')) {
    handleBookmark(event.target);
  } else if (event.target.matches('.loved')) {
    handleHeart(event.target);
  } else if (event.target.closest('.recipe-thumb') !== null) {
    clearPrevoiousRecipe();
    viewSwap('fullRecipe');
    getWholeRecipe(event.target.closest('.recipe-thumb').getAttribute('id'));
  }

});

function loadInList(pullFrom, appendTo) {
  if (pullFrom.length === 0) {
    return;
  } else {
    if (appendTo.firstElementChild.matches('.full-center')) {
      appendTo.firstElementChild.remove();
    }
  }
  for (var i = 0; i < pullFrom.length; i++) {
    appendTo.append(generateThumb(pullFrom[i]));
  }
}

function viewSwap(location) {
  data.currentPage = location;
  for (var i = 0; i < allViews.length; i++) {
    if (allViews[i].getAttribute('data-view') !== location) {
      if (!allViews[i].matches('.hidden')) {
        allViews[i].className = allViews[i].className.replace('view', 'view hidden');
      }
    } else {
      allViews[i].className = allViews[i].className.replace('view hidden', 'view');
    }
  }

  if (location !== 'searched') {
    $pageTitle.className = $pageTitle.className.replace('view hidden', 'view');
    if (location.match('bookmarked') !== null) {
      $pageTitle.firstElementChild.textContent = 'My Bookmarks';
    } else if (location.match('loved') !== null) {
      $pageTitle.firstElementChild.textContent = 'My Favorites';
    } else if (location.match('fullRecipe') !== null) {
      $pageTitle.firstElementChild.textContent = 'Recipe:';
    }
  }
  $select.selectedIndex = 0;
}

function generateStorage(target) {
  var currentThumb = target.closest('.recipe-thumb');
  if (data.currentDB === 'Meals') {
    var fullData = [{
      idMeal: currentThumb.closest('.recipe-thumb').getAttribute('id'),
      strMealThumb: currentThumb.firstElementChild.firstElementChild.getAttribute('src'),
      strMeal: currentThumb.children[1].firstElementChild.textContent,
      strArea: currentThumb.children[1].children[1].lastElementChild.textContent,
      strCategory: currentThumb.children[1].children[2].lastElementChild.textContent
    }];
  } else {
    fullData = [{
      idDrink: currentThumb.closest('.recipe-thumb').getAttribute('id'),
      strDrinkThumb: currentThumb.firstElementChild.firstElementChild.getAttribute('src'),
      strDrink: currentThumb.children[1].firstElementChild.textContent,
      strCategory: currentThumb.children[1].children[1].lastElementChild.textContent,
      strAlcoholic: currentThumb.children[1].children[2].lastElementChild.textContent
    }];
  }
  return fullData;
}

function updateHeartIcon(newImgURL, thumbID) {
  for (var i = 0; i < userDisplay.children.length; i++) {
    for (var j = 0; j < userDisplay.children[i].children.length; j++) {
      if (userDisplay.children[i].children[j].getAttribute('id') === thumbID) {
        userDisplay.children[i].children[j].lastChild.lastChild.firstChild.setAttribute('src', newImgURL);
      }
    }
  }
}

function handleHeart(target) {
  var page = 'Meal';
  var currentThumbID = target.closest('.recipe-thumb').getAttribute('id');
  if (data.currentDB === 'Meals') {
    var destination = $lovedMeals;
    var storageThumb = data.lovedMealThumbs;
  } else {
    page = 'Drink';
    destination = $lovedDrinks;
    storageThumb = data.lovedDrinkThumbs;
  }
  if (target.getAttribute('src') === 'images/Empty_Heart.svg') {
    const targetData = generateStorage(target);
    storageThumb.unshift(targetData);

    if (destination.firstElementChild.matches('.full-center')) {
      destination.firstElementChild.remove();
    }
    data['loved' + data.currentDB].push(currentThumbID);
    const clone = target.closest('.recipe-thumb').cloneNode(true);
    destination.prepend(clone);
    updateHeartIcon('images/Filled_Heart.svg', currentThumbID);
    return;
  }
  for (var i = 0; i < storageThumb.length; i++) {
    if (storageThumb[i][0]['id' + page] === currentThumbID) {
      storageThumb.splice(i, 1);
      break;
    }
  }
  var position = data['loved' + data.currentDB].indexOf(currentThumbID);
  data['loved' + data.currentDB].splice(position, 1);
  for (i = 0; i < destination.children.length; i++) {
    if (destination.children[i].getAttribute('id') === currentThumbID) {
      destination.children[i].remove();
      break;
    }
  }
  updateHeartIcon('images/Empty_Heart.svg', currentThumbID);
  if (destination.children.length === 0) {
    destination.append(nothingSaved(destination));
  }
}

function updateBookIcon(newImgURL, thumbID) {
  for (var i = 0; i < userDisplay.children.length; i++) {
    for (var j = 0; j < userDisplay.children[i].children.length; j++) {
      if (userDisplay.children[i].children[j].getAttribute('id') === thumbID) {
        userDisplay.children[i].children[j].lastChild.firstChild.firstChild.setAttribute('src', newImgURL);
      }
    }
  }
}

function handleBookmark(target) {
  var page = 'Meal';
  var currentThumbID = target.closest('.recipe-thumb').getAttribute('id');
  if (data.currentDB === 'Meals') {
    var destination = $bookmarkedMeals;
    var storageThumb = data.bookMealThumbs;
  } else {
    page = 'Drink';
    destination = $bookmarkedDrinks;
    storageThumb = data.bookDrinkThumbs;
  }
  if (target.getAttribute('src') === 'images/Empty_Bookmark.svg') {
    var targetData = generateStorage(target);
    storageThumb.unshift(targetData);
    if (destination.firstElementChild.matches('.full-center')) {
      destination.firstElementChild.remove();
    }
    data['bookmarked' + data.currentDB].push(currentThumbID);
    var clone = target.closest('.recipe-thumb').cloneNode(true);
    destination.prepend(clone);
    updateBookIcon('images/Checked_BookMark.svg', currentThumbID);
    return;
  }
  for (var i = 0; i < storageThumb.length; i++) {
    if (storageThumb[i][0]['id' + page] === currentThumbID) {
      storageThumb.splice(i, 1);
      break;
    }
  }
  var position = data['bookmarked' + data.currentDB].indexOf(currentThumbID);
  data['bookmarked' + data.currentDB].splice(position, 1);
  for (i = 0; i < destination.children.length; i++) {
    if (destination.children[i].getAttribute('id') === currentThumbID) {
      destination.children[i].remove();
      break;
    }
  }
  updateBookIcon('images/Empty_Bookmark.svg', currentThumbID);
  if (destination.children.length === 0) {
    destination.append(nothingSaved(destination));
  }
}

function nothingSaved(location) {
  const page = location.id.includes('Meals') ? 'meals' : 'drinks';
  const none = document.createElement('div');
  none.className = 'full-center';
  const $h4 = document.createElement('h4');
  $h4.className = `${page} full-center`;
  $h4.textContent = 'You have nothing stored in this page. Try Bookmarking or hitting the Love button on some recipes.';
  none.append($h4);
  return none;
}

function responseGET(neededFunction, callTail) {
  if (data.currentDB === 'Meals') {
    var URL = 'https://www.themealdb.com/api/json/v1/1/' + callTail;
    var page = 'meals';
  } else {
    URL = 'https://www.thecocktaildb.com/api/json/v1/1/' + callTail;
    page = 'drinks';
  }
  var xhr = new XMLHttpRequest();
  xhr.open('GET', URL);
  xhr.responseType = 'json';
  xhr.addEventListener('load', function () {
    searchCount--;
    if (xhr.response && xhr.response[page] !== null) {
      var product = neededFunction(xhr.response[page]);
      if (typeof product === 'object' && product.matches('.to-DOM')) {
        gallery.appendChild(product);
      }
    }
    if (searchCount === 0) {
      postSearch();
    }
  });
  xhr.send();
}

function postSearch() {
  if (data['searched' + data.currentDB].length === 0) {
    gallery.append(noResults());
    return;
  }

  for (var i = data['searched' + data.currentDB].length - 1; i > 0; i--) {
    if (data['searched' + data.currentDB].lastIndexOf(data['searched' + data.currentDB][i], i - 1) > -1) {
      data['searched' + data.currentDB].splice(i, 1);
    }
  }

  for (i = 0; i < data['searched' + data.currentDB].length; i++) {
    responseGET(generateThumb, 'lookup.php?i=' + data['searched' + data.currentDB][i]);
  }
}

function generateThumb(response) {
  var recipeObject = response[0];
  var page = data.currentDB.substring(0, data.currentDB.length - 1);
  var bookmark = 'images/Empty_Bookmark.svg';
  if (data['bookmarked' + data.currentDB].indexOf(recipeObject['id' + page]) >= 0) { bookmark = 'images/Checked_Bookmark.svg'; }
  var heart = 'images/Empty_Heart.svg';
  if (data['loved' + data.currentDB].indexOf(recipeObject['id' + page]) >= 0) { heart = 'images/Filled_Heart.svg'; }

  var $recipeThumb = document.createElement('div');
  $recipeThumb.className = 'to-DOM swap recipe-thumb ' + page.toLowerCase() + '-border';
  $recipeThumb.setAttribute('data-view', 'fullRecipe');
  $recipeThumb.setAttribute('id', recipeObject['id' + page]);

  var $leftImg = document.createElement('div');
  $leftImg.className = 'left-img thumb-padding';
  var $itemThumb = document.createElement('img');
  $itemThumb.className = 'img-thumb';
  $itemThumb.setAttribute('alt', 'picture of ' + page.toLowerCase());
  $itemThumb.setAttribute('src', recipeObject['str' + page + 'Thumb']);
  $leftImg.appendChild($itemThumb);

  var $centerBrief = document.createElement('div');
  $centerBrief.className = 'center-brief thumb-padding';
  var $dishName = document.createElement('h2');
  $dishName.textContent = recipeObject['str' + page];
  $dishName.className = 'marg-btm-1rem';
  var $subTitle1 = document.createElement('p');
  var $describe1 = document.createElement('i');
  var $subTitle2 = document.createElement('p');
  var $describe2 = document.createElement('i');
  if (data.currentDB === 'Meals') {
    $subTitle1.textContent = 'Origin: ';
    $describe1.textContent = recipeObject.strArea;
    $subTitle2.textContent = 'Category: ';
    $describe2.textContent = recipeObject.strCategory;
  } else {
    $subTitle1.textContent = 'Category: ';
    $describe1.textContent = recipeObject.strCategory;
    $subTitle2.textContent = 'Type: ';
    $describe2.textContent = recipeObject.strAlcoholic;
  }
  $subTitle1.appendChild($describe1);
  $subTitle2.appendChild($describe2);
  $centerBrief.append($dishName, $subTitle1, $subTitle2);

  var $rightbtns = document.createElement('div');
  $rightbtns.className = 'right-bookmark';
  var $bookmarkBtn = document.createElement('button');
  $bookmarkBtn.className = 'click bookmark-trigger seamless-btn';
  var $bookmark = document.createElement('img');
  $bookmark.setAttribute('src', bookmark);
  $bookmark.setAttribute('alt', 'Bookmark');
  $bookmark.className = 'full-center bookmark';
  $bookmarkBtn.append($bookmark);
  var $lovedBtn = document.createElement('button');
  $lovedBtn.className = 'click loved-trigger seamless-btn';
  var $loved = document.createElement('img');
  $loved.className = 'full-center loved';
  $loved.setAttribute('src', heart);
  $loved.setAttribute('alt', 'Love');
  $lovedBtn.append($loved);
  $rightbtns.append($bookmarkBtn, $lovedBtn);

  $recipeThumb.append($leftImg, $centerBrief, $rightbtns);
  return $recipeThumb;
}

function getRecipeIDs(response) {
  var page = data.currentDB.substring(0, data.currentDB.length - 1);
  for (var i = 0; i < response.length; i++) {
    if (response[i]['id' + page] !== undefined) {
      data['searched' + data.currentDB].push(response[i]['id' + page]);
    }
  }
}

function clearGallery() {
  while (gallery.firstChild) {
    gallery.removeChild(gallery.firstChild);
  }
}

function toggleDB(currentDB) {
  if (currentDB === 'Drinks') {
    $body.classList.replace('meal-background', 'drink-background');
    editNavBtns('Meals', 'Drinks');
    toggleColors('green', 'purple', 'meal-search', 'drink-search');
    toggleTouchUp('meals', 'drinks', 'purple', 'green', 'Meals', 'images/Spy_Glass_White.svg');
    toggleRecipePage('meal-border', 'drink-border');
  } else {
    $body.classList.replace('drink-background', 'meal-background');
    editNavBtns('Drinks', 'Meals');
    toggleColors('purple', 'green', 'drink-search', 'meal-search');
    toggleTouchUp('drinks', 'meals', 'green', 'purple', 'Drinks', 'images/Spy_Glass.svg');
    toggleRecipePage('drink-border', 'meal-border');
  }
  pageTitle.textContent = data.currentDB;
}

function toggleRecipePage(oldPageBorders, newPageBorders) {
  allRecipeBubbles.forEach(node => {
    node.classList.replace(oldPageBorders, newPageBorders);
  });
}

function editNavBtns(oldValue, newValue) {
  for (var i = 0; i < $navSwappers.length; i++) {
    $navSwappers[i].setAttribute('data-view', $navSwappers[i].getAttribute('data-view').replace(oldValue, newValue));
    if ($navSwappers[i].nodeName === 'OPTION') {
      $navSwappers[i].setAttribute('value', $navSwappers[i].getAttribute('value').replace(oldValue, newValue));
    }
  }
}

function toggleTouchUp(oldlcDB, newlcDB, oldColor, newColor, newUcDB, imgURL) {
  $pageTitle.className = $pageTitle.className.replace(oldlcDB, newlcDB);
  $toggleBtn.classList.replace(oldColor, newColor);
  $toggleBtn.textContent = newUcDB;
  $searchImg.setAttribute('src', imgURL);
}

function toggleColors(oldColor, newColor, oldBorder, newBorder) {
  for (var i = 0; i < $uniformColor.length; i++) {
    $uniformColor[i].classList.replace(oldColor, newColor);
    $searchBar.children[i].classList.replace(oldBorder, newBorder);
  }
}

function noResults() {
  var none = document.createElement('div');
  none.className = data.currentDB.substr(0, data.currentDB.length - 1).toLowerCase() + '-border justify-center full-center flex';
  var $thumb = document.createElement('div');
  $thumb.className = 'thumb-padding';
  var $h4 = document.createElement('h4');
  $h4.textContent = 'Hmm, No Results';
  var $h5A = document.createElement('h5');
  $h5A.textContent = 'The top right button toggles between Drinks or Meals.';
  var $h5B = document.createElement('h5');
  $h5B.textContent = 'Find Meals or Drinks by Name or Main Ingredient.';
  var $h5C = document.createElement('h5');
  $h5C.textContent = 'Find Meals from many Nationalities.';
  var $h5D = document.createElement('h5');
  $h5D.textContent = 'Search Drinks by Alcoholic or Non Alcoholic.';
  $thumb.append($h4, $h5A, $h5B, $h5C, $h5D);
  none.append($thumb);
  return none;
}

function clearPrevoiousRecipe() {
  recipeImg.setAttribute('src', 'https://cdn.dribbble.com/users/2140642/screenshots/4301537/rodrigosloader.gif');
  while (recipeInfo.firstChild) {
    recipeInfo.removeChild(recipeInfo.firstChild);
  }
  while (ingredients.firstChild) {
    ingredients.removeChild(ingredients.firstChild);
  }
  instructions.textContent = '';
}

const getWholeRecipe = id => {
  let URL = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
  let propInResponse = 'meals';
  if (data.currentDB === 'Drinks') {
    URL = `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`;
    propInResponse = 'drinks';
  }
  var xhr = new XMLHttpRequest();
  xhr.open('GET', URL);
  xhr.responseType = 'json';
  xhr.addEventListener('load', function () {
    data.currentRecipe = xhr.response[propInResponse][0];
    getIngredients(data.currentRecipe);
    recipeDataInject(data.currentRecipe);
  });
  xhr.send();
};

function getIngredients(recipe) {
  const fullIngredients = [];
  let i = 1;
  while (recipe[`strIngredient${i}`]) {
    if (!recipe[`strMeasure${i}`]) { recipe[`strMeasure${i}`] = 'To taste'; }
    fullIngredients.push({ ingredient: recipe[`strIngredient${i}`], quantity: recipe[`strMeasure${i}`] });
    i++;
  }
  data.currentRecipe.fullIngredients = fullIngredients;
}

function recipeDataInject(recipe) {
  let page = 'Meal';
  let thumbShortcut = [{
    idMeal: recipe.idMeal,
    strArea: recipe.strArea,
    strCategory: recipe.strCategory,
    strMeal: recipe.strMeal,
    strMealThumb: recipe.strMealThumb
  }];
  if (data.currentDB === 'Drinks') {
    page = 'Drink';
    thumbShortcut = [{
      idDrink: recipe.idDrink,
      strAlcoholic: recipe.strAlcoholic,
      strCategory: recipe.strCategory,
      strDrink: recipe.strDrink,
      strDrinkThumb: recipe.strDrinkThumb
    }];
    var recipeType = document.createElement('h3');
    recipeType.textContent = 'Type: ';
    var iDrinkType = document.createElement('i');
    iDrinkType.textContent = recipe.strAlcoholic;
    recipeType.appendChild(iDrinkType);
    recipeType.className = 'marg-btm-1rem';

    var glassType = document.createElement('h3');
    glassType.textContent = 'Glass Type: ';
    var iGlass = document.createElement('i');
    iGlass.textContent = recipe.strGlass;
    glassType.appendChild(iGlass);
    glassType.className = 'marg-btm-1rem';

    recipeInfo.append(recipeType, glassType);
  } else {
    var recipeOrigin = document.createElement('h3');
    recipeOrigin.textContent = 'Origin: ';
    var iOrigin = document.createElement('i');
    iOrigin.textContent = recipe.strArea;
    recipeOrigin.appendChild(iOrigin);
    recipeOrigin.className = 'marg-btm-1rem';

    var recipeYouTube = document.createElement('h3');
    recipeYouTube.textContent = 'YouTube Tutorial: ';
    recipeYouTube.className = 'marg-btm-1rem';
    var aYoutube = document.createElement('a');
    aYoutube.className = 'youtube-link';
    aYoutube.setAttribute('href', recipe.strYoutube);
    aYoutube.setAttribute('target', '_blank');
    recipeYouTube.appendChild(aYoutube);
    var linkBtn = document.createElement('i');
    linkBtn.textContent = 'Link';
    linkBtn.className = 'font-up-rem';
    aYoutube.appendChild(linkBtn);

    recipeInfo.append(recipeOrigin, recipeYouTube);
  }
  const recipeId = recipe[`id${page}`];

  var categroy = document.createElement('h3');
  categroy.textContent = 'Category: ';
  var iCategory = document.createElement('i');
  iCategory.textContent = recipe.strCategory;
  categroy.appendChild(iCategory);
  categroy.className = 'marg-btm-1rem';

  var recipeName = document.createElement('h1');
  recipeName.textContent = recipe[`str${page}`];
  recipeName.className = 'marg-btm-1rem';
  recipeInfo.prepend(recipeName, categroy);
  recipeImg.setAttribute('src', recipe[`str${page}Thumb`]);
  const buttonHolder = document.createElement('div');
  buttonHolder.className = 'full-width flex space-evenly';
  const heartImg = document.createElement('img');
  heartImg.addEventListener('click', () => {
    const location = page === 'Meal' ? $lovedMeals : $lovedDrinks;

    if (event.target.getAttribute('src') === 'images/Empty_Heart.svg') {
      event.target.setAttribute('src', 'images/Filled_Heart.svg');
      updateHeartIcon('images/Filled_Heart.svg', recipeId);
      data[`loved${data.currentDB}`].push(recipeId);
      const newThumb = generateThumb(thumbShortcut);
      data[`loved${page}Thumbs`].unshift(thumbShortcut);
      if (location.firstElementChild.matches('.full-center')) {
        location.firstElementChild.remove();
      }
      location.prepend(newThumb);
    } else {
      event.target.setAttribute('src', 'images/Empty_Heart.svg');
      updateHeartIcon('images/Empty_Heart.svg', recipeId);
      const indexToRm = data[`loved${data.currentDB}`].indexOf(recipeId);
      data[`loved${data.currentDB}`].splice(indexToRm, 1);
      for (let i = 0; i < data[`loved${page}Thumbs`].length; i++) {
        if (data[`loved${page}Thumbs`][i][0][`id${page}`] === recipeId) {
          data[`loved${page}Thumbs`].splice(i, 1);
          break;
        }
      }
      for (let i = 0; i < location.children.length; i++) {
        if (location.children[i].id === recipeId) {
          location.children[i].remove();
          if (location.children.length === 0) {
            location.appendChild(nothingSaved(location));
          }
          break;
        }
      }
    }
  });
  const bookmarkImg = document.createElement('img');
  bookmarkImg.addEventListener('click', () => {
    const location = page === 'Meal' ? $bookmarkedMeals : $bookmarkedDrinks;
    if (event.target.getAttribute('src') === 'images/Empty_Bookmark.svg') {
      event.target.setAttribute('src', 'images/Checked_BookMark.svg');
      updateBookIcon('images/Checked_BookMark.svg', recipeId);
      data[`bookmarked${data.currentDB}`].push(recipeId);
      const newThumb = generateThumb(thumbShortcut);
      data[`book${page}Thumbs`].unshift(thumbShortcut);
      if (location.firstElementChild.matches('.full-center')) {
        location.firstElementChild.remove();
      }
      location.prepend(newThumb);
    } else {
      event.target.setAttribute('src', 'images/Empty_Bookmark.svg');
      updateBookIcon('images/Empty_Bookmark.svg', recipeId);
      const indexToRm = data[`bookmarked${data.currentDB}`].indexOf(recipeId);
      data[`bookmarked${data.currentDB}`].splice(indexToRm, 1);
      for (let i = 0; i < data[`book${page}Thumbs`].length; i++) {
        if (data[`book${page}Thumbs`][i][0][`id${page}`] === recipeId) {
          data[`book${page}Thumbs`].splice(i, 1);
          break;
        }
      }
      for (let i = 0; i < location.children.length; i++) {
        if (location.children[i].id === recipeId) {
          location.children[i].remove();
          if (location.children.length === 0) {
            location.appendChild(nothingSaved(location));
          }
          break;
        }
      }
    }
  });

  let heartImgUrl = 'images/Empty_Heart.svg';
  if (data[`loved${data.currentDB}`].includes(recipeId)) {
    heartImgUrl = 'images/Filled_Heart.svg';
  }
  let bookmarkImgUrl = 'images/Empty_Bookmark.svg';
  if (data[`bookmarked${data.currentDB}`].includes(recipeId)) {
    bookmarkImgUrl = 'images/Checked_BookMark.svg';
  }

  heartImg.setAttribute('src', heartImgUrl);
  bookmarkImg.setAttribute('src', bookmarkImgUrl);
  buttonHolder.append(heartImg, bookmarkImg);

  recipeInfo.appendChild(buttonHolder);

  recipe.fullIngredients.forEach(pair => {
    const ingredientEl = document.createElement('p');
    ingredientEl.className = 'width-50-100';
    ingredientEl.textContent = `${pair.ingredient} - `;
    const ingredientQuan = document.createElement('i');
    ingredientQuan.textContent = pair.quantity;
    ingredientEl.appendChild(ingredientQuan);
    ingredients.appendChild(ingredientEl);
  });

  instructions.textContent = recipe.strInstructions;
}
