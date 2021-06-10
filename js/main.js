// this will reset the dropdown to "My Lists"
// $select.selectedIndex = 0

// destroyChildren to remove all children of thumbs

var $toggleBtn = document.querySelector('#toggle-Page');
var gallery = document.querySelector('#recipe-gallery');

var $navBar = document.querySelector('.nav-container');
var $uniformColor = document.querySelectorAll('.green');
var $body = document.querySelector('body');

console.log($toggleBtn);

$navBar.addEventListener('click', function (event) {
  event.preventDefault();

  if (event.target.matches('.large-btn')) {
    console.log(event.target.textContent);
    toggleDB();


  }

});

function clearGallery() {
  while (gallery.firstChild) {
    gallery.removeChild(gallery.firstChild);
  }
}

function toggleDB() {
  clearGallery();

  if (data.currentDBmeals === true) {
    data.currentDBmeals = false;
  } else {
    data.currentDBmeals = true;
  }

  if (data.currentDBmeals === false) {
    $body.classList.replace('meal-background', 'drink-background');
    for (var i = 0; i < $uniformColor.length; i++) {
      $uniformColor[i].classList.replace('green', 'purple')
    }
    $toggleBtn.classList.replace('purple', 'green');
    $toggleBtn.textContent = 'Meals';

  } else {
    $body.classList.replace('drink-background', 'meal-background');
    for (i = 0; i < $uniformColor.length; i++) {
      $uniformColor[i].classList.replace('purple', 'green');
      $toggleBtn.classList.replace('green', 'purple');
      $toggleBtn.textContent = 'Drink';
    }

  }


}
