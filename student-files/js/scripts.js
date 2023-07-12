// As per the requirements, we fetch 12 people from the API:
const nrEmployeesToFetch = 12;

// Details of the API and its parameters
const api = {
  // We specify the API version so this script will not break on API update
  url: 'https://randomuser.me/api/1.3/',
  parameters: [
    // Define what data we are interested in
    'inc=picture,name,email,location,cell,dob',
    // Define how many objects we would like to receive
    `results=${nrEmployeesToFetch}`,
    // Restrict nationalities to English (for the exceeds requirement)
    'nat=gb,us'
  ]
}

// The 'peopleData' array will hold the people objects we fetched from the API
let peopleData = [];

// The 'galleryDiv' is the element into which we will inject the 'card'
// elements (see the 'createCard' function below)
const galleryDiv = document.getElementById('gallery');

// ****************************************************************************
// *                                                                          *
// *  Function Definitions                                                    *
// *                                                                          *
// ****************************************************************************

/**
 * Takes in details about a person and returns a business card in the form of
 * a HTML string. The 'index' parameter is the index of this person in the
 * 'peopleData' array. This way we can quickly grab additional information
 * about this person from the array if needed (i.e. when the user clicks the
 * card and the modal gets displayed).
 *
 * @param {object} person - The details of the person
 * @returns {string} - The business card (HTML)
 */
function createCard(person) {
  return `
    <div class="card" data-index="${person.index}">
      <div class="card-img-container" data-index="${person.index}">
        <img class="card-img" data-index="${person.index}"
          src="${person.imageSrc}" alt="Profile Picture">
      </div>
      <div class="card-info-container" data-index="${person.index}">
        <h3 id="name" class="card-name cap" data-index="${person.index}">
          ${person.name}
        </h3>
        <p class="card-text" data-index="${person.index}">${person.email}</p>
        <p class="card-text cap" data-index="${person.index}">
          ${person.city}, ${person.state}
        </p>
      </div>
    </div>
  `;
}

/**
 * Takes in details about a person and returns the modal containing the person's
 * data as an HTML string. Same as 'createCard', but the 'modal' contains
 * more details. We store the index here as well, so it is easy to navigate
 * forwards and backwards through the 'peopleData' array when the user clicks
 * the prev/next buttons on the modal.
 *
 * @param {object} person - The details of the person
 * @returns {string} - The modal (HTML)
 */
function createModal(person) {
  return `
    <div class="modal-container">
      <div class="modal">
        <button type="button" id="modal-close-btn" class="modal-close-btn">
          <strong>X</strong>
        </button>
        <div class="modal-info-container">
          <img class="modal-img"
            src="${person.imageSrc}"
            alt="Profile Picture">
          <h3 id="name" class="modal-name cap">
            ${person.name}
          </h3>
          <p class="modal-text">${person.email}</p>
          <p class="modal-text cap">${person.city}</p>
          <hr>
          <p class="modal-text">${reformatCellNr(person.cell)}</p>
          <p class="modal-text">
            ${person.number} ${person.street},
            ${person.state}, ${person.postcode}
          </p>
          <p class="modal-text">
            Birthday: ${reformatBirthDay(person.birthday)}
          </p>
        </div>
      </div>
      <div class="modal-btn-container" data-index="${person.index}">
        <button type="button" id="modal-prev" class="modal-prev btn">
          Prev
        </button>
        <button type="button" id="modal-next" class="modal-next btn">
          Next
        </button>
      </div>
    </div>
  `;
}

/**
 * Updates the contents of the modal using the data of the parameter "person".
 * It also keeps track of the index in the 'peopleData' array by storing the
 * 'index' parameter in the HTML as a data attribute.
 *
 * @param {object} person - The details of the person
 * @returns {void} - Does not return anything
 */
function updateModalContent(person) {
  // Select the HTML elements inside the modal that need to be updated
  const modalContainerDiv = document.querySelector('.modal-container');
  const img = modalContainerDiv.querySelector('img');
  const nameH3 = modalContainerDiv.querySelector('#name');
  const paragraphs = modalContainerDiv.querySelectorAll('p');
  const modalBtnContainerDiv =
    modalContainerDiv.querySelector('.modal-btn-container');

  // Update the HTML elements with the details from 'person'
  img.src = person.imageSrc;
  nameH3.innerHTML = person.name;
  paragraphs[0].innerHTML = person.email;
  paragraphs[1].innerHTML = person.city;
  paragraphs[2].innerHTML = person.cell;
  paragraphs[3].innerHTML = `${person.number} ${person.street}, ` +
    `${person.state}, ${person.postcode}`;
  paragraphs[4].innerHTML = `Birthday: ${person.birthday}`;
  modalBtnContainerDiv.dataset.index = `${person.index}`;
}

/**
 * Adds the search functionality on the top right of the screen. Also adds the
 * event listener including the search logic.
 *
 * @returns {void} - Does not return anything
 */
function addSearch() {
  const searchContainerDiv = document.querySelector('.search-container');
  searchContainerDiv.innerHTML =
    `<form action="#" method="get">
      <input type="search" id="search-input" class="search-input"
        placeholder="Search...">
      <input type="submit" value="&#x1F50D;" id="search-submit"
        class="search-submit">
    </form>`;

  document.querySelector('form').addEventListener('submit', (event) => {
    // Prevent the form from refreshing the page on submission
    event.preventDefault();
    // Take the input from the user and transform it to uppercase for easy searching
    const input = document.getElementById('search-input').value.toUpperCase();
    let html = '';
    for (person of peopleData) {
      const name = person.name.toUpperCase();
      if (name.includes(input)) {
        html += createCard(person);
      }
    }
    if (html.length === 0) {
      html = '<h3>Your search yielded no results</h3>';
    }
    galleryDiv.innerHTML = html;
  });
}

