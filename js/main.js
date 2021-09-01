const $toggleBtn = document.querySelector('#toggle-Page');
const gallery = document.querySelector('#recipe-gallery');
const $lovedMeals = document.querySelector('#lovedMeals');
const $bookmarkedMeals = document.querySelector('#bookmarkedMeals');
const $lovedDrinks = document.querySelector('#lovedDrinks');
const $bookmarkedDrinks = document.querySelector('#bookmarkedDrinks');

const $navBar = document.querySelector('.nav-container');
const $uniformColor = document.querySelectorAll('.green');
const $body = document.querySelector('body');
const $searchBar = document.querySelector('.search-form');
let searchCount = 0;
const $searchInput = document.querySelector('.search-bar');
const $searchImg = document.querySelector('.spy');
const $pageTitle = document.querySelector('#title');
const $navSwappers = document.querySelectorAll('.nav-direct');
const allViews = document.querySelectorAll('.view');
const $select = document.querySelector('select');
const userDisplay = document.querySelector('.user-display');
const pageTitle = document.querySelector('#page-title');

const recipeImg = document.querySelector('#recipe-img');
const recipeInfo = document.querySelector('#recipe-info');
const ingredients = document.querySelector('#ingredients');
const instructions = document.querySelector('#instructions');
const allRecipeBubbles = document.querySelectorAll('.recipe-bubbles');

