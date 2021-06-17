// this will reset the dropdown to "My Lists"
// $select.selectedIndex = 0

var $toggleBtn = document.querySelector('#toggle-Page');
var gallery = document.querySelector('#recipe-gallery');
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

window.addEventListener('DOMContentLoaded', function (event) {
  toggleDB(data.currentDB);

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
      $pageTitle.firstElementChild.textContent = 'This will be the name of the recipe';
    }
  }
}

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

gallery.addEventListener('click', function (event) {
  if (event.target.matches('.bookmark')) {
    handleBookmark(event.target);
  }
  if (event.target.matches('.loved')) {
    handleHeart(event.target);
  }

});

function handleBookmark(target) {
  var currentThumb = target.closest('.recipe-thumb').getAttribute('id');
  if (target.getAttribute('src') === 'images/Empty_Bookmark.svg') {
    target.setAttribute('src', 'images/Checked_BookMark.svg');
    data['bookmarked' + data.currentDB].push(currentThumb);
    return;
  }
  target.setAttribute('src', 'images/Empty_Bookmark.svg');
  var position = data['bookmarked' + data.currentDB].indexOf(currentThumb);
  data['bookmarked' + data.currentDB].splice(position, 1);
}

function handleHeart(target) {
  var currentThumb = target.closest('.recipe-thumb').getAttribute('id');
  if (target.getAttribute('src') === 'images/Empty_Heart.svg') {
    target.setAttribute('src', 'images/Filled_Heart.svg');
    data['loved' + data.currentDB].push(currentThumb);
    return;
  }
  target.setAttribute('src', 'images/Empty_Heart.svg');
  var position = data['loved' + data.currentDB].indexOf(currentThumb);
  data['loved' + data.currentDB].splice(position, 1);
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
  $bookmarkBtn.className = 'bookmark-trigger seamless-btn';
  var $bookmark = document.createElement('img');
  $bookmark.setAttribute('src', bookmark);
  $bookmark.setAttribute('alt', 'Bookmark');
  $bookmark.className = 'full-center bookmark';
  $bookmarkBtn.append($bookmark);
  var $lovedBtn = document.createElement('button');
  $lovedBtn.className = 'loved-trigger seamless-btn';
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
    for (var i = 0; i < $navSwappers.length; i++) {
      $navSwappers[i].setAttribute('data-view', $navSwappers[i].getAttribute('data-view').replace('Meals', 'Drinks'));
    }
    for (i = 0; i < $uniformColor.length; i++) {
      $uniformColor[i].classList.replace('green', 'purple');
      $searchBar.children[i].classList.replace('meal-search', 'drink-search');
    }
    $pageTitle.className = $pageTitle.className.replace('meals', 'drinks');
    $toggleBtn.classList.replace('purple', 'green');
    $toggleBtn.textContent = 'Meals';
    $searchImg.setAttribute('src', 'images/Spy_Glass_White.svg');
  } else {
    $body.classList.replace('drink-background', 'meal-background');
    for (i = 0; i < $uniformColor.length; i++) {
      $uniformColor[i].classList.replace('purple', 'green');
      $searchBar.children[i].classList.replace('drink-search', 'meal-search');
    }
    for (i = 0; i < $navSwappers.length; i++) {
      $navSwappers[i].setAttribute('data-view', $navSwappers[i].getAttribute('data-view').replace('Drinks', 'Meals'));
    }
    $pageTitle.className = $pageTitle.className.replace('drinks', 'meals');
    $toggleBtn.classList.replace('green', 'purple');
    $toggleBtn.textContent = 'Drink';
    $searchImg.setAttribute('src', 'images/Spy_Glass.svg');
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