/**
 * Fetch helper function for error handling
 *
 * @param {Response} response - The response from a fetch request
 * @returns {Promise} - Returns a promise that resolves or rejects
 *                      depending on whether the fetch succeeded
 */
function checkStatus(response) {
  if (response.ok) {
    return Promise.resolve(response);
  } else {
    return Promise.reject(new Error(response.statusText));
  }
}

/**
 * Fetches data from the API and returns a promise that resolves to the requested
 * data as a JavaScript object (rather than a JSON string).
 *
 * @param {string} url - The full URL of the API, including parameters
 * @returns {Promise} - Returns a promise that resolves or rejects
 *                      depending on whether the fetch succeeded
 */
function fetchData(url) {
  return fetch(url)
    // Only continue if we get HTTP status 200 OK
    .then(checkStatus)
    // Transform the JSON string into a JavaScript object
    .then(response => response.json())
    // Catch failures of fetch (network error, etc)
    .catch(error => console.log('Looks like there was a problem!', error));
}

// This little helper function returns the full API URL
function getAPIString(api) {
  return `${api.url}?${api.parameters.join('&')}`;
}

// This little helper function reformats the phone number to the desired format
function reformatCellNr(cellNr) {
  // Keep digits only using regex & replace:
  let retStr = cellNr.replace(/[^\d]/g, '');
  // Recreate the string in the desired format
  retStr = `(${retStr.slice(0, 3)}) ${retStr.slice(3, 6)}-${retStr.slice(6)}`;
  return retStr;
}

// This little helper function reformats the birthday in the desired format
function reformatBirthDay(birthday) {
  // We only need the date, not the time
  let retStr = birthday.substring(0, 10);
  // Put the year, month, and day in the desired order
  retStr = retStr.replace(/^\d{2}(\d{2})-(\d{2})-(\d{2})/, '$2/$3/$1');
  return retStr;
}

/**
 * Takes the array of people as a parameter and stores the data in the global
 * variable 'peopleData' for later use. We only keep the data we need. Notice
 * how each object knows its own location inside the array 'peopleData' since
 * we store it inside the object as 'index'. This is done so we can navigate
 * through the array easily later on.
 *
 * @param {Array} peopleArray - The data returned from the API
 * @returns {Array} - Returns the 'peopleData' array
 */
function savePeopleData(peopleArray) {
  for (let i = 0; i < peopleArray.length; i++) {
    const person = peopleArray[i];
    peopleData.push({
      index: i,
      imageSrc: person.picture.large,
      name: `${person.name.first} ${person.name.last}`,
      email: person.email,
      birthday: reformatBirthDay(person.dob.date),
      cell: reformatCellNr(person.cell),
      street: person.location.street.name,
      number: person.location.street.number,
      city: person.location.city,
      postcode: person.location.postcode,
      state: person.location.state
    });
  }
  return peopleData;
}

/**
 * Takes an array of people objects and inserts cards made with the
 * 'createCard' function into the DOM. It returns its parameter unmodified so
 * that further ".then()" statements can be chained to the calling promise.
 *
 * @param {Array} people - The reworked data returned from the API
 * @returns {Array} - Returns the same array
 */
function insertPeopleToDom(people) {
  galleryDiv.innerHTML = '';
  for (let i = 0; i < people.length; i++) {
    galleryDiv.insertAdjacentHTML('beforeend', createCard(people[i]));
  }
  return people;
}

// ****************************************************************************
// ****************************************************************************
// **                                                                        **
// **  Start of the script                                                   **
// **                                                                        **
// ****************************************************************************
// ****************************************************************************

// Give a loading screen to the user
galleryDiv.innerHTML = '<h1>Loading Data...</h1>';

// Fetch the data from the API and display the cards
fetchData(getAPIString(api))
  // We take what we need from the response and tailor it to our needs
  .then(response => savePeopleData(response.results))
  // We insert each person into an HTML string and attach that to the DOM
  .then(insertPeopleToDom)
  // Catch failures with fetch (network error, etc)
  .catch(error => console.log('Looks like there was a problem!', error));

// Add search functionality
addSearch();

// Add the event listener that shows the modal when the user clicks on a card
galleryDiv.addEventListener('click', (event) => {
  const modalContainerDivs = document.getElementsByClassName('modal-container');
  const modalIsOpen = modalContainerDivs.length > 0;
  const index = event.target.dataset.index;
  // Exit function if index is not defined or if the modal is already open
  if (!index || modalIsOpen) {
    return;
  }
  galleryDiv.insertAdjacentHTML('beforeend', createModal(peopleData[index]));
  const modalCloseButton = document.getElementById('modal-close-btn');
  modalCloseButton.addEventListener('click', () => {
    modalCloseButton.parentNode.parentNode.remove();
  });
  // Add the event listeners for the navigation buttons in the modal
  const navButtons = [
    document.getElementById('modal-prev'),
    document.getElementById('modal-next')
  ];
  for (btn of navButtons) {
    btn.addEventListener('click', (event) => {
      console.log('adding event listener for ', btn); // DEBUG
      let index = parseInt(event.target.parentNode.dataset.index);
      if (event.target.id === 'modal-prev' && index > 0) {
        index--;
        updateModalContent(peopleData[index]);
      } else if (event.target.id === 'modal-next' &&
        index < (peopleData.length - 1)) {
        index++;
        updateModalContent(peopleData[index]);
      }
    });
  }
});
