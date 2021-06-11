// this will reset the dropdown to "My Lists"
// $select.selectedIndex = 0

var $toggleBtn = document.querySelector('#toggle-Page');
var gallery = document.querySelector('#recipe-gallery');
var $navBar = document.querySelector('.nav-container');
var $uniformColor = document.querySelectorAll('.green');
var $body = document.querySelector('body');
var $searchBar = document.querySelector('.search-form');
var $searchImg = document.querySelector('.spy');

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

    // missing items to swap (all the buttons and the HOME)

  }

});

$searchBar.addEventListener('submit', function (event) {
  event.preventDefault();
  var searched = $searchBar.elements.search.value;
  data['searched' + data.currentDB] = [];

  if (searched.length < 1) {
    return;
  } else if (searched.length < 2) {
    responseGET(getRecipeIDs, 'search.php?f=' + searched);
    return;
  }

  console.log(5 + 5);

});

function getRecipeIDs(response) {
  var page = data.currentDB.substring(0, data.currentDB.length - 1);
  for (var i = 0; i < response.length; i++) {
    data['searched' + data.currentDB].push(response[i]['id' + page]);
  }
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
    neededFunction(xhr.response[page]);
  });
  xhr.send();
}

function clearGallery() {
  while (gallery.firstChild) {
    gallery.removeChild(gallery.firstChild);
  }
}

function toggleDB(currentDB) {

  if (currentDB === 'Drinks') {
    $body.classList.replace('meal-background', 'drink-background');
    for (var i = 0; i < $uniformColor.length; i++) {
      $uniformColor[i].classList.replace('green', 'purple');
      $searchBar.children[i].classList.replace('meal-search', 'drink-search');
    }
    $toggleBtn.classList.replace('purple', 'green');
    $toggleBtn.textContent = 'Meals';
    $searchImg.setAttribute('src', 'images/Spy_Glass_White.svg');
  } else {
    $body.classList.replace('drink-background', 'meal-background');
    for (i = 0; i < $uniformColor.length; i++) {
      $uniformColor[i].classList.replace('purple', 'green');
      $searchBar.children[i].classList.replace('drink-search', 'meal-search');
    }
    $toggleBtn.classList.replace('green', 'purple');
    $toggleBtn.textContent = 'Drink';
    $searchImg.setAttribute('src', 'images/Spy_Glass.svg');
  }
}