window.addEventListener('DOMContentLoaded', event => {
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

$select.addEventListener('change', event => {
  viewSwap(event.target.value);
});

$navBar.addEventListener('click', event => {
  event.preventDefault();

  if (event.target.matches('.large-btn')) {
    clearGallery();
    data.currentDB = data.currentDB === 'Meals' ? 'Drinks' : 'Meals';
    toggleDB(data.currentDB);
  }

  if (event.target.matches('.randomize')) {
    loading();
    viewSwap('searched');
    data[`searched${data.currentDB}`] = [];
    searchCount = 6;
    $searchBar.reset();
    let draws = 6;
    while (draws > 0) {
      responseGET(getRecipeIDs, 'random.php');
      draws--;
    }
  }

  if (event.target.matches('.swap')) {
    viewSwap(event.target.getAttribute('data-view'));
  }

});

$searchBar.addEventListener('submit', event => {
  event.preventDefault();
  data[`searched${data.currentDB}`] = [];
  let searched = $searchBar.elements.search.value.toLowerCase();
  if (searched.includes('non') && searched.includes('alcoholic')) { searched = 'non alcoholic'; }

  if (searched.length < 1) {
    clearGallery();
    gallery.append(noResults(true));
    return;
  } else if (searched.length < 2) {
    loading();
    searchCount = 1;
    responseGET(getRecipeIDs, 'search.php?f=' + searched);
    return;
  }
  loading();
  searchCount = 4;
  responseGET(getRecipeIDs, `search.php?s=${searched}`); // name
  responseGET(getRecipeIDs, `filter.php?i=${searched}`); // ingredient
  responseGET(getRecipeIDs, `filter.php?a=${searched}`); // area
  responseGET(getRecipeIDs, `filter.php?c=${searched}`); // category
});

userDisplay.addEventListener('click', event => {
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

const loading = () => {
  clearGallery();
  const $loadingBar = document.createElement('div');
  $loadingBar.className = 'full-center';
  const $dualRings = document.createElement('div');
  $dualRings.className = 'lds-dual-ring';
  $loadingBar.append($dualRings);
  gallery.append($loadingBar);
};

const loadInList = (pullFrom, appendTo) => {
  if (pullFrom.length === 0) {
    return;
  } else {
    if (appendTo.firstElementChild.matches('.full-center')) {
      appendTo.firstElementChild.remove();
    }
  }
  for (let i = 0; i < pullFrom.length; i++) {
    appendTo.append(generateThumb(pullFrom[i]));
  }
};

const viewSwap = location => {
  data.currentPage = location;
  for (let i = 0; i < allViews.length; i++) {
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
};

const generateStorage = target => {
  const currentThumb = target.closest('.recipe-thumb');
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
};

const updateHeartIcon = (newImgURL, thumbID) => {
  for (let i = 0; i < userDisplay.children.length; i++) {
    for (let j = 0; j < userDisplay.children[i].children.length; j++) {
      if (userDisplay.children[i].children[j].getAttribute('id') === thumbID) {
        userDisplay.children[i].children[j].lastChild.lastChild.firstChild.setAttribute('src', newImgURL);
      }
    }
  }
};

const handleHeart = target => {
  let page = 'Meal';
  const currentThumbID = target.closest('.recipe-thumb').getAttribute('id');
  if (data.currentDB === 'Meals') {
    var destination = $lovedMeals;
    var storageThumb = data.lovedMealThumbs;
  } else {
    page = 'Drink';
    destination = $lovedDrinks;
    storageThumb = data.lovedDrinkThumbs;
  }
  if (target.getAttribute('src') === 'images/empty-heart.svg') {
    const targetData = generateStorage(target);
    storageThumb.unshift(targetData);

    if (destination.firstElementChild.matches('.full-center')) {
      destination.firstElementChild.remove();
    }
    data['loved' + data.currentDB].push(currentThumbID);
    const clone = target.closest('.recipe-thumb').cloneNode(true);
    destination.prepend(clone);
    updateHeartIcon('images/filled-heart.svg', currentThumbID);
    return;
  }
  for (var i = 0; i < storageThumb.length; i++) {
    if (storageThumb[i][0]['id' + page] === currentThumbID) {
      storageThumb.splice(i, 1);
      break;
    }
  }
  const position = data['loved' + data.currentDB].indexOf(currentThumbID);
  data['loved' + data.currentDB].splice(position, 1);
  for (i = 0; i < destination.children.length; i++) {
    if (destination.children[i].getAttribute('id') === currentThumbID) {
      destination.children[i].remove();
      break;
    }
  }
  updateHeartIcon('images/empty-heart.svg', currentThumbID);
  if (destination.children.length === 0) {
    destination.append(nothingSaved(destination));
  }
};

const updateBookIcon = (newImgURL, thumbID) => {
  for (let i = 0; i < userDisplay.children.length; i++) {
    for (let j = 0; j < userDisplay.children[i].children.length; j++) {
      if (userDisplay.children[i].children[j].getAttribute('id') === thumbID) {
        userDisplay.children[i].children[j].lastChild.firstChild.firstChild.setAttribute('src', newImgURL);
      }
    }
  }
};

const handleBookmark = target => {
  let page = 'Meal';
  const currentThumbID = target.closest('.recipe-thumb').getAttribute('id');
  if (data.currentDB === 'Meals') {
    var destination = $bookmarkedMeals;
    var storageThumb = data.bookMealThumbs;
  } else {
    page = 'Drink';
    destination = $bookmarkedDrinks;
    storageThumb = data.bookDrinkThumbs;
  }
  if (target.getAttribute('src') === 'images/empty-bookmark.svg') {
    const targetData = generateStorage(target);
    storageThumb.unshift(targetData);
    if (destination.firstElementChild.matches('.full-center')) {
      destination.firstElementChild.remove();
    }
    data['bookmarked' + data.currentDB].push(currentThumbID);
    const clone = target.closest('.recipe-thumb').cloneNode(true);
    destination.prepend(clone);
    updateBookIcon('images/checked-bookmark.svg', currentThumbID);
    return;
  }
  for (var i = 0; i < storageThumb.length; i++) {
    if (storageThumb[i][0]['id' + page] === currentThumbID) {
      storageThumb.splice(i, 1);
      break;
    }
  }
  const position = data['bookmarked' + data.currentDB].indexOf(currentThumbID);
  data['bookmarked' + data.currentDB].splice(position, 1);
  for (i = 0; i < destination.children.length; i++) {
    if (destination.children[i].getAttribute('id') === currentThumbID) {
      destination.children[i].remove();
      break;
    }
  }
  updateBookIcon('images/empty-bookmark.svg', currentThumbID);
  if (destination.children.length === 0) {
    destination.append(nothingSaved(destination));
  }
};

const nothingSaved = location => {
  const page = location.id.includes('Meals') ? 'meals' : 'drinks';
  const none = document.createElement('div');
  none.className = 'full-center';
  const $h4 = document.createElement('h4');
  $h4.className = `${page} full-center`;
  $h4.textContent = 'You have nothing stored in this page. Try Bookmarking or hitting the Love button on some recipes.';
  none.append($h4);
  return none;
};

const responseGET = (neededFunction, callTail) => {
  if (!navigator.onLine) {
    connectionError();
    return;
  }
  const page = data.currentDB.toLocaleLowerCase();
  const url = data.currentDB === 'Meals' ? `https://www.themealdb.com/api/json/v1/1/${callTail}` : `https://www.thecocktaildb.com/api/json/v1/1/${callTail}`;

  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.responseType = 'json';
  xhr.addEventListener('load', function () {
    searchCount--;
    if (xhr.response && xhr.response[page] !== null) {
      const product = neededFunction(xhr.response[page]);
      if (typeof product === 'object' && product.matches('.to-DOM')) {
        gallery.appendChild(product);
      }
    }
    if (searchCount === 0) {
      postSearch();
    }
  });
  xhr.send();
};

const connectionError = () => {
  clearGallery();
  const ConnectionError = document.createElement('div');
  ConnectionError.className = data.currentDB.substr(0, data.currentDB.length - 1).toLowerCase() + '-border justify-center full-center flex';
  const $thumb = document.createElement('div');
  $thumb.className = 'thumb-padding';
  const $h4 = document.createElement('h5');
  $h4.textContent = 'Sorry, there was an error connecting to the network! Please check your internet connection.';
  $thumb.append($h4);
  ConnectionError.append($thumb);
  gallery.append(ConnectionError);
};

const postSearch = () => {
  clearGallery();
  if (data[`searched${data.currentDB}`].length === 0) {
    gallery.append(noResults(true));
    return;
  }

  for (var i = data[`searched${data.currentDB}`].length - 1; i > 0; i--) {
    if (data[`searched${data.currentDB}`].lastIndexOf(data['searched' + data.currentDB][i], i - 1) > -1) {
      data[`searched${data.currentDB}`].splice(i, 1);
    }
  }

  for (i = 0; i < data[`searched${data.currentDB}`].length; i++) {
    responseGET(generateThumb, 'lookup.php?i=' + data['searched' + data.currentDB][i]);
  }
};

const generateThumb = response => {
  const recipeObject = response[0];
  const page = data.currentDB.substring(0, data.currentDB.length - 1);
  let bookmark = 'images/empty-bookmark.svg';
  if (data[`bookmarked${data.currentDB}`].indexOf(recipeObject[`id${page}`]) >= 0) { bookmark = 'images/checked-bookmark.svg'; }
  let heart = 'images/empty-heart.svg';
  if (data[`loved${data.currentDB}`].indexOf(recipeObject[`id${page}`]) >= 0) { heart = 'images/filled-heart.svg'; }

  const $recipeThumb = document.createElement('div');
  $recipeThumb.className = `to-DOM swap recipe-thumb pointer ${page.toLowerCase()}-border`;
  $recipeThumb.setAttribute('data-view', 'fullRecipe');
  $recipeThumb.setAttribute('id', recipeObject[`id${page}`]);

  const $leftImg = document.createElement('div');
  $leftImg.className = 'left-img thumb-padding';
  const $itemThumb = document.createElement('img');
  $itemThumb.className = 'img-thumb';
  $itemThumb.setAttribute('alt', `picture of ${page.toLowerCase()}`);
  $itemThumb.setAttribute('src', recipeObject[`str${page}Thumb`]);
  $leftImg.appendChild($itemThumb);

  const $centerBrief = document.createElement('div');
  $centerBrief.className = 'center-brief thumb-padding';
  const $dishName = document.createElement('h2');
  $dishName.textContent = recipeObject[`str${page}`];
  $dishName.className = 'margin-btm-half lato';
  const $subTitle1 = document.createElement('p');
  const $describe1 = document.createElement('i');
  $subTitle1.className = 'text-ellipsis';
  const $subTitle2 = document.createElement('p');
  const $describe2 = document.createElement('i');
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

  const $rightbtns = document.createElement('div');
  $rightbtns.className = 'right-bookmark';
  const $bookmarkBtn = document.createElement('button');
  $bookmarkBtn.className = 'click bookmark-trigger seamless-btn';
  const $bookmark = document.createElement('img');
  $bookmark.setAttribute('src', bookmark);
  $bookmark.setAttribute('alt', 'Bookmark');
  $bookmark.className = 'full-center bookmark';
  $bookmarkBtn.append($bookmark);
  const $lovedBtn = document.createElement('button');
  $lovedBtn.className = 'click loved-trigger seamless-btn';
  const $loved = document.createElement('img');
  $loved.className = 'full-center loved';
  $loved.setAttribute('src', heart);
  $loved.setAttribute('alt', 'Love');
  $lovedBtn.append($loved);
  $rightbtns.append($bookmarkBtn, $lovedBtn);

  $recipeThumb.append($leftImg, $centerBrief, $rightbtns);
  return $recipeThumb;
};

const getRecipeIDs = response => {
  const page = data.currentDB.substring(0, data.currentDB.length - 1);
  for (let i = 0; i < response.length; i++) {
    if (response[i][`id${page}`] !== undefined) {
      data[`searched${data.currentDB}`].push(response[i][`id${page}`]);
    }
  }
};

const clearGallery = () => {
  while (gallery.firstChild) {
    gallery.removeChild(gallery.firstChild);
  }
};

const toggleDB = currentDB => {
  if (currentDB === 'Drinks') {
    $body.classList.replace('meal-background', 'drink-background');
    editNavBtns('Meals', 'Drinks');
    toggleColors('green', 'purple', 'meal-search', 'drink-search');
    toggleTouchUp('meals', 'drinks', 'purple', 'green', 'Meals', 'images/spy-glass-white.svg');
    toggleRecipePage('meal-border', 'drink-border');
  } else {
    $body.classList.replace('drink-background', 'meal-background');
    editNavBtns('Drinks', 'Meals');
    toggleColors('purple', 'green', 'drink-search', 'meal-search');
    toggleTouchUp('drinks', 'meals', 'green', 'purple', 'Drinks', 'images/spy-glass-black.svg');
    toggleRecipePage('drink-border', 'meal-border');
  }
  gallery.append(noResults(false));
  pageTitle.textContent = currentDB;
  $searchInput.setAttribute('placeholder', `Search ${currentDB}`);
};

const toggleRecipePage = (oldPageBorders, newPageBorders) => {
  allRecipeBubbles.forEach(node => {
    node.classList.replace(oldPageBorders, newPageBorders);
  });
};

const editNavBtns = (oldValue, newValue) => {
  for (let i = 0; i < $navSwappers.length; i++) {
    $navSwappers[i].setAttribute('data-view', $navSwappers[i].getAttribute('data-view').replace(oldValue, newValue));
    if ($navSwappers[i].nodeName === 'OPTION') {
      $navSwappers[i].setAttribute('value', $navSwappers[i].getAttribute('value').replace(oldValue, newValue));
    }
  }
};

const toggleTouchUp = (oldlcDB, newlcDB, oldColor, newColor, newUcDB, imgURL) => {
  $pageTitle.className = $pageTitle.className.replace(oldlcDB, newlcDB);
  $toggleBtn.classList.replace(oldColor, newColor);
  $toggleBtn.textContent = newUcDB;
  $searchImg.setAttribute('src', imgURL);
};

const toggleColors = (oldColor, newColor, oldBorder, newBorder) => {
  for (let i = 0; i < $uniformColor.length; i++) {
    $uniformColor[i].classList.replace(oldColor, newColor);
    $searchBar.children[i].classList.replace(oldBorder, newBorder);
  }
};

const noResults = test => {
  const none = document.createElement('div');
  none.className = data.currentDB.substr(0, data.currentDB.length - 1).toLowerCase() + '-border justify-center full-center flex';
  const $thumb = document.createElement('div');
  $thumb.className = 'thumb-padding';
  if (test) {
    const $h4 = document.createElement('h4');
    $h4.textContent = 'Hmm, No Results';
    $thumb.append($h4);
  }
  const $h5A = document.createElement('h5');
  $h5A.textContent = 'The top right button switches between searching for Drinks or Meals.';
  const $h5B = document.createElement('h5');
  $h5B.textContent = 'Search Meals or Drinks by Name or Main Ingredient.';
  const $h5C = document.createElement('h5');
  $h5C.textContent = 'Search Meals from many Nationalities.';
  const $h5D = document.createElement('h5');
  $h5D.textContent = 'Search Drinks by Alcoholic or Non Alcoholic.';
  $thumb.append($h5A, $h5B, $h5C, $h5D);
  none.append($thumb);
  return none;
};

const clearPrevoiousRecipe = () => {
  recipeImg.setAttribute('src', 'https://cdn.dribbble.com/users/2140642/screenshots/4301537/rodrigosloader.gif');
  while (recipeInfo.firstChild) {
    recipeInfo.removeChild(recipeInfo.firstChild);
  }
  while (ingredients.firstChild) {
    ingredients.removeChild(ingredients.firstChild);
  }
  instructions.textContent = '';
};

const getWholeRecipe = id => {
  if (!navigator.onLine) {
    viewSwap('searched');
    connectionError();
    return;
  }
  let url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
  let propInResponse = 'meals';
  if (data.currentDB === 'Drinks') {
    url = `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`;
    propInResponse = 'drinks';
  }
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.responseType = 'json';
  xhr.addEventListener('load', function () {
    data.currentRecipe = xhr.response[propInResponse][0];
    getIngredients(data.currentRecipe);
    recipeDataInject(data.currentRecipe);
  });
  xhr.send();
};

const getIngredients = recipe => {
  const fullIngredients = [];
  let i = 1;
  while (recipe[`strIngredient${i}`]) {
    if (!recipe[`strMeasure${i}`]) { recipe[`strMeasure${i}`] = 'To taste'; }
    fullIngredients.push({ ingredient: recipe[`strIngredient${i}`], quantity: recipe[`strMeasure${i}`] });
    i++;
  }
  data.currentRecipe.fullIngredients = fullIngredients;
};

const recipeDataInject = recipe => {
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
    const recipeType = document.createElement('h3');
    recipeType.textContent = 'Type: ';
    const iDrinkType = document.createElement('i');
    iDrinkType.textContent = recipe.strAlcoholic;
    recipeType.appendChild(iDrinkType);
    recipeType.className = 'marg-btm-1rem';

    const glassType = document.createElement('h3');
    glassType.textContent = 'Glass Type: ';
    const iGlass = document.createElement('i');
    iGlass.textContent = recipe.strGlass;
    glassType.appendChild(iGlass);
    glassType.className = 'marg-btm-1rem';

    recipeInfo.append(recipeType, glassType);
  } else {
    const recipeOrigin = document.createElement('h3');
    recipeOrigin.textContent = 'Origin: ';
    const iOrigin = document.createElement('i');
    iOrigin.textContent = recipe.strArea;
    recipeOrigin.appendChild(iOrigin);
    recipeOrigin.className = 'marg-btm-1rem';

    const recipeYouTube = document.createElement('h3');
    recipeYouTube.textContent = 'YouTube Tutorial: ';
    recipeYouTube.className = 'marg-btm-1rem';
    const aYoutube = document.createElement('a');
    aYoutube.className = 'youtube-link';
    aYoutube.setAttribute('href', recipe.strYoutube);
    aYoutube.setAttribute('target', '_blank');
    recipeYouTube.appendChild(aYoutube);
    const linkBtn = document.createElement('i');
    linkBtn.textContent = 'Link';
    linkBtn.className = 'font-up-rem';
    aYoutube.appendChild(linkBtn);

    recipeInfo.append(recipeOrigin, recipeYouTube);
  }
  const recipeId = recipe[`id${page}`];

  const categroy = document.createElement('h3');
  categroy.textContent = 'Category: ';
  const iCategory = document.createElement('i');
  iCategory.textContent = recipe.strCategory;
  categroy.appendChild(iCategory);
  categroy.className = 'marg-btm-1rem';

  const recipeName = document.createElement('h1');
  recipeName.textContent = recipe[`str${page}`];
  recipeName.className = 'marg-btm-1rem';
  recipeInfo.prepend(recipeName, categroy);
  recipeImg.setAttribute('src', recipe[`str${page}Thumb`]);
  const buttonHolder = document.createElement('div');
  buttonHolder.className = 'flex space-evenly';
  const heartImg = document.createElement('img');
  heartImg.className = 'click';
  heartImg.addEventListener('click', () => {
    const location = page === 'Meal' ? $lovedMeals : $lovedDrinks;

    if (event.target.getAttribute('src') === 'images/empty-heart.svg') {
      event.target.setAttribute('src', 'images/filled-heart.svg');
      updateHeartIcon('images/filled-heart.svg', recipeId);
      data[`loved${data.currentDB}`].push(recipeId);
      const newThumb = generateThumb(thumbShortcut);
      data[`loved${page}Thumbs`].unshift(thumbShortcut);
      if (location.firstElementChild.matches('.full-center')) {
        location.firstElementChild.remove();
      }
      location.prepend(newThumb);
    } else {
      event.target.setAttribute('src', 'images/empty-heart.svg');
      updateHeartIcon('images/empty-heart.svg', recipeId);
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
  bookmarkImg.className = 'click';
  bookmarkImg.addEventListener('click', () => {
    const location = page === 'Meal' ? $bookmarkedMeals : $bookmarkedDrinks;
    if (event.target.getAttribute('src') === 'images/empty-bookmark.svg') {
      event.target.setAttribute('src', 'images/checked-bookmark.svg');
      updateBookIcon('images/checked-bookmark.svg', recipeId);
      data[`bookmarked${data.currentDB}`].push(recipeId);
      const newThumb = generateThumb(thumbShortcut);
      data[`book${page}Thumbs`].unshift(thumbShortcut);
      if (location.firstElementChild.matches('.full-center')) {
        location.firstElementChild.remove();
      }
      location.prepend(newThumb);
    } else {
      event.target.setAttribute('src', 'images/empty-bookmark.svg');
      updateBookIcon('images/empty-bookmark.svg', recipeId);
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

  let heartImgUrl = 'images/empty-heart.svg';
  if (data[`loved${data.currentDB}`].includes(recipeId)) {
    heartImgUrl = 'images/filled-heart.svg';
  }
  let bookmarkImgUrl = 'images/empty-bookmark.svg';
  if (data[`bookmarked${data.currentDB}`].includes(recipeId)) {
    bookmarkImgUrl = 'images/checked-bookmark.svg';
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
};
